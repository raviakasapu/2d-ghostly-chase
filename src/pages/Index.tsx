
import React from "react";
import GameBoard from "../components/game/GameBoard";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      {/* Header Section */}
      <header className="py-4 px-6 flex justify-center">
        <h1 className="text-4xl md:text-5xl font-bold game-title">
          PAC<span className="text-game-pacman">•</span>MAN
        </h1>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          <GameBoard />
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-panel mx-4 md:mx-auto mt-4 mb-6 max-w-xl p-4 text-center text-sm text-white/60">
        <p>Use arrow keys or on-screen controls to move Pac-Man</p>
        <p>Collect all pellets to advance to the next level</p>
      </footer>
    </div>
  );
};

export default Index;
