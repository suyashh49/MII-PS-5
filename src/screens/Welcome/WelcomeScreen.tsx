import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import Svg, { Path } from 'react-native-svg';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

const BroomIcon = ({ color }: { color: string }) => (
    <Svg width="64" height="64" viewBox="0 0 24 24" fill={color}>
      <Path d="M21.71,20.29l-4-4a1,1,0,0,0-1.42,0L14.34,18,6.41,10.07a1,1,0,0,0-1.42,0L3.29,11.77a1,1,0,0,0,0,1.42l7.93,7.93-1.71,1.71a1,1,0,0,0,0,1.42l4,4a1,1,0,0,0,1.42,0l1.71-1.71,7.93,7.93a1,1,0,0,0,1.42,0l1.71-1.71a1,1,0,0,0,0-1.42ZM5.83,12.24,7.24,10.83l6.93,6.93L12.76,19.17ZM19.17,22.76,17.76,21.34l6.93-6.93,1.41,1.41Z"/>
    </Svg>
  );

const WelcomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('Profile');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <BroomIcon color={theme.colors.primary} />
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
    width: '100%',
    borderRadius: 30,
  },
  buttonLabel: {
    fontSize: 16,
    textTransform: 'none',
  },
});

export default WelcomeScreen;