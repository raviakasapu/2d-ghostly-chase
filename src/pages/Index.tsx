
import React from "react";
import GameBoard from "../components/game/GameBoard";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      {/* Header Section - Making it even more compact */}
      <header className="py-1 px-6 flex justify-center">
        <h1 className="text-3xl md:text-4xl font-bold game-title">
          PAC-MAN
        </h1>
      </header>

      {/* Main Game Area - Maximizing vertical space */}
      <main className="flex-1 flex items-start justify-center p-2">
        <div className="w-full flex justify-center">
          <GameBoard />
        </div>
      </main>
    </div>
  );
};

export default Index;
