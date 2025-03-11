import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Alert } from 'react-native';
import { Text, Button, Card, Avatar, Divider, useTheme, Menu, IconButton, Chip } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import axios, { AxiosError } from 'axios';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Maid, Booking, SearchRequestData, BookRequestData, BookingConfirmRequestData, AuthHook, ErrorResponse } from '../../types/index';

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

    const [location, setLocation] = useState<string>('');
    const [service, setService] = useState<string>('');
    const [timeSlot, setTimeSlot] = useState<string>('');
    const [maids, setMaids] = useState<Maid[]>([]);
    const [menuVisible, setMenuVisible] = useState<boolean>(false);
    const [filterMenuVisible, setFilterMenuVisible] = useState<boolean>(false);
    const [selectedDay, setSelectedDay] = useState<string>(format(new Date(), 'EEEE'));
    const [loading, setLoading] = useState<boolean>(false);
    const [bookingInProgress, setBookingInProgress] = useState<boolean>(false);
    const [bookedMaids, setBookedMaids] = useState<number[]>([]);
  //p  

  const [storedToken, setStoredToken] = useState<string | null>(null);

  useEffect(() => {
    // load token from AsyncStorage on mount
    AsyncStorage.getItem('token').then(token => {
      setStoredToken(token);
      console.log('Loaded token from storage:', token);
    });
  }, []);

  // use token from auth context or fallback to stored token
  const tokenForAuth = user?.token || storedToken;
  

  // Fetch user's current bookings on mount
