// src/config/theme.ts
import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4285F4', // Google blue
    accent: '#34A853',  // Google green
    background: '#f7f7f7',
    surface: '#ffffff',
    text: '#202124',
    error: '#EA4335',   // Google red
    disabled: '#9AA0A6',
    placeholder: '#5F6368',
  },
};