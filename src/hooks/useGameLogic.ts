
import { useState, useRef, useEffect } from 'react';
import { GameState } from '../types/game';
import { 
  INITIAL_MAZE, 
  INITIAL_PACMAN_POSITION,
  countRemainingPellets
} from '../utils/gameUtils';
import { useGameAudio } from './useGameAudio';
import { usePlayerMovement } from './usePlayerMovement';
import { usePelletConsumption } from './usePelletConsumption';
import { useGameLifecycle } from './useGameLifecycle';

const GAME_SPEED = 150; // ms per tick

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
    gameStarted: false,
    gamePaused: false,
    highScore: parseInt(localStorage.getItem('pacmanHighScore') || '0')
  });
  
  const [maze, setMaze] = useState<number[][]>(JSON.parse(JSON.stringify(INITIAL_MAZE)));
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use the specialized hooks
  const audioRefs = useGameAudio();
  
  const {
    pacmanPosition,
    pacmanDirection,
    isMoving,
    handleKeyDown,
    handleDirectionClick,
    movePlayer,
    resetPlayerPosition
  } = usePlayerMovement(INITIAL_PACMAN_POSITION);
  
  const { consumePellet } = usePelletConsumption(
    maze, 
    setMaze, 
    setGameState, 
    {
      eatPelletSoundRef: audioRefs.eatPelletSoundRef,
      eatPowerPelletSoundRef: audioRefs.eatPowerPelletSoundRef
    }
  );
  
  const { handlePacmanDeath, resetGame } = useGameLifecycle(
    gameState,
    setGameState,
    resetPlayerPosition,
    setMaze,
    { deathSoundRef: audioRefs.deathSoundRef }
  );
  
  // Check for level completion
  useEffect(() => {
    const pelletCount = countRemainingPellets(maze);
    
    if (pelletCount === 0 && gameState.gameStarted && !gameState.gameOver) {
      setGameState(prev => ({
        ...prev,
        level: prev.level + 1
      }));
      
      resetGame(false);
    }
  }, [maze, gameState.gameStarted, gameState.gameOver, resetGame]);
  
  // Main game loop
  const gameLoop = () => {
    movePlayer(maze, consumePellet, {
      gamePaused: gameState.gamePaused,
      gameOver: gameState.gameOver,
      gameStarted: gameState.gameStarted
    });
  };
  
  // Set up event listeners and game loop
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      handleKeyDown(e, maze, {
        gameOver: gameState.gameOver,
        gameStarted: gameState.gameStarted,
        gamePaused: gameState.gamePaused
      }, setGameState);
    };
    
    window.addEventListener('keydown', keyDownHandler);
    
    if (gameState.gameStarted && !gameState.gamePaused && !gameState.gameOver) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      gameLoopRef.current = setInterval(gameLoop, GAME_SPEED);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [
    handleKeyDown,
    maze,
    gameState.gameStarted,
    gameState.gamePaused,
    gameState.gameOver
  ]);
  
  // Adapter function for direction clicks from UI
  const handleDirectionClickAdapter = (direction: any) => {
    handleDirectionClick(
      direction,
      maze,
      { gameOver: gameState.gameOver, gameStarted: gameState.gameStarted },
      setGameState
    );
  };
  
  return {
    gameState,
    setGameState,
    maze,
    pacmanPosition,
    pacmanDirection,
    isMoving,
    handleDirectionClick: handleDirectionClickAdapter,
    resetGame,
    handlePacmanDeath,
    consumePellet,
    ghostEatenSoundRef: audioRefs.ghostEatenSoundRef
  };
};
