import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function CustomHeader({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
      <Text style={[styles.headerText, { color: theme.colors.onPrimary }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});