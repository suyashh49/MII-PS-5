import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Alert } from 'react-native';
import { Text, Button, Card, Avatar, useTheme } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { User, Maid, Booking, SearchRequestData, BookRequestData, BookingConfirmRequestData, AuthHook, ErrorResponse } from '../../types/index';
import { BookStackParamList } from '../../types/index'; // adjust the path

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
  const [bookingInProgress, setBookingInProgress] = useState<boolean>(false);
  const [storedToken, setStoredToken] = useState<string | null>(null);

  // Instead of only storing maidIds, we now store the full booking details.
  const [bookings, setBookings] = useState<Booking[]>([]);

  // bookingType selection and service selection state.
  const [bookingType, setBookingType] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<{ [maidId: number]: 'cooking' | 'cleaning' | 'both' }>({});

  useEffect(() => {
    AsyncStorage.getItem('token').then(token => {
      setStoredToken(token);
      console.log('Loaded token from storage:', token);
    });
  }, []);

  const tokenForAuth = user?.token || storedToken;

  // Fetch full booking details.
  useEffect(() => {
    const fetchBookings = async () => {
      if (!tokenForAuth) return;
      try {
        const response = awgit adeait axios.get<Booking[]>('https://maid-in-india-nglj.onrender.com/api/maid/bookings', {
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

  // Updated search: now only requires location.
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
      setMaids(response.data);
      if (response.data.length === 0) {
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

  // Helper function to check if a specific service is booked for a maid.
  // Only bookings with paymentStatus true are counted.
  const isServiceBooked = (maidId: number, service: 'cooking' | 'cleaning'): boolean => {
    const bookingsForMaid = bookings.filter(b => b.maidId === maidId && b.paymentStatus === true);
    // If any booking booked both services, then both are considered booked.
    if (bookingsForMaid.some(b => b.service === 'both')) {
      return true;
    }
    return bookingsForMaid.some(b => b.service === service);
  };

  // Toggle the service selection for a given maid.
  const toggleService = (maidId: number, service: 'cooking' | 'cleaning') => {
    if (isServiceBooked(maidId, service)) {
      Alert.alert('Service Unavailable', `The ${service} service is already booked for this maid.`);
      return;
    }
    setSelectedService(prev => {
      const current = prev[maidId];
      if (current === service) {
        return { ...prev, [maidId]: 'both' };
      }
      if (current === 'both') {
        return { ...prev, [maidId]: service };
      }
      return { ...prev, [maidId]: service };
    });
  };

  // Navigate to TimeSlotSelection only if the selected service is available.
  const handleBook = (maid: Maid) => {
    if (!tokenForAuth) {
      Alert.alert('Authentication Error', 'Please log in again.');
      return;
    }
    const serviceSelected = selectedService[maid.maidId];
    if (!serviceSelected) {
      Alert.alert('Service Not Selected', 'Please select a service (Cooking, Cleaning, or Both) before booking.');
      return;
    }
    if (serviceSelected === 'both') {
      if (isServiceBooked(maid.maidId, 'cooking') || isServiceBooked(maid.maidId, 'cleaning')) {
        Alert.alert('Service Unavailable', 'One or both services are already booked. Please select the available service.');
        return;
      }
    } else {
      if (isServiceBooked(maid.maidId, serviceSelected)) {
        Alert.alert('Service Unavailable', `The ${serviceSelected} service is already booked. Please select another service.`);
        return;
      }
    }
    navigation.navigate('TimeSlotSelection', {
      maid,
      bookingType: bookingType!,
      service: serviceSelected as 'cooking' | 'cleaning' | 'both',
    });
  };

  // Render clickable service buttons with disabled state if that service is already booked.
  const renderServiceButtons = (maid: Maid) => {
    const serviceSelected = selectedService[maid.maidId] || '';
    const cookingBooked = isServiceBooked(maid.maidId, 'cooking');
    const cleaningBooked = isServiceBooked(maid.maidId, 'cleaning');
    return (
      <View style={styles.serviceButtonsContainer}>
        {maid.cleaning && (
          <Button
            mode={serviceSelected === 'cleaning' || serviceSelected === 'both' ? 'contained' : 'outlined'}
            onPress={() => toggleService(maid.maidId, 'cleaning')}
            style={styles.serviceButton}
            disabled={cleaningBooked}
          >
            Cleaning {cleaningBooked ? '(Booked)' : ''}
          </Button>
        )}
        {maid.cooking && (
          <Button
            mode={serviceSelected === 'cooking' || serviceSelected === 'both' ? 'contained' : 'outlined'}
            onPress={() => toggleService(maid.maidId, 'cooking')}
            style={styles.serviceButton}
            disabled={cookingBooked}
          >
            Cooking {cookingBooked ? '(Booked)' : ''}
          </Button>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.welcomeText, { color: theme.colors.onPrimary }]}>
          Book a Maid/Cook
        </Text>
        <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton} labelStyle={{ color: theme.colors.onPrimary }}>
          Sign Out
        </Button>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter location"
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
              Weekly 1-3-5
            </Button>
            <Button 
              mode={bookingType === 2 ? 'contained' : 'outlined'} 
              onPress={() => setBookingType(2)}
              style={styles.typeButton}
            >
              Weekly 2-4-6
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
              <Text style={styles.emptyText}>
                No maids found. Try a different location.
              </Text>
            </Card.Content>
          </Card>
        )}
        
        {maids.map((maid) => {
          const cookingBooked = isServiceBooked(maid.maidId, 'cooking');
          const cleaningBooked = isServiceBooked(maid.maidId, 'cleaning');
          const allBooked = cookingBooked && cleaningBooked;
          return (
            <Card key={maid.maidId} style={[styles.maidCard, allBooked && styles.bookedMaidCard]}>
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
                      {maid.pricePerService
                        ? `Cleaning: ₹${maid.pricePerService.cleaning || 'N/A'} | Cooking: ₹${maid.pricePerService.cooking || 'N/A'}`
                        : 'Price: Not specified'
                      }
                    </Text>
                    <Text style={[styles.maidDetail, { color: theme.colors.onSurfaceVariant }]}>
                      Contact: {maid.contact}
                    </Text>
                    <Text style={[styles.maidDetail, { color: theme.colors.onSurfaceVariant }]}>
                      Available: {maid.timeAvailable ? Object.keys(maid.timeAvailable).join(', ') : 'Not specified'}
                    </Text>
                    {renderServiceButtons(maid)}
                    {allBooked && (
                      <Text style={styles.bookedText}>
                        Already booked
                      </Text>
                    )}
                  </View>
                </View>
                <Button 
                  mode="contained" 
                  onPress={() => handleBook(maid)} 
                  style={styles.bookButton}
                  disabled={allBooked}
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
    borderBottomColor: '#ccc',
    marginBottom: 12,
    height: 40,
    paddingHorizontal: 8,
  },
  typeSelector: { marginBottom: 12 },
  typeSelectorLabel: { marginBottom: 4, fontSize: 16 },
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
  serviceButtonsContainer: { flexDirection: 'row', marginTop: 6 },
  serviceButton: { marginRight: 6 },
  bookedText: { color: 'orange', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  bookButton: { alignSelf: 'flex-end' },
});

export default BookMaid;
