import React, { useEffect, useState, useCallback } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList, Booking } from '../../types';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { Agenda as RawAgenda } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Agenda = RawAgenda as unknown as React.ComponentType<any>;

type HomeScreenMaidRouteProp = RouteProp<RootStackParamList, 'HomeMaid'>;
type HomeScreenMaidNavigationProp = StackNavigationProp<RootStackParamList, 'HomeMaid'>;

const HomeScreenMaid = () => {
  const route = useRoute<HomeScreenMaidRouteProp>();
  const navigation = useNavigation<HomeScreenMaidNavigationProp>();
  const { name } = route.params;
  const theme = useTheme();
  
  const [maidToken, setMaidToken] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [items, setItems] = useState<{ [date: string]: any[] }>({});

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSignOut = () => {
    navigation.navigate('Welcome');
  };

  useEffect(() => {
    const getMaidToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setMaidToken(storedToken);
      } catch (error) {
        console.error('Error retrieving token:', error);
      }
    };
    getMaidToken();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!maidToken) return;
      try {
        const response = await axios.get(
          'https://maid-in-india-nglj.onrender.com/api/worker/schedule',
          { headers: { 'Authorization': `Bearer ${maidToken}` } }
        );
        setBookings(response.data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load bookings.');
      }
    };
    fetchBookings();
  }, [maidToken]);

  const generateCalendarItems = useCallback(() => {
    const newItems: { [date: string]: any[] } = {};
    const today = new Date();
    const daysToGenerate = 30;

    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = getLocalDateString(date);
      newItems[dateString] = [];
    }

    bookings.forEach((booking) => {
      const allowedDays = Object.keys(booking.slot);
      for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        if (allowedDays.includes(dayName)) {
          const dateString = getLocalDateString(date);
          newItems[dateString].push({
            name: `Booking for ${booking.userName}`,
            time: booking.slot[dayName],
            location: booking.userLocation,
            userContact: booking.userContact,
          });
        }
      }
    });
    setItems(newItems);
  }, [bookings]);

  useEffect(() => {
    generateCalendarItems();
  }, [bookings, generateCalendarItems]);

  const renderItem = (item: { name: string; time: string; location: string; userContact: string}) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>Time: {item.time}</Text>
      <Text style={styles.itemText}>Location: {item.location || 'Not provided'}</Text>
      <Text style={styles.itemText}>Contact No.: {item.userContact}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.welcomeText, { color: theme.colors.onPrimary }]}>
          Welcome, {name}!
        </Text>
        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={styles.logoutButton}
          labelStyle={{ color: theme.colors.onPrimary }}
        >
          Sign Out
        </Button>
      </View>

      <Agenda
        items={items}
        loadItemsForMonth={generateCalendarItems}
        selected={getLocalDateString(new Date())}
        renderItem={renderItem}
        renderEmptyDate={() => (
          <View style={styles.emptyDate}>
            <Text style={[styles.emptyText, { color: theme.colors.background }]}>No work scheduled</Text>
          </View>
        )}
        rowHasChanged={(r1: { name: string }, r2: { name: string }) => r1.name !== r2.name}
        theme={{
          agendaTodayColor: theme.colors.primary,
          dotColor: theme.colors.onPrimary,
          selectedDayBackgroundColor: theme.colors.primary,
        }}
      />
    </View>
  );
};

// Styles remain unchanged
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
  emptyText: { fontSize: 15 },
  logoutButton: { borderColor: '#ffffff' },
  item: {
    backgroundColor: '#fff',
    padding: 12,
    marginRight: 10,
    marginTop: 17,
    borderRadius: 6,
    elevation: 2,
  },
  itemText: { fontSize: 16, color: '#333' },
  emptyDate: {
    height: 50,
    flex: 1,
    paddingTop: 20,
    justifyContent: 'center',
    color: '#333',
    alignItems: 'center',
  },
});

export default HomeScreenMaid;