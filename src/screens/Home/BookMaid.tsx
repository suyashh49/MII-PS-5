import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Alert } from 'react-native';
import { Text, Button, Card, Avatar, useTheme } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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

type BookStackNavigationProp = StackNavigationProp<BookStackParamList, 'BookMaid'>;

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

  const [location, setLocation] = useState<string>('');
  const [maids, setMaids] = useState<Maid[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  
  // bookingType: 1 = M-W-F, 2 = T-Th-S, 3 = Daily
  const [bookingType, setBookingType] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<{ [maidId: number]: 'cooking' | 'cleaning' | 'both' }>({});

  
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

  
  const resetState = () => {
    setLocation('');
    setMaids([]);
    setBookingType(null);
    setSelectedService({});
  };

  
  useFocusEffect(
    React.useCallback(() => {
      resetState();
      const fetchBookings = async () => {
        if (!tokenForAuth) return;
        try {
          const response = await axios.get<Booking[]>('https://maid-in-india-nglj.onrender.com/api/maid/bookings', {
            headers: { 'Authorization': `Bearer ${tokenForAuth}` }
          });
          setBookings(response.data);
        } catch (error) {
          console.error('Error fetching bookings:', error);
        }
      };
      fetchBookings();
      return () => {
       
      };
    }, [])
  );

  useEffect(() => {
    AsyncStorage.getItem('token').then((token) => {
      setStoredToken(token);
      console.log('Loaded token from storage:', token);
    });
  }, []);

  const tokenForAuth = user?.token || storedToken;

  
  useEffect(() => {
    const fetchBookings = async () => {
      if (!tokenForAuth) return;
      try {
        const response = await axios.get<Booking[]>('https://maid-in-india-nglj.onrender.com/api/maid/bookings', {
          headers: { 'Authorization': `Bearer ${tokenForAuth}` }
        });
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };
    fetchBookings();
  }, [tokenForAuth]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
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
    let isFirstIteration = true;
  
    for (const day of allowedDays) {
     
      const availableSlots: string[] = Array.isArray(maid.timeAvailable[day])
        ? maid.timeAvailable[day]
        : [];
      
      const bookedSlots = bookings
        .filter(
          (b) =>
            b.maidId === maid.maidId &&
            b.paymentStatus === true &&
            b.slot &&
            b.slot[day]
        )
        .map((b) => b.slot[day]);
  
      
      const freeSlots = availableSlots.filter((slot) => !bookedSlots.includes(slot));
  
      if (isFirstIteration) {
        commonSlots = freeSlots;
        isFirstIteration = false;
      } else {
       
        commonSlots = commonSlots.filter((slot) => freeSlots.includes(slot));
      }
  
      
      if (commonSlots.length === 0) {
        return false;
      }
    }
  
    return commonSlots.length > 0;
  };

  
  const handleSearch = async () => {
    if (!tokenForAuth) {
      Alert.alert('Authentication Error', 'Please log in again.');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Missing Information', 'Please enter a location to search.');
      return;
    }
    if (!bookingType) {
      Alert.alert('Missing Selection', 'Please select a booking type.');
      return;
    }
    setLoading(true);
    try {
      const requestData: Partial<SearchRequestData> = { location };
      const response = await axios.post<Maid[]>('https://maid-in-india-nglj.onrender.com/api/maid/search', requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenForAuth}`
        }
      });
      
      const filteredMaids = response.data.filter((maid) => {
        const allowedDays = getAllowedDays();
        return allowedDays.some(
          (day) => Array.isArray(maid.timeAvailable?.[day]) && maid.timeAvailable[day].length > 0
        );
      });
      setMaids(filteredMaids);
      if (filteredMaids.length === 0) {
        Alert.alert('No Results', 'No maids available for the given criteria.');
      }
    } catch (error: unknown) {
      console.error('Error searching maids:', error);
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        Alert.alert(
          'Search Failed',
          axiosError.response?.data?.message || 'Could not complete the search. Please try again.'
        );
      } else {
        Alert.alert('Search Failed', 'Could not complete the search. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  
  const toggleService = (maid: Maid, service: 'cooking' | 'cleaning') => {
    if (!hasCommonFreeSlot(maid)) {
      Alert.alert(
        'Service Unavailable',
        'No common free slot available for the selected days.'
      );
      return;
    }
    setSelectedService((prev) => {
      const current = prev[maid.maidId];
      if (current === service) {
       
        return { ...prev, [maid.maidId]: 'both' };
      }
      return { ...prev, [maid.maidId]: service };
    });
  };

  
  const handleBook = (maid: Maid) => {
    if (!tokenForAuth) {
      Alert.alert('Authentication Error', 'Please log in again.');
      return;
    }
    if (!hasCommonFreeSlot(maid)) {
      Alert.alert(
        'Service Unavailable',
        'No common free slot available for the selected days.'
      );
      return;
    }
    const serviceSelected = selectedService[maid.maidId];
    if (!serviceSelected) {
      Alert.alert(
        'Service Not Selected',
        'Please select a service (Cooking, Cleaning, or Both) before booking.'
      );
      return;
    }
    navigation.navigate('TimeSlotSelection', {
      maid,
      bookingType: bookingType!,
      service: serviceSelected as 'cooking' | 'cleaning' | 'both',
      pricePerService:
        typeof maid.pricePerService === 'number'
          ? maid.pricePerService
          : Number(maid.pricePerService),
          name: maid.name || 'Unnamed Provider',
    });
  };

  
  const renderServiceButtons = (maid: Maid) => {
    const serviceSelected = selectedService[maid.maidId] || '';
    const fullyBooked = !hasCommonFreeSlot(maid);
    return (
      <View style={styles.serviceButtonsContainer}>
        {maid.cleaning && (
          <Button
            mode={serviceSelected === 'cleaning' || serviceSelected === 'both' ? 'contained' : 'outlined'}
            onPress={() => toggleService(maid, 'cleaning')}
            style={styles.serviceButton}
            disabled={fullyBooked}
          >
          {fullyBooked ? '(Booked)' : 'Cleaning'}
          </Button>
        )}
        {maid.cooking && (
          <Button
            mode={serviceSelected === 'cooking' || serviceSelected === 'both' ? 'contained' : 'outlined'}
            onPress={() => toggleService(maid, 'cooking')}
            style={styles.serviceButton}
            disabled={fullyBooked}
          >
            {fullyBooked ? '(Booked)' : 'Cooking'}
          </Button>
        )}
      </View>
    );
  };

  const getDisplayAvailableDays = (maid: Maid): string => {
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let availableDays = new Set<string>();

    
    if (maid.timeAvailable) {
      Object.keys(maid.timeAvailable).forEach((day) => {
        if (Array.isArray(maid.timeAvailable[day]) && maid.timeAvailable[day].length > 0) {
          availableDays.add(day);
        }
      });
    }

    
    const sortedDays = weekDays.filter((day) => availableDays.has(day));
    return sortedDays.join(', ');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.welcomeText, { color: theme.colors.onPrimary }]}>
          Book a Maid/Cook
        </Text>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          labelStyle={{ color: theme.colors.onPrimary }}
        >
          Sign Out
        </Button>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter location"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={location}
          onChangeText={setLocation}
        />
        <View style={styles.typeSelector}>
          <Text style={styles.typeSelectorLabel}>Select Booking Type:</Text>
          <View style={styles.typeOptions}>
            <Button
              mode={bookingType === 1 ? 'contained' : 'outlined'}
              onPress={() => setBookingType(1)}
              style={styles.typeButton}
            >
              M - W - F
            </Button>
            <Button
              mode={bookingType === 2 ? 'contained' : 'outlined'}
              onPress={() => setBookingType(2)}
              style={styles.typeButton}
            >
              T - Th - S
            </Button>
            <Button
              mode={bookingType === 3 ? 'contained' : 'outlined'}
              onPress={() => setBookingType(3)}
              style={styles.typeButton}
            >
              Daily
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
          Search
        </Button>
      </View>

      <ScrollView style={styles.content}>
        {maids.length === 0 && !loading && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyCardContent}>
              <Text style={styles.emptyText}>Search for a Maid.</Text>
            </Card.Content>
          </Card>
        )}

        {maids.map((maid) => {
          const fullyBooked = !hasCommonFreeSlot(maid);
          return (
            <Card key={maid.maidId} style={[styles.maidCard, fullyBooked && styles.bookedMaidCard]}>
              <Card.Content>
                <View style={styles.maidInfo}>
                  <Avatar.Image
                    size={80}
                    source={{ uri: maid.imageUrl || 'https://via.placeholder.com/80' }}
                  />
                  <View style={styles.maidDetails}>
                    <Text style={[styles.maidName, { color: theme.colors.onBackground }]}>
                      {maid.name || 'Unnamed Provider'}
                    </Text>
                    <Text style={[styles.maidDetail, { color: theme.colors.onSurfaceVariant }]}>
                      Location: {maid.location}
                    </Text>
                    <Text style={[styles.maidDetail, { color: theme.colors.onSurfaceVariant }]}>
                      {maid.pricePerService ? getPriceDisplay(maid) : 'Price: Not specified'}
                    </Text>
                    <Text style={[styles.maidDetail, { color: theme.colors.onSurfaceVariant }]}>
                      Contact: {maid.contact}
                    </Text>
                    <Text style={[styles.maidDetail, { color: theme.colors.onSurfaceVariant }]}>
                      Available: {getDisplayAvailableDays(maid)}
                    </Text>
                    {renderServiceButtons(maid)}
                    {fullyBooked && (
                      <Text style={styles.bookedText}>
                        All services fully booked for selected days
                      </Text>
                    )}
                  </View>
                </View>
                <Button
                  mode="contained"
                  onPress={() => handleBook(maid)}
                  style={styles.bookButton}
                  disabled={fullyBooked}
                >
                  Book
                </Button>
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>
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
  logoutButton: { borderColor: '#ffffff' },
  searchContainer: { padding: 16 },
  searchInput: {
    borderBottomWidth: 1,
    color: '#ccc',
    borderBottomColor: '#ccc',
    marginBottom: 12,
    height: 40,
    paddingHorizontal: 8,
  },
  typeSelector: { marginBottom: 15 },
  typeSelectorLabel: { marginBottom: 16, fontSize: 16 },
  typeOptions: { flexDirection: 'row', justifyContent: 'space-between' },
  typeButton: { flex: 1, marginHorizontal: 4 },
  searchButton: { marginTop: 8 },
  content: { flex: 1, padding: 16 },
  emptyCard: { marginVertical: 16, borderRadius: 8 },
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
  bookedText: { color: 'orange', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  bookButton: { alignSelf: 'flex-end' },
});

export default BookMaid;
