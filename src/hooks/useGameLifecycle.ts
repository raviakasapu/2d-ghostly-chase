
import { useCallback } from 'react';
import { GameState } from '../types/game';
import { INITIAL_MAZE, INITIAL_PACMAN_POSITION } from '../utils/gameUtils';

export const useGameLifecycle = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  resetPlayerPosition: (initialPos: any) => void,
  setMaze: React.Dispatch<React.SetStateAction<number[][]>>,
  audio: {
    deathSoundRef: React.RefObject<HTMLAudioElement>
  }
) => {
  const handlePacmanDeath = useCallback(() => {
    if (audio.deathSoundRef.current) {
      audio.deathSoundRef.current.play().catch(() => {});
    }
    
    setGameState(prev => {
      const newLives = prev.lives - 1;
      const gameOver = newLives <= 0;
      
      if (gameOver && prev.score > prev.highScore) {
        localStorage.setItem('pacmanHighScore', prev.score.toString());
      }
      
      return {
        ...prev,
        lives: newLives,
        gameOver: gameOver
      };
    });
    
    if (gameState.lives > 1) {
      resetPlayerPosition({...INITIAL_PACMAN_POSITION});
      
      setGameState(prev => ({ ...prev, gamePaused: true }));
      
      setTimeout(() => {
        setGameState(prev => ({ ...prev, gamePaused: false }));
      }, 1500);
      
      return true; // Pacman died but game continues
    }
    
    return false; // Game over
  }, [gameState.lives, setGameState, resetPlayerPosition, audio.deathSoundRef]);
  
  const resetGame = useCallback((fullReset: boolean = true) => {
    resetPlayerPosition({...INITIAL_PACMAN_POSITION});
    
    setMaze(JSON.parse(JSON.stringify(INITIAL_MAZE)));
    
    setGameState(prev => ({
      ...prev,
      gameOver: false,
      gameStarted: false,
      gamePaused: false,
      ...(fullReset ? { score: 0, lives: 3, level: 1 } : {})
    }));
  }, [resetPlayerPosition, setMaze, setGameState]);
  
  return {
    handlePacmanDeath,
    resetGame
  };
};
