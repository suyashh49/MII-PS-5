// BookStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BookMaid from '../screens/Home/BookMaid';
import TimeSlotSelection from '../screens/Home/TimeSlotPage';
import { useTheme } from 'react-native-paper';
import { BookStackParamList } from '../types/index';
import Feedback from '../screens/Home/Feedback'
const Stack = createStackNavigator<BookStackParamList>();


const BookStackNavigator = () => {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="BookMaid"
        component={BookMaid}
        options={{ title: 'Book a Maid1/Cook', headerShown: false }}
      />
      <Stack.Screen
        name="TimeSlotSelection"
        component={TimeSlotSelection}
        options={{ title: 'Select Time Slot', headerShown: false }}
      />
      <Stack.Screen name="Feedback" component={Feedback} />
    </Stack.Navigator>
  );
};

export default BookStackNavigator;
