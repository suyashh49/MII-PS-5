import React from 'react';
import { StyleSheet, View, ImageBackground } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


const heroImage = require('../../assets/hero_1.png');
type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('Profile');
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
        Maid In India
      </Text>
      
      <Button
        mode="contained"
        onPress={handleGetStarted}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        next
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
    // This makes the image cover the entire screen
    position: 'absolute',
    top: 0,
    left: 20,
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
    //marginTop: 5,
    paddingVertical: 4,
  },
  buttonLabel: {
    fontSize: 16,
    textTransform: 'none',
  },
});

export default WelcomeScreen;