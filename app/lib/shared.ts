import { CheckersPiece, CheckersPieceInfo, expandMove as expandCheckersMove} from "./checkers";
import { ChessPiece, expandChessMove } from "./chess";

export type PieceType = CheckersPiece | ChessPiece;
export const pieceTypes = ["double", "single", "pawn", "king", "queen", "rook", "bishop", "knight"];
export type Game = "chess" | "checkers";
// In a chess game, "red" is used as "white."
export type Color = "black" | "red";

export type Piece = {
    game: Game,
    color: Color,
    type: PieceType
}

export type MaybePiece = Piece | undefined;
// Boards are organized ALWAYS with "white" at the bottom
export type Board = {
    pieces: MaybePiece[][],
    black: Game,
    white: Game
};

export type Move = {
    from: Coordinates,
    to: Coordinates,
    capturedLocations: Coordinates[]
};

export type Coordinates = {
    row: number,
    column : number
}

export function toCoordinates(index : number) : Coordinates {
    const row = Math.floor(index/8);
    const column = index - row*8;
    return {row, column};
}

export function fromCoordinates(coords : Coordinates) : number {
    return coords.row*8 + coords.column;
}

export function addCoords(a : Coordinates, b : Coordinates) : Coordinates {
    return {
        row: a.row + b.row,
        column: a.column + b.column
    };
}

export function onBoard(coords : Coordinates) : boolean {
    return (
        coords.row >= 0 && coords.row < 8
        && coords.column >= 0 && coords.column < 8
    );
}

export function scaleCoords(scalar : number, coordinate : Coordinates) : Coordinates {
    return {
        row: coordinate.row*scalar,
        column: coordinate.column*scalar
    };
}

export function pieceAt(board : Board, location : Coordinates) : MaybePiece {
    if(!onBoard(location)){
        return undefined;
    }
    return board.pieces[location.row][location.column];
}

export function getValidMoves(board : Board, from : number | null) : Move[] {
    if(from == null){
        return [];
    }
    const fromCoords = toCoordinates(from);
    const sourcePiece = pieceAt(board, fromCoords);
    if(!sourcePiece){
        return []; // an empty space has no valid moves to make
    }

    // expand based on which game is being played
    return sourcePiece.game == "checkers" 
        ? expandCheckersMove(board, fromCoords, sourcePiece as CheckersPieceInfo) 
        : expandChessMove(board, fromCoords, sourcePiece);
}

export function makePiece(type: PieceType, color: Color, game: Game) {
    return {
        type,
        color,
        game
    };
}

export function performMove(board : Board, move : Move) : Board {
    const newBoard : Board = copyBoard(board);
    for(const capture of move.capturedLocations){
        newBoard.pieces[capture.row][capture.column] = undefined;
    }
    const movingPiece = newBoard.pieces[move.from.row][move.from.column];
    newBoard.pieces[move.to.row][move.to.column] = movingPiece;
    newBoard.pieces[move.from.row][move.from.column] = undefined;

    if(movingPiece == undefined){
        throw new Error("Tried to move a nonexistent piece");
    }

    // checkers kinging
    if( move.to.row == (movingPiece.color == "black" ? 7 : 0) ){
        console.log("checker got kinged");
        movingPiece.type = "double";
    }

    return newBoard;
}

export function emptyBoard(white : Game, black : Game) : Board {
    return {
        pieces: [...Array(8).keys()].map(() => [...Array(8).keys()].map(() => undefined)),
        black,
        white
    };
}

export function copyBoard(board : Board) : Board {
    return {
        pieces: board.pieces.map((row) => [...row]),
        black: board.black,
        white: board.white
    }
}

export function makeBoard(white : Game, black : Game) : Board {
    const board = emptyBoard(white, black);

    const checkersEven = ["single", undefined, "single", undefined, "single", undefined, "single", undefined];
    const checkersOdd = [undefined, "single", undefined, "single", undefined, "single", undefined, "single"];

    // populate black's side
    if(board.black == "chess"){ // as chess
        const whiteBackRow = ["rook", "knight", "bishop", "king", "queen", "bishop", "knight", "rook"] as PieceType[];
        board.pieces[0] = whiteBackRow.map((type) => makePiece(type, "black", "chess"));
        board.pieces[1] = [...Array(8).keys()].map(() => makePiece("pawn", "black", "chess"));
    }else{ // as checkers
        board.pieces[0] = checkersOdd .map((type) => type == undefined ? undefined : makePiece("single", "black", "checkers"));
        board.pieces[1] = checkersEven.map((type) => type == undefined ? undefined : makePiece("single", "black", "checkers"));
        board.pieces[2] = checkersOdd .map((type) => type == undefined ? undefined : makePiece("single", "black", "checkers"));
    }

    // populate red's side
    if(board.white == "chess"){ // as chess
        const whiteBackRow = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"] as PieceType[];
        board.pieces[6] = [...Array(8).keys()].map(() => makePiece("pawn", "red", "chess"));
        board.pieces[7] = whiteBackRow.map((type) => makePiece(type, "red", "chess"));
    }else{ // as checkers
        board.pieces[5] = checkersEven.map((type) => type == undefined ? undefined : makePiece("single", "red", "checkers"));
        board.pieces[6] = checkersOdd .map((type) => type == undefined ? undefined : makePiece("single", "red", "checkers"));
        board.pieces[7] = checkersEven.map((type) => type == undefined ? undefined : makePiece("single", "red", "checkers"));
    }
    //console.log(board.pieces);
    return board;
}