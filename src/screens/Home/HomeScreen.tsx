import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, Card, Avatar, Divider, IconButton, useTheme, Menu } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { TextInput } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList, User, Booking, HomeStackParamList } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import theme from '../../config/theme';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useTranslation } from 'react-i18next';
import i18n from '../../locales/i18n';
import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type HomeScreenRouteProp = RouteProp<HomeStackParamList, 'Home'>;

interface HomeScreenProps {
  route: HomeScreenRouteProp;
}

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Home'>;

const HomeScreen = ({ route }: HomeScreenProps) => {
  const { user, logout } = useAuth();
  const userName = user?.name || '';
  const email = user?.email || '';
  const theme = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showBookings, setShowBookings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState(user?.name || '');
  const [editableContact, setEditableContact] = useState(user?.contact || '');
  const [editableAddress, setEditableAddress] = useState(user?.address || '');
  const [photoUrl,setPhotoUrl] = useState(user?.photoUrl || '');
  const [recentActivity, setRecentActivity] = useState<string>('You signed in just now');
  const [showActivity, setShowActivity] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const { t } = useTranslation();
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  // Request permission and get coordinates
  const getMyLocation = async (setCoordinates: (coords: { latitude: number; longitude: number }) => void) => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'ios') {
        Geolocation.requestAuthorization();
        return true;
      } else {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Permission",
              message: "App needs access to your location.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
          console.warn(err);
          return false;
        }
      }
    };

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

    Geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoordinates(coords);
        // Store coordinates in AsyncStorage
        try {
          await AsyncStorage.setItem('userCoordinates', JSON.stringify(coords));
        } catch (err) {
          console.error('Error saving coordinates:', err);
        }
        //Alert.alert('Location Captured', 'Your location has been successfully captured!');
      },
      (error) => {
        console.error(error);
        Alert.alert('Error', 'Failed to get your current location.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    if (route.params?.showBookings) {
      setShowBookings(true);
    }
    if (route.params?.showActivity) {
      handleToggleBookings();
    }
    if (route.params?.recentActivity) {
      setRecentActivity(route.params.recentActivity);
    }
  }, [route.params]);

  useEffect(() => {
    getMyLocation(setCoordinates);
  }, []);

  console.log('Coordinates:', coordinates);

  const fetchBookings = async () => {
    try {
      const storedToken = await user?.token;
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
    const fetchUserData = async () => {
      try {
        
        const storedUser = await AsyncStorage.getItem('user');

        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          setEditableName(parsedUser.name);
          setEditableContact(parsedUser.contact);
          setEditableAddress(parsedUser.address);
          setPhotoUrl(parsedUser?.photoUrl);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleToggleBookings = async () => {

    await fetchBookings();
    setShowBookings((prev) => !prev);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleSaveProfile = async () => {
    try {
      const storedToken = user?.token;
      const response = await axios.post(
        'https://maid-in-india-nglj.onrender.com/api/auth/update',
        {
          name: editableName,
          contactNumber: editableContact,
          address: editableAddress,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleCancelSubscription = async (bookingId: number, booking: Booking) => {
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


      Alert.alert(
        'Booking Cancelled',
        'Your booking has been cancelled successfully.',
        [{ text: 'OK' }]
      );


      setRecentActivity(`Cancelled booking for ${booking.maidName}.`);


      await fetchBookings();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };




  const groupSlots = (slot: { [day: string]: string }): { group: string; time: string }[] => {
    const groups: { [group: string]: string[] } = {
      'M-W-F': ['Monday', 'Wednesday', 'Friday'],
      'T-Th-S': ['Tuesday', 'Thursday', 'Saturday'],
      'Daily': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    };

    const result: { group: string; time: string }[] = [];

    for (const group in groups) {
      const requiredDays = groups[group];

      if (group === 'Daily') {

        const allDaysHaveTime = requiredDays.every(day => slot[day] && slot[day].trim() !== '');
        if (allDaysHaveTime) {
          const uniqueTimes = Array.from(new Set(requiredDays.map(day => slot[day])));
          if (uniqueTimes.length === 1) {
            result.push({ group, time: uniqueTimes[0] });
          }
        }
      } else {

        const times = requiredDays
          .map(day => slot[day])
          .filter((time) => time !== undefined && time.trim() !== '');
        if (times.length > 0) {
          const uniqueTimes = Array.from(new Set(times));
          const displayTime = uniqueTimes.length === 1 ? uniqueTimes[0] : uniqueTimes.join(', ');
          result.push({ group, time: displayTime });
        }
      }
    }

    const dailyGroup = result.find(r => r.group === 'Daily');
    return dailyGroup ? [dailyGroup] : result;
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
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.welcomeText, { color: theme.colors.onPrimary }]}>{t('welcome')}</Text>
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

      <ScrollView style={styles.content}>
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileCardContent}>
            <Avatar.Image
              size={80}
              source={{ uri: user?.photoUrl || 'https://via.placeholder.com/80' }}
            />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.colors.onBackground }]}>{editableName}</Text>
              <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>{email}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Title
            title="Account Information"
            titleStyle={{ color: theme.colors.onBackground }}
            right={(props) => (
              <IconButton
                {...props}
                icon={isEditing ? 'check' : 'pencil'}
                onPress={() => {
                  if (isEditing) {
                    handleSaveProfile();
                  } else {
                    setIsEditing(true);
                  }
                }}
              />
            )}
          />
          <Divider />
          <Card.Content style={styles.infoCardContent}>
            {isEditing ? (
              <>
                <TextInput
                  label="Name"
                  value={editableName}
                  onChangeText={setEditableName}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Contact"
                  value={editableContact}
                  onChangeText={setEditableContact}
                  mode="outlined"
                  style={styles.input}
                />
                {/* <TextInput
                  label="Address"
                  value={editableAddress}
                  onChangeText={setEditableAddress}
                  mode="outlined"
                  style={styles.input}
                /> */}
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>{editableName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Contact:</Text>
                  <Text style={styles.infoValue}>{editableContact}</Text>
                </View>
                {/* <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address:</Text>
                  <Text style={styles.infoValue}>{editableAddress}</Text>
                </View> */}
              </>
            )}
          </Card.Content>
        </Card>


        <Card style={styles.activityCard}>
          <Card.Title
            title="Recent Activity"
            titleStyle={{ color: theme.colors.onBackground }}
            right={(props) => (
              <IconButton
                {...props}
                icon={showActivity ? 'chevron-up' : 'chevron-down'}
                onPress={() => setShowActivity(!showActivity)}
              />
            )}
          />
          {showActivity && <Divider />}
          {showActivity && (
            <Card.Content style={styles.activityCardContent}>
              <Text style={[styles.activityText, { color: theme.colors.onBackground }]}>
                {recentActivity}
              </Text>
            </Card.Content>
          )}
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
          {showBookings && <Divider />}
          {showBookings && (
            <Card.Content style={styles.activityCardContent}>
              {bookings.length > 0 ? (
                bookings
                  .slice()
                  .sort((a, b) => b.BookingId - a.BookingId)
                  .map((booking: Booking) => (
                    <Card key={booking.BookingId} style={styles.bookingCard}>
                      <Card.Content>
                        <View style={styles.bookingRow}>
                          <View style={styles.maidDetails}>
                            <Text style={styles.boldText}>
                              Name:{' '}
                              <Text style={styles.maidcol}>{booking.maidName}</Text>
                            </Text>
                            <Text style={styles.boldText}>
                              Mob:{' '}
                              <Text style={styles.maidcol}>{booking.maidContact}</Text>
                            </Text>
                            <Text style={styles.boldText}>
                              Service:{' '}
                              <Text style={styles.maidcol}>{booking.service}</Text>
                            </Text>
                          </View>
                          <View style={styles.bookingSlots}>
                            {groupSlots(booking.slot).map(({ group, time }) => (
                              <View key={group} style={styles.slotRow}>
                                <Text style={[styles.slotDay, { color: theme.colors.onSurfaceVariant }]}>
                                  {group}:
                                </Text>
                                <Text style={[styles.slotTime, { color: theme.colors.onSurfaceVariant }]}>
                                  {time}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
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
                              onPress={() => handleCancelSubscription(booking.BookingId, booking)}
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
      {renderMenu()}
      {renderLanguageMenu()}
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
    borderColor: theme.colors.onPrimary,
    backgroundColor: theme.colors.primary,
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
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  maidDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  bookingSlots: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  bookingText: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  boldText: {
    fontWeight: 'bold',
  },
  maidcol: {
    color: theme.colors.primary,
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
    color: theme.colors.onSurfaceVariant,
  },
  slotTime: {
    fontSize: 14,
    color: 'blue',
  },
  noBookingsText: {
    fontSize: 16,
    color: theme.colors.onSurface,
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
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  menuButton: {
    padding: 8,
  },
});

export default HomeScreen;
