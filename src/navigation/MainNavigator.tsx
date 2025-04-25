// MainNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import LoginScreenMaid from '../screens/Login/LoginScreenMaid';
import Otp from '../screens/Login/Otp';
import MaidProfileDetials from '../screens/Profile/MaidProfileDetails';
import KYCPage from '../screens/Profile/KYCDetailsMaid';
import HomeScreenMaid from '../screens/Home/HomeScreenMaid';
import BottomTabNavigator from './BottomTabNavigator';
import AdminTabNavigator from './AdminTabNavigator';
import { useAuth } from '../hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';
import Feedback from '../screens/Home/Feedback';
import UserProfile  from '../screens/Home/UserProfile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
const Stack = createStackNavigator<RootStackParamList>();

const MainNavigator = () => {
  const { user, isLoading,isProfileCreated } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('role');   // await the promise
        if (raw !== null) {
          // raw === '"admin"' if you did JSON.stringify before
          const parsed = JSON.parse(raw);                // -> 'admin'
          setRole(parsed);
        } else {
          setRole(null);
        }
      } catch {
        setRole(null);
      }
    })();
  }, []);
  console.log(role);
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f7f7f7' },
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Login_Maid" component={LoginScreenMaid} />
          <Stack.Screen name="Otp" component={Otp} />
          <Stack.Screen name="MaidProfile" component={MaidProfileDetials} />
          <Stack.Screen name="KYCDetailsMaid" component={KYCPage} />
          <Stack.Screen name="HomeMaid" component={HomeScreenMaid} />
          
        </>
      ) : role === "admin" ? (
        <Stack.Screen name="Admin" component={AdminTabNavigator} />
      ) : isProfileCreated ? (
        <Stack.Screen name="Home" component={BottomTabNavigator} />
        
      ) : (
        <>
          <Stack.Screen name="UserProfile" component={UserProfile} />         
        </>
      )}
       <Stack.Screen name="Feedback" component={Feedback} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
