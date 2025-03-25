
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
      {/* Ghost body */}
      <div className="ghost-body w-full h-3/4 rounded-t-full relative">
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
        
        {/* Eyes - only shown in normal state */}
        {state !== 'frightened' && (
          <div className="absolute top-1/4 left-0 w-full flex justify-center space-x-1">
            <div className="ghost-eye w-1/4 h-1/2 rounded-full flex justify-center items-center">
              <div 
                className="ghost-pupil w-1/2 h-1/2 rounded-full" 
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
            <div className="ghost-eye w-1/4 h-1/2 rounded-full flex justify-center items-center">
              <div 
                className="ghost-pupil w-1/2 h-1/2 rounded-full"
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

        {/* Frightened face */}
        {state === 'frightened' && (
          <div className="absolute top-1/4 left-0 w-full flex flex-col items-center justify-center">
            <div className="flex justify-center space-x-2 mb-1">
              <div className="bg-white w-1/5 h-1 rounded-full"></div>
              <div className="bg-white w-1/5 h-1 rounded-full"></div>
            </div>
            <div className="bg-white w-2/5 h-1 mt-2 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ghost;
