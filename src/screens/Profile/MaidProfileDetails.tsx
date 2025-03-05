import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Text, Button, RadioButton, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

type MaidProfileDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'MaidProfile'>;

const MaidProfileDetails = () => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male'); // Initialize gender with a default value
  const [location, setLocation] = useState('');
  const navigation = useNavigation<MaidProfileDetailsNavigationProp>();
  const theme = useTheme();

  const handleNext = () => {
    navigation.navigate('KYCDetailsMaid', { name, gender, location });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        Welcome, Maid!
      </Text>
      <TextInput
        style={[styles.input, { color: theme.colors.onBackground, borderBottomColor: theme.colors.primary }]}
        placeholder="Enter your name"
        placeholderTextColor={theme.colors.onSurfaceVariant}
        value={name}
        onChangeText={setName}
      />
      <Text style={[styles.label, { color: theme.colors.onBackground }]}>Gender</Text>
      <RadioButton.Group onValueChange={newValue => setGender(newValue)} value={gender}>
        <View style={styles.radioContainer}>
          <RadioButton value="Male" color={theme.colors.primary} />
          <Text style={[styles.radioLabel, { color: theme.colors.onBackground }]}>Male</Text>
        </View>
        <View style={styles.radioContainer}>
          <RadioButton value="Female" color={theme.colors.primary} />
          <Text style={[styles.radioLabel, { color: theme.colors.onBackground }]}>Female</Text>
        </View>
        <View style={styles.radioContainer}>
          <RadioButton value="Other" color={theme.colors.primary} />
          <Text style={[styles.radioLabel, { color: theme.colors.onBackground }]}>Other</Text>
        </View>
      </RadioButton.Group>
      <TextInput
        style={[styles.input, { color: theme.colors.onBackground, borderBottomColor: theme.colors.primary }]}
        placeholder="Enter your location"
        placeholderTextColor={theme.colors.onSurfaceVariant}
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
    fontSize: 24,
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