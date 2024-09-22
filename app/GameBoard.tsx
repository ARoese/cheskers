import { useState, useMemo, useEffect } from "react";
import GamePiece from "./GamePiece";
import { Move, getAllBoardMoves } from "./lib/moves";
import { Board, pieceAt } from "./lib/types/Board";
import { fromCoordinates, toCoordinates } from "./lib/types/Coordinates";

function getValidMovesCombined(boardMoves : Record<number, Move[]>, selected : number | null) : [Move[], Record<number, Move[]>]{
    const validMoves = selected == null ? [] : boardMoves[selected];
    const movesOnto : Record<number, Move[]> = Object.fromEntries(
        [...Array(8*8).keys()].map((loc) => 
            [loc, validMoves.filter((move) => fromCoordinates(move.to) == loc)]
        )
    )

    return [
        validMoves, // all valid moves
        movesOnto // mapping from squares to any moves which target them
    ];
}

type args = {
    className? : string, 
    board: Board,
    doMove : (move : Move) => void
};

const selectedBgColor = "bg-blue-300";
const highlightBgColor = "bg-yellow-300";
const captureBgColor = "bg-red-500";

function GameBoard({className="", board, doMove} : args) {
    const [selected, setSelected] = useState(null as number | null);
    const [capturing, setCapturing] =  useState(null as number | null);
    
    const boardMoves = useMemo(() => getAllBoardMoves(board), [board]);
    const [, movesOnto] = useMemo(() => getValidMovesCombined(boardMoves, selected), [boardMoves, selected]);
    
    // whenever board updates, reset selection and capturing
    useEffect(() => {setSelected(null); setCapturing(null)}, [board]);

    if(board.state.multiCapturing != null){
        const multi = fromCoordinates(board.state.multiCapturing);
        if(selected != multi){
            setSelected(multi);
        }
        
    }

    function checkedSetSelected(sel : number){
        const targetPiece = pieceAt(board, toCoordinates(sel));
        if(targetPiece == undefined || targetPiece.color != board.state.turn){
            setSelected(null);
        }else{
            setSelected(sel);
        }
    }

    return ( 
        <>
        <div 
            className={`aspect-square 
                        grid grid-cols-8 grid-rows-8 grid-flow-row
                        ${className}`}>
            {
            board.pieces.flat().map(
                (piece, i) => {
                    // TODO: clean this up A LOT!
                    const boardBgColor = (i + Math.floor(i/8)) % 2 == 0 
                        ? "bg-red-400" 
                        : "bg-gray-400";
                    let onClick = () => checkedSetSelected(i);
                    let bgColor = boardBgColor;
                    if(selected == i){
                        bgColor = selectedBgColor
                    }
                    const movesOntoThis = movesOnto[i]
                    if(movesOntoThis.length > 1){
                        throw new Error("multiple moves onto the same square. This should not be possible. Please debug.");
                    }
                    let onMouseOver = undefined;
                    if(movesOntoThis.length != 0){
                        bgColor = highlightBgColor;
                        const moveToDo = movesOntoThis[0];
                        onClick = () => {
                            doMove(moveToDo);
                            setSelected(null);
                        }
                        if(moveToDo.captured != null){
                            onMouseOver = () => {
                                // @ts-expect-error we just checked this is not null
                                setCapturing(fromCoordinates(moveToDo.captured))
                            }
                            
                        }
                        
                    }
                    if(capturing == i){
                        bgColor = captureBgColor;
                    }

                    return <GamePiece 
                        piece={piece}
                        key={`${i}`}
                        className={`${bgColor}`}
                        onClick={onClick}
                        onMouseOver={onMouseOver}
                        onMouseOut={() => setCapturing(null)}
                    />;
                }
            )
            }
        </div>
        </>
     );
}

export default GameBoard;