
import React from 'react';
import { Direction, Position } from '../../types/game';
import { DIRECTION_DEGREES } from '../../utils/gameUtils';

interface PacmanProps {
  position: Position;
  direction: Direction;
  size: number;
  isMoving: boolean;
}

const Pacman: React.FC<PacmanProps> = ({ position, direction, size, isMoving }) => {
  // Determine rotation based on direction
  const getRotation = () => {
    switch (direction) {
      case 'right': return 0;
      case 'down': return 90;
      case 'left': return 180;
      case 'up': return 270;
      default: return 0;
    }
  };

  return (
    <div
      className={`pacman absolute ${isMoving ? 'animate-chomp' : ''}`}
      style={{
        width: size,
        height: size,
        left: position.x * size,
        top: position.y * size,
        transform: `rotate(${getRotation()}deg)`,
      }}
    >
      {/* Inner circle to create pacman shape */}
      <div className="absolute inset-0 bg-game-pacman rounded-full">
        {/* Mouth animation is handled by CSS animations */}
        <div className="pacman-mouth"></div>
      </div>
    </div>
  );
};

export default Pacman;
