
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
  return (
    <div
      className={`pacman absolute ${isMoving ? 'animate-chomp' : ''}`}
      style={{
        width: size,
        height: size,
        left: position.x * size,
        top: position.y * size,
        transform: `rotate(0deg)`, // Always facing right
      }}
    >
      {/* Inner circle to create pacman shape */}
      <div className="absolute inset-0 bg-game-pacman rounded-full" />
    </div>
  );
};

export default Pacman;
