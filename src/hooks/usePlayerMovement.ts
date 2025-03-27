
import { useState, useCallback } from 'react';
import { Position, Direction } from '../types/game';
import { isValidMove, getNextPosition } from '../utils/gameUtils';

export const usePlayerMovement = (initialPosition: Position) => {
  const [pacmanPosition, setPacmanPosition] = useState<Position>({...initialPosition});
  const [pacmanDirection, setPacmanDirection] = useState<Direction>('none');
  const [queuedDirection, setQueuedDirection] = useState<Direction>('none');
  const [isMoving, setIsMoving] = useState<boolean>(false);
  
  const handleKeyDown = useCallback((
    e: KeyboardEvent, 
    maze: number[][], 
    gameState: { gameOver: boolean, gameStarted: boolean, gamePaused: boolean },
    setGameState: (value: React.SetStateAction<any>) => void
  ) => {
    if (gameState.gameOver) return;
    
    if (!gameState.gameStarted) {
      setGameState(prev => ({ ...prev, gameStarted: true }));
    }
    
    let direction: Direction = 'none';
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        direction = 'up';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        direction = 'down';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        direction = 'left';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        direction = 'right';
        break;
      case 'p':
      case 'P':
        setGameState(prev => ({ 
          ...prev, 
          gamePaused: !prev.gamePaused
        }));
        break;
      default:
        return; // Exit if the key isn't relevant
    }
    
    // Only process direction changes
    if (direction !== 'none') {
      if (isValidMove(maze, pacmanPosition, direction)) {
        setPacmanDirection(direction);
        setIsMoving(true);
      } else {
        setQueuedDirection(direction);
      }
    }
  }, [pacmanPosition]);
  
  const handleDirectionClick = useCallback((
    direction: Direction,
    maze: number[][],
    gameState: { gameOver: boolean, gameStarted: boolean },
    setGameState: (value: React.SetStateAction<any>) => void
  ) => {
    if (gameState.gameOver) return;
    
    if (!gameState.gameStarted) {
      setGameState(prev => ({ ...prev, gameStarted: true }));
    }
    
    if (isValidMove(maze, pacmanPosition, direction)) {
      setPacmanDirection(direction);
      setIsMoving(true);
    } else {
      setQueuedDirection(direction);
    }
  }, [pacmanPosition]);
  
  const movePlayer = useCallback((
    maze: number[][],
    consumePellet: (position: Position) => boolean,
    gameState: { gamePaused: boolean, gameOver: boolean, gameStarted: boolean }
  ) => {
    if (gameState.gamePaused || gameState.gameOver || !gameState.gameStarted) {
      return;
    }
    
    if (pacmanDirection !== 'none') {
      setIsMoving(true);
      
      // Check if queued direction is now valid
      if (queuedDirection !== 'none' && isValidMove(maze, pacmanPosition, queuedDirection)) {
        setPacmanDirection(queuedDirection);
        setQueuedDirection('none');
        const newPosition = getNextPosition(pacmanPosition, queuedDirection);
        setPacmanPosition(newPosition);
        consumePellet(newPosition);
      } 
      // Continue in current direction if valid
      else if (isValidMove(maze, pacmanPosition, pacmanDirection)) {
        const newPosition = getNextPosition(pacmanPosition, pacmanDirection);
        setPacmanPosition(newPosition);
        consumePellet(newPosition);
      }
      // If we can't move, stop animation
      else {
        setIsMoving(false);
      }
    }
  }, [pacmanDirection, queuedDirection, pacmanPosition]);
  
  const resetPlayerPosition = useCallback((initialPos: Position) => {
    setPacmanPosition({...initialPos});
    setPacmanDirection('none');
    setQueuedDirection('none');
    setIsMoving(false);
  }, []);
  
  return {
    pacmanPosition,
    pacmanDirection,
    queuedDirection,
    isMoving,
    handleKeyDown,
    handleDirectionClick,
    movePlayer,
    resetPlayerPosition
  };
};
