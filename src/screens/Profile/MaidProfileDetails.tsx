import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Text, Button, RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

type MaidProfileDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'MaidProfileDetails'>;

const MaidProfileDetails = () => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const navigation = useNavigation<MaidProfileDetailsNavigationProp>();

  const handleNext = () => {
    // Navigate to the next page with the entered details
    navigation.navigate('KYCDetailsMaid', { name, gender, location });
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome, Maid!
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.label}>Gender</Text>
      <RadioButton.Group onValueChange={newValue => setGender(newValue)} value={gender}>
        <View style={styles.radioContainer}>
          <RadioButton value="male" />
          <Text style={styles.radioLabel}>Male</Text>
        </View>
        <View style={styles.radioContainer}>
          <RadioButton value="female" />
          <Text style={styles.radioLabel}>Female</Text>
        </View>
        <View style={styles.radioContainer}>
          <RadioButton value="other" />
          <Text style={styles.radioLabel}>Other</Text>
        </View>
      </RadioButton.Group>
      <TextInput
        style={styles.input}
        placeholder="Enter your location"
        value={location}
        onChangeText={setLocation}
      />
      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.button}
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
  input: {
    borderBottomWidth: 1,
    width: 200,
    marginVertical: 10,
    textAlign: 'center',
  },
  label: {
    marginTop: 20,
    fontSize: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  radioLabel: {
    marginLeft: 10,
  },
  button: {
    marginTop: 30,
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
});

export default MaidProfileDetails;