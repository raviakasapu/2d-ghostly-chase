
import React from 'react';
import { Direction, Position } from '../../types/game';

interface PacmanProps {
  position: Position;
  direction: Direction;
  size: number;
  isMoving: boolean;
}

const Pacman: React.FC<PacmanProps> = ({ position, direction, size, isMoving }) => {
  // We'll apply custom CSS to create the mouth based on direction
  const getMouthStyle = () => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      backgroundColor: '#FFCC00',
      borderRadius: '50%',
      position: 'relative' as const,
      overflow: 'hidden'
    };

    // Create a triangle cutout for the mouth
    const afterStyle = {
      content: '""',
      position: 'absolute' as const,
      width: '50%',
      height: '50%',
      backgroundColor: 'transparent'
    };

    // Position the mouth based on direction
    const directionStyles = {
      right: { ...afterStyle, right: 0, top: '25%', borderLeft: `${size/2}px solid black` },
      left: { ...afterStyle, left: 0, top: '25%', borderRight: `${size/2}px solid black` },
      up: { ...afterStyle, top: 0, left: '25%', borderBottom: `${size/2}px solid black` },
      down: { ...afterStyle, bottom: 0, left: '25%', borderTop: `${size/2}px solid black` },
      none: { ...afterStyle, display: 'none' }
    };

    return {
      base: baseStyle,
      mouth: directionStyles[direction] || directionStyles.right
    };
  };

  const styles = getMouthStyle();

  return (
    <div
      className={`pacman absolute ${isMoving ? 'animate-chomp' : ''}`}
      style={{
        width: size,
        height: size,
        left: position.x * size,
        top: position.y * size,
      }}
    >
      <div style={styles.base}>
        <div style={styles.mouth}></div>
      </div>
    </div>
  );
};

export default Pacman;
