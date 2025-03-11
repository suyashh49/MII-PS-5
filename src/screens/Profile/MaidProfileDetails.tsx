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
  const [gender, setGender] = useState<string>('Male'); // Initialize gender with a default value
  const [location, setLocation] = useState<string>(''); // Initialize location
  const [timeAvailable, setTimeAvailable] = useState<{ [key: string]: string[] }>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  const [cooking, setCooking] = useState<boolean>(false);
  const [cleaning, setCleaning] = useState<boolean>(false);

  const navigation = useNavigation<MaidProfileDetailsNavigationProp>();
  const theme = useTheme();

  const handleNext = () => {
    navigation.navigate('KYCDetailsMaid', { name, gender, location, timeAvailable, cooking, cleaning });
  };

  const handleTimeAvailableChange = (day: string, time: string) => {
    setTimeAvailable((prev) => ({
      ...prev,
      [day]: prev[day].includes(time) ? prev[day].filter((t) => t !== time) : [...prev[day], time],
    }));
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
        {Object.keys(timeAvailable).map((day) => (
          <View key={day} style={styles.timeAvailableRow}>
            <Text style={[styles.dayLabel, { color: theme.colors.onSurface }]} numberOfLines={1}>{day}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue=""
                onValueChange={(time) => handleTimeAvailableChange(day, time)}
                style={[styles.picker, { color: theme.colors.onBackground }]}
              >
                <Picker.Item label="Select time" value="" />
                {timeSlots.map((time) => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>
            <View style={styles.selectedTimes}>
              {timeAvailable[day].map((time, index) => (
                <Text key={index} style={[styles.selectedTime, { color: theme.colors.onBackground }]}>
                  {time}
                </Text>
              ))}
            </View>
          </View>
        ))}
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
  pickerWrapper: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    marginLeft: 10,
  },
  timeAvailableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  dayLabel: {
    width: 80,
    fontSize: 16,
  },
  selectedTimes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
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