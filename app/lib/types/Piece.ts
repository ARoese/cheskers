import { Color, Game, PieceType } from "../games";



export type Piece = {
    game: Game;
    color: Color;
    type: PieceType;
};

export type MaybePiece = Piece | undefined;

export function makePiece(type: PieceType, color: Color, game: Game) {
    return {
        type,
        color,
        game
    };
}

export function copyPiece(piece: Piece) : Piece{
    return {
        color: piece.color,
        game: piece.game,
        type: piece.type
    }
}
