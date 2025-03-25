
import React from 'react';
import { CellType } from '../../types/game';

interface CellProps {
  type: CellType | number;
  size: number;
}

const Cell: React.FC<CellProps> = ({ type, size }) => {
  // Convert numeric type to string type
  let cellType: CellType = 'empty';
  if (typeof type === 'number') {
    switch (type) {
      case 0: cellType = 'wall'; break;
      case 2: cellType = 'pellet'; break;
      case 3: cellType = 'power-pellet'; break;
      default: cellType = 'empty';
    }
  } else {
    cellType = type;
  }

  switch (cellType) {
    case 'wall':
      return (
        <div 
          className="wall" 
          style={{ 
            width: size, 
            height: size
          }}
        />
      );
    case 'pellet':
      return (
        <div 
          className="cell" 
          style={{ 
            width: size, 
            height: size,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div 
            className="pellet" 
            style={{ 
              width: size / 5, 
              height: size / 5
            }}
          />
        </div>
      );
    case 'power-pellet':
      return (
        <div 
          className="cell" 
          style={{ 
            width: size, 
            height: size,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center' 
          }}
        >
          <div 
            className="power-pellet" 
            style={{ 
              width: size / 2, 
              height: size / 2
            }}
          />
        </div>
      );
    default:
      return (
        <div 
          className="cell"
          style={{ 
            width: size, 
            height: size
          }}
        />
      );
  }
};

export default Cell;
