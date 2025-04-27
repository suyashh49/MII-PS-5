import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminMaidsStack from './AdminMaidsStack';
import MakeAdminScreen from '../screens/Admin/MakeAdminScreen';
import theme from '../config/theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export type AdminTabParamList = {
  Maids: undefined;
  MakeAdmin: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarLabelStyle: { fontSize: 12 }, tabBarActiveTintColor:theme.colors.primary }}>
      <Tab.Screen
        name="Maids"
        component={AdminMaidsStack}
        options={{ title: 'All Maids' , tabBarIcon(props) {
          return <MaterialCommunityIcons name="home" color={props.color} size={24} />;
        },}}
      />
      <Tab.Screen
        name="MakeAdmin"
        component={MakeAdminScreen}
        options={{ title: 'Make Admin', tabBarIcon(props) {
          return <MaterialCommunityIcons name="account-plus" color={props.color} size={24} />;
        }, }}
      />
    </Tab.Navigator>
  );
}
