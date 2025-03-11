import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Switch, ScrollView, SafeAreaView } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList } from '../../types';
import theme from '../../config/theme';

type MaidProfileDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'MaidProfile'>;

const timeSlots = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

const MaidProfileDetails = () => {
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<string>('Male');
  const [location, setLocation] = useState<string>('');
  // Use one state variable to store all selected time slots
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [cooking, setCooking] = useState<boolean>(false);
  const [cleaning, setCleaning] = useState<boolean>(false);
  // New field for price per hour
  const [pricePerService, setpricePerService] = useState<string>('');

  const navigation = useNavigation<MaidProfileDetailsNavigationProp>();
  const theme = useTheme();

  const handleNext = () => {
    // Auto-populate the same time slots for every day of the week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeAvailable = days.reduce((acc, day) => {
      acc[day] = selectedTimeSlots;
      return acc;
    }, {} as { [key: string]: string[] });

    navigation.navigate('KYCDetailsMaid', { name, gender, location, timeAvailable, cooking, cleaning, pricePerService });
  };

  const handleTimeSlotChange = (time: string) => {
    setSelectedTimeSlots(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Fixed header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('Profile')}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Welcome, Maid!
        </Text>
      </View>
      
      {/* Scrollable content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.label, { color: theme.colors.onBackground }]}>Name</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.onBackground, borderBottomColor: theme.colors.primary }]}
          placeholder="Enter your name"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={name}
          onChangeText={setName}
        />
        <Text style={[styles.label, { color: theme.colors.onBackground }]}>Gender</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={[styles.picker, { color: theme.colors.onBackground }]}
          >
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
          </Picker>
        </View>
        <Text style={[styles.label, { color: theme.colors.onBackground }]}>Location</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.onBackground, borderBottomColor: theme.colors.primary }]}
          placeholder="Enter your location"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={location}
          onChangeText={setLocation}
        />
        <Text style={[styles.label, { color: theme.colors.onBackground }]}>Time Available</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue=""
            onValueChange={(time) => {
              if (time) {
                handleTimeSlotChange(time);
              }
            }}
            style={[styles.picker, { color: theme.colors.onBackground }]}
          >
            <Picker.Item label="Select time" value="" />
            {timeSlots.map((time) => (
              <Picker.Item key={time} label={time} value={time} />
            ))}
          </Picker>
        </View>
        <View style={styles.selectedTimes}>
          {selectedTimeSlots.map((time, index) => (
            <Text key={index} style={[styles.selectedTime, { color: theme.colors.onBackground }]}>
              {time}
            </Text>
          ))}
        </View>
        <Text style={[styles.label, { color: theme.colors.onBackground }]}>Price per Hour (₹)</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.onBackground, borderBottomColor: theme.colors.primary }]}
          placeholder="Enter price per hour"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          keyboardType="numeric"
          value={pricePerService}
          onChangeText={setpricePerService}
        />
        <View style={styles.switchRow}>
          <Text style={[styles.label, { color: theme.colors.onBackground }]}>Cooking</Text>
          <Switch value={cooking} onValueChange={setCooking} />
        </View>
        <View style={styles.switchRow}>
          <Text style={[styles.label, { color: theme.colors.onBackground }]}>Cleaning</Text>
          <Switch value={cleaning} onValueChange={setCleaning} />
        </View>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.button}
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
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: '100%',
    backgroundColor: theme.colors.background,
    zIndex: 1,
    elevation: 3,
    shadowColor: '#000',
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
    marginRight: 24,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  input: {
    borderBottomWidth: 1,
    width: '50%',
    marginVertical: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
  },
  pickerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    width: '50%',
    marginVertical: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  selectedTimes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  selectedTime: {
    marginHorizontal: 5,
    marginVertical: 2,
    padding: 5,
    backgroundColor: theme.colors.primary,
    color: theme.colors.onPrimary,
    borderRadius: 5,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 4,
    elevation: 2,
    marginTop: 20,
    width: '100%',
    marginBottom: 20,
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
