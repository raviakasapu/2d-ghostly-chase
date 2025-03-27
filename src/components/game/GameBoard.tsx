
import React, { useCallback, useEffect } from 'react';
import Cell from './Cell';
import Pacman from './Pacman';
import Ghost from './Ghost';
import { 
  Ghost as GhostType,
} from '../../types/game';
import { 
  CELL_SIZE, 
  MAZE_WIDTH, 
  MAZE_HEIGHT,
} from '../../utils/gameUtils';
import GameOver from './GameOver';
import GameUI from './GameUI';
import { useGameLogic } from '../../hooks/useGameLogic';
import { useGhostMovement } from '../../hooks/useGhostMovement';

const FRIGHTENED_TIME = 8000; // 8 seconds

const GameBoard: React.FC = () => {
  const {
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
  } = useGameLogic();
  
  const handleGhostCollision = useCallback((ghost: GhostType) => {
    if (ghost.state === 'frightened') {
      // Reset ghost position when eaten
      resetGhosts();
      
      if (ghostEatenSoundRef.current) {
        ghostEatenSoundRef.current.play().catch(() => {});
      }
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + 200
      }));
    } else {
      // Handle pacman death
      const continueGame = handlePacmanDeath();
      
      if (continueGame) {
        resetGhosts();
      }
    }
  }, [resetGame, setGameState, handlePacmanDeath, ghostEatenSoundRef]);
  
  const {
    ghosts,
    resetGhosts,
    makeGhostsFrightened
  } = useGhostMovement(
    pacmanPosition,
    pacmanDirection,
    maze,
    {
      gameStarted: gameState.gameStarted,
      gamePaused: gameState.gamePaused,
      gameOver: gameState.gameOver
    },
    handleGhostCollision
  );
  
  // Handle power pellet consumption
  useEffect(() => {
    const handlePowerPellet = (isPowerPellet: boolean) => {
      if (isPowerPellet) {
        makeGhostsFrightened();
      }
    };
    
    const originalConsumePellet = consumePellet;
    const wrappedConsumePellet = (position: any) => {
      const result = originalConsumePellet(position);
      handlePowerPellet(result);
      return result;
    };
    
    // This isn't actually overriding the function, just setting up a handler
    // if we detect a power pellet was eaten during the normal game loop
  }, [consumePellet, makeGhostsFrightened]);
  
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative game-container">
        <div 
          className="relative"
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
            <div className="absolute inset-0 flex flex-col items-center justify-center z-40">
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
            <div className="absolute inset-0 flex items-center justify-center z-40">
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
          
          {gameState.gameOver && (
            <GameOver 
              score={gameState.score} 
              highScore={gameState.highScore} 
              onRestart={resetGame} 
            />
          )}
        </div>
        
        <GameUI 
          score={gameState.score}
          lives={gameState.lives}
          level={gameState.level}
        />
      </div>
    </div>
  );
};

export default GameBoard;
