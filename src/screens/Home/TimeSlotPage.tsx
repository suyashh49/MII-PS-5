import React, { useState } from 'react';
import { View, Alert, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, useTheme, IconButton } from 'react-native-paper';
import axios, { AxiosError } from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BookingConfirmRequestData, ErrorResponse, Maid } from '../../types/index';
import { useAuth } from '../../hooks/useAuth'; // Import your auth hook

const isAxiosError = (error: unknown): error is AxiosError =>
  typeof error === 'object' &&
  error !== null &&
  'isAxiosError' in error &&
  Boolean((error as AxiosError).isAxiosError);

type RouteParams = {
  maid: Maid;
  bookingType: number; // 1, 2, or 3
  service: 'cooking' | 'cleaning' | 'both';
};

const TimeSlotSelection: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useAuth(); // Retrieve token from auth context
  const { maid, bookingType, service } = route.params as RouteParams;
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingInProgress, setBookingInProgress] = useState<boolean>(false);
  const [storedToken, setStoredToken] = useState<string | null>(null);

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
        service,
      };
      const response = await axios.post('https://maid-in-india-nglj.onrender.com/api/maid/book', requestData, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAuth}`  // Include the token here
        },
      });
      Alert.alert(
        'Booking Request Submitted',
        'Please confirm your booking by making the payment.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm Payment', onPress: () => confirmBooking(response.data.BookingId) },
        ]
      );
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

  const confirmBooking = async (bookingId: number) => {
    try {
      const requestData = { bookingId };
      await axios.post('https://maid-in-india-nglj.onrender.com/api/maid/confirm-booking', requestData, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAuth}`  // Include token here too
        },
      });
      Alert.alert('Success', 'Booking confirmed successfully!');
      navigation.goBack();
    } catch (error: unknown) {
      console.error('Error confirming booking:', error);
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        Alert.alert('Confirmation Failed', axiosError.response?.data?.message || 'Failed to confirm booking.');
      } else {
        Alert.alert('Confirmation Failed', 'Failed to confirm booking. Please try again.');
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <IconButton
          icon="arrow-left"
          iconColor={theme.colors.onPrimary}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.headerText, { color: theme.colors.onPrimary }]}>
          Select a Time Slot
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {availableTimeSlots.length > 0 ? (
          <View style={styles.slotsContainer}>
            {availableTimeSlots.map((time) => (
              <Button
                key={time}
                mode={selectedTime === time ? 'contained' : 'outlined'}
                onPress={() => setSelectedTime(time)}
                style={styles.slotButton}
              >
                {time}
              </Button>
            ))}
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
          Confirm Booking
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 40 },
  headerText: { fontSize: 22, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  contentContainer: { padding: 16 },
  slotsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  slotButton: { margin: 8, paddingHorizontal: 16, paddingVertical: 8 },
  noSlotsText: { textAlign: 'center', marginVertical: 20, color: 'gray' },
  confirmButton: { marginTop: 24, alignSelf: 'center', width: '80%' },
});

export default TimeSlotSelection;
