
import React from "react";
import GameBoard from "../components/game/GameBoard";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-white">
      {/* Header Section - Making it more compact */}
      <header className="py-2 px-6 flex justify-center">
        <h1 className="text-4xl md:text-5xl font-bold game-title">
          PAC-MAN
        </h1>
      </header>

      {/* Main Game Area - Centering content vertically */}
      <main className="flex-1 flex items-center justify-center p-4 pb-2">
        <div className="w-full flex justify-center">
          <GameBoard />
        </div>
      </main>
    </div>
  );
};

export default Index;
