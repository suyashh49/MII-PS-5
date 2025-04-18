import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Divider, useTheme, TextInput } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import axios, { AxiosError } from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList, ErrorResponse } from '../../types';
import { StackNavigationProp } from '@react-navigation/stack';

type HomeNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const CartCheckout = () => {
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const { user, logout } = useAuth();
  const theme = useTheme();
  const route = useRoute();
  const navigation = useNavigation<HomeNavigationProp>();

  // Define all state hooks at the top level of the component
  const [loading, setLoading] = useState(false);
  const [cartReset, setCartReset] = useState(false);
  const [cartData, setCartData] = useState<{
    bookingId: number;
    service: 'cooking' | 'cleaning' | 'both';
    slot: string;
    type: number;
    pricePerService: number;
    cost: number;
    name: string;
  } | null>(null);

  // Use useEffect to process route params after component mounts
  useEffect(() => {
    if (route.params && !cartReset) {
      // Extract parameters. If a maid object is passed, use its name.
      const { bookingId, service, slot, type, pricePerService } = route.params as {
        bookingId: number;
        service: 'cooking' | 'cleaning' | 'both';
        slot: string;
        type: number;
        pricePerService: number;
      };
      // Use the maid's name if available; otherwise fall back to a provided name property.
      const maidName = (route.params as any).maid?.name || (route.params as any).name || 'Unknown Maid';

      // Calculate total cost based on booking type
      const daysCount = type === 3 ? 30 : (type === 1 || type === 2 ? 12 : 1);
      const cost = pricePerService * daysCount;

      setCartData({
        bookingId,
        service,
        slot,
        type,
        pricePerService,
        cost,
        name: maidName
      });
    } else {
      setCartData(null);
    }
  }, [route.params, cartReset]);

  const token = user?.token;

  const handleLogout = async () => {
    await logout();
  };

  const handleConfirmPayment = async () => {
    if (!cartData) return;

    setLoading(true);
    try {
      const requestData = {
        bookingId: cartData.bookingId,
        service: cartData.service,
        cost: cartData.cost,
        userLocation: address,
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

      // Reset the cart
      setCartReset(true);

      Alert.alert('Success', 'Booking confirmed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Home', {
              userName: user?.name || '',
              email: user?.email || '',
            });
          },
        },
      ]);
    } catch (error: unknown) {
      console.error('Error confirming booking:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        Alert.alert(
          'Error',
          axiosError.response?.data?.message || 'Failed to confirm booking.'
        );
      } else {
        Alert.alert('Error', 'Failed to confirm booking.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Render empty cart view
  if (!cartData) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No order found in your cart. Please add an order first.</Text>
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

  // Helper to convert booking type number to display string.
  const getTypeDisplay = (type: number): string => {
    if (type === 1) return 'M-W-F';
    if (type === 2) return 'T-Th-S';
    if (type === 3) return 'Daily';
    return 'Unknown';
  };

  // Render cart with data
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
        <Card style={styles.card}>
          <Card.Title
            title="Cart Checkout"
            titleStyle={[styles.cardTitle, { color: theme.colors.primary }]}
          />
          <Divider />
          <Card.Content>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booking Id:</Text>
              <Text style={styles.detailValue}>{cartData.bookingId}</Text>
            </View>
            {/* <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{cartData.name}</Text>
            </View> */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service:</Text>
              <Text style={styles.detailValue}>{cartData.service}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Slot:</Text>
              <Text style={styles.detailValue}>{cartData.slot}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>{getTypeDisplay(cartData.type)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cost Per Month:</Text>
              <Text style={styles.detailValue}>{cartData.cost}/- INR</Text>
            </View>
            <TextInput
              label="Enter Address"
              value={address}
              onChangeText={setAddress}
              mode="outlined"
              style={{ marginVertical: 10 }}
            />
            <TextInput
              label="Enter Contact Number"
              value={contact}
              onChangeText={setContact}
              mode="outlined"
              style={{ marginVertical: 10 }}
            />
            <Button
              mode="contained"
              onPress={handleConfirmPayment}
              loading={loading}
              style={styles.confirmButton}
            >
              Confirm Payment
            </Button>
          </Card.Content>
        </Card>
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
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 0.5,
  },
  detailValue: {
    fontSize: 18,
    flex: 0.5,
  },
  confirmButton: {
    marginTop: 30,
    alignSelf: 'center',
    width: '80%',
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
