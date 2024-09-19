import { useMemo, useState } from "react";
import GamePiece from "./GamePiece";
import {fromCoordinates, getValidMoves, makeBoard, Move, performMove, pieceAt, toCoordinates } from "./lib/shared";

function GameBoard({className=""} : {className? : string}) {
    const [board, setBoard] = useState(makeBoard("checkers", "chess"));
    const [selected, setSelected] = useState(null as number | null);
    const [capturing, setCapturing] =  useState(null as number | null);
    const selectedBgColor = "bg-blue-300";
    const highlightBgColor = "bg-yellow-300";
    const captureBgColor = "bg-red-500";
    
    const validMoves = useMemo(() => getValidMoves(board, selected), [board, selected]);
    const movesOnto : Record<number, Move[]> = useMemo(() => 
        Object.fromEntries(
            [...Array(8*8).keys()].map(
                    (loc) => [loc, validMoves.filter((move) => fromCoordinates(move.to) == loc)]
                )
        ),
        [validMoves]
    );

    function checkedSetSelected(sel : number){
        if(pieceAt(board, toCoordinates(sel)) == undefined){
            setSelected(null);
        }else{
            setSelected(sel);
        }
    }

    //console.log("moves onto:", movesOnto);

    return ( 
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
                    let onMouseOver = undefined;
                    if(movesOntoThis.length != 0){
                        bgColor = highlightBgColor;
                        const moveToDo = movesOntoThis[0];
                        onClick = () => {
                            // TODO: add selector in the case where there are multiple paths to a given destination
                            setBoard(performMove(board, moveToDo));
                            setSelected(fromCoordinates(moveToDo.to));
                            setCapturing(null);
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
     );
}

export default GameBoard;