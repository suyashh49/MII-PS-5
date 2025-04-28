import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, Card, Divider, useTheme, TextInput, IconButton, Menu } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import axios, { AxiosError } from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList, ErrorResponse } from '../../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geocoder from 'react-native-geocoding';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import i18n from '../../locales/i18n';
import { useTranslation } from 'react-i18next';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Modal, Dimensions, Animated } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';

const { width, height } = Dimensions.get('window');

Geocoder.init('AIzaSyAPQtPZzAuyG4dyEP-45rf8FtOr6pSUBsg');

type HomeNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type BookingItem = {
  bookingId: number;
  service: 'cooking' | 'cleaning' | 'both';
  slot: string;
  type: number;
  pricePerService: number;
  cost: number;
  name: string;
};

const CartCheckout = () => {
  //const [address, setAddress] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressLine3, setAddressLine3] = useState('');
  const [contact, setContact] = useState('');
  const { user, logout } = useAuth();
  const theme = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'CartCheckout'>>();
  const navigation = useNavigation<HomeNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<BookingItem[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const { t } = useTranslation();
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };
  const menuRef = useRef<View>(null);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [languageSubmenuVisible, setLanguageSubmenuVisible] = useState<boolean>(false);

  const [mapVisible, setMapVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedMarker, setSelectedMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);
  const [locationAnimValue] = useState(new Animated.Value(0));

  useEffect(() => {
    if (route.params) {
      const { bookingId, service, slot, type, pricePerService } = route.params as {
        bookingId: number;
        service: 'cooking' | 'cleaning' | 'both';
        slot: string;
        type: number;
        pricePerService: number;
        contactNumber: string;
      };

      const maidName = (route.params as any).maid?.name || (route.params as any).name || 'Unknown Maid';
      const daysCount = type === 3 ? 30 : (type === 1 || type === 2 ? 12 : 1);
      const cost = pricePerService * daysCount;

      const newBooking = {
        bookingId,
        service,
        slot,
        type,
        pricePerService,
        cost,
        name: maidName
      };

      setCartItems(prevItems => {
        const existingBookingIndex = prevItems.findIndex(item => item.bookingId === bookingId);
        if (existingBookingIndex === -1) {
          // Item doesn't exist, add it to cart
          return [...prevItems, newBooking];
        } else {
          // Item exists, return unchanged cart
          return prevItems;
        }
      });
    }
  }, [route.params?.bookingId]); // Only trigger when bookingId changes

  useEffect(() => {
    if (route.params?.contactNumber) {
      setContact(route.params.contactNumber);
    } else {

      AsyncStorage.getItem('user').then(storedUser => {
        if (storedUser) {
          try {
            const userObj = JSON.parse(storedUser);
            if (userObj.contact) setContact(userObj.contact);
            else if (userObj.contactNumber) setContact(userObj.contactNumber);
          } catch (e) {

          }
        }
      });
    }
  }, [route.params?.contactNumber]);

  useEffect(() => {
    const fetchAndSetAddress = async () => {
      try {
        const coordsString = await AsyncStorage.getItem('userCoordinates');
        if (coordsString) {
          const coords = JSON.parse(coordsString);
          const geoRes = await Geocoder.from(coords.latitude, coords.longitude);
          if (
            geoRes.results &&
            geoRes.results.length > 0 &&
            geoRes.results[0].formatted_address
          ) {
            const address = geoRes.results[0].formatted_address;

            const lines = address.split(',').map(line => line.trim());
            setAddressLine1(lines[0] || '');
            setAddressLine2(lines[1] || '');
            setAddressLine3(lines.slice(2).join(', ') || '');
          }
        }
      } catch (error) {
        console.error('Error converting coordinates to address:', error);
      }
    };

    fetchAndSetAddress();
  }, []);

  useEffect(() => {
    const newTotal = cartItems.reduce((sum, item) => sum + item.cost, 0);
    setTotalCost(newTotal);
  }, [cartItems]);

  const token = user?.token;

  const handleLogout = async () => {
    await logout();
  };

  const handleSoftCancel = async (bookingId: number) => {
    try {
      await axios.post(
        'https://maid-in-india-nglj.onrender.com/api/maid/delete-soft',
        { bookingId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // on success, remove from cart
      handleRemoveItem(bookingId);
    } catch (err) {
      console.error('Soft-cancel failed:', err);
      Alert.alert('Error', 'Could not cancel booking.');
    }
  };

  const handleRemoveItem = async (bookingId: number) => {
    const updatedCart = cartItems.filter(item => item.bookingId !== bookingId);
    setCartItems(updatedCart);

    try {
      if (updatedCart.length > 0) {
        await AsyncStorage.setItem('cartItems', JSON.stringify(updatedCart));
      } else {
        await AsyncStorage.removeItem('cartItems');
      }
    } catch (error) {
      console.error('Failed to update saved cart', error);
    }
  };

  const handleConfirmPayment = async () => {
    if (cartItems.length === 0) return;

    if (!addressLine1.trim() || !addressLine2.trim() || !addressLine3.trim() || !contact.trim()) {
      Alert.alert('Required Fields', 'Please fill in your address and contact information.');
      return;
    }

    const fullAddress = [addressLine1, addressLine2, addressLine3]
      .filter(line => line.trim() !== '')
      .join(', ');


    setLoading(true);
    try {

      for (const item of cartItems) {
        const requestData = {
          bookingId: item.bookingId,
          service: item.service,
          cost: item.cost,
          userLocation: fullAddress,
          userContact: contact,
        };

        await axios.post(
          'https://maid-in-india-nglj.onrender.com/api/maid/confirm-booking',
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
      }


      setCartItems([]);
      await clearSavedCart(); // Clear saved cart

      Alert.alert('', 'Booking confirmed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Home', {
              showBookings: true,
              showActivity: true,
              recentActivity: 'Booking confirmed successfully!',
            });
          },
        },
      ]);
    } catch (error: unknown) {
      console.error('Error confirming bookings:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        Alert.alert(
          'Error',
          axiosError.response?.data?.message || 'Failed to confirm bookings.'
        );
      } else {
        Alert.alert('Error', 'Failed to confirm bookings.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cartItems');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from storage', error);
    }
  };

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('cartItems', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Failed to save cart to storage', error);
      }
    };

    if (cartItems.length > 0) {
      saveCart();
    }
  }, [cartItems]);

  // Load cart when component mounts
  useEffect(() => {
    loadCart();
  }, []);

  // Clear cart from AsyncStorage after successful checkout
  const clearSavedCart = async () => {
    try {
      await AsyncStorage.removeItem('cartItems');
    } catch (error) {
      console.error('Failed to clear saved cart', error);
    }
  };

  const getTypeDisplay = (type: number): string => {
    if (type === 1) return 'M-W-F';
    if (type === 2) return 'T-Th-S';
    if (type === 3) return 'Daily';
    return 'Unknown';
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>Your Cart</Text>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            labelStyle={{ color: theme.colors.onPrimary }}
          >
            Sign Out
          </Button>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders found in your cart. Please add an order first.</Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('BookMaid')}
            style={styles.goToOrderButton}
          >
            Go to Order
          </Button>
        </View>
      </SafeAreaView>
    );
  }



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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>Your Cart</Text>
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
      <Modal
    visible={mapVisible}
    animationType="slide"
    onRequestClose={() => setMapVisible(false)}
  >
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.background,
        zIndex: 2,
      }}>
        <TouchableOpacity onPress={() => setMapVisible(false)}>
          <MaterialCommunityIcons name="close" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.onBackground }}>Select Address</Text>
        <TouchableOpacity
          onPress={async () => {
            // Get current location
            Geolocation.getCurrentPosition(
              (position) => {
                const coords = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                };
                const newRegion = {
                  ...coords,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                };
                setMapRegion(newRegion);
                setSelectedMarker(coords);
                if (mapRef.current) {
                  mapRef.current.animateToRegion(newRegion, 1000);
                }
              },
              (error) => {
                Alert.alert('Error', 'Failed to get your current location.');
              },
              { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
          }}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <GooglePlacesAutocomplete
        placeholder="Search for a location"
        fetchDetails={true}
        onPress={(data, details = null) => {
          if (details && details.geometry) {
            const newRegion = {
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            };
            setMapRegion(newRegion);
            setSelectedMarker({
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
            });
            if (mapRef.current) {
              mapRef.current.animateToRegion(newRegion, 1000);
            }
          }
        }}
        query={{
          key: 'AIzaSyAPQtPZzAuyG4dyEP-45rf8FtOr6pSUBsg',
          language: 'en',
        }}
        styles={{
          container: {
            position: 'absolute',
            top: 60,
            width: '90%',
            zIndex: 1,
            alignSelf: 'center',
          },
          textInputContainer: {
            backgroundColor: 'white',
            borderRadius: 8,
            paddingHorizontal: 5,
          },
          textInput: {
            height: 40,
            color: '#5d5d5d',
            fontSize: 16,
            borderRadius: 8,
          },
          listView: {
            backgroundColor: 'white',
            borderRadius: 8,
          },
        }}
      />

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ width: '100%', height: height * 0.7, marginTop: 80 }}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        onPress={(e) => setSelectedMarker(e.nativeEvent.coordinate)}
      >
        {selectedMarker && (
          <Marker
            coordinate={selectedMarker}
            draggable
            onDragEnd={(e) => setSelectedMarker(e.nativeEvent.coordinate)}
          />
        )}
      </MapView>

      <View style={{ padding: 16, backgroundColor: theme.colors.background }}>
        <Button
          mode="contained"
          disabled={!selectedMarker}
          onPress={async () => {
            if (selectedMarker) {
              // Reverse geocode to get address
              try {
                const geoRes = await Geocoder.from(selectedMarker.latitude, selectedMarker.longitude);
                if (
                  geoRes.results &&
                  geoRes.results.length > 0 &&
                  geoRes.results[0].formatted_address
                ) {
                  const address = geoRes.results[0].formatted_address;
                  const lines = address.split(',').map(line => line.trim());
                  setAddressLine1(lines[0] || '');
                  setAddressLine2(lines[1] || '');
                  setAddressLine3(lines.slice(2).join(', ') || '');
                }
              } catch (error) {
                Alert.alert('Error', 'Could not fetch address for this location.');
              }
              setMapVisible(false);
              Animated.sequence([
                Animated.timing(locationAnimValue, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(locationAnimValue, {
                  toValue: 0,
                  duration: 300,
                  delay: 1000,
                  useNativeDriver: true,
                })
              ]).start();
            }
          }}
          style={{ borderRadius: 8 }}
        >
          Confirm Location
        </Button>
      </View>
    </SafeAreaView>
  </Modal>
      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Items:</Text>
              <Text style={styles.summaryValue}>{cartItems.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Cost:</Text>
              <Text style={styles.summaryValue}>{totalCost}/- INR</Text>
            </View>
          </Card.Content>
        </Card>


        {/* User Information */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoTitle}>User's Address</Text>
            <Button
              mode="outlined"
              onPress={() => setMapVisible(true)}
              style={{ marginBottom: 12 , borderRadius: 4}}
              labelStyle={{ color: theme.colors.onBackground }}
            >
              Select Address on Map
            </Button>
            <TextInput
              label="Address Line 1"
              value={addressLine1}
              onChangeText={setAddressLine1}
              mode="outlined"
              style={styles.textInput}
            />
            <TextInput
              label="Address Line 2"
              value={addressLine2}
              onChangeText={setAddressLine2}
              mode="outlined"
              style={styles.textInput}
            />
            <TextInput
              label="Address Line 3"
              value={addressLine3}
              onChangeText={setAddressLine3}
              mode="outlined"
              style={styles.textInput}
            />
            <TextInput
              label="Enter Contact Number"
              value={contact}
              onChangeText={setContact}
              mode="outlined"
              style={styles.textInput}
              keyboardType="phone-pad"
            />
            <Animated.View style={{
              opacity: locationAnimValue,
              transform: [{
                translateY: locationAnimValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0]
                })
              }]
            }}>
              <Text style={{ color: theme.colors.primary, textAlign: 'center', marginVertical: 8 }}>
                Address selected successfully!
              </Text>
            </Animated.View>
          </Card.Content>
        </Card>

        {/* Booking Items */}
        <Text style={styles.bookingsTitle}>Your Bookings</Text>
        {cartItems.map((item) => (
          <Card key={item.bookingId} style={styles.bookingCard}>
            <Card.Title
              title={`Booking #${item.bookingId}`}
              titleStyle={styles.bookingCardTitle}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="delete"
                  iconColor={theme.colors.error}
                  onPress={() => {
                    Alert.alert(
                      'Delete Booking',
                      'Are you sure you want to delete this booking?',
                      [
                        { text: 'No', style: 'cancel' },
                        {
                          text: 'Yes',
                          style: 'destructive',
                          onPress: async () => {
                            await handleSoftCancel(item.bookingId);
                            Alert.alert('Deleted', 'Booking deleted.');
                          },
                        },
                      ],
                      { cancelable: true }
                    );
                  }}
                />
              )}
            />
            <Divider />
            <Card.Content style={styles.bookingContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Service:</Text>
                <Text style={styles.detailValue}>
                  {item.service.charAt(0).toUpperCase() + item.service.slice(1)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Maid:</Text>
                <Text style={styles.detailValue}>{item.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Slot:</Text>
                <Text style={styles.detailValue}>{item.slot}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{getTypeDisplay(item.type)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cost:</Text>
                <Text style={styles.detailValue}>{item.cost}/- INR</Text>
              </View>
            </Card.Content>
          </Card>
        ))}

        <Button
          mode="contained"
          onPress={handleConfirmPayment}
          loading={loading}
          style={styles.confirmButton}
          disabled={cartItems.length === 0}
        >
          Confirm Payment ({totalCost}/- INR)
        </Button>
      </ScrollView>
      {renderMenu()}
      {renderLanguageMenu()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    borderColor: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  summaryCard: {
    width: '100%',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    width: '100%',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    marginVertical: 8,
  },
  bookingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    alignSelf: 'flex-start',
  },
  bookingCard: {
    width: '100%',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  bookingCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookingContent: {
    paddingVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    width: '30%',
  },
  detailValue: {
    fontSize: 16,
    width: '70%',
  },
  confirmButton: {
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  goToOrderButton: {
    width: '60%',
  },
  menuButton: {
    padding: 8,
  },
});

export default CartCheckout;