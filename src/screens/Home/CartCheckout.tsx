import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Button, Card, Avatar, Divider, useTheme } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';

const CartCheckout = () => {
  const { user, logout } = useAuth();
  const photoUrl = user?.photoUrl || '';
  const theme = useTheme();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.welcomeText, { color: theme.colors.onPrimary }]}>Your Cart</Text>
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
       

        <Card style={styles.infoCard}>
          <Card.Title title="Cart Items" titleStyle={{ color: theme.colors.onBackground }} />
          <Divider />
          <Card.Content style={styles.infoCardContent}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Item 1:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.onBackground }]}>Details</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Item 2:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.onBackground }]}>Details</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Item 3:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.onBackground }]}>Details</Text>
            </View>
          </Card.Content>
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
});

export default CartCheckout;