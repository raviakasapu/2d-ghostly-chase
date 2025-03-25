
import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Position, 
  Direction, 
  Ghost as GhostType,
  GameState
} from '../types/game';
import { 
  INITIAL_MAZE, 
  MAZE_WIDTH, 
  MAZE_HEIGHT,
  INITIAL_PACMAN_POSITION,
  INITIAL_GHOST_POSITIONS,
  isValidMove,
  getNextPosition,
  countRemainingPellets
} from '../utils/gameUtils';

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
  const [pacmanPosition, setPacmanPosition] = useState<Position>({...INITIAL_PACMAN_POSITION});
  const [pacmanDirection, setPacmanDirection] = useState<Direction>('none');
  const [queuedDirection, setQueuedDirection] = useState<Direction>('none');
  const [isMoving, setIsMoving] = useState<boolean>(false);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  
  const eatPelletSoundRef = useRef<HTMLAudioElement | null>(null);
  const eatPowerPelletSoundRef = useRef<HTMLAudioElement | null>(null);
  const deathSoundRef = useRef<HTMLAudioElement | null>(null);
  const ghostEatenSoundRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    eatPelletSoundRef.current = new Audio();
    eatPowerPelletSoundRef.current = new Audio();
    deathSoundRef.current = new Audio();
    ghostEatenSoundRef.current = new Audio();
    
    if (eatPelletSoundRef.current) eatPelletSoundRef.current.volume = 0.2;
    if (eatPowerPelletSoundRef.current) eatPowerPelletSoundRef.current.volume = 0.3;
    if (deathSoundRef.current) deathSoundRef.current.volume = 0.4;
    if (ghostEatenSoundRef.current) ghostEatenSoundRef.current.volume = 0.3;
  }, []);
  
  const consumePellet = useCallback((position: Position) => {
    const { x, y } = position;
    const cellValue = maze[y][x];
    
    if (cellValue === 2) {
      setMaze(prevMaze => {
        const newMaze = [...prevMaze];
        newMaze[y][x] = 1;
        return newMaze;
      });
      
      if (eatPelletSoundRef.current) {
        eatPelletSoundRef.current.play().catch(() => {});
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
      
      if (eatPowerPelletSoundRef.current) {
        eatPowerPelletSoundRef.current.play().catch(() => {});
      }
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + 50
      }));
      
      return true; // Power pellet eaten
    }
    
    return false; // No power pellet eaten
  }, [maze]);
  
  useEffect(() => {
    const pelletCount = countRemainingPellets(maze);
    
    if (pelletCount === 0 && gameState.gameStarted && !gameState.gameOver) {
      setGameState(prev => ({
        ...prev,
        level: prev.level + 1
      }));
      
      resetGame(false);
    }
  }, [maze, gameState.gameStarted, gameState.gameOver]);
  
  const handlePacmanDeath = useCallback(() => {
    if (deathSoundRef.current) {
      deathSoundRef.current.play().catch(() => {});
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
      setPacmanPosition({...INITIAL_PACMAN_POSITION});
      setPacmanDirection('none');
      setQueuedDirection('none');
      setIsMoving(false);
      
      setGameState(prev => ({ ...prev, gamePaused: true }));
      
      setTimeout(() => {
        setGameState(prev => ({ ...prev, gamePaused: false }));
      }, 1500);
      
      return true; // Pacman died but game continues
    }
    
    return false; // Game over
  }, [gameState.lives]);
  
  const gameLoop = useCallback(() => {
    if (gameState.gamePaused || gameState.gameOver || !gameState.gameStarted) {
      return;
    }
    
    if (pacmanDirection !== 'none') {
      setIsMoving(true);
      
      if (queuedDirection !== 'none' && isValidMove(maze, pacmanPosition, queuedDirection)) {
        setPacmanDirection(queuedDirection);
        setQueuedDirection('none');
        const newPosition = getNextPosition(pacmanPosition, queuedDirection);
        setPacmanPosition(newPosition);
        consumePellet(newPosition);
      } 
      else if (isValidMove(maze, pacmanPosition, pacmanDirection)) {
        const newPosition = getNextPosition(pacmanPosition, pacmanDirection);
        setPacmanPosition(newPosition);
        consumePellet(newPosition);
      }
      else if (queuedDirection !== 'none' && isValidMove(maze, pacmanPosition, queuedDirection)) {
        setPacmanDirection(queuedDirection);
        setQueuedDirection('none');
        const newPosition = getNextPosition(pacmanPosition, queuedDirection);
        setPacmanPosition(newPosition);
        consumePellet(newPosition);
      } else {
        setIsMoving(false);
      }
    }
  }, [pacmanDirection, queuedDirection, pacmanPosition, maze, consumePellet, gameState]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState.gameOver) return;
    
    if (!gameState.gameStarted) {
      setGameState(prev => ({ ...prev, gameStarted: true }));
    }
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        if (isValidMove(maze, pacmanPosition, 'up')) {
          setPacmanDirection('up');
        } else {
          setQueuedDirection('up');
        }
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        if (isValidMove(maze, pacmanPosition, 'down')) {
          setPacmanDirection('down');
        } else {
          setQueuedDirection('down');
        }
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        if (isValidMove(maze, pacmanPosition, 'left')) {
          setPacmanDirection('left');
        } else {
          setQueuedDirection('left');
        }
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        if (isValidMove(maze, pacmanPosition, 'right')) {
          setPacmanDirection('right');
        } else {
          setQueuedDirection('right');
        }
        break;
      case 'p':
      case 'P':
        setGameState(prev => ({ 
          ...prev, 
          gamePaused: !prev.gamePaused
        }));
        break;
      default:
        break;
    }
  }, [maze, pacmanPosition, gameState.gameStarted, gameState.gameOver, gameState.gamePaused]);
  
  const handleDirectionClick = useCallback((direction: Direction) => {
    if (gameState.gameOver) return;
    
    if (!gameState.gameStarted) {
      setGameState(prev => ({ ...prev, gameStarted: true }));
    }
    
    if (isValidMove(maze, pacmanPosition, direction)) {
      setPacmanDirection(direction);
    } else {
      setQueuedDirection(direction);
    }
  }, [maze, pacmanPosition, gameState.gameStarted, gameState.gameOver]);
  
  const resetGame = useCallback((fullReset: boolean = true) => {
    setPacmanPosition({...INITIAL_PACMAN_POSITION});
    setPacmanDirection('none');
    setQueuedDirection('none');
    setIsMoving(false);
    
    setMaze(JSON.parse(JSON.stringify(INITIAL_MAZE)));
    
    setGameState(prev => ({
      ...prev,
      gameOver: false,
      gameStarted: false,
      gamePaused: false,
      ...(fullReset ? { score: 0, lives: 3, level: 1 } : {})
    }));
  }, []);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    if (gameState.gameStarted && !gameState.gamePaused && !gameState.gameOver) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      gameLoopRef.current = setInterval(gameLoop, GAME_SPEED);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [handleKeyDown, gameLoop, gameState.gameStarted, gameState.gamePaused, gameState.gameOver]);
  
  return {
    gameState,
    setGameState,
    maze,
    pacmanPosition,
    pacmanDirection,
    isMoving,
    handleDirectionClick,
    resetGame,
    handlePacmanDeath,
    consumePellet,
    ghostEatenSoundRef
  };
};
