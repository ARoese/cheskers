import { Board, Coordinates, Move, Piece } from "./shared";
export type ChessPiece = "pawn" | "king" | "queen" | "rook" | "bishop" | "knight";
export function expandChessMove(board : Board, location : Coordinates, piece : Piece) : Move[] {
    return [];
}