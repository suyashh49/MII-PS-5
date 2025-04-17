// src/App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import Theme from '../GoogleSignInApp/src/config/theme';
import MainNavigator from '../GoogleSignInApp/src/navigation/MainNavigator';
import { AuthProvider } from '../GoogleSignInApp/src/hooks/useAuth';

export default function App() {
  return (
    <PaperProvider theme={Theme}>
      <AuthProvider>
        <NavigationContainer>
          <MainNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}

