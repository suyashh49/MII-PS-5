// // src/navigation/MainNavigator.tsx
// import React from 'react';
// import { createStackNavigator } from '@react-navigation/stack';
// import { RootStackParamList } from '../types';
// import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
// import LoginScreen from '../screens/Login/LoginScreen';
// import ProfileScreen from '../screens/Profile/ProfileScreen';
// import LoginScreenMaid from '../screens/Login/LoginScreenMaid';
// import Otp from '../screens/Login/Otp';
// import MaidProfileDetials from '../screens/Profile/MaidProfileDetails';
// import KYCPage from '../screens/Profile/KYCDetailsMaid';
// import HomeScreenMaid from '../screens/Home/HomeScreenMaid';
// import BottomTabNavigator from './BottomTabNavigator';
// import AdminTabNavigator from './AdminTabNavigator';
// import { useAuth } from '../hooks/useAuth';
// import { useMaidAuth } from '../hooks/useMaidauth';
// import { ActivityIndicator, View } from 'react-native';
// import Feedback from '../screens/Home/Feedback';
// import UserProfile from '../screens/Home/UserProfile';
// import { useTranslation } from 'react-i18next';

// const Stack = createStackNavigator<RootStackParamList>();

// const MainNavigator = () => {
//   const { user, isLoading: userLoading, isProfileCreated, isRole } = useAuth();
//   const { maid, isLoading: maidLoading } = useMaidAuth();
  
//   const isLoading = userLoading || maidLoading;

//   if (isLoading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color="#4285F4" />
//       </View>
//     );
//   }

//   // Priority: Check for maid login first, then user login
//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerShown: false,
//         cardStyle: { backgroundColor: '#f7f7f7' },
//       }}
//     >
//       {maid ? (
//          maid.profileCreated ? ( // Add this check
//           <Stack.Screen 
//             name="HomeMaid" 
//             component={HomeScreenMaid} 
//             initialParams={{ 
//               name: maid.name || 'Maid',
//               govtId: maid.govtId,
//               imageUrl: maid.imageUrl
//             }} 
//           />
//         ) : (
//           <Stack.Screen name="MaidProfile" component={MaidProfileDetials} />
//           //  <Stack.Screen name="KYCDetailsMaid" component={KYCPage} />
//           // <Stack.Screen name="HomeMaid" component={HomeScreenMaid} /> 
          
//         )
//       ) : user ? (
//         // User is logged in
//         isRole === "admin" ? (
//           <Stack.Screen name="Admin" component={AdminTabNavigator} />
//         ) : isProfileCreated ? (
//           <Stack.Screen name="Home" component={BottomTabNavigator} />
//         ) : (
//           <Stack.Screen name="UserProfile" component={UserProfile} />         
//         )
//       ) : (
//         // No one is logged in
//         <>
//           <Stack.Screen name="Welcome" component={WelcomeScreen} />
//           <Stack.Screen name="Profile" component={ProfileScreen} />
//           <Stack.Screen name="Login" component={LoginScreen} />
//           <Stack.Screen name="Login_Maid" component={LoginScreenMaid} />
//           <Stack.Screen name="Otp" component={Otp} />
//           {/* <Stack.Screen name="MaidProfile" component={MaidProfileDetials} />
//           <Stack.Screen name="KYCDetailsMaid" component={KYCPage} />
//           <Stack.Screen name="HomeMaid" component={HomeScreenMaid} /> */}
//         </>
//       )}
//       <Stack.Screen name="KYCDetailsMaid" component={KYCPage} />
//       {/* <Stack.Screen name="HomeMaid" component={HomeScreenMaid} /> */}
//       <Stack.Screen name="Feedback" component={Feedback} />
//     </Stack.Navigator>
//   );
// };

// export default MainNavigator;

// src/navigation/MainNavigator.tsx
import React from 'react';
import { CardStyleInterpolators } from '@react-navigation/stack';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import LoginScreenMaid from '../screens/Login/LoginScreenMaid';
import Otp from '../screens/Login/Otp';
import MaidProfileDetials from '../screens/Profile/MaidProfileDetails';
import KYCPage from '../screens/Profile/KYCDetailsMaid';
import MaidTabNavigator from './MaidTabNavigator';
import BottomTabNavigator from './BottomTabNavigator';
import AdminTabNavigator from './AdminTabNavigator';
import { useAuth } from '../hooks/useAuth';
import { useMaidAuth } from '../hooks/useMaidauth';
import { ActivityIndicator, View } from 'react-native';
import Feedback from '../screens/Home/Feedback';
import UserProfile from '../screens/Home/UserProfile';
import AnimatedLoader from '../componenets/AnimatedLoader';


const Stack = createStackNavigator<RootStackParamList>();

const MainNavigator = () => {
  const { user, isLoading: userLoading, isProfileCreated, isRole } = useAuth();
  const { maid, isLoading: maidLoading } = useMaidAuth();
  
  const isLoading = userLoading || maidLoading;

  if (isLoading) {
      return <AnimatedLoader text="Loading..." />;
  }

  // Priority: Check for maid login first, then user login
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f7f7f7' },
        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid, // Smooth horizontal sliding
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 400,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 300,
            },
          },
        },
      }}
    >
   
      {maid ? (
         maid.profileCreated ? (
          <Stack.Screen 
            name="HomeMaid" 
            component={MaidTabNavigator} 
            initialParams={{ 
              name: maid.name || 'Maid',
              govtId: maid.govtId,
              imageUrl: maid.imageUrl
            }} 
          />
        ) : (
          <Stack.Screen name="MaidProfile" component={MaidProfileDetials} />
        )
      ) : user ? (
        // User is logged in
        isRole === "admin" ? (
          <Stack.Screen name="Admin" component={AdminTabNavigator} />
        ) : isProfileCreated ? (
          <Stack.Screen name="Home" component={BottomTabNavigator} />
        ) : (
          <Stack.Screen name="UserProfile" component={UserProfile} />         
        )
      ) : (
        // No one is logged in
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Login_Maid" component={LoginScreenMaid} />
          <Stack.Screen name="Otp" component={Otp} />
        </>
      )}
      <Stack.Screen name="KYCDetailsMaid" component={KYCPage} />
      <Stack.Screen name="Feedback" component={Feedback} />
    </Stack.Navigator>
  );
};

export default MainNavigator;