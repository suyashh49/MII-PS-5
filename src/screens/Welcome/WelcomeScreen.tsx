import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ImageBackground, BackHandler } from 'react-native';
import { Text, Button, useTheme, Menu, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import i18n from '../../locales/i18n';

const heroImage = require('../../assets/hero_1.png');
type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
  };

  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const handleGetStarted = () => {
    navigation.navigate('Profile');
  };

  const getLanguageDisplay = () => {
    switch (currentLanguage) {
      case 'en': return t('selectLanguage');
      case 'hi': return t('selectLanguage');
      default: return t('selectLanguage');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ImageBackground
        source={heroImage}
        style={styles.backgroundImage}
        resizeMode="contain"
      ></ImageBackground>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons name="broom" size={64} color={theme.colors.primary} />
      </View>

      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        {t('appTitle')}
      </Text>

      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={
          <Button
            mode="outlined"
            icon="translate"
            onPress={openMenu}
            style={{ marginBottom: 16, width: 180, alignSelf: 'center' }}
            labelStyle={{ color: theme.colors.primary }}
          >
            {getLanguageDisplay()}
          </Button>
        }
      >
        <Menu.Item onPress={() => { changeLanguage('en'); closeMenu(); }} title={t('english')} />
        <Divider />
        <Menu.Item onPress={() => { changeLanguage('hi'); closeMenu(); }} title={t('hindi')} />
          <Divider />
          <Menu.Item onPress={() => { changeLanguage('ma'); closeMenu(); }} title={t('marathi')} />
      </Menu>

      <Button
        mode="contained"
        onPress={handleGetStarted}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        {t('next')}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backgroundImage: {
    position: 'absolute',
    top: -80,
    left: 15,
    right: 20,
    bottom: 300,
    width: '100%',
    alignContent: 'flex-start',
  },
  iconContainer: {
    marginBottom: 24,
    borderRadius: 50,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  button: {
    width: '90%',
    borderRadius: 24,
    paddingVertical: 4,
  },
  buttonLabel: {
    fontSize: 16,
    textTransform: 'none',
  },
});

export default WelcomeScreen;