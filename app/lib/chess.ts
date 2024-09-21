import { addCoords, Board, Coordinates, hasPiece, Move, onBoard, Piece, pieceAt, reverseCoordinates, scaleCoords } from "./shared";
export type ChessPieceType = "pawn" | "king" | "queen" | "rook" | "bishop" | "knight" | "pessantable";
export type ChessPiece = Piece & {game: "chess", type : ChessPieceType};

type chessPieceExpander = (board : Board, location : Coordinates) => Move[];

const right : Coordinates = {
    row: 0,
    column: 1
};

const up : Coordinates = {
    row: 1,
    column: 0
};

const left = scaleCoords(-1, right);
const down = scaleCoords(-1, up);

const directions = {
    left,
    right,
    up,
    down,
    lower_right: addCoords(down, right),
    lower_left: addCoords(down, left),
    upper_right: addCoords(up, right),
    upper_left: addCoords(up, left)
}

/** Returns all mvoements and captures available to a piece which moves in a beam in a given direction */
function beamMovements(board : Board, location: Coordinates, direction: Coordinates) : Move[]{
    let scale = 1;
    let targetCoords = addCoords(location, scaleCoords(scale,direction));
    const moves : Move[] = [];
    while(onBoard(targetCoords)){
        targetCoords = addCoords(location, scaleCoords(scale,direction));
        scale+=1;
        const piece = pieceAt(board, targetCoords);
        if(piece != undefined){
            return [...moves, {
                from: location,
                to: targetCoords,
                captured: targetCoords
            }]
        }else{
            moves.push({
                from: location,
                to: targetCoords,
                captured: null
            });
        }
    }
    return moves;
}

const pawnExpands = (board: Board, location: Coordinates): Move[] => {
    const advances : Move[] = [
        {
            from: location,
            to: addCoords(up, location),
            captured: null
        }
    ]
    if(location.row == 1){
        advances.push({
            from: location,
            to: addCoords(scaleCoords(2,up), location),
            captured: null
        });
    }

    const captures : Move[] = [
        {
            from: location,
            to: addCoords(directions.upper_right, location),
            captured: addCoords(directions.upper_right, location)
        },
        {
            from: location,
            to: addCoords(directions.upper_left, location),
            captured: addCoords(directions.upper_left, location)
        }
    ]
    // google "en passant"
    .map((move) => {
        const passing = addCoords(move.to, directions.down);
        const passedPiece = pieceAt(board, passing);
        if(passedPiece != undefined && passedPiece.type == "pessantable"){
            move.captured = passing;
            return move;
        }
        return move;
    })
    // can only move in this way to capture a piece
    .filter((move) => hasPiece(board, move.captured));



    // cannot advance into occupied space
    return [...advances.filter((move) => !hasPiece(board, move.to)), ...captures];
};

const chessExpands : Record<ChessPieceType, chessPieceExpander> = {
    pawn: pawnExpands,
    pessantable: pawnExpands,
    // TODO: castling
    king: function (board: Board, location: Coordinates): Move[] {
        const offsets : Coordinates[] = [...Object.values(directions)];
        const moves : Move[] = offsets.map((offset) => {
            const to = addCoords(offset, location);
            const captured = hasPiece(board, to) ? to : null;
            return {
                from: location,
                to,
                captured: captured
            } as Move;
        });

        return moves;
    },
    queen: function (board: Board, location: Coordinates): Move[] {
        const offsets : Coordinates[] = [...Object.values(directions)];
        const moves = offsets.flatMap(
            (direction) => beamMovements(board, location, direction)
        );

        return moves;
    },
    rook: function (board: Board, location: Coordinates): Move[] {
        const offsets : Coordinates[] = [
            directions.left,
            directions.right,
            directions.up,
            directions.down
        ];
        const moves = offsets.flatMap(
            (direction) => beamMovements(board, location, direction)
        );
        return moves;
    },
    bishop: function (board: Board, location: Coordinates): Move[] {
        const offsets : Coordinates[] = [
            directions.upper_left,
            directions.upper_right,
            directions.lower_left,
            directions.lower_right
        ];
        const moves = offsets.flatMap(
            (direction) => beamMovements(board, location, direction)
        );
        return moves;
    },
    knight: function (board: Board, location: Coordinates): Move[] {
        const x = [
            directions.left,
            directions.right
        ];
        const y = [
            directions.up,
            directions.down
        ]
        
        const xHops = x.flatMap((dir) => {
            const xHop = scaleCoords(2, dir); // 2 in one axis
            return [addCoords(xHop, up), addCoords(xHop, down)] // 1 in both directions on other axis 
        });

        const yHops = y.flatMap((dir) => {
            const yHop = scaleCoords(2, dir);
            return [addCoords(yHop, left), addCoords(yHop, right)]
        });

        const combined = [...xHops, ...yHops];
        return combined.map((offset) => {
            const dest = addCoords(offset, location);
            const capture = hasPiece(board, dest) ? dest : null;
            return {
                from: location,
                to: dest,
                captured: capture
            }
        })
    }
};

export function expandMove(board : Board, location : Coordinates, piece : ChessPiece) : Move[] {
    // always conceive of the board in one direction
    const shouldReverse = piece.color == "red";
    const revLocation = shouldReverse ? {row: 7-location.row, column: location.column} : location;
    const revBoard = shouldReverse ? {...board, pieces: board.pieces.toReversed()} : board;
    const moves = chessExpands[piece.type](revBoard, revLocation)
        // undo reversal if it was performed
        .map((move) => (
            {
                from: location, 
                to: shouldReverse ? reverseCoordinates(move.to) : move.to,
                captured: shouldReverse ? (move.captured == null ? null : reverseCoordinates(move.captured)) : move.captured 
            }
        ))
        // do not allow moves that leave the game board
        .filter((move) => onBoard(move.to))
        // do not allow capture of own pieces
        // @ts-expect-error if the capture field is set, there is a piece on the board
        .filter((move) => (move.captured == null || pieceAt(board, move.captured).color != piece.color))
        
    //console.log("moves:", moves);
    return moves;
}