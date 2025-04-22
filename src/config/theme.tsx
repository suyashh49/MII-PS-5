// import { MD3DarkTheme, MD3Theme } from 'react-native-paper';

// type ExtendedColors = typeof MD3DarkTheme.colors & {
//   placeholder: string;
// };

// const Theme: MD3Theme = {
//   ...MD3DarkTheme,
//   colors: {
//     ...MD3DarkTheme.colors,
//     primary: '#4285F4',  //blue
//     accent: '#34A853',  //green
//     background: '#121212', //black
//     surface: '#1E1E1E', //dark grey
//     text: '#FFFFFF', // white
//     error: '#EA4335',   // red
//     disabled: '#9AA0A6', // light grey
//     placeholder: '#5F6368', // grey

    
//   } as ExtendedColors,
// };

// export default Theme;
//------------------------------------------------------------------
import { MD3LightTheme, MD3Theme } from 'react-native-paper';

type ExtendedColors = typeof MD3LightTheme.colors & {
  placeholder: string;
};

const Theme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1368A4',  // blue (kept the same for brand consistency)
    accent: '#34A853',   // green (kept the same for brand consistency)
    background: '#FFFFFF', // white
    surface: '#F5F5F5',   // light grey
    text: '#202124',      // dark grey/almost black
    error: '#EA4335',     // red (kept the same for consistency)
    disabled: '#9AA0A6',  // medium grey (kept the same)
    placeholder: '#5F6368', // dark grey (kept the same)
  } as ExtendedColors,
};

export default Theme;

// // src/config/theme.tsx
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper';
// import { useColorScheme } from 'react-native';

// type ExtendedColors = typeof MD3DarkTheme.colors & {
//   placeholder: string;
// };

// // Define both themes
// const DarkTheme: MD3Theme = {
//   ...MD3DarkTheme,
//   colors: {
//     ...MD3DarkTheme.colors,
//     primary: '#4285F4',  //blue
//     accent: '#34A853',  //green
//     background: '#121212', //black
//     surface: '#1E1E1E', //dark grey
//     text: '#FFFFFF', // white
//     error: '#EA4335',   // red
//     disabled: '#9AA0A6', // light grey
//     placeholder: '#5F6368', // grey
//   } as ExtendedColors,
// };

// const LightTheme: MD3Theme = {
//   ...MD3LightTheme,
//   colors: {
//     ...MD3LightTheme.colors,
//     primary: '#4285F4',  // blue
//     accent: '#34A853',   // green
//     background: '#FFFFFF', // white
//     surface: '#F5F5F5',   // light grey
//     text: '#202124',      // dark grey/almost black
//     error: '#EA4335',     // red
//     disabled: '#9AA0A6',  // medium grey
//     placeholder: '#5F6368', // dark grey
//   } as ExtendedColors,
// };

// // Create the theme context
// type ThemeContextType = {
//   theme: MD3Theme;
//   isDarkMode: boolean;
//   toggleTheme: () => void;
//   setTheme: (isDark: boolean) => void;
// };

// const ThemeContext = createContext<ThemeContextType>({
//   theme: DarkTheme,
//   isDarkMode: true,
//   toggleTheme: () => {},
//   setTheme: () => {},
// });

// // Create the provider component
// export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const colorScheme = useColorScheme();
//   const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

//   // Update theme when device theme changes
//   useEffect(() => {
//     if (colorScheme) {
//       setIsDarkMode(colorScheme === 'dark');
//     }
//   }, [colorScheme]);

//   const toggleTheme = () => {
//     setIsDarkMode(!isDarkMode);
//   };

//   const setTheme = (isDark: boolean) => {
//     setIsDarkMode(isDark);
//   };

//   const theme = isDarkMode ? DarkTheme : LightTheme;

//   return (
//     <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, setTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// // Hook to use the theme
// export const useTheme = () => useContext(ThemeContext);

// // For backward compatibility - this ensures existing imports still work
// const Theme = DarkTheme;
// export default Theme;