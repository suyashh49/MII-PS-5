import React from 'react';
import { Switch, View, Text, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useTheme } from '../config/theme';

export const ThemeToggleSwitch: React.FC = () => {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  console.log({ isDarkMode, toggleTheme, theme }); // Debugging

  return (
    <View style={styles.switchContainer}>
      <Text style={[styles.switchText, { color: theme.colors.onSurface }]}>
        {isDarkMode ? 'Dark' : 'Light'}
      </Text>
      <Switch
        value={isDarkMode}
        onValueChange={toggleTheme}
        trackColor={{ false: '#767577', true: '#4285F4' }}
        thumbColor={'#f4f3f4'}
      />
    </View>
  );
};

export const ThemeToggleButton: React.FC = () => {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  return (
    <IconButton
      icon={isDarkMode ? 'weather-sunny' : 'weather-night'}
      iconColor={theme.colors.primary}
      size={24}
      onPress={toggleTheme}
    />
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  switchText: {
    marginRight: 8,
  },
});