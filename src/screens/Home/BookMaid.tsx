import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, LayoutAnimation, ScrollView, TextInput, Alert, TouchableOpacity, UIManager, Platform, PermissionsAndroid } from 'react-native';
import { Text, Button, Card, Avatar, useTheme, Menu } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import i18n from '../../locales/i18n';
import * as Animatable from 'react-native-animatable';
import AnimatedButton from '../../componenets/AnimatedButton';
import AnimatedCard from '../../componenets/AnimatedCard';
import AnimatedLoader from '../../componenets/AnimatedLoader';
import {
  User,
  Maid,
  Booking,
  SearchRequestData,
  BookRequestData,
  BookingConfirmRequestData,
  AuthHook,
  ErrorResponse
} from '../../types/index';
import { BookStackParamList } from '../../types/index';
import theme from '../../config/theme';


Geocoder.init('AIzaSyAPQtPZzAuyG4dyEP-45rf8FtOr6pSUBsg');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type BookStackNavigationProp = StackNavigationProp<BookStackParamList, 'BookMaid'>;
type BookMaidRouteProp = RouteProp<BookStackParamList, 'BookMaid'>;

const isAxiosError = (error: unknown): error is AxiosError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    Boolean((error as AxiosError).isAxiosError)
  );
};

const BookMaid: React.FC = () => {
  const { user, logout } = useAuth() as AuthHook;
  const theme = useTheme();
  const navigation = useNavigation<BookStackNavigationProp>();

  const { t } = useTranslation();
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const [expandedMaidId, setExpandedMaidId] = useState<number | null>(null);
  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMaidId(prev => (prev === id ? null : id));
  };

  const [location, setLocation] = useState<string>('');
  const [maids, setMaids] = useState<Maid[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState<boolean>(false);
  const [showCurrentLocation, setShowCurrentLocation] = useState<boolean>(false);
  const [bookingType, setBookingType] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<{ [maidId: number]: 'cooking' | 'cleaning' | 'both' | undefined }>({});
  const [hasSearched, setHasSearched] = useState<boolean>(false);  
  const route = useRoute<BookMaidRouteProp>();
  const preserveState = route.params?.preserveState ?? false;
  const [address, setAddress] = useState<string>('');
  

  const tokenForAuth = user?.token || storedToken;

  const getPriceDisplay = (maid: Maid): string => {
    if (maid.cleaning && maid.cooking) {
      return `Cleaning: ₹${maid.pricePerService || 'N/A'} | Cooking: ₹${maid.pricePerService || 'N/A'}`;
    } else if (maid.cleaning) {
      return `Cleaning: ₹${maid.pricePerService || 'N/A'}`;
    } else if (maid.cooking) {
      return `Cooking: ₹${maid.pricePerService || 'N/A'}`;
    } else {
      return 'Price: Not specified';
    }
  };

  // Load token
  useEffect(() => {
    AsyncStorage.getItem('token').then(token => setStoredToken(token));
  }, []);

  // Fetch bookings on focus
  useFocusEffect(
    React.useCallback(() => {
      if (!preserveState) {
        console.log('Fetching bookings on focus');
      }
      fetchBookings();
    }, [tokenForAuth, preserveState])
  );

  // Fetch bookings on token change
  useEffect(() => {
    fetchBookings();
  }, [tokenForAuth]);

  // const resetState = () => {
  //   setLocation('');
  //   setMaids([]);
  //   setBookingType(null);
  //   setSelectedService({});
  // };

  const fetchBookings = async () => {
    if (!tokenForAuth) return;
    try {
      const response = await axios.get<Booking[]>('https://maid-in-india-nglj.onrender.com/api/maid/bookings', {
        headers: { 'Authorization': `Bearer ${tokenForAuth}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert(t('error'), t('logoutFailed'));
    }
  };

  const getAllowedDays = (): string[] => {
    if (bookingType === 1) return ['Monday', 'Wednesday', 'Friday'];
    if (bookingType === 2) return ['Tuesday', 'Thursday', 'Saturday'];
    if (bookingType === 3) return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return [];
  };

  const hasCommonFreeSlot = (maid: Maid): boolean => {
    if (!bookingType || !maid.timeAvailable) return false;
    const allowedDays = getAllowedDays();
    let commonSlots: string[] = [];
    let first = true;

    for (const day of allowedDays) {
      const availableSlots: string[] = Array.isArray(maid.timeAvailable[day]) ? maid.timeAvailable[day] : [];
      const bookedSlots = bookings
        .filter(b => b.maidId === maid.maidId && b.paymentStatus && b.slot && b.slot[day])
        .map(b => b.slot![day]);
      const freeSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));

      if (first) {
        commonSlots = freeSlots;
        first = false;
      } else {
        commonSlots = commonSlots.filter(s => freeSlots.includes(s));
      }

      if (commonSlots.length === 0) return false;
    }

    return commonSlots.length > 0;
  };

  const handleSearch = async () => {
    if (!tokenForAuth) {
      Alert.alert(t('authError'), t('pleaseLogin'));
      return;
    }

    if (!location.trim() && !coordinates) {
      Alert.alert(t('Missing Info'), t('enterLocation'));
      return;
    }

    if (!bookingType) {
      Alert.alert(t('Missing Selection'), t('selectBookingType'));
      return;
    }

    setLoading(true);
    setHasSearched(true); // Add this to track search has been performed

    try {
      const requestData: Partial<SearchRequestData> = {
        location,
        ...(coordinates && {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        })
      };

      const response = await axios.post<Maid[]>(
        'https://maid-in-india-nglj.onrender.com/api/maid/search',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenForAuth}`
          }
        }
      );

      const filtered = response.data.filter(m => {
        // Only show maids that have available slots for the selected booking type
        const hasAvailableSlots = getAllowedDays().some(
          day => Array.isArray(m.timeAvailable?.[day]) &&
            m.timeAvailable![day].length > 0 &&
            hasCommonFreeSlot(m)  // Add this check
        );
        return hasAvailableSlots;
      });

      setMaids(filtered);

      if (filtered.length === 0) {
        Alert.alert(t('noResults'), t('noMaidsFound'));
      }
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        Alert.alert(
          t('searchFailed'),
          axiosError.response?.data?.message || t('tryAgain')
        );
      } else {
        Alert.alert(t('searchFailed'), t('tryAgain'));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (maid: Maid, service: 'cooking' | 'cleaning') => {
    if (!hasCommonFreeSlot(maid)) {
      Alert.alert(t('serviceUnavailable'), t('noSlot'));
      return;
    }
    setSelectedService(prev => {
      const current = prev[maid.maidId];
      if (current === service) {
        return { ...prev, [maid.maidId]: undefined };
      }
      return { ...prev, [maid.maidId]: service };
    });
  };

  const checkSoftBookings = async (maid: Maid) => {
    try {
      const response = await axios.post('https://maid-in-india-nglj.onrender.com/api/maid/get-soft',
        { maidId: maid.maidId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenForAuth}`
          }
        }
      );
      console.log('Soft booking response:', response.data);
      // Navigate to time slot selection with soft booking data
      navigation.navigate('TimeSlotSelection', {
        maid,
        bookingType: bookingType!,
        service: selectedService[maid.maidId] as 'cooking' | 'cleaning' | 'both',
        pricePerService: Number(maid.pricePerService),
        name: maid.name || t('unnamed'),
        contactNumber: user?.contact || t('contactNotProvided'),
        softBookedSlots: response.data[maid.maidId.toString()] || []  // Change to correctly pass the array
      });
    } catch (error) {
      console.error('Error checking soft bookings:', error);
      // If API fails, still navigate but without soft booking data
      handleBook(maid);
    }
  };

  const handleBook = (maid: Maid) => {
    if (!tokenForAuth) {
      Alert.alert(t('authError'), t('pleaseLogin'));
      return;
    }
    if (!hasCommonFreeSlot(maid)) {
      Alert.alert(t('serviceUnavailable'), t('noSlot'));
      return;
    }
    const serviceSelected = selectedService[maid.maidId];
    if (!serviceSelected) {
      Alert.alert(t('serviceNotSelected'), t('selectService'));
      return;
    }

    // Call the soft booking check before navigation
    checkSoftBookings(maid);

    navigation.navigate('TimeSlotSelection', {
      maid,
      bookingType: bookingType!,
      service: serviceSelected as 'cooking' | 'cleaning' | 'both',
      pricePerService: Number(maid.pricePerService),
      name: maid.name || t('unnamed'),
      contactNumber: user?.contact || t('contactNotProvided')
    });



  };

  const handleBookingTypeChange = (type: number) => {
    // Clear the displayed maids when changing booking type
    setMaids([]);
    setBookingType(type);
  };

  const renderServiceButtons = (maid: Maid) => {
    const serviceSelected = selectedService[maid.maidId];
    const fullyBooked = !hasCommonFreeSlot(maid);
  
    return (
      <View style={styles.serviceButtonsContainer}>
        {maid.cleaning && (
          <Button
            mode={serviceSelected === 'cleaning' ? 'contained' : 'outlined'}
            onPress={() => toggleService(maid, 'cleaning')}
            style={styles.serviceButton}
            disabled={fullyBooked}
          >
            {fullyBooked ? t('booked') : t('cleaning')}
          </Button>
        )}
        {maid.cooking && (
          <Button
            mode={serviceSelected === 'cooking' ? 'contained' : 'outlined'}
            onPress={() => toggleService(maid, 'cooking')}
            style={styles.serviceButton}
            disabled={fullyBooked}
          >
            {fullyBooked ? t('booked') : t('cooking')}
          </Button>
        )}
      </View>
    );
  };

  const getDisplayAvailableDays = (maid: Maid): string => {
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let availableDays = new Set<string>();
    if (maid.timeAvailable) {
      Object.keys(maid.timeAvailable).forEach(day => {
        if (Array.isArray(maid.timeAvailable![day]) && maid.timeAvailable![day].length > 0) {
          availableDays.add(day);
        }
      });
    }
    return weekDays.filter(day => availableDays.has(day)).join(', ');
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
            title: t('locationPermissionTitle'),
            message: t('locationPermissionMessage'),
            buttonNeutral: t('askMeLater'),
            buttonNegative: t('cancel'),
            buttonPositive: t('okay')
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(t('permissionDenied'), t('requireLocationPerm'));
      return;
    }
    
    setIsUsingCurrentLocation(true);
   
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

        // Reverse geocode to get address from coordinates
        Geocoder.from(latitude, longitude)
          .then(json => {
            const addressComponent = json.results[0].formatted_address;
            console.log(addressComponent);
            setAddress(addressComponent);
            setLocation(addressComponent);
            setIsUsingCurrentLocation(false);
          })
          .catch(error => {
            console.error('Error in geocoding:', error);
            setIsUsingCurrentLocation(false);
            Alert.alert(t('error'), t('geocodingFailed'));
          });
      },
      error => {
        console.error(error);
        setIsUsingCurrentLocation(false);
        Alert.alert(t('error'), t('locationFail'));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    setShowCurrentLocation(true);
  };

  const menuRef = useRef<View>(null);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [languageSubmenuVisible, setLanguageSubmenuVisible] = useState<boolean>(false);

  const showMenu = () => {
    if (menuRef.current) {
      menuRef.current.measure((x, y, width, height, pageX, pageY) => {
        setMenuAnchor({ x: pageX, y: pageY });
        setMenuVisible(true);
      });
    }
  };

  const renderMenu = () => {
    return (
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={menuAnchor}
        style={{ marginTop: 40 }}
      >
        <Menu.Item
          onPress={() => {
            setLanguageSubmenuVisible(true);
            setMenuVisible(false);
          }}
          title={t('selectLanguage')}
          leadingIcon="translate"
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            handleLogout();
          }}
          title={t('logout')}
          leadingIcon="logout"
        />
      </Menu>
    );
  };

  const renderLanguageMenu = () => {
    return (
      <Menu
        visible={languageSubmenuVisible}
        onDismiss={() => setLanguageSubmenuVisible(false)}
        anchor={menuAnchor}
        style={{ marginTop: 40 }}
      >
        <Menu.Item
          onPress={() => {
            setLanguageSubmenuVisible(false);
            changeLanguage('en');
          }}
          title="English"
          //leadingIcon="check"
          style={{ opacity: i18n.language === 'en' ? 1 : 0.6 }}
        />
        <Menu.Item
          onPress={() => {
            setLanguageSubmenuVisible(false);
            changeLanguage('hi');
          }}
          title="हिंदी"
          //leadingIcon="check"
          style={{ opacity: i18n.language === 'hi' ? 1 : 0.6 }}
        />
        <Menu.Item
          onPress={() => {
            setLanguageSubmenuVisible(false);
            changeLanguage('ma');
          }}
          title="मराठी"
          //leadingIcon="check"
          style={{ opacity: i18n.language === 'hi' ? 1 : 0.6 }}
        />
      </Menu>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.welcomeText, { color: theme.colors.onPrimary }]}>
          {t('headerTitle')}
        </Text>

        <View style={styles.headerRightContent}>
          {/* 3-dot menu button */}
          <TouchableOpacity
            ref={menuRef}
            onPress={showMenu}
            style={styles.menuButton}
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color={theme.colors.onPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.locationInputContainer}>
          <GooglePlacesAutocomplete
            placeholder={t('locationPlaceholder')}
            onPress={(data, details = null) => {
              setLocation(data.description);
              if (details?.geometry?.location) {
                setCoordinates({
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng
                });
              }
            }}
            query={{
              key: 'AIzaSyAPQtPZzAuyG4dyEP-45rf8FtOr6pSUBsg',
              language: i18n.language,
            }}
            fetchDetails={true}
            enablePoweredByContainer={false}
            styles={{
              textInput: {
                ...styles.searchInput,
                height: 40,
              },
              listView: {
                position: 'absolute',
                top: 40,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                borderRadius: 5,
                flex: 1,
                elevation: 3,
                zIndex: 1000,
              },
              container: {
                flex: 1,
              },
            }}
            textInputProps={{
              value: location,
              onChangeText: setLocation,
              placeholderTextColor: theme.colors.onSurfaceVariant,
            }}
          />
        </View>

        {/* Button below the search bar for current location */}
        <View style={{ marginTop: 8, marginBottom: 8 }}>
          <Button
            mode="outlined"
            onPress={getCurrentLocation}
            style={styles.locationButton}
            labelStyle={{ color: theme.colors.primary }}
            icon="crosshairs-gps"
          >
            <Text style={{ color: theme.colors.primary }}>
              {t('Find Maids Near Me')}
            </Text>
          </Button>
        </View>
        {isUsingCurrentLocation && (
          <Text style={styles.currentLocationText}>
            {t('Finding Your Current Location')}
          </Text>
        )}

        {/*Show your current location*/}
        {showCurrentLocation && (
          <Text style={styles.currentLocationText}>
           {address}
          </Text>
        )}

        {/* Booking Type Selector */}

        <View style={styles.typeSelector}>
          <Text style={styles.typeSelectorLabel}>
            {t('selectBookingType')}
          </Text>
          <View style={styles.typeOptions}>
            <Button
              mode={bookingType === 1 ? 'contained' : 'outlined'}
              onPress={() => handleBookingTypeChange(1)}  // Use new function here
              style={styles.typeButton}
            >
              {t('mwf')}
            </Button>
            <Button
              mode={bookingType === 2 ? 'contained' : 'outlined'}
              onPress={() => handleBookingTypeChange(2)}  // Use new function here
              style={styles.typeButton}
            >
              {t('tth')}
            </Button>
            <Button
              mode={bookingType === 3 ? 'contained' : 'outlined'}
              onPress={() => handleBookingTypeChange(3)}  // Use new function here
              style={styles.typeButton}
            >
              {t('daily')}
            </Button>
          </View>
        </View>
        <Button
          mode="contained"
          onPress={handleSearch}
          style={styles.searchButton}
          loading={loading}
          disabled={loading}
        >
          {t('search')}
        </Button>
      </View>

      {/* Results */}
      <ScrollView style={styles.content}>
        {maids.length === 0 && !loading && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyCardContent}>
              <Text style={styles.emptyText}>{t('searchPrompt')}</Text>
            </Card.Content>
          </Card>
        )}

        {maids.map((maid) => {
          const fullyBooked = !hasCommonFreeSlot(maid);
          const isExpanded = expandedMaidId === maid.maidId;

          return (
            <Card
              key={maid.maidId}
              style={[styles.maidCard, fullyBooked && styles.bookedMaidCard]}
              onPress={() => toggleExpand(maid.maidId)}
            >
              <Card.Content>
                <View style={styles.maidInfo}>
                  <Avatar.Image
                    size={80}
                    source={{ uri: maid.imageUrl || 'https://via.placeholder.com/80' }}
                  />
                   <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>⭐ {maid.rating?.toFixed(1) || 'N/A'}</Text>
                  </View>

                  <View style={styles.maidDetails}>
                    <Text style={[styles.maidName, { color: theme.colors.onBackground }]}>
                      {maid.name || t('unnamed')}
                    </Text>
                    <Text style={[styles.maidDetail, { color: theme.colors.onSurfaceVariant }]}>
                      {maid.pricePerService ? getPriceDisplay(maid) : t('priceNotSpecified')}
                    </Text>

                    {isExpanded && (
                      <>
                        <Text style={[styles.maidDetail, { color: theme.colors.onSurfaceVariant }]}>
                          {t('location')}: {maid.location}
                        </Text>
                        <Text style={[styles.maidDetail, { color: theme.colors.onSurfaceVariant }]}>
                          {t('contact')}: Book To Reveal
                        </Text>
                        <Text style={[styles.maidDetail, { color: theme.colors.onSurfaceVariant }]}>
                          {t('available')}: {getDisplayAvailableDays(maid)}
                        </Text>
                        {renderServiceButtons(maid)}
                        {fullyBooked && (
                          <Text style={styles.bookedText}>
                            {t('fullyBooked')}
                          </Text>
                        )}
                        <Button
                          mode="contained"
                          onPress={() => handleBook(maid)}
                          style={styles.bookButton}
                          disabled={fullyBooked}
                        >
                          {t('book')}
                        </Button>
                      </>
                    )}
                  </View>
                </View>
              </Card.Content>
            </Card>
          );
        })}

      </ScrollView>
      {renderMenu()}
      {renderLanguageMenu()}
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  welcomeText: { fontSize: 24, fontWeight: 'bold' },
  logoutButton: { borderColor: theme.colors.onPrimary, borderWidth: 1 },
  searchContainer: { padding: 16 },
  typeSelector: { marginBottom: 15 },
  typeSelectorLabel: { marginBottom: 16, fontSize: 16 },
  typeOptions: { flexDirection: 'row', justifyContent: 'space-between' },
  typeButton: { flex: 1, marginHorizontal: 4 },
  searchButton: { marginTop: 8 },
  content: { flex: 1, padding: 16 },
  emptyCard: { marginVertical: -10, borderRadius: 8 },
  emptyCardContent: { alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 16, textAlign: 'center', opacity: 0.7 },
  maidCard: { marginBottom: 16, borderRadius: 12, elevation: 2 },
  bookedMaidCard: { opacity: 0.7 },
  maidInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  maidDetails: { marginLeft: 16, flex: 1 },
  maidName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  maidDetail: { fontSize: 14, marginBottom: 2 },
  serviceButtonsContainer: { flexDirection: 'row', marginTop: 6, width: '50%' },
  serviceButton: { marginRight: 6 },
  bookedText: { color: theme.colors.onPrimary, fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  bookButton: { 
    alignSelf: 'flex-end',
    marginTop: 14,
  },

  locationButton: {
    padding: 8,
  },
  currentLocationText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginBottom: 8,
    fontStyle: 'italic',
  },

  headerRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  ratingContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  ratingText: {
    fontSize: 14,
    color: '#a1890b', // gold-like color
    fontWeight: 'bold',
  },
  
  langButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  // Add these to your styles object
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.onSurfaceVariant,
    marginBottom: 12,
    zIndex: 1, // Important to keep the autocomplete dropdown visible
  },
  searchInput: {
    flex: 1,
    color: theme.colors.onSurface,
    height: 40,
    paddingHorizontal: 8,
  },
  menuButton: {
    padding: 8,
  },


});

export default BookMaid;

