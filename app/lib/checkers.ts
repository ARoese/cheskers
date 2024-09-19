import { addCoords, Board, Coordinates, Move, onBoard, Piece, pieceAt, scaleCoords } from "./shared";

export type CheckersPiece = "double" | "single";
export type Expander = (piece : Piece) => Move[];
export type OffsetExpander = (board : Board, location : Coordinates, piece : Piece) => Move[];

const checkersMoves : Record<CheckersPiece, Coordinates[]> = {
    // valid movements of a checkers king
    double: [
        {
            row: 1,
            column: 1
        },
        {
            row: 1,
            column: -1
        },
        {
            row: -1,
            column: 1
        },
        {
            row: -1,
            column: -1
        },
    ],
    // valid movements of a checkers single
    single: [
        {
            row: 1,
            column: 1
        },
        {
            row: 1,
            column: -1
        }
    ]
}

// a piece that is definitely a checkers piece
export type CheckersPieceInfo = Piece & {type : CheckersPiece};

// get a list off offsets a piece can move into
// reverses the direction based on piece color
function expandSimpleOffsets(piece : CheckersPieceInfo) : Coordinates[] {
    return piece.color == "black" 
        ? checkersMoves[piece.type] 
        : checkersMoves[piece.type].map((offset) => scaleCoords(-1, offset));
} 

// make this not recursive; just return all the possible captures. Handle the requirement to
// take capture opportunities some other way. Maybe add a "yield" field to the move object which
// says it's time to give up control because there are no captures possible
// get all valid moves a piece can make on a board
function expandCaptureMoves(board : Board, captureMove : Move, piece : CheckersPieceInfo) : Move[] {
    // TODO: this doesn't quite work
    const captures = expandSimpleOffsets(piece)
        .map((offset) => [offset, addCoords(captureMove.to, offset)])
        // find any simple move that would land on a piece 
        // that piece must also be of a different color
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, captured]) => {
            const jumped = pieceAt(board, captured);
            return jumped != undefined && jumped.color != piece.color;
        })
        // scale offset to make it a capture offset
        .map(([offset, captured]) => [scaleCoords(2, offset), captured])
        // convert capture offsets into new Moves
        // with their start at the original move's location, and the end in the new destination
        // add the captured piece to the capture list
        .map(([offset, captured]) => ({
            from: captureMove.from, 
            to: addCoords(captureMove.to, offset), 
            capturedLocations: [...captureMove.capturedLocations, captured]
            })
        )
        // only produce moves that are actually on the board
        .filter((move) => onBoard(move.to))
        // cannot move onto another piece
        .filter((move) => pieceAt(board, move.to) == undefined);
    
        return captures;
    if(captures.length == 0){
        // we call this function with an initial fake capture of self.
        // we don't return this fake capture.
        return captureMove.from == captureMove.to ? [] : [captureMove];
    }else{
        console.log("captures1:", captures);
        // recursively find any captures that could be made from each of these new captures
        const res = captures.flatMap((captureMove) => expandCaptureMoves(board, captureMove, piece));
        console.log("captures2:", res);
        return res;
    }
}

// get all valid simple moves
export function expandMove(board : Board, location : Coordinates, piece : CheckersPieceInfo) : Move[] {
    // get simple moves that can be legally made
    const simpleMoves = expandSimpleOffsets(piece)
        // map into moves
        .map((offset) => ({
                from: location, 
                to: addCoords(location, offset),
                capturedLocations: []
            })
        )
        // cannot move off board
        .filter((move) => onBoard(move.to))
        // cannot move onto another piece
        .filter((move) => pieceAt(board, move.to) == undefined);
    console.log("simple offsets:", expandSimpleOffsets(piece))
    console.log("simple moves:", simpleMoves)
    // get captures that can be legally made
    // this will use recursion to find all valid end-destinations of multi-captures
    const captureMoves = expandCaptureMoves(board, {
        from: location,
        to: location,
        capturedLocations: []
    }, piece);

    return [...simpleMoves, ...captureMoves];
}