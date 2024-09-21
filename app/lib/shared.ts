import { CheckersPieceType, CheckersPiece, expandMove as expandCheckersMove} from "./checkers";
import { ChessPiece, ChessPieceType, expandMove as expandChessMove } from "./chess";

export type PieceType = CheckersPieceType | ChessPieceType;
export const pieceTypes = ["double", "single", "pawn", "king", "queen", "rook", "bishop", "knight"];
export type Game = "chess" | "checkers";
// In a chess game, "red" is used as "white."
export type Color = "black" | "red";

export type Piece = {
    game: Game,
    color: Color,
    type: PieceType
}

export type MaybePiece = Piece | undefined;
type GameState = {
    turn: Color, // whose turn it currently is
    // whether the board is in a "capture only" state.
    // This could happen because a checkers piece is able to capture
    // this can be restricted so that only a specific piece is allowed
    // to capture
    multiCapturing: MaybeCoordinates,
    winner: Color | null
}
// Boards are organized ALWAYS with "white" at the bottom
export type Board = {
    pieces: MaybePiece[][],
    black: Game,
    white: Game,
    state: GameState
};

export type MaybeCoordinates = Coordinates | null;

export type Move = {
    from: Coordinates,
    to: Coordinates,
    captured: MaybeCoordinates
};

export type Coordinates = {
    row: number,
    column : number
}

export function toCoordinates(index : number) : Coordinates {
    const row = Math.floor(index/8);
    const column = index - row*8;
    return {row, column};
}

export function coordsEqual(a : Coordinates, b : Coordinates) {
    return a.row == b.row && b.column == b.column;
}

export function fromCoordinates(coords : Coordinates) : number {
    return coords.row*8 + coords.column;
}

export function addCoords(a : Coordinates, b : Coordinates) : Coordinates {
    return {
        row: a.row + b.row,
        column: a.column + b.column
    };
}

export function onBoard(coords : Coordinates) : boolean {
    return (
        coords.row >= 0 && coords.row < 8
        && coords.column >= 0 && coords.column < 8
    );
}

export function scaleCoords(scalar : number, coordinate : Coordinates) : Coordinates {
    return {
        row: coordinate.row*scalar,
        column: coordinate.column*scalar
    };
}

export function pieceAt(board : Board, location : Coordinates) : MaybePiece {
    if(!onBoard(location)){
        return undefined;
    }
    return board.pieces[location.row][location.column];
}

export function hasPiece(board : Board, location : Coordinates) : boolean {
    return pieceAt(board, location) != undefined;
}

export function getAllBoardMoves(board : Board) : Record<number, Move[]> {
    const allMoves : [number, Move[]][] = board.pieces.flat()
        // evaluate all valid moves for every position
        .map((piece, i) => [i, piece != undefined ? getValidMoves(board, i) : []])
    
    

    const currentGame = board.state.turn == "red" ? board.white : board.black;
    if(currentGame == "chess"){
        return Object.fromEntries(allMoves);
    }
    
    // checkers player MUST make a capture move if one is available
    const canCapture = allMoves.flatMap((s) => s[1]).some((move) => move.captured != null);
    if(canCapture){
        // filter out non-capturing moves
        allMoves.forEach(
            (elem) => elem[1] = elem[1].filter((move) => move.captured != null)
        );
    }
    

    return Object.fromEntries(allMoves);
}

export function getValidMoves(board : Board, from : number) : Move[] {
    const fromCoords = toCoordinates(from);
    const sourcePiece = pieceAt(board, fromCoords);
    if(sourcePiece == undefined || sourcePiece.color != board.state.turn){
        // an empty space has no valid moves to make
        // a piece cannot move unless it is its turn
        return []; 
    }

    // expand based on which game is being played
    return sourcePiece.game == "checkers" 
        ? expandCheckersMove(board, fromCoords, sourcePiece as CheckersPiece) 
        : expandChessMove(board, fromCoords, sourcePiece as ChessPiece);
}

export function makePiece(type: PieceType, color: Color, game: Game) {
    return {
        type,
        color,
        game
    };
}

export function reverseCoordinates(toReverse : Coordinates) : Coordinates {
    return {
        row: 7-toReverse.row,
        column: toReverse.column
    }
}

/** Apply special game rules to the new board state.
 * 
 *  newBoard - board state after the basic movement has been applied. This will be mutated then returned.
 *  move - the move performed
 *  movingPiece - the piece object being moved.
 * 
 */
