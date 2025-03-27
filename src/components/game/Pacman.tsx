
import React from 'react';
import { Direction, Position } from '../../types/game';

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
      case 'right': return 90;     // 90 degrees - facing right
      case 'down': return 180;    // 180 degrees - facing down
      case 'left': return 270;    // 270 degrees - facing left
      case 'up': return 0;      // 0 degrees - facing up
      default: return 90;
    }
  };

  return (
    <div
      className={`absolute ${isMoving ? 'animate-chomp' : ''}`}
      style={{
        width: size,
        height: size,
        left: position.x * size,
        top: position.y * size,
        transform: `rotate(${getRotation()}deg)`,
        backgroundColor: '#FFCC00',
        borderRadius: '50%',
      }}
    />
  );
};

export default Pacman;
