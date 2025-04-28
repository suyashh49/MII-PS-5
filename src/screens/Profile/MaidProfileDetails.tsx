import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, ScrollView, SafeAreaView, Alert } from 'react-native';
import { TextInput as PaperTextInput, Text, Button, Card, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList } from '../../types';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid } from 'react-native';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import Geocoder from 'react-native-geocoding';
import { Menu, Checkbox } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Add these imports
import MapView, { Marker, PROVIDER_GOOGLE, MapViewProps } from 'react-native-maps';
import { Modal, Dimensions } from 'react-native';
import theme from '../../config/theme';
import { Animated } from 'react-native';

type MaidProfileDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'MaidProfile'>;
Geocoder.init('AIzaSyAPQtPZzAuyG4dyEP-45rf8FtOr6pSUBsg');
const timeSlots = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

const { width, height } = Dimensions.get('window');
const MaidProfileDetails = () => {
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<string>('Male');
  const [location, setLocation] = useState<string>('');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [cooking, setCooking] = useState<boolean>(false);
  const [cleaning, setCleaning] = useState<boolean>(false);
  const [pricePerService, setPricePerService] = useState<string>('');
  const [servicesMenuVisible, setServicesMenuVisible] = useState(false);
  const mapRef = useRef<MapView>(null);

  const navigation = useNavigation<MaidProfileDetailsNavigationProp>();
  const theme = useTheme();
  const [coordinates, setCoordinates] = useState<{ latitude: Float, longitude: Float } | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 20.5937, // Default to India center
    longitude: 78.9629,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedMarker, setSelectedMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationAnimValue] = useState(new Animated.Value(0));

  const clearStorage = async () => {
    await AsyncStorage.removeItem('maid');
    await AsyncStorage.removeItem('maidToken');
    console.log('maidToken:', await AsyncStorage.getItem('maidToken'));
    console.log('maid:', await AsyncStorage.getItem('maid'));
  };

  const animateLocationConfirmation = () => {
    Animated.sequence([
      Animated.timing(locationAnimValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(locationAnimValue, {
        toValue: 0,
        duration: 300,
        delay: 1000,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleNext = () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return;
    }
    if (!coordinates) {
      Alert.alert('Location Required', 'Please tap the GPS icon to share your location');
      return;
    }
    if (selectedTimeSlots.length === 0) {
      Alert.alert('Time Required', 'Please select at least one time slot');
      return;
    }
    if (!pricePerService || isNaN(Number(pricePerService))) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }

    if (!cooking && !cleaning) {
      Alert.alert('Service Required', 'Please select at least one service type (Cooking or Cleaning)');
      return;
    }


    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeAvailable = days.reduce((acc, day) => {
      acc[day] = selectedTimeSlots;
      return acc;
    }, {} as { [key: string]: string[] });

    navigation.navigate('KYCDetailsMaid', {
      name,
      gender,
      location,
      coordinates,
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

        // Update map region to center on user's location
        const newRegion = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setMapRegion(newRegion);

        // Set marker to user's location
        setSelectedMarker(coords);

        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }

        console.log('Selected marker:', coords);
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
        {/* <Button
          mode="contained"
          onPress={clearStorage}
          style={{ margin: 16, backgroundColor: 'red' }}
        >
          Clear Maid Storage
        </Button> */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}  keyboardShouldPersistTaps="handled">
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
            {/* Location Section */}
            <View style={styles.locationSection}>
              {/* <Text style={styles.sectionTitle}>Your Location</Text> */}

              <TouchableOpacity
                style={styles.mapSelector}
                onPress={() => setMapVisible(true)}
              >
                <View style={styles.locationDisplay}>
                  <MaterialCommunityIcons name="map-marker" size={24} color={theme.colors.primary} />
                  <Text style={styles.locationText} numberOfLines={2}>
                    {location || "Select your location"}
                  </Text>
                </View>
              </TouchableOpacity>

              {coordinates && (
                <Text style={styles.coordinatesText}>
                  Location selected successfully
                </Text>
              )}
            </View>

            {/* Map Modal */}
            <Modal
              visible={mapVisible}
              animationType="slide"
              onRequestClose={() => setMapVisible(false)}
            >
              <SafeAreaView style={styles.mapModalContainer}>
                <View style={styles.mapHeader}>
                  <TouchableOpacity onPress={() => setMapVisible(false)}>
                    <MaterialCommunityIcons name="close" size={24} color={theme.colors.onBackground} />
                  </TouchableOpacity>
                  <Text style={styles.mapHeaderTitle}>Select Location</Text>
                  <TouchableOpacity onPress={getMyLocation}>
                    <MaterialCommunityIcons name="crosshairs-gps" size={24} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>

                {/* Search bar */}
                <GooglePlacesAutocomplete
                  placeholder="Search for a location"
                  fetchDetails={true}
                  onPress={(data, details = null) => {
                    if (details && details.geometry) {
                      const newRegion = {
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      };
                      setMapRegion(newRegion);
                      setSelectedMarker({
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng,
                      });
                      // Animate the map to the new region
                      if (mapRef.current) {
                        mapRef.current.animateToRegion(newRegion, 1000);
                      }
                    }
                  }}
                  query={{
                    key: 'AIzaSyAPQtPZzAuyG4dyEP-45rf8FtOr6pSUBsg',
                    language: 'en',
                  }}
                  styles={{
                    container: {
                      position: 'absolute',
                      top: 60,
                      width: '90%',
                      zIndex: 1,
                      alignSelf: 'center',
                    },
                    textInputContainer: {
                      backgroundColor: 'white',
                      borderRadius: 8,
                      paddingHorizontal: 5,
                    },
                    textInput: {
                      height: 40,
                      color: '#5d5d5d',
                      fontSize: 16,
                      borderRadius: 8,
                    },
                    listView: {
                      backgroundColor: 'white',
                      borderRadius: 8,
                    },
                  }}
                />

                {/* The actual map */}
                <MapView
                ref={mapRef}
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  region={mapRegion}
                  onRegionChangeComplete={setMapRegion}
                  onPress={(e) => setSelectedMarker(e.nativeEvent.coordinate)}
                >
                  {selectedMarker && (
                    <Marker
                      coordinate={selectedMarker}
                      draggable
                      onDragEnd={(e) => setSelectedMarker(e.nativeEvent.coordinate)}
                    />
                  )}
                </MapView>

                <View style={styles.mapFooter}>
                  <Button
                    mode="contained"
                    disabled={!selectedMarker}
                    onPress={() => {
                      if (selectedMarker) {
                        setCoordinates({
                          latitude: selectedMarker.latitude,
                          longitude: selectedMarker.longitude,
                        });

                        // Reverse geocode to get address
                        Geocoder.from(selectedMarker.latitude, selectedMarker.longitude)
                          .then(res => {
                            const addressComponent = res.results[0].formatted_address;
                            setLocation(addressComponent);
                            setMapVisible(false);
                            animateLocationConfirmation();
                          })
                          .catch(error => {
                            console.warn(error);
                            setLocation(`${selectedMarker.latitude.toFixed(4)}, ${selectedMarker.longitude.toFixed(4)}`);
                            setMapVisible(false);
                            animateLocationConfirmation();
                          });
                      }
                    }}
                    style={styles.confirmLocationButton}
                  >
                    Confirm Location
                  </Button>
                </View>
              </SafeAreaView>
            </Modal>

            {/* Show coordinates if available (for debugging) */}

            <Animated.View style={{
              opacity: locationAnimValue,
              transform: [{
                translateY: locationAnimValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0]
                })
              }]
            }}>
              {/* {coordinates && (
                <Text style={styles.coordinatesText}>
                  Location selected successfully
                </Text>
              )} */}
            </Animated.View>

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
                <Text style={styles.label}>Select Your Working Hours</Text>
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
            <View style={{ marginVertical: 8 }}>
              <Menu
                visible={servicesMenuVisible}
                onDismiss={() => setServicesMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setServicesMenuVisible(true)}
                    style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 3 }}
                    labelStyle={{ color: theme.colors.onSurfaceVariant, textAlign: 'left', flex: 1 }}
                    icon="chevron-down"
                    contentStyle={{ flexDirection: 'row-reverse' }}
                  >
                    {!cooking && !cleaning
                      ? 'Select Services'
                      : [cooking ? 'Cooking' : null, cleaning ? 'Cleaning' : null].filter(Boolean).join(', ')
                    }
                  </Button>
                }
                style={{ width: '90%', alignSelf: 'center' }}
              >
                <Menu.Item
                  onPress={() => {
                    setCooking(prev => !prev);
                    setServicesMenuVisible(false);
                  }}
                  title="Cooking"
                  leadingIcon={() => (
                    <Checkbox status={cooking ? 'checked' : 'unchecked'} />
                  )}
                />
                <Menu.Item
                  onPress={() => {
                    setCleaning(prev => !prev);
                    setServicesMenuVisible(false);
                  }}
                  title="Cleaning"
                  leadingIcon={() => (
                    <Checkbox status={cleaning ? 'checked' : 'unchecked'} />
                  )}
                />
              </Menu>
            </View>
          </Card.Content>
        </Card>
        <Button
          mode="contained"
          disabled={!coordinates}
          onPress={() => {
            console.log(cooking, cleaning);
            handleNext();
          }}
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
  mapModalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    backgroundColor: theme.colors.background,
    zIndex: 2,
  },
  mapHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
  },
  map: {
    width: '100%',
    height: height * 0.7,
  },
  mapFooter: {
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  confirmLocationButton: {
    borderRadius: 8,
  },
  locationSection: {
    marginVertical: 12,
  },
  mapSelector: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 8,
    padding: 12,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    flex: 1,
    color: theme.colors.onBackground,
  },
  coordinatesText: {
    marginTop: 8,
    fontSize: 12,
    color: theme.colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: theme.colors.onBackground,
    fontWeight: '500',
  },
});

export default MaidProfileDetails;

