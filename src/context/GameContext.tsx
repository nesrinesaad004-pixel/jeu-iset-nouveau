import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GameState, StudentInfo } from '@/types/game';

interface GameContextType {
  gameState: GameState;
  setStudentInfo: (info: StudentInfo) => void;
  setLevel1Choices: (choices: string[]) => void;
  setLevel2Domain: (domain: string) => void;
  setLevel2Values: (values: string[]) => void;
  setLevel3Order: (order: string[]) => void;
  completeLevel: (level: number) => void;
  goToLevel: (level: number) => void;
  resetGame: () => void;
  startGame: () => void;
}

const initialState: GameState = {
  currentLevel: 0,
  studentInfo: null,
  level1Choices: [],
  level2Domain: null,
  level2Values: [],
  level3Order: [],
  level4Avatar: null,
  level4PitchOrder: [],
  level5Answers: {},
  completedLevels: [],
  startTime: null,
  endTime: null,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(initialState);

  const setStudentInfo = (info: StudentInfo) => {
    setGameState(prev => ({ ...prev, studentInfo: info }));
  };

  const setLevel1Choices = (choices: string[]) => {
    setGameState(prev => ({ ...prev, level1Choices: choices }));
  };

  const setLevel2Domain = (domain: string) => {
    setGameState(prev => ({ ...prev, level2Domain: domain }));
  };

  const setLevel2Values = (values: string[]) => {
    setGameState(prev => ({ ...prev, level2Values: values }));
  };

  const setLevel3Order = (order: string[]) => {
    setGameState(prev => ({ ...prev, level3Order: order }));
  };

  const completeLevel = (level: number) => {
    setGameState(prev => ({
      ...prev,
      completedLevels: [...prev.completedLevels, level],
      currentLevel: level + 1,
    }));
  };

  const goToLevel = (level: number) => {
    setGameState(prev => ({ ...prev, currentLevel: level }));
  };

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      currentLevel: 1,
      startTime: Date.now(),
    }));
  };

  const resetGame = () => {
    setGameState(initialState);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        setStudentInfo,
        setLevel1Choices,
        setLevel2Domain,
        setLevel2Values,
        setLevel3Order,
        completeLevel,
        goToLevel,
        resetGame,
        startGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
