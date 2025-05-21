import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';

interface AnimatedButtonProps {
  onPress: () => void;
  label: string;
  mode?: 'text' | 'outlined' | 'contained';
  icon?: string;
  style?: any;
}

const AnimatedButton = ({
  onPress,
  label,
  mode = 'contained',
  icon,
  style,
}: AnimatedButtonProps) => {
  return (
    <Animatable.View
      animation="pulse"
      iterationCount="infinite"
      iterationDelay={3000}
      duration={1500}
    >
      <Button
        mode={mode}
        onPress={onPress}
        icon={icon}
        style={[styles.button, style]}
        contentStyle={styles.buttonContent}
      >
        {label}
      </Button>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default AnimatedButton;