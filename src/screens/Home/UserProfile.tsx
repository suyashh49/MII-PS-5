import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, RadioButton, useTheme, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

type UserProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'UserProfile'
>;

const API_URL = 'https://maid-in-india-nglj.onrender.com';

const UserProfile = () => {
  const theme = useTheme();
  const navigation = useNavigation<UserProfileScreenNavigationProp>();
  const { user, setProfileCreated } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [contact, setContact] = useState(user?.contact || '');
  const [gender, setGender] = useState('Male');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const fullContact = `+91${contact}`;
  const validatePhone = (phone: string) => /^\+91[6-9]\d{9}$/.test(phone);
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPhotoUrl(uri);
    }
  };

  const handleSave = async () => {
    if (!name || !contact || !gender) {
      Alert.alert("Missing Info", "Please fill out all fields.");
      return;
    }

    if (!validatePhone(fullContact)) {
      Alert.alert("Invalid Contact", "Please enter a valid 10-digit Indian phone number.");
      return;
    }

    if (!user?.token) {
      Alert.alert("Error", "Authentication token missing.");
      return;
    }

    try {
      console.log(photoUrl);
      const response = await axios.post(`${API_URL}/api/auth/update`, {
        name: name,
        contactNumber: fullContact,
        gender: gender,
        photoUrl: photoUrl,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });

      const updatedUser = {
        ...user,
        name,
        contact,
        gender,
        photoUrl
      };

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      Alert.alert('Profile Updated', 'Welcome! Your profile is complete.');


      setProfileCreated(true);

    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Complete Your Profile</Text>
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Avatar.Image
            size={80}
            source={{
              uri: photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name),
            }}
          />
          <Text style={{ marginTop: 8 , marginLeft: -30, marginRight:0}}>Change Profile Picture</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        label="Full Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Contact Number"
        value={contact}
        onChangeText={setContact}
        keyboardType="phone-pad"
        maxLength={13}
        mode="outlined"
        style={styles.input}
      />

      <Text style={styles.label}>Gender</Text>
      <RadioButton.Group onValueChange={setGender} value={gender}>
        <View style={styles.radioRow}>
          <RadioButton value="Male" />
          <Text>Male</Text>
          <RadioButton value="Female" />
          <Text>Female</Text>
        </View>
      </RadioButton.Group>

      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Save & Continue
      </Button>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
  },
  buttonContent: {
    height: 50,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});

export default UserProfile;