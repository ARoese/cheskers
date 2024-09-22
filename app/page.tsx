"use client";
import GameBoard from "./GameBoard";

export default function Home() {
  
  //console.log(board.pieces.flat().length);
  return (
    <main>
      <GameBoard className="w-1/3 mx-auto my-10"/>
    </main>
  );
}
