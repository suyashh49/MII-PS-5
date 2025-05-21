// src/screens/Maid/MaidCalendarScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Linking} from 'react-native';
import { Text, useTheme, Card, Button } from 'react-native-paper';
import { Agenda as RawAgenda } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking } from '../../types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geocoder from 'react-native-geocoding';
import { useTranslation } from 'react-i18next';

// Initialize Geocoder
Geocoder.init('AIzaSyAPQtPZzAuyG4dyEP-45rf8FtOr6pSUBsg');

const Agenda = RawAgenda as unknown as React.ComponentType<any>;

const MaidCalendarScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [maidToken, setMaidToken] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [items, setItems] = useState<{ [date: string]: any[] }>({});
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('token')
      .then(t => setMaidToken(t))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!maidToken) return;
    axios.get(
      'https://maid-in-india-nglj.onrender.com/api/worker/schedule',
      { headers: { Authorization: `Bearer ${maidToken}` } }
    )
      .then(res => {
        setBookings(res.data);
      })
      .catch(() => Alert.alert(t('error'), t('failed_load_bookings')));
  }, [maidToken, t]);

  const getLocalDateString = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const generateCalendarItems = useCallback(() => {
    const today = new Date();
    const newItems: { [date: string]: any[] } = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      newItems[getLocalDateString(d)] = [];
    }
    bookings.forEach((b, bookingIndex) => {
      Object.keys(b.slot).forEach(dayName => {
        for (let i = 0; i < 30; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          if (d.toLocaleDateString('en-US', { weekday: 'long' }) === dayName) {
            const key = getLocalDateString(d);
            const uniqueId = `booking-${bookingIndex}-${dayName}-${i}`;
            newItems[key].push({
              id: uniqueId,
              name: `${t('booking')} ${b.userName}`,
              time: b.slot[dayName],
              location: b.userLocation,
              userContact: b.userContact,
              service: b.service,
            });
          }
        }
      });
    });
    setItems(newItems);
  }, [bookings, t]);

  useEffect(() => {
    generateCalendarItems();
  }, [bookings, generateCalendarItems]);

  const toggleCardExpansion = (id: string) => {
    setExpandedBookingId(expandedBookingId === id ? null : id);
  };

  const openDirections = async (location: string) => {
    try {
      if (!location || location === 'N/A') {
        Alert.alert(t('error'), t('no_location_info'));
        return;
      }

      try {
        const response = await Geocoder.from(location);
        if (response.results && response.results.length > 0) {
          const { lat, lng } = response.results[0].geometry.location;
          const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
            return;
          }
        }
      } catch (geocodeError) {
        console.log('Geocoding error', geocodeError);
      }

      const encodedAddress = encodeURIComponent(location);
      const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      const canOpenFallback = await Linking.canOpenURL(fallbackUrl);
      if (canOpenFallback) {
        await Linking.openURL(fallbackUrl);
      } else {
        Alert.alert(t('error'), t('cannot_open_maps'));
      }
    } catch (error) {
      console.error('Error opening maps:', error);
      Alert.alert(t('error'), t('failed_open_directions'));
    }
  };

  const renderItem = (item: any) => {
    const isExpanded = expandedBookingId === item.id;
    return (
      <Card style={[styles.bookingCard, isExpanded && styles.expandedCard]}>
        <TouchableOpacity
          onPress={() => toggleCardExpansion(item.id)}
          activeOpacity={0.7}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.bookingRow}>
              <View style={styles.maidDetails}>
                <Text style={styles.bookingTitle}>{item.name}</Text>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#1368A4" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{item.service}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="phone" size={16} color="#1368A4" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{item.userContact}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker" size={16} color="#1368A4" style={styles.infoIcon} />
                  <Text style={styles.infoText} numberOfLines={2}>{item.location || 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeLabel}>{t('time')}</Text>
                <Text style={styles.timeValue}>{item.time}</Text>
              </View>
            </View>

            {isExpanded && (
              <View style={styles.actionButtonsContainer}>
                <Button
                  mode="contained"
                  onPress={() => openDirections(item.location)}
                  style={styles.actionButton}
                  icon="map-marker-radius"
                  labelStyle={styles.buttonLabel}
                >
                  label={t('directions')}
                  </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    const phoneNumber = item.userContact;
                    if (!phoneNumber || phoneNumber === 'N/A') {
                      Alert.alert(t('error'), t('no_contact_info'));
                      return;
                    }
                    Linking.openURL(`tel:${phoneNumber}`);
                  }}
                  style={[styles.actionButton2]}
                  icon="phone"
                  labelStyle={styles.buttonLabel}
                  >
                  label={t('call')}
                  </Button>
              </View>
            )}
          </Card.Content>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <Agenda
      items={items}
      loadItemsForMonth={generateCalendarItems}
      selected={getLocalDateString(new Date())}
      renderItem={renderItem}
      renderEmptyDate={() => (
        <View style={styles.emptyDate}>
          <Text style={[styles.emptyText, { color: theme.colors.primary }]}>
            {t('no_work_scheduled')}
          </Text>
        </View>
      )}
      rowHasChanged={(r1: any, r2: any) => r1.name !== r2.name}
      theme={{
        agendaTodayColor: theme.colors.primary,
        dotColor: theme.colors.onPrimary,
        selectedDayBackgroundColor: theme.colors.primary
      }}
    />
  );
};

const styles = StyleSheet.create({
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    marginVertical: 8,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  expandedCard: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 12,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  maidDetails: {
    flex: 3,
    paddingRight: 10,
  },
  bookingTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  timeContainer: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 18,
    color: '#1368A4',
    fontWeight: 'bold',
    marginTop: 2,
  },
  actionButtonsContainer: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 4,
  },
  emptyDate: {
    height: 40,
    flex: 1,
    paddingTop: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
  actionButton2: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
});

export default MaidCalendarScreen;