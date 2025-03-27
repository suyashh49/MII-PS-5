import React, { useEffect, useState, useCallback } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList, Booking } from '../../types';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { Agenda as RawAgenda } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cast Agenda to a React component type
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

  const handleSignOut = () => {
    navigation.navigate('Welcome');
  };

  // Retrieve the maid token from AsyncStorage
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
  console.log('maidToken:', maidToken);

  // Fetch bookings using the retrieved maid token
  useEffect(() => {
    const fetchBookings = async () => {
      if (!maidToken) return;
      try {
        const response = await axios.get(
          'https://maid-in-india-nglj.onrender.com/api/worker/schedule',
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${maidToken}`,
            },
          }
        );
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        Alert.alert('Error', 'Failed to load bookings.');
      }
    };
    fetchBookings();
  }, [maidToken]);

  console.log('bookings:', bookings);
  
  // Generate calendar items for the next 30 days
  const generateCalendarItems = useCallback(() => {
    const newItems: { [date: string]: any[] } = {};
    const today = new Date();
    const daysToGenerate = 30; // Adjust as needed

    // Initialize all dates in the range with an empty array
    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      newItems[dateString] = [];
    }

    // Add bookings to the corresponding date if available
    bookings.forEach((booking) => {
      // Use the keys of booking.slot as allowed days
      const allowedDays = Object.keys(booking.slot);
      for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        // Get the weekday name (e.g., "Monday")
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        if (allowedDays.includes(dayName)) {
          const dateString = date.toISOString().split('T')[0];
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

  // Regenerate calendar items whenever bookings change
  useEffect(() => {
    generateCalendarItems();
  }, [bookings, generateCalendarItems]);

  // Render each calendar item
  const renderItem = (item: { name: string; time: string; location: string; userContact: string}) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>Time: {item.time}</Text>
      <Text style={styles.itemText}>Location: {item.location ? item.location : 'Not provided'}</Text>
      <Text style={styles.itemText}>Contact No.: {item.userContact}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
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

      {/* Agenda Component as the work calendar */}
      <Agenda
        items={items}
        loadItemsForMonth={() => generateCalendarItems()}
        selected={new Date().toISOString().split('T')[0]}
        renderItem={renderItem}
        renderEmptyDate={() => (
          <View style={styles.emptyDate}>
            <Text style={[styles.emptyText, { color: theme.colors.background }]}>You have no work scheduled for the day</Text>
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
  emptyText: {
    fontSize: 15,
  },

  logoutButton: {
    borderColor: '#ffffff',
  },
  item: {
    backgroundColor: '#fff',
    padding: 12,
    marginRight: 10,
    marginTop: 17,
    borderRadius: 6,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
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


