
import React from 'react';

interface GameUIProps {
  score: number;
  lives: number;
  level: number;
}

const GameUI: React.FC<GameUIProps> = ({ score, lives, level }) => {
  return (
    <div className="glass-panel mt-4 p-4 w-full flex items-center justify-between">
      <div className="flex flex-col items-start">
        <span className="text-xs text-white/70">SCORE</span>
        <span className="text-white text-xl font-bold score-counter">{score}</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        {Array.from({ length: lives }).map((_, i) => (
          <div 
            key={`life-${i}`} 
            className="bg-game-pacman w-4 h-4 rounded-full"
            style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
          />
        ))}
      </div>
      
      <div className="flex flex-col items-end">
        <span className="text-xs text-white/70">LEVEL</span>
        <span className="text-white text-xl font-bold">{level}</span>
      </div>
    </div>
  );
};

export default GameUI;
