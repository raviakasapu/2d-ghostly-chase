import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Direction, 
  Position, 
  Ghost as GhostType
} from '../types/game';
import { 
  MAZE_WIDTH, 
  MAZE_HEIGHT,
  INITIAL_GHOST_POSITIONS,
  isValidMove,
  getNextPosition,
  calculateGhostTarget,
  getBestDirection,
  checkCollision,
  calculateDistance,
  getValidDirections,
  getOppositeDirection
} from '../utils/gameUtils';

const GHOST_SPEED = 175; // ms per ghost move

// Define ghost path constants
const blinkyCirclePath = [
  { x: 2, y: 2 }, // top left area
  { x: 4, y: 2 },
  { x: 4, y: 4 },
  { x: 2, y: 4 },
];

const pinkyCirclePath = [
  { x: MAZE_WIDTH - 4, y: 2 }, // top right area
  { x: MAZE_WIDTH - 2, y: 2 },
  { x: MAZE_WIDTH - 2, y: 4 },
  { x: MAZE_WIDTH - 4, y: 4 },
];

// Updated path for Inky to circle around a single block in bottom left
const inkyCirclePath = [
  { x: 2, y: MAZE_HEIGHT - 4 }, 
  { x: 3, y: MAZE_HEIGHT - 4 },
  { x: 3, y: MAZE_HEIGHT - 3 },
  { x: 2, y: MAZE_HEIGHT - 3 },
];

// Updated path for Clyde to circle around a single block in bottom right
const clydeCirclePath = [
  { x: MAZE_WIDTH - 4, y: MAZE_HEIGHT - 4 },
  { x: MAZE_WIDTH - 3, y: MAZE_HEIGHT - 4 },
  { x: MAZE_WIDTH - 3, y: MAZE_HEIGHT - 3 }, 
  { x: MAZE_WIDTH - 4, y: MAZE_HEIGHT - 3 },
];

