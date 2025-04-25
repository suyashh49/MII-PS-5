import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminMaidsStack from './AdminMaidsStack';
import MakeAdminScreen from '../screens/Admin/MakeAdminScreen';

export type AdminTabParamList = {
  Maids: undefined;
  MakeAdmin: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarLabelStyle: { fontSize: 12 } }}>
      <Tab.Screen
        name="Maids"
        component={AdminMaidsStack}
        options={{ title: 'All Maids' }}
      />
      <Tab.Screen
        name="MakeAdmin"
        component={MakeAdminScreen}
        options={{ title: 'Make Admin' }}
      />
    </Tab.Navigator>
  );
}
