import { useMemo, useState } from "react";
import GamePiece from "./GamePiece";
import {Board, fromCoordinates, getAllBoardMoves, getValidMoves, makeBoard, Move, performMove, pieceAt, toCoordinates } from "./lib/shared";

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

function GameBoard({className=""} : {className? : string}) {
    const [board, setBoard] = useState(makeBoard("chess", "chess"));
    const [selected, setSelected] = useState(null as number | null);
    const [capturing, setCapturing] =  useState(null as number | null);
    const selectedBgColor = "bg-blue-300";
    const highlightBgColor = "bg-yellow-300";
    const captureBgColor = "bg-red-500";
    const boardMoves = useMemo(() => getAllBoardMoves(board), [board]);
    const [validMoves, movesOnto] = useMemo(() => getValidMovesCombined(boardMoves, selected), [boardMoves, selected]);

    function checkedSetSelected(sel : number){
        const targetPiece = pieceAt(board, toCoordinates(sel));
        if(targetPiece == undefined || targetPiece.color != board.state.turn){
            setSelected(null);
        }else{
            setSelected(sel);
        }
    }

    function doMove(move : Move){
        const nextBoard = performMove(board, move);
        setBoard(nextBoard);
        // if multicapturing, select that piece
        if(nextBoard.state.multiCapturing != null){
            setSelected(fromCoordinates(nextBoard.state.multiCapturing));
        // two turns can't be taken in series outside of checkers multicapturing, so
        // just select null and wait for the user to select that themselves
        }else{
            setSelected(null);
        }
        
        setCapturing(null);
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
        <div>
            <p>Turn: {board.state.turn}</p>
            <p>
                Multi-capture: {
                    board.state.multiCapturing != null 
                    ? `row: ${board.state.multiCapturing.row}, column: ${board.state.multiCapturing.column}`
                    : "no multicapture"
                }
            </p>
            <p>Winner: {board.state.winner == null ? "none" : board.state.winner}</p>
        </div>
        </>
     );
}

export default GameBoard;