
import React from 'react';

interface GameOverProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, highScore, onRestart }) => {
  const isNewHighScore = score > highScore;
  
  return (
    <div className="game-over-overlay">
      <div className="game-over-card">
        <h2 className="text-white text-4xl font-bold">GAME OVER</h2>
        
        <div className="space-y-3 w-full">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Score:</span>
            <span className="text-white text-xl font-bold">{score}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/80">High Score:</span>
            <span className="text-white text-xl font-bold">{Math.max(score, highScore)}</span>
          </div>
        </div>
        
        {isNewHighScore && (
          <div className="py-2 px-4 bg-game-pacman/20 border border-game-pacman/30 rounded-lg">
            <p className="text-white font-medium">New High Score!</p>
          </div>
        )}
        
        <button
          className="primary-btn px-8 py-3 mt-4"
          onClick={onRestart}
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOver;
