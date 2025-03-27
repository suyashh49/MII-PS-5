

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, ScrollView, SafeAreaView } from 'react-native';
import { TextInput as PaperTextInput, Text, Button, Card, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList } from '../../types';

type MaidProfileDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'MaidProfile'>;

const timeSlots = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

const MaidProfileDetails = () => {
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<string>('Male');
  const [location, setLocation] = useState<string>('');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [cooking, setCooking] = useState<boolean>(false);
  const [cleaning, setCleaning] = useState<boolean>(false);
  const [pricePerService, setPricePerService] = useState<string>('');

  const navigation = useNavigation<MaidProfileDetailsNavigationProp>();
  const theme = useTheme();

  const handleNext = () => {
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
      {/* Consistent header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('Profile')}
        >
          {/* <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onPrimary} /> */}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
          Welcome, Maid!
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <PaperTextInput
              mode="outlined"
              label="Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              underlineColor={theme.colors.onBackground}
              theme={{ colors: { text: theme.colors.onBackground, primary: theme.colors.onBackground } }}
            />
            {/* <Text style={[styles.label, { color: theme.colors.onBackground }]}>Gender</Text> */}
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
            <PaperTextInput
              mode="outlined"
              label="Location"
              placeholder="Enter your location"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
              underlineColor={theme.colors.onBackground}
              theme={{ colors: { text: theme.colors.onBackground, primary: theme.colors.onBackground } }}
            />
            {/* <Text style={[styles.label, { color: theme.colors.onBackground }]}>Time Available</Text> */}
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
                <Picker.Item label="Select time slots" value="" />
                {timeSlots.map((time) => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>
            <View style={styles.selectedTimes}>
              {selectedTimeSlots.map((time, index) => (
                <Text key={index} style={[styles.selectedTime, { backgroundColor: theme.colors.primary, color: theme.colors.onPrimary }]}>
                  {time}
                </Text>
              ))}
            </View>
            <PaperTextInput
              mode="outlined"
              label="Price per Hour (₹)"
              placeholder="Enter price per hour"
              keyboardType="numeric"
              value={pricePerService}
              onChangeText={setPricePerService}
              style={styles.input}
              underlineColor={theme.colors.onBackground}
              theme={{ colors: { text: theme.colors.onBackground, primary: theme.colors.onBackground } }}
            />
            <View style={styles.switchRow}>
              <Text style={[styles.label, { color: theme.colors.onBackground }]}>Cooking</Text>
              <Switch value={cooking} onValueChange={setCooking} />
            </View>
            <View style={styles.switchRow}>
              <Text style={[styles.label, { color: theme.colors.onBackground }]}>Cleaning</Text>
              <Switch value={cleaning} onValueChange={setCleaning} />
            </View>
          </Card.Content>
        </Card>
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
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    paddingRight: 20,
  },
  headerTitle: {
    fontSize: 24,
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  scrollContainer: {
    marginTop: 10,
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  input: {
    marginVertical: 8,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginVertical: 4,
  },
  pickerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#cfcfcfcf',
    marginVertical: 8,
    
  },
  picker: {
    height: 50,
    width: '100%',
  },
  selectedTimes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  selectedTime: {
    margin: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  button: {
    width: '90%',
    borderRadius: 30,
    marginTop: 12,
    // marginBottom: 48,
    paddingVertical: 2,
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
});

export default MaidProfileDetails;
