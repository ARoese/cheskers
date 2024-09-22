import { CheckersPiece, expandMove as expandCheckersMove } from "./games/checkers";
import { ChessPiece, expandMove as expandChessMove } from "./games/chess";
import { Board, copyBoard, pieceAt } from "./types/Board";
import { fromCoordinates, toCoordinates, Coordinates, MaybeCoordinates } from "./types/Coordinates";
import { Piece, MaybePiece, copyPiece } from "./types/Piece";

//TODO: use immutable.ts or something similar to garuntee immutability
//of the board. Immutability garuntee should be RECURSIVE.

/** Apply special game rules to the new board state.
 *
 *  newBoard - board state after the basic movement has been applied. This will be mutated then returned.
 *  move - the move performed
 *  movingPiece - the piece object being moved.
 *
 */
export function applySpecialRules(newBoard: Board, move: Move, movingPiece: Piece, takenPiece: MaybePiece): Board {
    // win/loss scenarios
    // chess loss
    if (takenPiece != undefined && takenPiece.type == "king") {
        // opposite color wins
        newBoard.state.winner = takenPiece.color == "red" ? "black" : "red";
    }

    //const pieceCounts : [number, number] = newBoard.pieces.flat()
    //    .reduce(
    //        ([red, black], piece) => {
    //            if(piece == undefined){return [red,black]}
    //            return piece.color == "red" ? [red+1,black] : [red,black+1]
    //        },
    //        [0,0]
    //    );
    const [hasRed, hasBlack]: [boolean, boolean] = (["red", "black"]).map(
        (color) => newBoard.pieces.flat().some(
            (piece) => piece != undefined && piece.color == color
        )
    ) as [boolean, boolean];
    console.log(hasRed, hasBlack);
    if (!hasBlack) {
        newBoard.state.winner = "red";
    } else if (!hasRed) {
        newBoard.state.winner = "black";
    }

    // checkers kinging and multi-attacking
    if (movingPiece.type == "single" && move.to.row == (movingPiece.color == "black" ? 7 : 0)) {
        console.log("checker got kinged");
        movingPiece.type = "double";
        // a kinged piece does not continue multi-attacking
        newBoard.state.multiCapturing = null;
        // swap to other player's turn
        newBoard.state.turn = newBoard.state.turn == "red" ? "black" : "red";
    } else if (movingPiece.game == "checkers" && move.captured != null) {
        // update multi-capturing position
        newBoard.state.multiCapturing = move.to;
        // check if this piece has any valid captures to make
        const validCaptures = getValidMoves(newBoard, fromCoordinates(move.to));
        if (validCaptures.length == 0) { //no valid captures
            // swap to other player's turn
            newBoard.state.turn = newBoard.state.turn == "red" ? "black" : "red";
            // leave capture-only state
            newBoard.state.multiCapturing = null;
        }
    } else {
        // swap to other player's turn
        newBoard.state.turn = newBoard.state.turn == "red" ? "black" : "red";
    }

    // en pessant transitions
    // all pessantable pawns transition into normal pawns each turn
    newBoard.pieces.flat().forEach(piece => {
        if (piece != undefined && piece.type == "pessantable") {
            piece.type = "pawn";
        }
    });
    // a pawn the moves 2 spaces in 1 turn becomes pessantable
    if (movingPiece.type == "pawn" && Math.abs(move.from.row - move.to.row) == 2) {
        console.log("pessantable created");
        movingPiece.type = "pessantable";
    }

    return newBoard;
}

/** Given a board state and a move, return a new board representing the state of the game
 *  after that move has been made.
 */
export function performMove(board: Board, move: Move): Board {

    // copy the board and move the piece according to the move
    const newBoard: Board = copyBoard(board);
    const takenPiece: MaybePiece = move.captured != null
        ? newBoard.pieces[move.captured.row][move.captured.column]
        : undefined;
    if (move.captured != null) {
        newBoard.pieces[move.captured.row][move.captured.column] = undefined;
    }
    
    const movingPiece = newBoard.pieces[move.from.row][move.from.column];
    if (movingPiece == undefined) {
        throw new Error("Tried to move a nonexistent piece");
    }
    if (movingPiece.color != board.state.turn) {
        throw new Error("attempted to move a piece outside of its turn");
    }
    // copy the piece being moved
    const movedPiece = copyPiece(movingPiece);
    // assign that copy
    // this way, mutations to this piece by the function below
    // do not affect the previous board state--it remains unchanged
    newBoard.pieces[move.to.row][move.to.column] = movedPiece;
    newBoard.pieces[move.from.row][move.from.column] = undefined;

    // apply any special game rules and return
    return applySpecialRules(newBoard, move, movedPiece, takenPiece);
}

export function getValidMoves(board: Board, from: number): Move[] {
    const fromCoords = toCoordinates(from);
    const sourcePiece = pieceAt(board, fromCoords);
    if (sourcePiece == undefined || sourcePiece.color != board.state.turn) {
        // an empty space has no valid moves to make
        // a piece cannot move unless it is its turn
        return [];
    }

    // expand based on which game is being played
    return sourcePiece.game == "checkers"
        ? expandCheckersMove(board, fromCoords, sourcePiece as CheckersPiece)
        : expandChessMove(board, fromCoords, sourcePiece as ChessPiece);
}

export function getAllBoardMoves(board: Board): Record<number, Move[]> {
    const allMoves: [number, Move[]][] = board.pieces.flat()
        // evaluate all valid moves for every position
        .map((piece, i) => [i, piece != undefined ? getValidMoves(board, i) : []]);



    const currentGame = board.state.turn == "red" ? board.white : board.black;
    if (currentGame == "chess") {
        return Object.fromEntries(allMoves);
    }

    // checkers player MUST make a capture move if one is available
    const canCapture = allMoves.flatMap((s) => s[1]).some((move) => move.captured != null);
    if (canCapture) {
        // filter out non-capturing moves
        allMoves.forEach(
            (elem) => elem[1] = elem[1].filter((move) => move.captured != null)
        );
    }


    return Object.fromEntries(allMoves);
}
export type Move = {
    from: Coordinates;
    to: Coordinates;
    captured: MaybeCoordinates;
};
