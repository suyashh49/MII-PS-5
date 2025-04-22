// src/App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import Theme from '../MII-PS-5/src/config/theme';
import MainNavigator from '../MII-PS-5/src/navigation/MainNavigator';
import { AuthProvider } from '../MII-PS-5/src/hooks/useAuth';
import 'react-native-get-random-values';


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

//uncomment for theme switch
// import 'react-native-gesture-handler';
// import React from 'react';
// import { StatusBar } from 'expo-status-bar';
// import { NavigationContainer } from '@react-navigation/native';
// import { Provider as PaperProvider } from 'react-native-paper';
// import { ThemeProvider, useTheme } from './src/config/theme';
// import MainNavigator from './src/navigation/MainNavigator';
// import { AuthProvider } from './src/hooks/useAuth';

// const ThemedApp = () => {
//   const { theme } = useTheme();

//   return (
//     <PaperProvider theme={theme}>
//       <AuthProvider>
//         <NavigationContainer>
//           <MainNavigator />
//           <StatusBar style={theme.dark ? 'light' : 'dark'} />
//         </NavigationContainer>
//       </AuthProvider>
//     </PaperProvider>
//   );
// };

// export default function App() {
//   return (
//     <ThemeProvider>
//       <ThemedApp />
//     </ThemeProvider>
//   );
// }