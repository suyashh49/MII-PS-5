import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

type HomeScreenMaidRouteProp = RouteProp<RootStackParamList, 'HomeMaid'>;

const HomeScreenMaid = () => {
  const route = useRoute<HomeScreenMaidRouteProp>();
  const { name, govtId, imageUrl } = route.params;
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
        Welcome, {name}!
      </Text>
      <Text style={[styles.label, { color: theme.colors.onBackground }]}>Government ID Photo</Text>
      {govtId && <Image source={{ uri: govtId }} style={styles.image} />}
      <Text style={[styles.label, { color: theme.colors.onBackground }]}>Your Photo</Text>
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 20,
  },
  label: {
    marginTop: 20,
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
});

export default HomeScreenMaid;