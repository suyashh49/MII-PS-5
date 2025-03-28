// // src/hooks/useAuth.tsx
// import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
// import * as Google from 'expo-auth-session/providers/google';
// import * as WebBrowser from 'expo-web-browser';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { AuthContextType, User } from '../types';
// import { storeUserInBackend } from "../services/api";

// // Register for redirection
// WebBrowser.maybeCompleteAuthSession();

// // Replace with your own Google client ID
// const CLIENT_ID = '411763389934-btjt6a3ua0jdmc1fuhvk20nped3gdgbh.apps.googleusercontent.com';

// // Create Auth Context
// const AuthContext = createContext<AuthContextType | null>(null);

// // Hook to use auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// interface AuthProviderProps {
//   children: ReactNode;
// }

// // Provider component
// export const AuthProvider = ({ children }: AuthProviderProps) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const [request, response, promptAsync] = Google.useAuthRequest({
//     //expoClientId: CLIENT_ID,
//     webClientId: "411763389934-btjt6a3ua0jdmc1fuhvk20nped3gdgbh.apps.googleusercontent.com",
//     scopes: ['profile', 'email'],
//     androidClientId: "411763389934-2v0dihlftn1jvh92s387d7a26trhqpib.apps.googleusercontent.com",
//   });

//   useEffect(() => {
//     // Check for stored user data on load
//     const loadStoredUser = async () => {
//       try {
//         const userString = await AsyncStorage.getItem('user');
//         if (userString) {
//           setUser(JSON.parse(userString));
//         }
//       } catch (error) {
//         console.error('Failed to load user data', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadStoredUser();
//   }, []);

//   useEffect(() => {
//     if (response?.type === 'success') {
//       const { authentication } = response;
      
//       // Exchange the code for access token
//       fetchUserInfo(authentication?.accessToken);
//     }
//   }, [response]);

//   const fetchUserInfo = async (token: string | undefined) => {
//     if (!token) return;
    
//     try {
//       setIsLoading(true);
      
//       console.log('Access token my:', token);
//       // Fetch user info from Google
//       const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       const userInfo = await response.json();
      
//       // Create user object
//       const newUser: User = {
//         id: userInfo.id,
//         name: userInfo.name,
//         email: userInfo.email,
//         photoUrl: userInfo.picture,
//         token: userInfo.token
//       };
      

//       // Store in AsyncStorage
//       await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
//       // Store in state
//       setUser(newUser);
      
//       // Send to backend
//       await storeUserInBackend(newUser);
      
//     } catch (error) {
//       console.error('Error fetching user info:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const login = async () => {
//     try {
//       await promptAsync();
//     } catch (error) {
//       console.error('Login error:', error);
//     }
//   };

//   const logout = async () => {
//     try {
//       await AsyncStorage.removeItem('user');
//       setUser(null);
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, isLoading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// src/hooks/useAuth.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, User } from '../types';
import { storeUserInBackend } from "../services/api";

// Register for redirection
WebBrowser.maybeCompleteAuthSession();

// Replace with your own Google client ID
const CLIENT_ID = '411763389934-btjt6a3ua0jdmc1fuhvk20nped3gdgbh.apps.googleusercontent.com';
const API_URL = 'https://maid-in-india-nglj.onrender.com';
// Create Auth Context
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
    // Check for stored user data on load
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
      // Wrap async logic in an inner function
      const fetchUserData = async () => {
        try {
          const { authentication } = response;
          const { accessToken } = authentication;
          console.log("Access Token:", accessToken);
          const token = accessToken; // from Google

          // Fetch user info from your backend
          console.log("This is token:", token);
          const res = await fetch(`${API_URL}/api/auth/verify-google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          // Await and then log the response JSON
          const userInfo = await res.json();
          console.log("User Info from backend:", userInfo);

          // Create user object
          const newUser: User = {
            id: userInfo.user.id,
            name: userInfo.user.name,
            email: userInfo.user.email,
            photoUrl: userInfo.user.picture,
            token: userInfo.user.token,
          };

          // Rename the token from userInfo to avoid shadowing the outer token
          //const jwtToken = userInfo.user.token;

          // Store in AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(newUser));
          //await AsyncStorage.setItem('token', jwtToken);
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


//   const fetchUserInfo = async (token: string | undefined) => {
//     if (!token) return;
//
//     try {
//       setIsLoading(true);
//
//       // Fetch user info from Google
//
// //       const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
// //         headers: { Authorization: `Bearer ${token}` }
// //       });
//
//
//       // Send to backend
//       //await storeUserInBackend(newUser);
//
//     } catch (error) {
//       console.error('Error fetching user info:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
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