
import React from 'react';
import { Direction } from '../../types/game';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface GameControlsProps {
  onDirectionClick: (direction: Direction) => void;
}

const GameControls: React.FC<GameControlsProps> = ({ onDirectionClick }) => {
  return (
    <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center">
      <div className="glass-panel p-2 rounded-full grid grid-cols-3 grid-rows-3 gap-1">
        {/* Up button */}
        <button 
          className="col-start-2 row-start-1 secondary-btn rounded-full p-2"
          onClick={() => onDirectionClick('up')}
          aria-label="Move up"
        >
          <ArrowUp size={24} className="text-white" />
        </button>
        
        {/* Left button */}
        <button 
          className="col-start-1 row-start-2 secondary-btn rounded-full p-2"
          onClick={() => onDirectionClick('left')}
          aria-label="Move left"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        
        {/* Empty center */}
        <div className="col-start-2 row-start-2"></div>
        
        {/* Right button */}
        <button 
          className="col-start-3 row-start-2 secondary-btn rounded-full p-2"
          onClick={() => onDirectionClick('right')}
          aria-label="Move right"
        >
          <ArrowRight size={24} className="text-white" />
        </button>
        
        {/* Down button */}
        <button 
          className="col-start-2 row-start-3 secondary-btn rounded-full p-2"
          onClick={() => onDirectionClick('down')}
          aria-label="Move down"
        >
          <ArrowDown size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default GameControls;
