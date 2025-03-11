import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../../config/theme';

type KYCDetailsMaidNavigationProp = StackNavigationProp<RootStackParamList, 'KYCDetailsMaid'>;
type KYCDetailsMaidRouteProp = RouteProp<RootStackParamList, 'KYCDetailsMaid'>;

const KYCDetailsMaid = () => {
  const [govtId, setgovtId] = useState<string | null>(null);
  const [imageUrl, setimageUrl] = useState<string | null>(null);
  const navigation = useNavigation<KYCDetailsMaidNavigationProp>();
  const route = useRoute<KYCDetailsMaidRouteProp>();
  const { name, gender, location, timeAvailable, cooking, cleaning, pricePerService } = route.params;
  const theme = useTheme();

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
        timeAvailable,
        cooking,
        cleaning,
        pricePerService,
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Fixed header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('MaidProfile')}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          KYC Verification
        </Text>
      </View>
      
      {/* Scrollable content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={[styles.label, { color: theme.colors.onBackground }]}>Upload Government ID Photo</Text>
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
          <Text style={[styles.label, { color: theme.colors.onBackground }]}>Upload Your Photo</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: '100%',
    backgroundColor: theme.colors.background,
    zIndex: 1,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    paddingRight: 20,
  },
  title: {
    fontSize: 24,
    flex: 1,
    textAlign: 'center',
    marginRight: 24, // To balance with the back button width
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    alignItems: 'center',
    padding: 100,
    paddingTop: 120,
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 4,
    elevation: 2,
    width: '80%',
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
    borderRadius: 8,
  },
  nextButton: {
    marginTop: 40,
    marginBottom: 20,
    width: '40%',
    borderRadius: 8,
    paddingVertical: 4,
    elevation: 2,
    //marginTop: 20,
    //width: '100%',
    //marginBottom: 20,
  },
});

export default KYCDetailsMaid;