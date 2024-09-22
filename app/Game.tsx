import { useMemo, useState } from "react";
import GameBoard from "./GameBoard";
import { Board, makeBoard } from "./lib/types/Board";
import type { Color, Game } from "./lib/games";
import { getBestMove, Move, performMove, rateBoard } from "./lib/moves";
import GameSettingsForm from "./GameSettingsForm";
import { coordsToString } from "./lib/types/Coordinates";

export type GameOptions = {
    white: Game,
    black: Game,
    realPlayer: Color,
    autoMove: boolean,
    searchDepth: number
};

const defaultOptions : GameOptions = {
    white: "chess",
    black: "checkers", 
    realPlayer: "red",
    autoMove: false,
    searchDepth: 2
};

function Game({className=""} : {className? : string}) {
    const [options, setOptions] = useState<GameOptions>(defaultOptions);
    const [board, setBoard] = useState<Board>(makeBoard(options.white, options.black));
    function doMove(move : Move){
        const nextBoard = performMove(board, move);
        setBoard(nextBoard);
    }

    const [bestMove, searched] = useMemo(() => {
            const depth = isNaN(options.searchDepth) ? 0 : options.searchDepth;
            return getBestMove(board, depth);
        },
        [board, options.searchDepth]);

    if(options.autoMove && board.state.turn != options.realPlayer && bestMove != null){
        doMove(bestMove);
    }

    return ( 
        <div className={className}>
            <button onClick={() => bestMove != null ? doMove(bestMove) : null}>
                Play best move
            </button>
            <GameSettingsForm options={options} setGameSettings={(o) => {setOptions(o); console.log("called setO")}}/>
            <button onClick={() => setBoard(makeBoard(options.white, options.black))}>
                Reset Board
            </button>
            <GameBoard
                board={board}
                doMove={doMove}
                />

            <div>
                <p>Turn: {board.state.turn}</p>
                <p>
                    Multi-capture: {
                        board.state.multiCapturing != null 
                        ? coordsToString(board.state.multiCapturing)
                        : "no multicapture"
                    }
                </p>
                <p>Winner: {board.state.winner == null ? "none" : board.state.winner}</p>
                <p>Board rating: {rateBoard(board)}</p>
                <p>
                    Best move: {
                        bestMove != null 
                        ? `${coordsToString(bestMove.from)} => ${coordsToString(bestMove.to)}`
                        : "none"
                    }
                </p>
                <p>searched {searched} terminals to find this best move.</p>
            </div>
        </div>
     );
}

export default Game;