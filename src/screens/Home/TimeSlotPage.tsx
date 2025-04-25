import React, { useState } from 'react';
import { View, Alert, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, useTheme, IconButton } from 'react-native-paper';
import axios, { AxiosError } from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BookingConfirmRequestData, BookStackParamList, ErrorResponse, Maid } from '../../types/index';
import { useAuth } from '../../hooks/useAuth';
import { CommonActions } from '@react-navigation/native';

type RouteParams = {
  maid: Maid;
  bookingType: number; // 1, 2, or 3
  service: 'cooking' | 'cleaning' | 'both';
  pricePerService: number;
  name: string;
  softBookedSlots?: {
    [day: string]: string;
  };

};

type BookStackNavigationProp = StackNavigationProp<BookStackParamList, 'TimeSlotSelection'>;

const isAxiosError = (error: unknown): error is AxiosError =>
  typeof error === 'object' &&
  error !== null &&
  'isAxiosError' in error &&
  Boolean((error as AxiosError).isAxiosError);

const TimeSlotSelection: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<BookStackNavigationProp>();
  const theme = useTheme();
  const { user } = useAuth();
  const { maid, bookingType, service, pricePerService, name } = route.params as RouteParams;
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingInProgress, setBookingInProgress] = useState<boolean>(false);
  const [storedToken, setStoredToken] = useState<string | null>(null);
  //console.log('TimeS params:', route.params);
  const getAllowedDays = (): string[] => {
    if (bookingType === 1) return ['Monday', 'Wednesday', 'Friday'];
    if (bookingType === 2) return ['Tuesday', 'Thursday', 'Saturday'];
    if (bookingType === 3)
      return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return [];
  };

  const tokenAuth = user?.token || storedToken;
  const allowedDays = getAllowedDays();

  const commonSlots = (): string[] => {
    const slotsArrays = allowedDays.map(day => maid.timeAvailable?.[day] || []);
    if (slotsArrays.length === 0) return [];
    return slotsArrays.reduce((acc, curr) => acc.filter(time => curr.includes(time)));
  };

  const isSoftBooked = (time: string): boolean => {
    const { softBookedSlots } = route.params as RouteParams;
    if (!softBookedSlots || !Array.isArray(softBookedSlots) || softBookedSlots.length === 0) return false;
    
    // Check if time exists in any of the soft booking objects
    for (const bookingObj of softBookedSlots) {
      for (const day of allowedDays) {
        if (bookingObj[day] === time) {
          return true;
        }
      }
    }
    return false;
  };

  const availableTimeSlots = commonSlots();

  const handleConfirmBooking = async () => {
    if (!selectedTime) {
      Alert.alert('Selection Missing', 'Please select a time slot.');
      return;
    }
    setBookingInProgress(true);
    try {
      const requestData = {
        maidId: maid.maidId,
        slot: selectedTime,
        type: bookingType,
        service: service,
        pricePerservice: pricePerService,
      };

      const response = await axios.post('https://maid-in-india-nglj.onrender.com/api/maid/book', requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAuth}`
        },
      });
      
      navigation.navigate('CartCheckout', {
        bookingId: response.data.BookingId,
              maidId: maid.maidId,
              service,
              slot: selectedTime,
              type: bookingType,
              pricePerService,
              name: name || maid.name || 'Unknown Maid',
              
              isNewBooking: true,
      });

    } catch (error: unknown) {
      console.error('Error booking maid:', error);
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        Alert.alert('Booking Failed', axiosError.response?.data?.message || 'Failed to book. Please try again.');
      } else {
        Alert.alert('Booking Failed', 'Failed to book. Please try again.');
      }
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleBackToSearch = () => {
    navigation.navigate('BookMaid', { preserveState: true });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <IconButton
          icon="arrow-left"
          iconColor={theme.colors.onPrimary}
          onPress={handleBackToSearch}
        />
        <Text style={[styles.headerText, { color: theme.colors.onPrimary }]}>
          Select a Time Slot
        </Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {availableTimeSlots.length > 0 ? (
          <View style={styles.slotsContainer}>
            {availableTimeSlots.map((time) => {
              const softBooked = isSoftBooked(time);
              return (
                <Button
                  key={time}
                  mode={selectedTime === time ? 'contained' : 'outlined'}
                  onPress={() => !softBooked && setSelectedTime(time)}
                  style={[
                    styles.slotButton,
                    softBooked && styles.softBookedSlot
                  ]}
                  disabled={softBooked}
                >
                  {time} {softBooked ? '' : ''}
                </Button>
              );
            })}
          </View>
        ) : (
          <Text style={styles.noSlotsText}>No common time slots available.</Text>
        )}
        <Button
          mode="contained"
          onPress={handleConfirmBooking}
          loading={bookingInProgress}
          style={styles.confirmButton}
        >
          Add to Cart
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 40 },
  headerText: { 
    fontSize: 22, fontWeight: 'bold', flex: 1, textAlign: 'center'}, 
  contentContainer: { padding: 16 },
  slotsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  slotButton: { margin: 8, paddingHorizontal: 16, paddingVertical: 8 },
  noSlotsText: { textAlign: 'center', marginVertical: 20, color: 'gray' },
  confirmButton: { marginTop: 24, alignSelf: 'center', width: '80%' },
  softBookedSlot: { 
    opacity: 0.5, 
    backgroundColor: '#e0e0e0' 
  },
});

export default TimeSlotSelection;