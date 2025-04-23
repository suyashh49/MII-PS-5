// import React, { useState, useEffect } from 'react';
// import { SafeAreaView, StyleSheet, View, ScrollView, Alert } from 'react-native';
// import { Text, Button, Card, Divider, useTheme, TextInput } from 'react-native-paper';
// import { useAuth } from '../../hooks/useAuth';
// import axios, { AxiosError } from 'axios';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { RootStackParamList, ErrorResponse } from '../../types';
// import { StackNavigationProp } from '@react-navigation/stack';

// type HomeNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// const CartCheckout = () => {
//   const [address, setAddress] = useState('');
//   const [contact, setContact] = useState('');
//   const { user, logout } = useAuth();
//   const theme = useTheme();
//   const route = useRoute();
//   const navigation = useNavigation<HomeNavigationProp>();


//   const [loading, setLoading] = useState(false);
//   const [cartReset, setCartReset] = useState(false);
//   const [cartData, setCartData] = useState<{
//     bookingId: number;
//     service: 'cooking' | 'cleaning' | 'both';
//     slot: string;
//     type: number;
//     pricePerService: number;
//     cost: number;
//     name: string;
//   } | null>(null);


//   useEffect(() => {
//     if (route.params && !cartReset) {

//       const { bookingId, service, slot, type, pricePerService } = route.params as {
//         bookingId: number;
//         service: 'cooking' | 'cleaning' | 'both';
//         slot: string;
//         type: number;
//         pricePerService: number;
//       };

//       const maidName = (route.params as any).maid?.name || (route.params as any).name || 'Unknown Maid';


//       const daysCount = type === 3 ? 30 : (type === 1 || type === 2 ? 12 : 1);
//       const cost = pricePerService * daysCount;

//       setCartData({
//         bookingId,
//         service,
//         slot,
//         type,
//         pricePerService,
//         cost,
//         name: maidName
//       });
//     } else {
//       setCartData(null);
//     }
//   }, [route.params, cartReset]);

//   const token = user?.token;

//   const handleLogout = async () => {
//     await logout();
//   };

//   const handleConfirmPayment = async () => {
//     if (!cartData) return;

//     setLoading(true);
//     try {
//       const requestData = {
//         bookingId: cartData.bookingId,
//         service: cartData.service,
//         cost: cartData.cost,
//         userLocation: address,
//         userContact: contact,
//       };

//       await axios.post(
//         'https://maid-in-india-nglj.onrender.com/api/maid/confirm-booking',
//         requestData,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//         }
//       );


//       setCartReset(true);

//       Alert.alert('Success', 'Booking confirmed successfully!', [
//         {
//           text: 'OK',
//           onPress: () => {
//             navigation.navigate('Home', {
//               userName: user?.name || '',
//               email: user?.email || '',
//             });
//           },
//         },
//       ]);
//     } catch (error: unknown) {
//       console.error('Error confirming booking:', error);
//       if (axios.isAxiosError(error)) {
//         const axiosError = error as AxiosError<ErrorResponse>;
//         Alert.alert(
//           'Error',
//           axiosError.response?.data?.message || 'Failed to confirm booking.'
//         );
//       } else {
//         Alert.alert('Error', 'Failed to confirm booking.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };


//   if (!cartData) {
//     return (
//       <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyText}>No order found in your cart. Please add an order first.</Text>
//           <Button
//             mode="contained"
//             onPress={() => navigation.navigate('BookMaid')}
//             style={styles.goToOrderButton}
//           >
//             Go to Order
//           </Button>
//         </View>
//       </SafeAreaView>
//     );
//   }


//   const getTypeDisplay = (type: number): string => {
//     if (type === 1) return 'M-W-F';
//     if (type === 2) return 'T-Th-S';
//     if (type === 3) return 'Daily';
//     return 'Unknown';
//   };


//   return (

//     <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
//       {/* Header */}
//       <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
//         <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>Your Cart</Text>
//         <Button
//           mode="outlined"
//           onPress={handleLogout}
//           style={styles.logoutButton}
//           labelStyle={{ color: theme.colors.onPrimary }}
//         >
//           Sign Out
//         </Button>
//       </View>

