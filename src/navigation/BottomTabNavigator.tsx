import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/Home/HomeScreen';
import BookMaid from '../screens/Home/BookMaid';
import CartCheckout from '../screens/Home/CartCheckout';
import BookStackNavigator from './BookStackNavigator';
import { useAuth } from '../hooks/useAuth';
import HomeStackNavigator from './HomeStackNavigator';
import theme from '../config/theme';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  
  const { user } = useAuth();
  
  
  const HomeScreenWrapper = (props: any) => {
    return (
      <HomeScreen 
        {...props} 
        route={{
          ...props.route,
          params: {
            ...props.route.params,
            userName: user?.name || 'User Name',
            email: user?.email || 'user@example.com'
          }
        }}
      />
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'BookMaid') {
            iconName = 'broom';
          } else if (route.name === 'CartCheckout') {
            iconName = 'cart';
          }

          return <MaterialCommunityIcons name={iconName} color={color} size={size} />;
        },
        tabBarActiveTintColor: theme.colors.primary, // blue
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: theme.colors.background }, // Dark background
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="BookMaid" component={BookStackNavigator} options={{ headerShown: false }}/>
      <Tab.Screen name="CartCheckout" component={CartCheckout} options={{ headerShown: false }}/>
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;