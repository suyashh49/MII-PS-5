import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Divider, useTheme } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import axios, { AxiosError } from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList, ErrorResponse } from '../../types';
import { StackNavigationProp } from '@react-navigation/stack';

type HomeNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const CartCheckout = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const route = useRoute();
  // Call useNavigation once at the top level with proper typing
  const navigation = useNavigation<HomeNavigationProp>();

  const { bookingId, service, slot, type, cost } = route.params as { 
    bookingId: number; 
    service: 'cooking' | 'cleaning' | 'both'; 
    slot: string; 
    type: number; 
    cost:number;
  };
  const [loading, setLoading] = useState(false);
  const token = user?.token;

  const handleLogout = async () => {
    await logout();
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const requestData = { bookingId, service };
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
      Alert.alert('Success', 'Booking confirmed successfully!', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('Home', {
              userName: user?.name || '',
              email: user?.email || '',
            }),
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
              <Text style={styles.detailValue}>{bookingId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service:</Text>
              <Text style={styles.detailValue}>{service}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Slot:</Text>
              <Text style={styles.detailValue}>{slot}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>{type}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Cost</Text>
              <Text style={styles.detailValue}>{cost}</Text>
            </View>
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
});

export default CartCheckout;
