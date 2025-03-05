import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, StyleSheet, Image, TextInput } from 'react-native';
import { Text, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type KYCDetailsMaidNavigationProp = StackNavigationProp<RootStackParamList, 'KYCDetailsMaid'>;
type KYCDetailsMaidRouteProp = RouteProp<RootStackParamList, 'KYCDetailsMaid'>;

const KYCDetailsMaid = () => {
  const [govtId, setgovtId] = useState<string | null>(null);
  const [imageUrl, setimageUrl] = useState<string | null>(null);
  const navigation = useNavigation<KYCDetailsMaidNavigationProp>();
  const route = useRoute<KYCDetailsMaidRouteProp>();
  const { name, gender, location } = route.params;

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

  const handleNext = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put('http://192.168.193.5:5000/api/maid/profile', {
        name,
        govtId,
        imageUrl,
        gender,
        location,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Profile created successfully');
      navigation.navigate('HomeMaid', { name, govtId, imageUrl });
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Failed to create profile. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        KYC Verification
      </Text>
      <Text style={styles.label}>Upload Government ID Photo</Text>
      <Button
        mode="contained"
        onPress={() => pickImage(setgovtId)}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {govtId ? 'Change Photo' : 'Upload Photo'}
      </Button>
      {govtId && <Image source={{ uri: govtId }} style={styles.image} />}
      <Text style={styles.label}>Upload Your Photo</Text>
      <Button
        mode="contained"
        onPress={() => pickImage(setimageUrl)}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {imageUrl ? 'Change Photo' : 'Upload Photo'}
      </Button>
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
  },
  button: {
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
    marginVertical: 10,
  },
  nextButton: {
    marginTop: 20,
  },
});

export default KYCDetailsMaid;