import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

type HomeScreenMaidRouteProp = RouteProp<RootStackParamList, 'HomeMaid'>;

const HomeScreenMaid = () => {
  const route = useRoute<HomeScreenMaidRouteProp>();
  const { name, govtId, imageUrl } = route.params;

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome, {name}!
      </Text>
      <Text style={styles.label}>Government ID Photo</Text>
      {govtId && <Image source={{ uri: govtId }} style={styles.image} />}
      <Text style={styles.label}>Your Photo</Text>
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