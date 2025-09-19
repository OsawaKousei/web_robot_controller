'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { ROSContext } from '../types';
import { useRos } from '../hooks/useRos';

const RosContext = createContext<ROSContext | undefined>(undefined);

interface RosProviderProps {
  children: ReactNode;
  defaultUrl?: string;
}

export const RosProvider: React.FC<RosProviderProps> = ({ 
  children, 
  defaultUrl = 'ws://localhost:9090' 
}) => {
  const rosHook = useRos();

  const value: ROSContext = {
    connectionStatus: rosHook.connectionStatus,
    ros: rosHook.ros,
    connect: rosHook.connect,
    disconnect: rosHook.disconnect,
    publishCmdVel: rosHook.publishCmdVel,
    error: rosHook.error
  };

  return (
    <RosContext.Provider value={value}>
      {children}
    </RosContext.Provider>
  );
};

export const useRosContext = (): ROSContext => {
  const context = useContext(RosContext);
  if (context === undefined) {
    throw new Error('useRosContext must be used within a RosProvider');
  }
  return context;
};