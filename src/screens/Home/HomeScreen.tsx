import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Button, Card, Avatar, Divider, IconButton, useTheme } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { RouteProp } from '@react-navigation/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList, User, Booking, HomeStackParamList } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import theme from '../../config/theme';

type HomeScreenRouteProp = RouteProp<HomeStackParamList, 'Home'>;

interface HomeScreenProps {
  route: HomeScreenRouteProp;
}

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Home'>;

const HomeScreen = ({ route }: HomeScreenProps) => {
  const { user, logout } = useAuth();
  const userName = user?.name || '';
  const email = user?.email || '';
  const photoUrl = user?.photoUrl || '';
  const theme = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showBookings, setShowBookings] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const fetchBookings = async () => {
    try {
      const storedToken = await user?.token; // Get token before request
      const response = await axios.get(
        'https://maid-in-india-nglj.onrender.com/api/maid/bookings',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );
      console.log('API Response:', response.data);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    // Optionally, you can fetch bookings on mount or keep it manual only.
    // fetchBookings();
  }, []);

  const handleToggleBookings = async () => {
    // Refresh bookings list every time the button is clicked
    await fetchBookings();
    setShowBookings((prev) => !prev);
  };

  const handleLogout = async () => {
    await logout();
  };

  // New function to handle cancel subscription
  const handleCancelSubscription = async (bookingId: number) => {
    try {
      const storedToken = user?.token;
      const response = await axios.post(
        'https://maid-in-india-nglj.onrender.com/api/maid/cancel-booking',
        { bookingId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );
      console.log('Cancel subscription response:', response.data);
      // Optionally refresh bookings after cancellation
      await fetchBookings();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.welcomeText, { color: theme.colors.onPrimary }]}>Welcome back</Text>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          labelStyle={{ color: theme.colors.onPrimary }}
        >
          Sign Out
        </Button>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileCardContent}>
            <Avatar.Image
              size={80}
              source={{ uri: photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName) }}
            />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.colors.onBackground }]}>{userName}</Text>
              <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>{email}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Title title="Account Information" titleStyle={{ color: theme.colors.onBackground }} />
          <Divider />
          <Card.Content style={styles.infoCardContent}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Name:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.onBackground }]}>{userName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Email:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.onBackground }]}>{email}</Text>
            </View>
            {/* <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Account Type:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.onBackground }]}>Google</Text>
            </View> */}
          </Card.Content>
        </Card>

        <Card style={styles.activityCard}>
          <Card.Title title="Recent Activity" titleStyle={{ color: theme.colors.onBackground }} />
          <Divider />
          <Card.Content style={styles.activityCardContent}>
            <Text style={[styles.activityText, { color: theme.colors.onBackground }]}>
              You signed in just now
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.activityCard}>
          <Card.Title
            title="Bookings"
            titleStyle={{ color: theme.colors.onBackground }}
            right={(props) => (
              <IconButton
                {...props}
                icon={showBookings ? 'chevron-up' : 'chevron-down'}
                onPress={handleToggleBookings}
              />
            )}
          />
          <Divider />
          {showBookings && (
            <Card.Content style={styles.activityCardContent}>
              {bookings.length > 0 ? (
                bookings.map((booking: Booking) => (
                  <Card key={booking.BookingId} style={styles.bookingCard}>
                    <Card.Content>
                      <View style={styles.bookingRow}>
                        <Text style={styles.bookingText}>
                          <Text style={styles.boldText}>Maid Name:</Text> {booking.maidName}
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <Text style={styles.boldText}>Maid Contact:</Text> {booking.maidContact}
                        </Text>
                      </View>
                      {(Object.entries(booking.slot) as [string, string][]).map(([day, time]) => (
                        <View key={day} style={styles.slotRow}>
                          <Text style={[styles.slotDay, { color: theme.colors.onSurfaceVariant }]}>{day}:</Text>
                          <Text style={[styles.slotTime, { color: theme.colors.onSurfaceVariant }]}>{time}</Text>
                        </View>
                      ))}
                      {booking.paymentStatus && (
                        <View style={styles.actionButtonsContainer}>
                          {!booking.feedback && (
                            <Button
                              mode="contained"
                              onPress={() =>
                                navigation.navigate('Feedback', { bookingId: booking.BookingId })
                              }
                              style={{ marginTop: 8 }}
                            >
                              Give Feedback
                            </Button>
                          )}
                          <Button
                            mode="contained"
                            onPress={() => handleCancelSubscription(booking.BookingId)}
                            style={{ marginTop: 8, marginLeft: 8 }}
                          >
                            Cancel Subscription
                          </Button>
                        </View>
                      )}
                      {booking.paymentStatus && booking.feedback && (
                        <View style={styles.feedbackContainer}>
                          <Text style={styles.feedbackLabel}>Your Feedback:</Text>
                          <Text style={styles.feedbackText}>{booking.feedback}</Text>
                        </View>
                      )}
                    </Card.Content>
                  </Card>
                ))
              ) : (
                <Text style={styles.noBookingsText}>No bookings available</Text>
              )}
            </Card.Content>
          )}
        </Card>
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
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
  },
  infoCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  infoCardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    width: 100,
    fontSize: 16,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
  },
  activityCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  activityCardContent: {
    padding: 16,
  },
  activityText: {
    fontSize: 16,
  },
  bookingCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 3,
    backgroundColor: '#1e1e1e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  bookingText: {
    fontSize: 16,
    color: 'blue',
  },
  boldText: {
    fontWeight: 'bold',
  },
  slotRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  slotDay: {
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 6,
    color: 'blue',
  },
  slotTime: {
    fontSize: 14,
    color: 'blue',
  },
  noBookingsText: {
    fontSize: 16,
    color: 'blue',
    textAlign: 'center',
  },
  feedbackContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 4,
  },
  feedbackLabel: {
    fontWeight: 'bold',
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  feedbackText: {
    color: theme.colors.onSurfaceVariant,
  },
  // New style for action buttons container
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});

export default HomeScreen;
