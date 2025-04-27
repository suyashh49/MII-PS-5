import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type KYCDetailsMaidNavigationProp = StackNavigationProp<RootStackParamList, 'KYCDetailsMaid'>;
type KYCDetailsMaidRouteProp = RouteProp<RootStackParamList, 'KYCDetailsMaid'>;

const KYCDetailsMaid = () => {
  const [govtId, setGovtId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const navigation = useNavigation<KYCDetailsMaidNavigationProp>();
  const route = useRoute<KYCDetailsMaidRouteProp>();
  const { name, gender, location, timeAvailable, cooking, cleaning, pricePerService, coordinates } = route.params;
  const theme = useTheme();

  const pickImage = async (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    console.log('🌍 received coords:', coordinates);
  }, []);

  const handleNext = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Ensure coordinates are properly structured before sending to API
      let latitude = null;
      let longitude = null;
      
      if (coordinates) {
        latitude = coordinates.latitude;
        longitude = coordinates.longitude;
        console.log('Sending coordinates to API:', { latitude, longitude });
      }
      
      const response = await axios.put(
        'https://maid-in-india-nglj.onrender.com/api/maid/profile',
        {
          name,
          govtId,
          imageUrl,
          gender,
          location,
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
          timeAvailable,
          cooking,
          cleaning,
          pricePerService,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log('API Response:', response.data);
      alert('Profile created successfully');
      navigation.navigate('HomeMaid', { name, govtId, imageUrl });
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Failed to create profile. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Consistent header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('MaidProfile')}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
          KYC Verification
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.label, { color: theme.colors.onBackground, textAlign: 'center' }]}>
              Government ID
            </Text>
            <Button
              mode="contained"
              onPress={() => pickImage(setGovtId)}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {govtId ? 'Change Photo' : 'Upload Photo'}
            </Button>
            {govtId && <Image source={{ uri: govtId }} style={styles.image} />}
            
            <Text style={[styles.label, { color: theme.colors.onBackground, marginTop: 16, textAlign: 'center' }]}>
              Profile Picture
            </Text>
            <Button
              mode="contained"
              onPress={() => pickImage(setImageUrl)}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {imageUrl ? 'Change Photo' : 'Upload Photo'}
            </Button>
            {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
          </Card.Content>
        </Card>
        
        {/* Display coordinates for debugging */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.label, { color: theme.colors.onBackground, textAlign: 'center' }]}>
              Location Coordinates
            </Text>
            <Text style={{ textAlign: 'center' }}>
              {coordinates ? 
                `Latitude: ${coordinates.latitude}, Longitude: ${coordinates.longitude}` : 
                'No coordinates available'}
            </Text>
          </Card.Content>
        </Card>
        
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.nextButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Next
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    paddingRight: 2,
  },
  headerTitle: {
    fontSize: 24,
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  scrollContainer: {
    padding: 16,
    marginTop: 10,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  button: {
    width: '90%',
    borderRadius: 30,
    marginVertical: 8,
    alignSelf: 'center',
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    textTransform: 'none',
    fontWeight: 'bold',
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  nextButton: {
    width: '90%',
    borderRadius: 30,
    marginTop: 12,
    alignSelf: 'center',
  },
});

export default KYCDetailsMaid;