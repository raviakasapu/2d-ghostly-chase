
import React from "react";
import GameBoard from "../components/game/GameBoard";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
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

      {/* Footer - Removing glass panel and making it more compact */}
      <footer className="mx-4 md:mx-auto mb-2 max-w-xl p-1 text-center text-sm text-white/60">
        <p className="text-xs">Use arrow keys or on-screen controls to move Pac-Man</p>
      </footer>
    </div>
  );
};

export default Index;
