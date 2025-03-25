
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
  calculateDistance
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

const inkyCirclePath = [
  { x: 2, y: MAZE_HEIGHT - 4 }, // bottom left area
  { x: 4, y: MAZE_HEIGHT - 4 },
  { x: 4, y: MAZE_HEIGHT - 2 },
  { x: 2, y: MAZE_HEIGHT - 2 },
];

const clydeCirclePath = [
  { x: MAZE_WIDTH - 4, y: MAZE_HEIGHT - 4 }, // bottom right area
  { x: MAZE_WIDTH - 2, y: MAZE_HEIGHT - 4 },
  { x: MAZE_WIDTH - 2, y: MAZE_HEIGHT - 2 },
  { x: MAZE_WIDTH - 4, y: MAZE_HEIGHT - 2 },
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
  
  const ghostLoopRef = useRef<NodeJS.Timeout | null>(null);
  
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
        
        // Different behavior based on ghost type
        if (newState !== 'frightened') {
          let nextTargetPosition;
          let pathIndex;
          let setPathIndex;
          
          // Determine which path to follow based on ghost type
          if (ghost.type === 'blinky') {
            nextTargetPosition = blinkyCirclePath[blinkyPathIndex];
            pathIndex = blinkyPathIndex;
            setPathIndex = setBlinkyPathIndex;
          } else if (ghost.type === 'pinky') {
            nextTargetPosition = pinkyCirclePath[pinkyPathIndex];
            pathIndex = pinkyPathIndex;
            setPathIndex = setPinkyPathIndex;
          } else if (ghost.type === 'inky') {
            nextTargetPosition = inkyCirclePath[inkyPathIndex];
            pathIndex = inkyPathIndex;
            setPathIndex = setInkyPathIndex;
          } else { // clyde
            nextTargetPosition = clydeCirclePath[clydePathIndex];
            pathIndex = clydePathIndex;
            setPathIndex = setClydePathIndex;
          }
          
          if (calculateDistance(ghost.position, nextTargetPosition) < 1) {
            setPathIndex((prev: number) => (prev + 1) % 4);
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
        } else {
          // Frightened state handling - random movement
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
          
          // If no valid random moves, use best direction to current target
          const newDirection = getBestDirection(
            maze, 
            ghost.position, 
            ghost.targetPosition, 
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
    clydePathIndex
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
