
import { Direction, Position } from '../types/game';

// Initial maze layout
// 0 = wall, 1 = empty, 2 = pellet, 3 = power pellet, 4 = ghost house
export const INITIAL_MAZE = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
  [0, 3, 0, 0, 2, 0, 0, 0, 2, 0, 2, 0, 0, 0, 2, 0, 0, 3, 0],
  [0, 2, 0, 0, 2, 0, 0, 0, 2, 0, 2, 0, 0, 0, 2, 0, 0, 2, 0],
  [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
  [0, 2, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 2, 0],
  [0, 2, 2, 2, 2, 0, 2, 2, 2, 0, 2, 2, 2, 0, 2, 2, 2, 2, 0],
  [0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0],
  [0, 1, 1, 0, 2, 0, 1, 1, 1, 1, 1, 1, 1, 0, 2, 0, 1, 1, 0],
  [0, 0, 0, 0, 2, 0, 1, 0, 0, 4, 0, 0, 1, 0, 2, 0, 0, 0, 0],
  [1, 1, 1, 1, 2, 1, 1, 0, 4, 4, 4, 0, 1, 1, 2, 1, 1, 1, 1],
  [0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0],
  [0, 1, 1, 0, 2, 0, 1, 1, 1, 1, 1, 1, 1, 0, 2, 0, 1, 1, 0],
  [0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0],
  [0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
  [0, 2, 0, 0, 2, 0, 0, 0, 2, 0, 2, 0, 0, 0, 2, 0, 0, 2, 0],
  [0, 3, 2, 0, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 0, 2, 3, 0],
  [0, 0, 2, 0, 2, 0, 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 2, 0, 0],
  [0, 2, 2, 2, 2, 0, 2, 2, 2, 0, 2, 2, 2, 0, 2, 2, 2, 2, 0],
  [0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0],
  [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

export const CELL_SIZE = 20;
export const MAZE_WIDTH = INITIAL_MAZE[0].length;
export const MAZE_HEIGHT = INITIAL_MAZE.length;

export const INITIAL_PACMAN_POSITION: Position = { x: 9, y: 16 };
export const INITIAL_GHOST_POSITIONS: Record<string, Position> = {
  blinky: { x: 9, y: 9 },
  pinky: { x: 9, y: 10 },
  inky: { x: 8, y: 10 },
  clyde: { x: 10, y: 10 }
};

export const DIRECTIONS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  none: { x: 0, y: 0 }
};

export const DIRECTION_DEGREES: Record<Direction, number> = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
  none: 0
};

export const isValidMove = (maze: number[][], position: Position, direction: Direction): boolean => {
  const newPosition = {
    x: position.x + DIRECTIONS[direction].x,
    y: position.y + DIRECTIONS[direction].y
  };
  
  // Handle wraparound
  if (newPosition.x < 0) newPosition.x = MAZE_WIDTH - 1;
  if (newPosition.x >= MAZE_WIDTH) newPosition.x = 0;
  if (newPosition.y < 0) newPosition.y = MAZE_HEIGHT - 1;
  if (newPosition.y >= MAZE_HEIGHT) newPosition.y = 0;
  
  // Check if the new position is a wall
  return maze[newPosition.y][newPosition.x] !== 0;
};

export const getNextPosition = (position: Position, direction: Direction): Position => {
  const newPosition = {
    x: position.x + DIRECTIONS[direction].x,
    y: position.y + DIRECTIONS[direction].y
  };
  
  // Handle wraparound
  if (newPosition.x < 0) newPosition.x = MAZE_WIDTH - 1;
  if (newPosition.x >= MAZE_WIDTH) newPosition.x = 0;
  if (newPosition.y < 0) newPosition.y = MAZE_HEIGHT - 1;
  if (newPosition.y >= MAZE_HEIGHT) newPosition.y = 0;
  
  return newPosition;
};

export const getRandomDirection = (currentDirection: Direction): Direction => {
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  const validDirections = directions.filter(dir => dir !== getOppositeDirection(currentDirection));
  const randomIndex = Math.floor(Math.random() * validDirections.length);
  return validDirections[randomIndex];
};

export const getOppositeDirection = (direction: Direction): Direction => {
  switch (direction) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
    default: return 'none';
  }
};

export const calculateDistance = (pos1: Position, pos2: Position): number => {
  return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
};

export const getValidDirections = (maze: number[][], position: Position, exclude: Direction = 'none'): Direction[] => {
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  return directions.filter(dir => {
    return dir !== exclude && isValidMove(maze, position, dir);
  });
};

export const getBestDirection = (
  maze: number[][], 
  currentPosition: Position, 
  targetPosition: Position, 
  currentDirection: Direction
): Direction => {
  const validDirections = getValidDirections(maze, currentPosition, getOppositeDirection(currentDirection));
  
  if (validDirections.length === 0) {
    return currentDirection;
  }
  
  let bestDirection = validDirections[0];
  let minDistance = Number.MAX_VALUE;
  
  for (const dir of validDirections) {
    const nextPos = getNextPosition(currentPosition, dir);
    const distance = calculateDistance(nextPos, targetPosition);
    
    if (distance < minDistance) {
      minDistance = distance;
      bestDirection = dir;
    }
  }
  
  return bestDirection;
};

export const calculateGhostTarget = (
  ghostType: string,
  ghostPosition: Position,
  pacmanPosition: Position,
  pacmanDirection: Direction
): Position => {
  // Simple ghost targeting logic based on ghost type
  switch (ghostType) {
    case 'blinky': // Directly targets Pacman
      return { ...pacmanPosition };
    
    case 'pinky': // Targets 4 spaces ahead of Pacman
      const dir = DIRECTIONS[pacmanDirection];
      return {
        x: pacmanPosition.x + (dir.x * 4),
        y: pacmanPosition.y + (dir.y * 4)
      };
    
    case 'inky': // Complex targeting based on Blinky's position (simplified here)
      return {
        x: pacmanPosition.x + (Math.random() * 10 - 5),
        y: pacmanPosition.y + (Math.random() * 10 - 5)
      };
    
    case 'clyde': // Targets Pacman but runs away when close
      const distance = calculateDistance(ghostPosition, pacmanPosition);
      if (distance < 8) {
        // Run to bottom-left corner when close
        return { x: 0, y: MAZE_HEIGHT - 1 };
      }
      return { ...pacmanPosition };
    
    default:
      return { ...pacmanPosition };
  }
};

export const checkCollision = (pos1: Position, pos2: Position): boolean => {
  return pos1.x === pos2.x && pos1.y === pos2.y;
};

export const countRemainingPellets = (maze: number[][]): number => {
  let count = 0;
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 2 || maze[y][x] === 3) {
        count++;
      }
    }
  }
  return count;
};

export const debounce = (fn: Function, ms = 50) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};
