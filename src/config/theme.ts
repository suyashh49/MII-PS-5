import { MD3DarkTheme, MD3Theme } from 'react-native-paper';

type ExtendedColors = typeof MD3DarkTheme.colors & {
  placeholder: string;
};

const Theme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4285F4', // Google blue
    accent: '#34A853',  // Google green
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    error: '#EA4335',   // Google red
    disabled: '#9AA0A6',
    placeholder: '#5F6368', // Add placeholder color
  } as ExtendedColors,
};

export default Theme;