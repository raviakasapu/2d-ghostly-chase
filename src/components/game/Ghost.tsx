
import React from 'react';
import { Ghost as GhostType, Direction } from '../../types/game';
import { DIRECTION_DEGREES } from '../../utils/gameUtils';

interface GhostProps {
  ghost: GhostType;
  size: number;
}

const Ghost: React.FC<GhostProps> = ({ ghost, size }) => {
  const { type, position, direction, state } = ghost;
  
  // Determine ghost color based on state and type
  const ghostColor = state === 'frightened' 
    ? 'ghost-frightened' 
    : `bg-game-${type}`;
  
  // Different eye positions based on direction
  const getEyeStyles = (direction: Direction) => {
    const baseEyeStyles = {
      left: { left: size * 0.1, top: size * 0.2 },
      right: { left: size * 0.55, top: size * 0.2 }
    };
    
    // Adjust pupil position based on direction
    const leftPupilStyles = { left: size * 0.2, top: size * 0.2 };
    const rightPupilStyles = { left: size * 0.65, top: size * 0.2 };
    
    switch (direction) {
      case 'up':
        leftPupilStyles.top = size * 0.15;
        rightPupilStyles.top = size * 0.15;
        break;
      case 'down':
        leftPupilStyles.top = size * 0.25;
        rightPupilStyles.top = size * 0.25;
        break;
      case 'left':
        leftPupilStyles.left = size * 0.15;
        rightPupilStyles.left = size * 0.6;
        break;
      case 'right':
        leftPupilStyles.left = size * 0.25;
        rightPupilStyles.left = size * 0.7;
        break;
      default:
        break;
    }
    
    return {
      leftEye: baseEyeStyles.left,
      rightEye: baseEyeStyles.right,
      leftPupil: leftPupilStyles,
      rightPupil: rightPupilStyles
    };
  };
  
  const eyeStyles = getEyeStyles(direction);
  
  return (
    <div
      className={`ghost ${ghostColor}`}
      style={{
        width: size,
        height: size,
        left: position.x * size,
        top: position.y * size,
      }}
    >
      {/* Eyes only shown in normal state */}
      {state !== 'frightened' && (
        <>
          {/* Left eye */}
          <div
            className="ghost-eyes"
            style={{
              width: size * 0.3,
              height: size * 0.3,
              ...eyeStyles.leftEye
            }}
          >
            <div
              className="ghost-pupil"
              style={{
                width: size * 0.15,
                height: size * 0.15,
                left: size * 0.075,
                top: size * 0.075,
              }}
            />
          </div>
          
          {/* Right eye */}
          <div
            className="ghost-eyes"
            style={{
              width: size * 0.3,
              height: size * 0.3,
              ...eyeStyles.rightEye
            }}
          >
            <div
              className="ghost-pupil"
              style={{
                width: size * 0.15,
                height: size * 0.15,
                left: size * 0.075,
                top: size * 0.075,
              }}
            />
          </div>
        </>
      )}
      
      {/* Frightened eyes */}
      {state === 'frightened' && (
        <div className="relative w-full h-full flex justify-center items-center">
          <div className="text-white font-bold text-xl">?</div>
        </div>
      )}
    </div>
  );
};

export default Ghost;
