
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
    : `ghost-${type}`;
  
  // Add a hint about the ghost's behavior
  const getGhostBehaviorIcon = () => {
    if (state === 'frightened') {
      return '🏃';
    }
    
    switch (type) {
      case 'blinky':
        return '🎯'; // Direct pursuit
      case 'pinky':
        return '⚡'; // Ambush
      case 'inky':
        return '👣'; // Patrol
      case 'clyde':
        return '🎲'; // Random
      default:
        return '';
    }
  };
  
  return (
    <div
      className={`ghost ${ghostColor} absolute`}
      style={{
        width: size,
        height: size,
        left: position.x * size,
        top: position.y * size,
      }}
    >
      {/* Ghost body - more rounded with proper ghost shape */}
      <div className="ghost-body w-full h-3/4 rounded-t-full relative overflow-visible">
        {/* Ghost behavior indicator */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-xs">
          {getGhostBehaviorIcon()}
        </div>
        
        {/* Ghost bottom wavy part */}
        <div className="ghost-bottom absolute bottom-0 left-0 w-full h-1/4">
          <div className="flex h-full">
            <div className="w-1/5 h-full ghost-wave"></div>
            <div className="w-1/5 h-full ghost-wave"></div>
            <div className="w-1/5 h-full ghost-wave"></div>
            <div className="w-1/5 h-full ghost-wave"></div>
            <div className="w-1/5 h-full ghost-wave"></div>
          </div>
        </div>
        
        {/* Eyes - larger, more expressive when in normal state */}
        {state !== 'frightened' && (
          <div className="absolute top-1/4 left-0 w-full flex justify-center space-x-2">
            <div className="ghost-eye w-1/4 h-2/5 rounded-full bg-white flex justify-center items-center">
              <div 
                className="ghost-pupil w-1/2 h-1/2 rounded-full bg-black" 
                style={{
                  transform: `translate(${
                    direction === 'left' ? '-25%' : 
                    direction === 'right' ? '25%' : '0'
                  }%, ${
                    direction === 'up' ? '-25%' : 
                    direction === 'down' ? '25%' : '0'
                  }%)`
                }}
              />
            </div>
            <div className="ghost-eye w-1/4 h-2/5 rounded-full bg-white flex justify-center items-center">
              <div 
                className="ghost-pupil w-1/2 h-1/2 rounded-full bg-black"
                style={{
                  transform: `translate(${
                    direction === 'left' ? '-25%' : 
                    direction === 'right' ? '25%' : '0'
                  }%, ${
                    direction === 'up' ? '-25%' : 
                    direction === 'down' ? '25%' : '0'
                  }%)`
                }}
              />
            </div>
          </div>
        )}

        {/* Frightened face - improved with blue color and expressive mouth */}
        {state === 'frightened' && (
          <div className="absolute top-1/4 left-0 w-full flex flex-col items-center justify-center">
            <div className="flex justify-center space-x-4 mb-2">
              <div className="bg-white w-1/6 h-1.5 rounded-full"></div>
              <div className="bg-white w-1/6 h-1.5 rounded-full"></div>
            </div>
            <div className="bg-white w-2/5 h-1.5 mt-2 rounded-full" style={{ 
              borderRadius: '40%',
              transform: 'rotate(180deg)'
            }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ghost;
