
export type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

export type Position = {
  x: number;
  y: number;
};

export type CellType = 'wall' | 'empty' | 'pellet' | 'power-pellet';

export type GhostType = 'blinky' | 'pinky' | 'inky' | 'clyde';

export type GhostState = 'chase' | 'scatter' | 'frightened';

export type Ghost = {
  type: GhostType;
  position: Position;
  direction: Direction;
  nextDirection: Direction;
  state: GhostState;
  frightenedTimer: number | null;
  targetPosition: Position;
};

export type GameState = {
  score: number;
  lives: number;
  level: number;
  gameOver: boolean;
  gameStarted: boolean;
  gamePaused: boolean;
  highScore: number;
};