function applySpecialRules(newBoard : Board, move : Move, movingPiece : Piece, takenPiece : MaybePiece) : Board {
    // win/loss scenarios
    // chess loss
    if(takenPiece != undefined && takenPiece.type == "king"){
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

    const [hasRed, hasBlack] : [boolean, boolean] = (["red", "black"]).map(
        (color) => newBoard.pieces.flat().some(
            (piece) => piece != undefined && piece.color == color
        )
    ) as [boolean, boolean];
    console.log(hasRed, hasBlack)
    if(!hasBlack){
        newBoard.state.winner = "red";
    }else if(!hasRed){
        newBoard.state.winner = "black";
    }

    // checkers kinging and multi-attacking
    if( movingPiece.type == "single" && move.to.row == (movingPiece.color == "black" ? 7 : 0) ){
        console.log("checker got kinged");
        movingPiece.type = "double";
        // a kinged piece does not continue multi-attacking
        newBoard.state.multiCapturing = null;
        // swap to other player's turn
        newBoard.state.turn = newBoard.state.turn == "red" ? "black" : "red";
    }else if(movingPiece.game == "checkers" && move.captured != null){
        // update multi-capturing position
        newBoard.state.multiCapturing = move.to; 
        // check if this piece has any valid captures to make
        const validCaptures = getValidMoves(newBoard, fromCoordinates(move.to));
        if(validCaptures.length == 0){ //no valid captures
            // swap to other player's turn
            newBoard.state.turn = newBoard.state.turn == "red" ? "black" : "red";
            // leave capture-only state
            newBoard.state.multiCapturing = null;
        }
    }else{
        // swap to other player's turn
        newBoard.state.turn = newBoard.state.turn == "red" ? "black" : "red";
    }

    // en pessant transitions
    // all pessantable pawns transition into normal pawns each turn
    newBoard.pieces.flat().forEach(piece => {
        if(piece!=undefined && piece.type == "pessantable"){
            piece.type = "pawn";
        }
    });
    // a pawn the moves 2 spaces in 1 turn becomes pessantable
    if( movingPiece.type == "pawn" && Math.abs(move.from.row - move.to.row) == 2){
        console.log("pessantable created");
        movingPiece.type = "pessantable";
    }

    return newBoard;
}

/** Given a board state and a move, return a new board representing the state of the game
 *  after that move has been made.
 */
export function performMove(board : Board, move : Move) : Board {

    // copy the board and move the piece according to the move
    const newBoard : Board = copyBoard(board);
    const takenPiece : MaybePiece = move.captured != null
        ? newBoard.pieces[move.captured.row][move.captured.column] 
        : undefined;
    if(move.captured != null){
        newBoard.pieces[move.captured.row][move.captured.column] = undefined;
    }
    const movingPiece = newBoard.pieces[move.from.row][move.from.column];
    if(movingPiece == undefined){
        throw new Error("Tried to move a nonexistent piece");
    }
    if(movingPiece.color != board.state.turn){
        throw new Error("attempted to move a piece outside of its turn");
    }

    newBoard.pieces[move.to.row][move.to.column] = movingPiece;
    newBoard.pieces[move.from.row][move.from.column] = undefined;

    // apply any special game rules and return
    return applySpecialRules(newBoard, move, movingPiece, takenPiece);
}

export function emptyBoard(white : Game, black : Game) : Board {
    return {
        pieces: [...Array(8).keys()].map(() => [...Array(8).keys()].map(() => undefined)),
        black,
        white,
        state: {
            turn: "red",
            multiCapturing: null,
            winner: null
        }
    };
}

export function copyBoard(board : Board) : Board {
    return {
        pieces: board.pieces.map((row) => [...row]),
        black: board.black,
        white: board.white,
        state: {
            turn: board.state.turn,
            multiCapturing: board.state.multiCapturing,
            winner: board.state.winner
        }
    }
}

export function makeBoard(white : Game, black : Game) : Board {
    const board = emptyBoard(white, black);

    const checkersEven = ["single", undefined, "single", undefined, "single", undefined, "single", undefined];
    const checkersOdd = [undefined, "single", undefined, "single", undefined, "single", undefined, "single"];

    // populate black's side
    if(board.black == "chess"){ // as chess
        const whiteBackRow = ["rook", "knight", "bishop", "king", "queen", "bishop", "knight", "rook"] as PieceType[];
        board.pieces[0] = whiteBackRow.map((type) => makePiece(type, "black", "chess"));
        board.pieces[1] = [...Array(8).keys()].map(() => makePiece("pawn", "black", "chess"));
    }else{ // as checkers
        board.pieces[0] = checkersOdd .map((type) => type == undefined ? undefined : makePiece("single", "black", "checkers"));
        board.pieces[1] = checkersEven.map((type) => type == undefined ? undefined : makePiece("single", "black", "checkers"));
        board.pieces[2] = checkersOdd .map((type) => type == undefined ? undefined : makePiece("single", "black", "checkers"));
    }

    // populate red's side
    if(board.white == "chess"){ // as chess
        const whiteBackRow = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"] as PieceType[];
        board.pieces[6] = [...Array(8).keys()].map(() => makePiece("pawn", "red", "chess"));
        board.pieces[7] = whiteBackRow.map((type) => makePiece(type, "red", "chess"));
    }else{ // as checkers
        board.pieces[5] = checkersEven.map((type) => type == undefined ? undefined : makePiece("single", "red", "checkers"));
        board.pieces[6] = checkersOdd .map((type) => type == undefined ? undefined : makePiece("single", "red", "checkers"));
        board.pieces[7] = checkersEven.map((type) => type == undefined ? undefined : makePiece("single", "red", "checkers"));
    }
    
    return board;
}