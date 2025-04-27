import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AllMaidsScreen from '../screens/Admin/AllMaidsScreen';
import MaidFeedbackScreen from '../screens/Admin/AdminMaidFeedBackScreen';
import CustomHeader from '../componenets/CustomHeader';

export type AdminMaidsStackParamList = {
  AllMaids: undefined;
  MaidFeedback: { maidId: number };
};

const Stack = createStackNavigator<AdminMaidsStackParamList>();

export default function AdminMaidsStack() {
  return (
    <Stack.Navigator  screenOptions={{
      headerStyle: { backgroundColor: '#1368A4', padding:24, paddingTop: 60, width: '100%' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontSize: 22, fontWeight: 'bold', width: '100%' },
      headerTitleAlign: 'left',
    }}>
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
