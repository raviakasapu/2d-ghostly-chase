import React, { useState, useEffect, useCallback, useRef } from 'react';
import Cell from './Cell';
import Pacman from './Pacman';
import Ghost from './Ghost';
import { 
  Direction, 
  Position, 
  Ghost as GhostType,
  GameState
} from '../../types/game';
import { 
  INITIAL_MAZE, 
  CELL_SIZE, 
  MAZE_WIDTH, 
  MAZE_HEIGHT,
  INITIAL_PACMAN_POSITION,
  INITIAL_GHOST_POSITIONS,
  isValidMove,
  getNextPosition,
  calculateGhostTarget,
  getBestDirection,
  checkCollision,
  countRemainingPellets,
  calculateDistance
} from '../../utils/gameUtils';
import GameControls from './GameControls';
import GameOver from './GameOver';

const GAME_SPEED = 150; // ms per tick
const GHOST_SPEED = 175; // ms per ghost move
const FRIGHTENED_TIME = 8000; // 8 seconds

const clydeCirclePath = [
  { x: MAZE_WIDTH - 4, y: MAZE_HEIGHT - 4 }, // bottom right area
  { x: MAZE_WIDTH - 2, y: MAZE_HEIGHT - 4 },
  { x: MAZE_WIDTH - 2, y: MAZE_HEIGHT - 2 },
  { x: MAZE_WIDTH - 4, y: MAZE_HEIGHT - 2 },
];

const inkyCirclePath = [
  { x: 2, y: MAZE_HEIGHT - 4 }, // bottom left area
  { x: 4, y: MAZE_HEIGHT - 4 },
  { x: 4, y: MAZE_HEIGHT - 2 },
  { x: 2, y: MAZE_HEIGHT - 2 },
];

