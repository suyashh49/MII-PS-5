import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

type KYCDetailsMaidNavigationProp = StackNavigationProp<RootStackParamList, 'KYCDetailsMaid'>;
type KYCDetailsMaidRouteProp = RouteProp<RootStackParamList, 'KYCDetailsMaid'>;

const KYCDetailsMaid = () => {
  const [govtIdPhoto, setGovtIdPhoto] = useState<string | null>(null);
  const [selfPhoto, setSelfPhoto] = useState<string | null>(null);
  const navigation = useNavigation<KYCDetailsMaidNavigationProp>();
  const route = useRoute<KYCDetailsMaidRouteProp>();
  const { name } = route.params;

  const pickImage = async (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    // Navigate to the next page with the uploaded images
    navigation.navigate('HomeMaid', { name, govtIdPhoto, selfPhoto });
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        KYC Verification
      </Text>
      <Text style={styles.label}>Upload Government ID Photo</Text>
      <Button
        mode="contained"
        onPress={() => pickImage(setGovtIdPhoto)}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {govtIdPhoto ? 'Change Photo' : 'Upload Photo'}
      </Button>
      {govtIdPhoto && <Image source={{ uri: govtIdPhoto }} style={styles.image} />}
      <Text style={styles.label}>Upload Your Photo</Text>
      <Button
        mode="contained"
        onPress={() => pickImage(setSelfPhoto)}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {selfPhoto ? 'Change Photo' : 'Upload Photo'}
      </Button>
      {selfPhoto && <Image source={{ uri: selfPhoto }} style={styles.image} />}
      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.nextButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        Next
      </Button>
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
  button: {
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 4,
    elevation: 2,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  nextButton: {
    marginTop: 30,
    borderRadius: 8,
    paddingVertical: 4,
    elevation: 2,
  },
});

export default KYCDetailsMaid;