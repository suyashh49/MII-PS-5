// src/hooks/useAuth.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, User } from '../types';


// Register for redirection
WebBrowser.maybeCompleteAuthSession();


const CLIENT_ID = '411763389934-btjt6a3ua0jdmc1fuhvk20nped3gdgbh.apps.googleusercontent.com';
const API_URL = 'https://maid-in-india-nglj.onrender.com';

const AuthContext = createContext<AuthContextType | null>(null);

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [request, response, promptAsync] = Google.useAuthRequest({
    //expoClientId: CLIENT_ID,
    webClientId: "411763389934-btjt6a3ua0jdmc1fuhvk20nped3gdgbh.apps.googleusercontent.com",
    scopes: ['profile', 'email'],
    androidClientId: "411763389934-2v0dihlftn1jvh92s387d7a26trhqpib.apps.googleusercontent.com",
  });

  useEffect(() => {
    // check for stored user data on load
    const loadStoredUser = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          setUser(JSON.parse(userString));
        }
      } catch (error) {
        console.error('Failed to load user data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      
      const fetchUserData = async () => {
        try {
          const { authentication } = response;
          const { accessToken } = authentication;
          console.log("Access Token:", accessToken);
          const token = accessToken; // from Google

          // user info from backend
          console.log("This is token:", token);
          const res = await fetch(`${API_URL}/api/auth/verify-google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          // await response JSON log
          const userInfo = await res.json();
          console.log("User Info from backend:", userInfo);

          
          const newUser: User = {
            id: userInfo.user.id,
            name: userInfo.user.name,
            email: userInfo.user.email,
            photoUrl: userInfo.user.picture,
            token: userInfo.user.token,
          };

          
         
          await AsyncStorage.setItem('user', JSON.stringify(newUser));
       
          // Update state
          setUser(newUser);
        } catch (error) {
          console.error('Error fetching user info:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserData();
    }
  }, [response]);


  // Login and logout functions
  const login = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};