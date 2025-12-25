'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SceneState, SceneAction } from '@/types/scene';
import { sceneReducer, initialState } from './scene-reducer';

interface SceneContextValue {
  state: SceneState;
  dispatch: React.Dispatch<SceneAction>;
}

const SceneContext = createContext<SceneContextValue | undefined>(undefined);

export function SceneProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sceneReducer, initialState);

  return (
    <SceneContext.Provider value={{ state, dispatch }}>
      {children}
    </SceneContext.Provider>
  );
}

export function useSceneContext() {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error('useSceneContext must be used within SceneProvider');
  }
  return context;
}
