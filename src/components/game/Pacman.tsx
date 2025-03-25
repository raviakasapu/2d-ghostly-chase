
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
      className={`pacman ${isMoving ? 'animate-chomp' : ''}`}
      style={{
        width: size,
        height: size,
        left: position.x * size,
        top: position.y * size,
        transform: `rotate(${DIRECTION_DEGREES[direction]}deg)`,
      }}
    />
  );
};

export default Pacman;
