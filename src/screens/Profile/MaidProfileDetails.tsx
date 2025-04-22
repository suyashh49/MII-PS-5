import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, ScrollView, SafeAreaView, Alert } from 'react-native';
import { TextInput as PaperTextInput, Text, Button, Card, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList } from '../../types';

import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid } from 'react-native';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';

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
  const [coordinates, setCoordinates] = useState<{ latitude: Float, longitude: Float } | null>(null);

  const handleNext = () => {
    if (!coordinates) {
      Alert.alert(
        'Location Required',
        'Please tap the GPS icon to share your location before continuing.'
      );
      return;
    }
    
    // Create a deep copy of coordinates to ensure it's not lost in navigation
    const coordinatesCopy = coordinates ? { ...coordinates } : null;
    
    console.log("Sending coordinates to next screen:", coordinatesCopy);
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeAvailable = days.reduce((acc, day) => {
      acc[day] = selectedTimeSlots;
      return acc;
    }, {} as { [key: string]: string[] });

    navigation.navigate('KYCDetailsMaid', {
      name,
      gender,
      location,
      coordinates: coordinatesCopy,
      timeAvailable,
      cooking,
      cleaning,
      pricePerService
    });
  };

  const handleTimeSlotChange = (time: string) => {
    setSelectedTimeSlots(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      return true;
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "BookMaid needs access to your location to list your services correctly.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
  };

  const getMyLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        
        console.log("Retrieved coordinates:", coords);
        setCoordinates(coords);
        
        // // Update location text field with readable format
        // setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        
        Alert.alert('Location Captured', 'Your location has been successfully captured!');
      },
      (error) => {
        console.error(error);
        Alert.alert('Error', 'Failed to get your current location.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
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
            <View style={styles.locationInputContainer}>
              <PaperTextInput
                mode="outlined"
                label="Location"
                placeholder="Enter your location"
                value={location}
                onChangeText={setLocation}
                style={styles.locationInput}
                underlineColor={theme.colors.onBackground}
                theme={{ colors: { text: theme.colors.onBackground, primary: theme.colors.onBackground } }}
              />
              <TouchableOpacity
                style={styles.locationButton}
                onPress={getMyLocation}
              >
                <MaterialCommunityIcons
                  name="crosshairs-gps"
                  size={24}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
            
            {/* Show coordinates if available (for debugging) */}
            {coordinates && (
              <Text style={{ marginVertical: 8, color: theme.colors.onBackground }}>
                Coordinates captured: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
              </Text>
            )}
            
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
          disabled={!coordinates}
          onPress={handleNext}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          {coordinates ? 'Next' : 'Please get your location'}
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
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  locationInput: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  locationButton: {
    marginLeft: 8,
    padding: 8,
  },
});

export default MaidProfileDetails;