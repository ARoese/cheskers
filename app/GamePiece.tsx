import { MaybePiece } from "./lib/shared";
import { 
    faChessPawn, faChessKing, faChessKnight, faChessBishop, 
    faChessRook, faChessQueen, IconDefinition, 
    faDotCircle, faDiamond } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { PieceType } from "./lib/shared";
const pieceIcons : Record<PieceType,IconDefinition> = {
    double: faDiamond,
    single: faDotCircle,
    pawn: faChessPawn,
    king: faChessKing,
    queen: faChessQueen,
    rook: faChessRook,
    bishop: faChessBishop,
    knight: faChessKnight
};

type args = {piece : MaybePiece, className? : string, onClick? : () => void};
function GamePiece({piece, className = "", onClick = (() => null)} : args) {
    let pieceColor;
    if(piece){
        if(piece.game == "chess"){
            pieceColor = piece.color == "black" 
                ? "text-gray-800" 
                : "text-gray-200";
        }else{
            pieceColor = piece.color == "black" 
                ? "text-gray-800" 
                : "text-red-800";
        }
    }

    return ( 
        <div className={`aspect-square text-center p-2 ${className} ${pieceColor}`} onClick={onClick}>
            {
                piece == undefined
                ? <></>
                : <div className="h-full">
                    <FontAwesomeIcon icon={pieceIcons[piece.type]} className="h-full"/>
                </div>
            }
        </div>
     );
}

export default GamePiece;