import { CheckersPieceType, CheckersPiece, expandMove as expandCheckersMove} from "./checkers";
import { ChessPiece, ChessPieceType, expandMove as expandChessMove } from "./chess";

export type PieceType = CheckersPieceType | ChessPieceType;
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

export type MaybeCoordinates = Coordinates | null;

export type Move = {
    from: Coordinates,
    to: Coordinates,
    captured: MaybeCoordinates
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

export function hasPiece(board : Board, location : Coordinates) : boolean {
    return pieceAt(board, location) != undefined;
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
        ? expandCheckersMove(board, fromCoords, sourcePiece as CheckersPiece) 
        : expandChessMove(board, fromCoords, sourcePiece as ChessPiece);
}

export function makePiece(type: PieceType, color: Color, game: Game) {
    return {
        type,
        color,
        game
    };
}

export function reverseCoordinates(toReverse : Coordinates) : Coordinates {
    return {
        row: 7-toReverse.row,
        column: toReverse.column
    }
}

export function performMove(board : Board, move : Move) : Board {
    const newBoard : Board = copyBoard(board);
    if(move.captured != null){
        newBoard.pieces[move.captured.row][move.captured.column] = undefined;
    }
    const movingPiece = newBoard.pieces[move.from.row][move.from.column];
    if(movingPiece == undefined){
        throw new Error("Tried to move a nonexistent piece");
    }
    newBoard.pieces[move.to.row][move.to.column] = movingPiece;
    newBoard.pieces[move.from.row][move.from.column] = undefined;

    

    // checkers kinging
    if( movingPiece.game == "checkers" && move.to.row == (movingPiece.color == "black" ? 7 : 0) ){
        console.log("checker got kinged");
        movingPiece.type = "double";
    }

    // en pessant transitions
    // all pessantable pawns transition into normal pawns each turn
    newBoard.pieces.flat().forEach(piece => {
        if(piece!=undefined && piece.type == "pessantable"){
            piece.type = "pawn";
        }
    });
    // a pawn the moves 2 spaces in 1 turn becomes pessantable
    if( movingPiece.type == "pawn" && Math.abs(move.from.row - move.to.row) == 2){
        console.log("pessantable created");
        movingPiece.type = "pessantable";
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