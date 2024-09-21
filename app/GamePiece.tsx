import { MaybePiece } from "./lib/types/Piece";
import { 
    faChessPawn, faChessKing, faChessKnight, faChessBishop, 
    faChessRook, faChessQueen, IconDefinition, 
    faDotCircle, faDiamond } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { PieceType } from "./lib/games";
const pieceIcons : Record<PieceType,IconDefinition> = {
    double: faDiamond,
    single: faDotCircle,
    pawn: faChessPawn,
    pessantable: faChessPawn,
    king: faChessKing,
    queen: faChessQueen,
    rook: faChessRook,
    bishop: faChessBishop,
    knight: faChessKnight
};

type args = {
    piece : MaybePiece,
    className? : string,
    onClick? : () => void,
    onMouseOver? : () => void,
    onMouseOut? : () => void
};

const defaultHandler = () => null;

function GamePiece({piece, className = "", onClick = defaultHandler, onMouseOut = defaultHandler, onMouseOver = defaultHandler} : args) {
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
        <div 
            className={`aspect-square text-center p-2 ${className} ${pieceColor}`} 
            onClick={onClick}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}>
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