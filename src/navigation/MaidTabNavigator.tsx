// src/navigation/MaidTabNavigator.tsx
import React, { useRef, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme, Menu, Text } from 'react-native-paper';
import MaidCalendarScreen from '../screens/Maid/MaidCalendarScreen';
import MaidProfileScreen from '../screens/Maid/MaidProfileScreen';
import MaidEarningsScreen from '../screens/Maid/MaidEarningsScreen';
import { useMaidAuth } from '../hooks/useMaidauth';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import i18n from '../locales/i18n';
import MaidSettingsScreen from '../screens/Maid/MaidSettingsScreen';
export type MaidTabParamList = {
  Calendar: undefined;
  Profile: undefined;
  Earnings: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MaidTabParamList>();

type MaidTabNavigatorProps = {
  route: {
    params: {
      name: string;
      govtId: string | null;
      imageUrl: string | null;
    }
  }
};

const MaidTabNavigator: React.FC<MaidTabNavigatorProps> = ({ route }) => {
  const { name } = route.params;
  const theme = useTheme();
  const navigation = useNavigation();
  const { logoutMaid } = useMaidAuth();
  const { t } = useTranslation();
  
  const menuRef = useRef<View>(null);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [languageSubmenuVisible, setLanguageSubmenuVisible] = useState<boolean>(false);

  const showMenu = () => {
    if (menuRef.current) {
      menuRef.current.measure((x, y, width, height, pageX, pageY) => {
        setMenuAnchor({ x: pageX, y: pageY });
        setMenuVisible(true);
      });
    }
  };

  const handleSignOut = async () => {
    await logoutMaid();
    navigation.navigate('Welcome' as never);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const renderMenu = () => {
    return (
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={menuAnchor}
        style={{ marginTop: 40 }}
      >
        <Menu.Item
          onPress={() => {
            setLanguageSubmenuVisible(true);
            setMenuVisible(false);
          }}
          title={t('select_language')}
          leadingIcon="translate"
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            handleSignOut();
          }}
          title={t('logout')}
          leadingIcon="logout"
        />
      </Menu>
    );
  };

  const renderLanguageMenu = () => {
    return (
      <Menu
        visible={languageSubmenuVisible}
        onDismiss={() => setLanguageSubmenuVisible(false)}
        anchor={menuAnchor}
        style={{ marginTop: 40 }}
      >
        <Menu.Item
          onPress={() => {
            setLanguageSubmenuVisible(false);
            changeLanguage('en');
          }}
          title={t('english')}
          style={{ opacity: i18n.language === 'en' ? 1 : 0.6 }}
        />
        <Menu.Item
          onPress={() => {
            setLanguageSubmenuVisible(false);
            changeLanguage('hi');
          }}
          title={t('hindi')}
          style={{ opacity: i18n.language === 'hi' ? 1 : 0.6 }}
        />
        <Menu.Item
          onPress={() => {
            setLanguageSubmenuVisible(false);
            changeLanguage('ma');
          }}
          title={t('marathi')}
          style={{ opacity: i18n.language === 'ma' ? 1 : 0.6 }}
        />
      </Menu>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.welcomeText, { color: theme.colors.onPrimary }]}>
          {t('welcomemaid')}, {name}!
        </Text>
        <TouchableOpacity
          ref={menuRef}
          onPress={showMenu}
          style={styles.menuButton}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={theme.colors.onPrimary}
          />
        </TouchableOpacity>
      </View>

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName = 'calendar';
            if (route.name === 'Calendar') iconName = 'calendar';
            if (route.name === 'Profile') iconName = 'account';
            if (route.name === 'Earnings') iconName = 'cash';
            if (route.name === 'Settings') iconName = 'cog';
            return <MaterialCommunityIcons name={iconName} color={color} size={size} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { backgroundColor: theme.colors.background },
        })}
      >
        <Tab.Screen 
          name="Calendar" 
          component={MaidCalendarScreen} 
        />
        <Tab.Screen 
          name="Profile" 
          component={MaidProfileScreen} 
        />
        <Tab.Screen 
          name="Earnings" 
          component={MaidEarningsScreen} 
        />
        <Tab.Screen
          name="Settings"
          component={MaidSettingsScreen}
        />
      </Tab.Navigator>
      {renderMenu()}
      {renderLanguageMenu()}
    </View>
  );
};

const styles = {
  header: {
    flexDirection: 'row' as const, 
    justifyContent: 'space-between' as const, 
    alignItems: 'center' as const,
    padding: 24, 
    paddingTop: 60
  },
  welcomeText: { 
    fontSize: 24, 
    fontWeight: 'bold' as const
  },
  menuButton: {
    padding: 8,
  },
};

export default MaidTabNavigator;