// Fetch user's current bookings on mount (or when token changes)
useEffect(() => {
    const fetchBookings = async () => {
      if (!tokenForAuth) return;
      
      try {
        const response = await axios.get<Booking[]>('http://10.0.2.2:5000/api/maid/bookings', {
          headers: {
            'Authorization': `Bearer ${tokenForAuth}`
          }
        });
        // Extract maid IDs from bookings to disable already booked maids
        const bookedMaidIds = response.data.map(booking => booking.maidId);
        setBookedMaids(bookedMaidIds);
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

  const handleSearch = async () => {
    if (!tokenForAuth) {
      console.log('user:', user);
      Alert.alert('Authentication Error', 'Please log in again.');
      return;
    }
  
    if (!location) {
      Alert.alert('Missing Information', 'Please enter a location to search.');
      return;
    }
  
    let requestData: Partial<SearchRequestData> = { location };
  
    // If additional filters are provided, require both service and timeSlot
    if (service.trim() !== '' || timeSlot.trim() !== '') {
      if (!service || !timeSlot) {
        Alert.alert('Missing Information', 'Please fill in both service and time slot for filtered search.');
        return;
      }
  
      // Validate time format (e.g., "9:00")
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(timeSlot)) {
        Alert.alert('Invalid Time Format', 'Please enter time in format HH:MM (e.g., 9:00, 14:30)');
        return;
      }
  
      // Add search filters to requestData
      requestData = {
        ...requestData,
        service: service === 'both' ? 'all' : service,
        slot: { [selectedDay]: timeSlot }
      };
    }
  
    setLoading(true);
    try {
      const response = await axios.post<Maid[]>('http://10.0.2.2:5000/api/maid/search', requestData, {
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
        const axiosError = error as AxiosError<{ message?: string }>;
        Alert.alert('Search Failed', axiosError.response?.data?.message || 'Could not complete the search. Please try again.');
      } else {
        Alert.alert('Search Failed', 'Could not complete the search. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (maidId: number) => {
    if (!tokenForAuth) {
      console.log('user:', user);
      Alert.alert('Authentication Error', 'Please log in again.');
      return;
    }

    if (!timeSlot) {
      Alert.alert('Missing Information', 'Please select a time slot first');
      return;
    }

    setBookingInProgress(true);
    try {
      const requestData: BookRequestData = {
        maidId,
        slot: { [selectedDay]: timeSlot }
      };
      
      const response = await axios.post<Booking>('http://10.0.2.2:5000/api/maid/book', requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenForAuth}`
        }
      });
      
      Alert.alert(
        'Booking Request Submitted', 
        'Please confirm your booking by making the payment.',
        [
          { 
            text: 'Cancel', 
            style: 'cancel' 
          },
          { 
            text: 'Confirm Payment', 
            onPress: () => handleConfirmBooking(response.data.id) 
          }
        ]
      );
      
    } catch (error: unknown) {
      console.error('Error booking maid:', error);
      if (isAxiosError(error) && error.response) {
        const axiosError = error as AxiosError<ErrorResponse>;
        Alert.alert(
          'Booking Failed',
          axiosError.response?.data?.message || 'Failed to book. Please try again.'
        );
      } else {
        Alert.alert('Booking Failed', 'Failed to book. Please try again.');
      }
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleConfirmBooking = async (bookingId: number) => {
    if (!tokenForAuth) {
      console.log('user:', user);
      Alert.alert('Authentication Error', 'Please log in again.');
      return;
    }

    try {
      const requestData: BookingConfirmRequestData = { bookingId };
      await axios.post('http://10.0.2.2:5000/api/maid/confirm-booking', requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenForAuth}`
        }
      });
      
      Alert.alert('Success', 'Booking confirmed successfully!');
      handleSearch();
      
      const updatedBookings = await axios.get<Booking[]>('http://10.0.2.2:5000/api/maid/bookings', {
        headers: {
          'Authorization': `Bearer ${tokenForAuth}`
        }
      });
      const bookedMaidIds = updatedBookings.data.map(booking => booking.maidId);
      setBookedMaids(bookedMaidIds);
      
    } catch (error: unknown) {
      console.error('Error confirming booking:', error);
      if (isAxiosError(error) && error.response) {
        const axiosError = error as AxiosError<ErrorResponse>;
        Alert.alert('Confirmation Failed', axiosError.response?.data?.message || 'Failed to confirm booking. Please try again.');
      } else {
        Alert.alert('Confirmation Failed', 'Failed to confirm booking. Please try again.');
      }
    }
  };

  const getDayOptions = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({ label: day, value: day }));
  };

  const renderServiceBadges = (maid: Maid) => {
    const badges = [];
    if (maid.cleaning) {
      badges.push(
        <Chip key="cleaning" style={styles.serviceBadge} mode="outlined">Cleaning</Chip>
      );
    }
    if (maid.cooking) {
      badges.push(
        <Chip key="cooking" style={styles.serviceBadge} mode="outlined">Cooking</Chip>
      );
    }
    return badges;
  };

  const renderPrice = (maid: Maid) => {
    if (!maid.pricePerService) return "Price: Not specified";
    
    const priceInfo = [];
    if (maid.pricePerService.cleaning && maid.cleaning) {
      priceInfo.push(`Cleaning: ₹${maid.pricePerService.cleaning}/hr`);
    }
    if (maid.pricePerService.cooking && maid.cooking) {
      priceInfo.push(`Cooking: ₹${maid.pricePerService.cooking}/hr`);
    }
    
    return priceInfo.length > 0 ? priceInfo.join(', ') : "Price: Not specified";
  };

  // Check if a maid is already booked by the user
  const isMaidBooked = (maidId: number) => {
    return bookedMaids.includes(maidId);
  };

  // Check if a maid is available for the selected time slot
  const isMaidAvailable = (maid: Maid) => {
    // If no time slot is selected, assume the maid is available for display purposes.
    if (!timeSlot) return true;
    
    if (!maid.timeAvailable || !maid.timeAvailable[selectedDay]) {
      return false;
    }
    
    return maid.timeAvailable[selectedDay].includes(timeSlot);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.welcomeText, { color: theme.colors.onPrimary }]}>Book a Maid/Cook</Text>
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
          value={location}
          onChangeText={setLocation}
        />
        
        <IconButton
          icon="filter-variant"
          size={24}
          onPress={() => setFilterMenuVisible(true)}
          style={styles.filterButton}
        />
        
        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={
            <View style={{ width: 1, height: 1 }} />
          }
          style={styles.filterMenu}
        >
          <Menu.Item onPress={() => {
            setService('cleaning');
            setFilterMenuVisible(false);
          }} title="Cleaning" />
          <Menu.Item onPress={() => {
            setService('cooking');
            setFilterMenuVisible(false);
          }} title="Cooking" />
          <Menu.Item onPress={() => {
            setService('both');
            setFilterMenuVisible(false);
          }} title="Both" />
          <Divider />
          
          <Menu.Item title="Select Day:" disabled />
          {getDayOptions().map(day => (
            <Menu.Item 
              key={day.value}
              onPress={() => {
                setSelectedDay(day.value);
                setFilterMenuVisible(false);
              }}
              title={day.label}
              style={selectedDay === day.value ? styles.selectedMenuItem : null}
            />
          ))}
          <Divider />
          
          <View style={styles.timeInputContainer}>
            <TextInput
              style={styles.timeInput}
              placeholder="Enter time (e.g., 9:00)"
              value={timeSlot}
              onChangeText={setTimeSlot}
            />
          </View>
        </Menu>
        
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

      {service && (
        <View style={styles.filterChips}>
          <Chip onClose={() => setService('')} style={styles.chip}>
            {service === 'both' ? 'Cleaning & Cooking' : (
              service === 'cleaning' ? 'Cleaning' : 'Cooking'
            )}
          </Chip>
          {timeSlot && (
            <Chip onClose={() => setTimeSlot('')} style={styles.chip}>
              {selectedDay} at {timeSlot}
            </Chip>
          )}
        </View>
      )}

      <ScrollView style={styles.content}>
        {maids.length === 0 && !loading && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyCardContent}>
              <Text style={styles.emptyText}>No maids found. Try different search criteria.</Text>
            </Card.Content>
          </Card>
        )}
        
        {maids.map((maid) => {
          const isBooked = isMaidBooked(maid.maidId);
          const isAvailable = isMaidAvailable(maid);
          
          return (
            <Card key={maid.maidId} style={[styles.maidCard, !isAvailable && styles.unavailableMaidCard]}>
              <Card.Content style={styles.maidCardContent}>
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
                      {renderPrice(maid)}
                    </Text>
                    <Text style={[styles.maidDetail, { color: theme.colors.onSurfaceVariant }]}>
                      Contact: {maid.contact}
                    </Text>
                    <Text style={[styles.maidDetail, { color: theme.colors.onSurfaceVariant }]}>
                      Time Available: {maid.timeAvailable ? maid.timeAvailable[selectedDay]?.join(', ') : 'Not specified'}
                    </Text>
                    <View style={styles.serviceBadges}>
                      {renderServiceBadges(maid)}
                    </View>
                    {!isAvailable && (
                      <Text style={styles.unavailableText}>
                        Not available for selected time
                      </Text>
                    )}
                    {isBooked && (
                      <Text style={styles.bookedText}>
                        Already booked
                      </Text>
                    )}
                  </View>
                </View>
                <Button 
                  mode="contained" 
                  onPress={() => handleBook(maid.maidId)} 
                  style={styles.bookButton}
                  loading={bookingInProgress}
                  disabled={bookingInProgress || isBooked || !isAvailable}
                >
                  {isBooked ? 'Booked' : 'Book'}
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    borderColor: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  searchInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginRight: 8,
    height: 40,
  },
  filterButton: {
    marginHorizontal: 4,
  },
  filterMenu: {
    marginTop: 40,
    marginLeft: 50,
  },
  selectedMenuItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  timeInputContainer: {
    padding: 8,
  },
  timeInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    height: 40,
    padding: 8,
  },
  searchButton: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  maidCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  unavailableMaidCard: {
    opacity: 0.7,
  },
  maidCardContent: {
    flexDirection: 'column',
  },
  maidInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookButton: {
    alignSelf: 'flex-end',
  },
  maidDetails: {
    marginLeft: 16,
    flex: 1,
  },
  maidName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  maidDetail: {
    fontSize: 14,
    marginBottom: 2,
  },
  serviceBadges: {
    flexDirection: 'row',
    marginTop: 6,
  },
  serviceBadge: {
    marginRight: 6,
    fontSize: 12,
  },
  emptyCard: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 8,
  },
  emptyCardContent: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  unavailableText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  bookedText: {
    color: 'orange',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  }
});

export default BookMaid;




