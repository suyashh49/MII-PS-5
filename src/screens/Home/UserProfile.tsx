import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, RadioButton, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
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

  const validatePhone = (phone: string) => /^[6-9]\d{9}$/.test(phone); // Indian number regex

  const handleSave = async () => {
    if (!name || !contact || !gender) {
      Alert.alert("Missing Info", "Please fill out all fields.");
      return;
    }

    if (!validatePhone(contact)) {
      Alert.alert("Invalid Contact", "Please enter a valid 10-digit Indian phone number.");
      return;
    }
    
    if (!user?.token) {
      Alert.alert("Error", "Authentication token missing.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/update`, {
        name:name,
        contactNumber:contact,
        gender:gender,
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
      };

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      Alert.alert('Profile Updated', 'Welcome! Your profile is complete.');
      
      // Update the auth context to indicate profile creation is complete
      // This will trigger MainNavigator to show BottomTabNavigator with Home screen
      setProfileCreated(true);

    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Complete Your Profile</Text>

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
});

export default UserProfile;