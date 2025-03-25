
import { useCallback } from 'react';
import { Position } from '../types/game';

export const usePelletConsumption = (
  maze: number[][],
  setMaze: React.Dispatch<React.SetStateAction<number[][]>>,
  setGameState: React.Dispatch<React.SetStateAction<any>>,
  audio: {
    eatPelletSoundRef: React.RefObject<HTMLAudioElement>,
    eatPowerPelletSoundRef: React.RefObject<HTMLAudioElement>
  }
) => {
  const consumePellet = useCallback((position: Position) => {
    const { x, y } = position;
    const cellValue = maze[y][x];
    
    if (cellValue === 2) {
      setMaze(prevMaze => {
        const newMaze = [...prevMaze];
        newMaze[y][x] = 1;
        return newMaze;
      });
      
      if (audio.eatPelletSoundRef.current) {
        audio.eatPelletSoundRef.current.play().catch(() => {});
      }
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + 10
      }));
    } else if (cellValue === 3) {
      setMaze(prevMaze => {
        const newMaze = [...prevMaze];
        newMaze[y][x] = 1;
        return newMaze;
      });
      
      if (audio.eatPowerPelletSoundRef.current) {
        audio.eatPowerPelletSoundRef.current.play().catch(() => {});
      }
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + 50
      }));
      
      return true; // Power pellet eaten
    }
    
    return false; // No power pellet eaten
  }, [maze, setMaze, setGameState, audio]);
  
  return { consumePellet };
};