export const useGhostMovement = (
  pacmanPosition: Position,
  pacmanDirection: Direction,
  maze: number[][],
  gameState: {
    gameStarted: boolean;
    gamePaused: boolean;
    gameOver: boolean;
  },
  onGhostCollision: (ghost: GhostType) => void
) => {
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
      targetPosition: { x: 0, y: MAZE_HEIGHT - 1 }
    },
    { 
      type: 'clyde', 
      position: {...INITIAL_GHOST_POSITIONS.clyde}, 
      direction: 'up', 
      nextDirection: 'up',
      state: 'scatter',
      frightenedTimer: null,
      targetPosition: { x: MAZE_WIDTH - 1, y: MAZE_HEIGHT - 1 }
    }
  ]);
  
  const [blinkyPathIndex, setBlinkyPathIndex] = useState(0);
  const [pinkyPathIndex, setPinkyPathIndex] = useState(0);
  const [inkyPathIndex, setInkyPathIndex] = useState(0);
  const [clydePathIndex, setClydePathIndex] = useState(0);
  const [lastPacmanPositions, setLastPacmanPositions] = useState<Position[]>([]);
  
  const ghostLoopRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gamePaused && !gameState.gameOver) {
      setLastPacmanPositions(prevPositions => {
        const newPositions = [...prevPositions, { ...pacmanPosition }];
        if (newPositions.length > 10) {
          return newPositions.slice(newPositions.length - 10);
        }
        return newPositions;
      });
    }
  }, [pacmanPosition, gameState]);
  
  const resetGhosts = useCallback(() => {
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
  }, []);
  
  const makeGhostsFrightened = useCallback(() => {
    setGhosts(prevGhosts => 
      prevGhosts.map(ghost => ({
        ...ghost,
        state: 'frightened',
        frightenedTimer: null
      }))
    );
  }, []);
  
  const checkGhostCollisions = useCallback(() => {
    for (const ghost of ghosts) {
      if (checkCollision(ghost.position, pacmanPosition)) {
        onGhostCollision(ghost);
      }
    }
  }, [ghosts, pacmanPosition, onGhostCollision]);
  
  const getBlinkyTarget = () => {
    return { ...pacmanPosition };
  };
  
  const getPinkyTarget = () => {
    const dir = pacmanDirection;
    let targetPos = { ...pacmanPosition };
    
    switch (dir) {
      case 'up':
        targetPos.y -= 4;
        break;
      case 'down':
        targetPos.y += 4;
        break;
      case 'left':
        targetPos.x -= 4;
        break;
      case 'right':
        targetPos.x += 4;
        break;
      default:
        break;
    }
    
    return targetPos;
  };
  
  const getInkyTarget = () => {
    if (lastPacmanPositions.length >= 5) {
      return { ...lastPacmanPositions[0] };
    }
    
    return inkyCirclePath[inkyPathIndex];
  };
  
  const getClydeTarget = () => {
    const distance = calculateDistance(ghosts[3].position, pacmanPosition);
    
    if (distance < 8) {
      return { x: 0, y: MAZE_HEIGHT - 1 };
    }
    
    if (Math.random() < 0.2) {
      const validDirs = getValidDirections(maze, ghosts[3].position, getOppositeDirection(ghosts[3].direction));
      if (validDirs.length > 0) {
        const randomDir = validDirs[Math.floor(Math.random() * validDirs.length)];
        return getNextPosition(ghosts[3].position, randomDir);
      }
    }
    
    return { ...pacmanPosition };
  };
  
  const moveGhosts = useCallback(() => {
    if (gameState.gamePaused || gameState.gameOver || !gameState.gameStarted) {
      return;
    }
    
    setGhosts(prevGhosts => 
      prevGhosts.map((ghost, index) => {
        let newState = ghost.state;
        let newFrightenedTimer = ghost.frightenedTimer;
        
        if (ghost.state === 'frightened' && ghost.frightenedTimer && Date.now() > ghost.frightenedTimer) {
          newState = 'chase';
          newFrightenedTimer = null;
        }
        
        if (newState !== 'frightened') {
          let targetPosition;
          
          switch (ghost.type) {
            case 'blinky':
              targetPosition = getBlinkyTarget();
              break;
            case 'pinky':
              targetPosition = getPinkyTarget();
              break;
            case 'inky':
              targetPosition = getInkyTarget();
              break;
            case 'clyde':
              targetPosition = getClydeTarget();
              break;
            default:
              targetPosition = { ...pacmanPosition };
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
        } else {
          const validMoves = getValidDirections(maze, ghost.position, getOppositeDirection(ghost.direction));
          
          if (validMoves.length > 0) {
            const randomDir = validMoves[Math.floor(Math.random() * validMoves.length)];
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
          
          const cornerPositions = [
            { x: 1, y: 1 },
            { x: MAZE_WIDTH - 2, y: 1 },
            { x: 1, y: MAZE_HEIGHT - 2 },
            { x: MAZE_WIDTH - 2, y: MAZE_HEIGHT - 2 }
          ];
          
          let furthestCorner = cornerPositions[0];
          let maxDistance = 0;
          
          for (const corner of cornerPositions) {
            const dist = calculateDistance(pacmanPosition, corner);
            if (dist > maxDistance) {
              maxDistance = dist;
              furthestCorner = corner;
            }
          }
          
          const newDirection = getBestDirection(
            maze, 
            ghost.position, 
            furthestCorner, 
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
            state: newState,
            frightenedTimer: newFrightenedTimer
          };
        }
      })
    );
    
    checkGhostCollisions();
  }, [
    maze, 
    pacmanPosition, 
    pacmanDirection, 
    checkGhostCollisions, 
    gameState,
    blinkyPathIndex,
    pinkyPathIndex,
    inkyPathIndex,
    clydePathIndex,
    lastPacmanPositions
  ]);
  
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gamePaused && !gameState.gameOver) {
      if (ghostLoopRef.current) clearInterval(ghostLoopRef.current);
      ghostLoopRef.current = setInterval(moveGhosts, GHOST_SPEED);
    } else {
      if (ghostLoopRef.current) clearInterval(ghostLoopRef.current);
    }
    
    return () => {
      if (ghostLoopRef.current) clearInterval(ghostLoopRef.current);
    };
  }, [moveGhosts, gameState.gameStarted, gameState.gamePaused, gameState.gameOver]);
  
  return {
    ghosts,
    resetGhosts,
    makeGhostsFrightened
  };
};
