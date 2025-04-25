import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AllMaidsScreen from '../screens/Admin/AllMaidsScreen';
import MaidFeedbackScreen from '../screens/Admin/AdminMaidFeedBackScreen';

export type AdminMaidsStackParamList = {
  AllMaids: undefined;
  MaidFeedback: { maidId: number };
};

const Stack = createStackNavigator<AdminMaidsStackParamList>();

export default function AdminMaidsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#4285F4' }, headerTintColor: '#fff' }}>
      <Stack.Screen
        name="AllMaids"
        component={AllMaidsScreen}
        options={{ title: 'All Maids' }}
      />
      <Stack.Screen
        name="MaidFeedback"
        component={MaidFeedbackScreen}
        options={{ title: 'Feedback' }}
      />
    </Stack.Navigator>
  );
}
