// src/hooks/useMaidAuth.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Maid } from '../types';

interface MaidAuthContextType {
  maid: Maid | null;
  isLoading: boolean;
  loginMaid: (token: string, maidData: Partial<Maid>) => Promise<void>;
  logoutMaid: () => Promise<void>;
}

const MaidAuthContext = createContext<MaidAuthContextType | null>(null);

export const useMaidAuth = () => {
  const context = useContext(MaidAuthContext);
  if (!context) {
    throw new Error('useMaidAuth must be used within a MaidAuthProvider');
  }
  return context;
};

export const MaidAuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [maid, setMaid] = useState<Maid | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredMaid = async () => {
      try {
        const maidString = await AsyncStorage.getItem('maid');
        const maidToken = await AsyncStorage.getItem('maidToken');
        
        if (maidString && maidToken) {
            const parsedMaid = JSON.parse(maidString);
            console.log('Loaded maid data:', parsedMaid);
            console.log('profileCreated value:', parsedMaid.profileCreated);
          setMaid(JSON.parse(maidString));
        }
      } catch (error) {
        console.error('Failed to load maid data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredMaid();
  }, []);

  const loginMaid = async (token: string, maidData: Partial<Maid>) => {
    try {
      await AsyncStorage.setItem('maidToken', token);
      await AsyncStorage.setItem('maid', JSON.stringify(maidData));
    setMaid(maidData as Maid);
  } catch (error) {
    console.error('Maid login error:', error);
  }
};
  const logoutMaid = async () => {
    try {
      await AsyncStorage.removeItem('maidToken');
      await AsyncStorage.removeItem('maid');
      setMaid(null);
    } catch (error) {
      console.error('Maid logout error:', error);
    }
  };

  return (
    <MaidAuthContext.Provider value={{ 
      maid, 
      isLoading, 
      loginMaid, 
      logoutMaid 
    }}>
      {children}
    </MaidAuthContext.Provider>
  );
};