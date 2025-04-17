import { MD3DarkTheme, MD3Theme } from 'react-native-paper';

type ExtendedColors = typeof MD3DarkTheme.colors & {
  placeholder: string;
};

const Theme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4285F4',  //blue
    accent: '#34A853',  //green
    background: '#121212', //black
    surface: '#1E1E1E', //dark grey
    text: '#FFFFFF', // white
    error: '#EA4335',   // red
    disabled: '#9AA0A6', // light grey
    placeholder: '#5F6368', // grey
  } as ExtendedColors,
};

export default Theme;
