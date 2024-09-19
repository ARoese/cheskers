import { addCoords, Board, Coordinates, hasPiece, Move, onBoard, Piece, pieceAt, scaleCoords } from "./shared";

export type CheckersPieceType = "double" | "single";
export type Expander = (piece : Piece) => Move[];
export type OffsetExpander = (board : Board, location : Coordinates, piece : Piece) => Move[];

const checkersMoves : Record<CheckersPieceType, Coordinates[]> = {
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
export type CheckersPiece = Piece & {type : CheckersPieceType};

// get a list off offsets a piece can move into
// reverses the direction based on piece color
function expandSimpleOffsets(piece : CheckersPiece) : Coordinates[] {
    return piece.color == "black" 
        ? checkersMoves[piece.type] 
        : checkersMoves[piece.type].map((offset) => scaleCoords(-1, offset));
} 

// make this not recursive; just return all the possible captures. Handle the requirement to
// take capture opportunities some other way. Maybe add a "yield" field to the move object which
// says it's time to give up control because there are no captures possible
// get all valid moves a piece can make on a board
function expandCaptureMoves(board : Board, location : Coordinates, piece : CheckersPiece) : Move[] {
    // TODO: this doesn't quite work
    const captures = expandSimpleOffsets(piece)
        .map((offset) => [offset, addCoords(location, offset)])
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
            from: location, 
            to: addCoords(location, offset), 
            captured
            })
        )
        // only produce moves that are actually on the board
        .filter((move) => onBoard(move.to))
        // cannot move onto another piece
        .filter((move) => !hasPiece(board, move.to));
    
        return captures;
}

// get all valid simple moves
export function expandMove(board : Board, location : Coordinates, piece : CheckersPiece) : Move[] {
    // get simple moves that can be legally made
    const simpleMoves = expandSimpleOffsets(piece)
        // map into moves
        .map((offset) => ({
                from: location, 
                to: addCoords(location, offset),
                captured: null
            })
        )
        // cannot move off board
        .filter((move) => onBoard(move.to))
        // cannot move onto another piece
        .filter((move) => !hasPiece(board, move.to));
    console.log("simple offsets:", expandSimpleOffsets(piece))
    console.log("simple moves:", simpleMoves)
    // get captures that can be legally made
    const captureMoves = expandCaptureMoves(board, location, piece);

    return [...simpleMoves, ...captureMoves];
}