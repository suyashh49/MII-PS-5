import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';

interface LoaderProps {
  text?: string;
  color?: string;
}

const AnimatedLoader = ({ text, color = '#1368A4' }: LoaderProps) => {
  return (
    <View style={styles.container}>
      <Animatable.View 
        animation="pulse" 
        iterationCount="infinite" 
        duration={1500}
      >
        <ActivityIndicator size="large" color={color} />
      </Animatable.View>
      
      {text && (
        <Animatable.View animation="fadeIn" delay={500}>
          <Text style={styles.text}>{text}</Text>
        </Animatable.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AnimatedLoader;