//       {/* Main Content */}
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <Card style={styles.card}>
//           <Card.Title
//             title="Cart Checkout"
//             titleStyle={[styles.cardTitle, { color: theme.colors.primary }]}
//           />
//           <Divider />
//           <Card.Content>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Booking Id:</Text>
//               <Text style={styles.detailValue}>{cartData.bookingId}</Text>
//             </View>
//             {/* <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Name:</Text>
//               <Text style={styles.detailValue}>{cartData.name}</Text>
//             </View> */}
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Service:</Text>
//               <Text style={styles.detailValue}>{cartData.service}</Text>
//             </View>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Slot:</Text>
//               <Text style={styles.detailValue}>{cartData.slot}</Text>
//             </View>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Type:</Text>
//               <Text style={styles.detailValue}>{getTypeDisplay(cartData.type)}</Text>
//             </View>
//             <View style={styles.detailRow}>
//               <Text style={styles.detailLabel}>Cost Per Month:</Text>
//               <Text style={styles.detailValue}>{cartData.cost}/- INR</Text>
//             </View>
//             <TextInput
//               label="Enter Address"
//               value={address}
//               onChangeText={setAddress}
//               mode="outlined"
//               style={{ marginVertical: 10 }}
//             />
//             <TextInput
//               label="Enter Contact Number"
//               value={contact}
//               onChangeText={setContact}
//               mode="outlined"
//               style={{ marginVertical: 10 }}
//             />
//             <Button
//               mode="contained"
//               onPress={handleConfirmPayment}
//               loading={loading}
//               style={styles.confirmButton}
//             >
//               Confirm Payment
//             </Button>
//           </Card.Content>
//         </Card>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//     paddingTop: 60,
//     paddingBottom: 20,
//     elevation: 4,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   logoutButton: {
//     borderColor: '#ffffff',
//   },
//   scrollContent: {
//     padding: 16,
//     alignItems: 'center',
//   },
//   card: {
//     width: '100%',
//     borderRadius: 12,
//     elevation: 2,
//   },
//   cardTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//   },
//   detailRow: {
//     flexDirection: 'row',
//     marginVertical: 10,
//   },
//   detailLabel: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     flex: 0.5,
//   },
//   detailValue: {
//     fontSize: 18,
//     flex: 0.5,
//   },
//   confirmButton: {
//     marginTop: 30,
//     alignSelf: 'center',
//     width: '80%',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//   },
//   emptyText: {
//     fontSize: 18,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   goToOrderButton: {
//     width: '60%',
//   },
// });

// export default CartCheckout;

import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Divider, useTheme, TextInput, IconButton } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import axios, { AxiosError } from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList, ErrorResponse } from '../../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geocoder from 'react-native-geocoding';

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
  const [address, setAddress] = useState('');
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

  useEffect(() => {
    // Process the incoming booking if it exists
    if (route.params) {
      const { bookingId, service, slot, type, pricePerService } = route.params as {
        bookingId: number;
        service: 'cooking' | 'cleaning' | 'both';
        slot: string;
        type: number;
        pricePerService: number;
        contactNumber: string;
      };

      // Fetch contact number from params or AsyncStorage

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

      // Check if booking already exists in cart
      const existingBookingIndex = cartItems.findIndex(item => item.bookingId === bookingId);

      if (existingBookingIndex === -1) {
        // Add new booking to cart
        setCartItems(prevItems => [...prevItems, newBooking]);
      }
    }
  }, [route.params]);

  useEffect(() => {
    if (route.params?.contactNumber) {
      setContact(route.params.contactNumber);
    } else {
      // Try to get contact from user object in AsyncStorage
      AsyncStorage.getItem('user').then(storedUser => {
        if (storedUser) {
          try {
            const userObj = JSON.parse(storedUser);
            if (userObj.contact) setContact(userObj.contact);
            else if (userObj.contactNumber) setContact(userObj.contactNumber);
          } catch (e) {
            // fallback: do nothing
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
            // Split address into lines
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
  // Calculate total cost whenever cart items change
  useEffect(() => {
    const newTotal = cartItems.reduce((sum, item) => sum + item.cost, 0);
    setTotalCost(newTotal);
  }, [cartItems]);

  const token = user?.token;

  const handleLogout = async () => {
    await logout();
  };

  const handleRemoveItem = (bookingId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.bookingId !== bookingId));
  };

  const handleConfirmPayment = async () => {
    if (cartItems.length === 0) return;

    if (!address.trim() || !contact.trim()) {
      Alert.alert('Required Fields', 'Please fill in your address and contact information.');
      return;
    }

    const fullAddress = [addressLine1, addressLine2, addressLine3]
      .filter(line => line.trim() !== '')
      .join(', ');


    setLoading(true);
    try {
      // Make sequential requests for each booking
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

      // Clear cart after successful payment
      setCartItems([]);

      Alert.alert('Success', 'All bookings confirmed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Home');
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
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
            <Text style={styles.infoTitle}>Delivery Information</Text>
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
                  onPress={() => handleRemoveItem(item.bookingId)}
                  iconColor={theme.colors.error}
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    elevation: 4,
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
});

export default CartCheckout;