import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Button, Card, Avatar, Divider, useTheme } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  route: HomeScreenRouteProp;
}

const HomeScreen = ({ route }: HomeScreenProps) => {
  const { userName, email } = route.params;
  const { user, logout } = useAuth();
  const photoUrl = user?.photoUrl || '';
  const theme = useTheme();

  const handleLogout = async () => {
    await logout();
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
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Account Type:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.onBackground }]}>Google</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.activityCard}>
          <Card.Title title="Recent Activity" titleStyle={{ color: theme.colors.onBackground }} />
          <Divider />
          <Card.Content style={styles.activityCardContent}>
            <Text style={[styles.activityText, { color: theme.colors.onBackground }]}>You signed in just now</Text>
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
});

export default HomeScreen;

