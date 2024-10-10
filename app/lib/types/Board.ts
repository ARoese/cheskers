import { Game, Color, PieceType } from "../games";
import { MaybePiece } from "./Piece";
import { MaybeCoordinates } from "./Coordinates";
import { Coordinates } from "./Coordinates";
import { makePiece } from "./Piece";

type GameState = {
    turn: Color; // whose turn it currently is

    // whether the board is in a "capture only" state.
    // This could happen because a checkers piece is able to capture
    // this can be restricted so that only a specific piece is allowed
    // to capture
    multiCapturing: MaybeCoordinates;
    winner: Color | null;
};

// Boards are organized ALWAYS with "white" at the bottom
export type Board = {
    pieces: MaybePiece[][];
    black: Game;
    white: Game;
    state: GameState;
};

export function onBoard(coords: Coordinates): boolean {
    return (
        coords.row >= 0 && coords.row < 8
        && coords.column >= 0 && coords.column < 8
    );
}

export function pieceAt(board: Board, location: Coordinates): MaybePiece {
    if (!onBoard(location)) {
        return undefined;
    }
    return board.pieces[location.row][location.column];
}

export function hasPiece(board: Board, location: Coordinates): boolean {
    return pieceAt(board, location) != undefined;
}

export function emptyBoard(white: Game, black: Game): Board {
    return {
        pieces: [...Array(8).keys()].map(() => [...Array(8).keys()].map(() => undefined)),
        black,
        white,
        state: {
            turn: "red",
            multiCapturing: null,
            winner: null
        }
    };
}

export function copyBoard(board: Board): Board {
    return {
        pieces: board.pieces.map((row) => [...row]),
        black: board.black,
        white: board.white,
        state: {
            turn: board.state.turn,
            multiCapturing: board.state.multiCapturing,
            winner: board.state.winner
        }
    };
}

export function makeBoard(white: Game, black: Game): Board {
    const board = emptyBoard(white, black);

    const checkersEven = ["single", undefined, "single", undefined, "single", undefined, "single", undefined];
    const checkersOdd = [undefined, "single", undefined, "single", undefined, "single", undefined, "single"];

    // populate black's side
    if (board.black == "chess") { // as chess
        const whiteBackRow = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"] as PieceType[];
        board.pieces[0] = whiteBackRow.map((type) => makePiece(type, "black", "chess"));
        board.pieces[1] = [...Array(8).keys()].map(() => makePiece("pawn", "black", "chess"));
    } else { // as checkers
        board.pieces[0] = checkersOdd.map((type) => type == undefined ? undefined : makePiece("single", "black", "checkers"));
        board.pieces[1] = checkersEven.map((type) => type == undefined ? undefined : makePiece("single", "black", "checkers"));
        board.pieces[2] = checkersOdd.map((type) => type == undefined ? undefined : makePiece("single", "black", "checkers"));
    }

    // populate red's side
    if (board.white == "chess") { // as chess
        const whiteBackRow = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"] as PieceType[];
        board.pieces[6] = [...Array(8).keys()].map(() => makePiece("pawn", "red", "chess"));
        board.pieces[7] = whiteBackRow.map((type) => makePiece(type, "red", "chess"));
    } else { // as checkers
        board.pieces[5] = checkersEven.map((type) => type == undefined ? undefined : makePiece("single", "red", "checkers"));
        board.pieces[6] = checkersOdd.map((type) => type == undefined ? undefined : makePiece("single", "red", "checkers"));
        board.pieces[7] = checkersEven.map((type) => type == undefined ? undefined : makePiece("single", "red", "checkers"));
    }

    return board;
}