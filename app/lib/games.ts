import { CheckersPieceType} from "./games/checkers";
import { ChessPieceType } from "./games/chess";

export type PieceType = CheckersPieceType | ChessPieceType;
export const pieceTypes = ["double", "single", "pawn", "king", "queen", "rook", "bishop", "knight"];
export type Game = "chess" | "checkers";
// In a chess game, "red" is used as "white."
export type Color = "black" | "red";