const GameBoard: React.FC = () => {
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
  
  const [ghosts, setGhosts] = useState<GhostType[]>([
    { 
      type: 'blinky', 
      position: {...INITIAL_GHOST_POSITIONS.blinky}, 
      direction: 'left', 
      nextDirection: 'left',
      state: 'scatter',
      frightenedTimer: null,
      targetPosition: { x: MAZE_WIDTH - 1, y: 0 }
    },
    { 
      type: 'pinky', 
      position: {...INITIAL_GHOST_POSITIONS.pinky}, 
      direction: 'up', 
      nextDirection: 'up',
      state: 'scatter',
      frightenedTimer: null,
      targetPosition: { x: 0, y: 0 }
    },
    { 
      type: 'inky', 
      position: {...INITIAL_GHOST_POSITIONS.inky}, 
      direction: 'up', 
      nextDirection: 'up',
      state: 'scatter',
      frightenedTimer: null,
      targetPosition: { x: MAZE_WIDTH - 1, y: MAZE_HEIGHT - 1 }
    },
    { 
      type: 'clyde', 
      position: {...INITIAL_GHOST_POSITIONS.clyde}, 
      direction: 'up', 
      nextDirection: 'up',
      state: 'scatter',
      frightenedTimer: null,
      targetPosition: { x: 0, y: MAZE_HEIGHT - 1 }
    }
  ]);
  
  const [clydePathIndex, setClydePathIndex] = useState(0);
  const [inkyPathIndex, setInkyPathIndex] = useState(0);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const ghostLoopRef = useRef<NodeJS.Timeout | null>(null);
  
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
      
      setGhosts(prevGhosts => 
        prevGhosts.map(ghost => ({
          ...ghost,
          state: 'frightened',
          frightenedTimer: null
        }))
      );
    }
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
  
  const checkGhostCollisions = useCallback(() => {
    for (const ghost of ghosts) {
      if (checkCollision(ghost.position, pacmanPosition)) {
        if (ghost.state === 'frightened') {
          setGhosts(prevGhosts => 
            prevGhosts.map(g => 
              g.type === ghost.type
                ? {
                    ...g,
                    position: {...INITIAL_GHOST_POSITIONS[g.type as keyof typeof INITIAL_GHOST_POSITIONS]},
                    state: 'scatter',
                    frightenedTimer: null
                  }
                : g
            )
          );
          
          if (ghostEatenSoundRef.current) {
            ghostEatenSoundRef.current.play().catch(() => {});
          }
          
          setGameState(prev => ({
            ...prev,
            score: prev.score + 200
          }));
        } else {
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
            
            setGhosts(prevGhosts => 
              prevGhosts.map(g => ({
                ...g,
                position: {...INITIAL_GHOST_POSITIONS[g.type as keyof typeof INITIAL_GHOST_POSITIONS]},
                direction: 'up',
                nextDirection: 'up',
                state: 'scatter',
                frightenedTimer: null
              }))
            );
            
            setGameState(prev => ({ ...prev, gamePaused: true }));
            
            setTimeout(() => {
              setGameState(prev => ({ ...prev, gamePaused: false }));
            }, 1500);
          }
        }
      }
    }
  }, [ghosts, pacmanPosition, gameState.lives]);
  
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
    
    checkGhostCollisions();
  }, [pacmanDirection, queuedDirection, pacmanPosition, maze, consumePellet, checkGhostCollisions, gameState]);
  
  const moveGhosts = useCallback(() => {
    if (gameState.gamePaused || gameState.gameOver || !gameState.gameStarted) {
      return;
    }
    
    setGhosts(prevGhosts => 
      prevGhosts.map(ghost => {
        let newState = ghost.state;
        let newFrightenedTimer = ghost.frightenedTimer;
        
        if (ghost.state === 'frightened' && ghost.frightenedTimer && Date.now() > ghost.frightenedTimer) {
          newState = 'chase';
          newFrightenedTimer = null;
        }
        
        if (ghost.type === 'clyde' && newState !== 'frightened') {
          const nextTargetPosition = clydeCirclePath[clydePathIndex];
          
          if (calculateDistance(ghost.position, nextTargetPosition) < 1) {
            setClydePathIndex(prev => (prev + 1) % clydeCirclePath.length);
          }
          
          const newDirection = getBestDirection(
            maze, 
            ghost.position, 
            nextTargetPosition, 
            ghost.direction
          );
          
          let newPosition = ghost.position;
          if (isValidMove(maze, ghost.position, newDirection)) {
            newPosition = getNextPosition(ghost.position, newDirection);
          }
          
          return {
            ...ghost,
            position: newPosition,
            direction: newDirection,
            nextDirection: newDirection,
            targetPosition: nextTargetPosition,
            state: newState,
            frightenedTimer: newFrightenedTimer
          };
        } 
        else if (ghost.type === 'inky' && newState !== 'frightened') {
          const nextTargetPosition = inkyCirclePath[inkyPathIndex];
          
          if (calculateDistance(ghost.position, nextTargetPosition) < 1) {
            setInkyPathIndex(prev => (prev + 1) % inkyCirclePath.length);
          }
          
          const newDirection = getBestDirection(
            maze, 
            ghost.position, 
            nextTargetPosition, 
            ghost.direction
          );
          
          let newPosition = ghost.position;
          if (isValidMove(maze, ghost.position, newDirection)) {
            newPosition = getNextPosition(ghost.position, newDirection);
          }
          
          return {
            ...ghost,
            position: newPosition,
            direction: newDirection,
            nextDirection: newDirection,
            targetPosition: nextTargetPosition,
            state: newState,
            frightenedTimer: newFrightenedTimer
          };
        }
        else {
          let targetPosition = ghost.targetPosition;
          
          if (newState === 'chase') {
            targetPosition = calculateGhostTarget(
              ghost.type, 
              ghost.position, 
              pacmanPosition, 
              pacmanDirection
            );
          } else if (newState === 'frightened') {
            const validMoves = ['up', 'down', 'left', 'right'].filter(
              dir => dir !== ghost.direction && isValidMove(maze, ghost.position, dir as Direction)
            );
            
            if (validMoves.length > 0) {
              const randomDir = validMoves[Math.floor(Math.random() * validMoves.length)] as Direction;
              const newPosition = getNextPosition(ghost.position, randomDir);
              
              return {
                ...ghost,
                position: newPosition,
                direction: randomDir,
                nextDirection: randomDir,
                state: newState,
                frightenedTimer: newFrightenedTimer
              };
            }
          }
          
          const newDirection = getBestDirection(
            maze, 
            ghost.position, 
            targetPosition, 
            ghost.direction
          );
          
          let newPosition = ghost.position;
          if (isValidMove(maze, ghost.position, newDirection)) {
            newPosition = getNextPosition(ghost.position, newDirection);
          }
          
          return {
            ...ghost,
            position: newPosition,
            direction: newDirection,
            nextDirection: newDirection,
            targetPosition: targetPosition,
            state: newState,
            frightenedTimer: newFrightenedTimer
          };
        }
      })
    );
    
    checkGhostCollisions();
  }, [maze, pacmanPosition, pacmanDirection, checkGhostCollisions, gameState, clydePathIndex, inkyPathIndex]);
  
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
    
    setGhosts(prevGhosts => 
      prevGhosts.map(g => ({
        ...g,
        position: {...INITIAL_GHOST_POSITIONS[g.type as keyof typeof INITIAL_GHOST_POSITIONS]},
        direction: 'up',
        nextDirection: 'up',
        state: 'scatter',
        frightenedTimer: null
      }))
    );
    
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
      if (ghostLoopRef.current) clearInterval(ghostLoopRef.current);
      
      gameLoopRef.current = setInterval(gameLoop, GAME_SPEED);
      ghostLoopRef.current = setInterval(moveGhosts, GHOST_SPEED);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (ghostLoopRef.current) clearInterval(ghostLoopRef.current);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (ghostLoopRef.current) clearInterval(ghostLoopRef.current);
    };
  }, [handleKeyDown, gameLoop, moveGhosts, gameState.gameStarted, gameState.gamePaused, gameState.gameOver, clydePathIndex, inkyPathIndex]);
  
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative game-container">
        <div 
          className="relative bg-black"
          style={{ 
            width: MAZE_WIDTH * CELL_SIZE, 
            height: MAZE_HEIGHT * CELL_SIZE 
          }}
        >
          {maze.map((row, y) => (
            <div key={`row-${y}`} className="flex">
              {row.map((cell, x) => (
                <Cell key={`cell-${x}-${y}`} type={cell} size={CELL_SIZE} />
              ))}
            </div>
          ))}
          
          <Pacman 
            position={pacmanPosition} 
            direction={pacmanDirection} 
            size={CELL_SIZE} 
            isMoving={isMoving}
          />
          
          {ghosts.map((ghost) => (
            <Ghost 
              key={ghost.type} 
              ghost={ghost} 
              size={CELL_SIZE} 
            />
          ))}
          
          {!gameState.gameStarted && !gameState.gameOver && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-40">
              <h2 className="text-white text-4xl font-bold mb-8 game-title">PAC-MAN</h2>
              <button 
                className="primary-btn px-8 py-4 text-xl"
                onClick={() => setGameState(prev => ({ ...prev, gameStarted: true }))}
              >
                Start Game
              </button>
            </div>
          )}
          
          {gameState.gamePaused && gameState.gameStarted && !gameState.gameOver && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40">
              <div className="glass-panel p-8 text-center">
                <h2 className="text-white text-3xl font-bold mb-4">PAUSED</h2>
                <button 
                  className="primary-btn px-6 py-2 mt-4"
                  onClick={() => setGameState(prev => ({ ...prev, gamePaused: false }))}
                >
                  Resume
                </button>
              </div>
            </div>
          )}
          
          <GameControls onDirectionClick={handleDirectionClick} />
          
          {gameState.gameOver && (
            <GameOver 
              score={gameState.score} 
              highScore={gameState.highScore} 
              onRestart={resetGame} 
            />
          )}
        </div>
        
        <div className="glass-panel mt-4 p-4 w-full flex items-center justify-between">
          <div className="flex flex-col items-start">
            <span className="text-xs text-white/70">SCORE</span>
            <span className="text-white text-xl font-bold score-counter">{gameState.score}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {Array.from({ length: gameState.lives }).map((_, i) => (
              <div 
                key={`life-${i}`} 
                className="bg-game-pacman w-4 h-4 rounded-full"
                style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
              />
            ))}
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-xs text-white/70">LEVEL</span>
            <span className="text-white text-xl font-bold">{gameState.level}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
