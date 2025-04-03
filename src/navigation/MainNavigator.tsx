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
import { useAuth } from '../hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';
import Feedback from '../screens/Home/Feedback';
const Stack = createStackNavigator<RootStackParamList>();

const MainNavigator = () => {
  const { user, isLoading } = useAuth();

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
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Login_Maid" component={LoginScreenMaid} />
          <Stack.Screen name="Otp" component={Otp} />
          <Stack.Screen name="MaidProfile" component={MaidProfileDetials} />
          <Stack.Screen name="KYCDetailsMaid" component={KYCPage} />
          <Stack.Screen name="HomeMaid" component={HomeScreenMaid} />
          
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={BottomTabNavigator} />
          
        </>
      )}
       <Stack.Screen name="Feedback" component={Feedback} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
