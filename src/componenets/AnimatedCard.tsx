import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';

interface AnimatedCardProps {
  children: React.ReactNode;
  animation?: string;
  duration?: number;
  delay?: number;
  style?: any;
}

const AnimatedCard = ({
  children,
  animation = 'fadeIn',
  duration = 500,
  delay = 0,
  style,
}: AnimatedCardProps) => {
  return (
    <Animatable.View
      animation={animation}
      duration={duration}
      delay={delay}
      style={styles.container}
    >
      <Surface style={[styles.surface, style]}>
        {children}
      </Surface>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  surface: {
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
});

export default AnimatedCard;