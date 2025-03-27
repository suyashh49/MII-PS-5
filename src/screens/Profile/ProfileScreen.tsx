import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Button, useTheme, Card, Divider, Avatar, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const theme = useTheme();

  const handleGetStarted1 = () => {
    navigation.navigate('Login');
  };

  const handleGetStarted2 = () => {
    navigation.navigate('Login_Maid');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Choose your role
        </Text>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            <Avatar.Icon size={64} icon="account" color={theme.colors.onSurface} style={{ backgroundColor: theme.colors.surfaceVariant }} />
            <View style={styles.cardInfo}>
              <Text style={[styles.roleTitle, { color: theme.colors.onBackground }]}>User Login</Text>
              <Text style={[styles.roleDesc, { color: theme.colors.onSurfaceVariant }]}>Access all customer features</Text>
              <Button mode="contained" onPress={handleGetStarted1} style={styles.button} labelStyle={{ color: theme.colors.onPrimary }}>
                Login as User
              </Button>
            </View>
          </Card.Content>
        </Card>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, marginTop: 20 }]}>
          <Card.Content style={styles.cardContent}>
            <Avatar.Icon size={64} icon="account-tie" color={theme.colors.onSurface} style={{ backgroundColor: theme.colors.surfaceVariant }} />
            <View style={styles.cardInfo}>
              <Text style={[styles.roleTitle, { color: theme.colors.onBackground }]}>Maid Login</Text>
              <Text style={[styles.roleDesc, { color: theme.colors.onSurfaceVariant }]}>Access maid-specific features</Text>
              <Button mode="contained" onPress={handleGetStarted2} style={styles.button} labelStyle={{ color: theme.colors.onPrimary }}>
                Login as Maid
              </Button>
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
    
    padding: 10,
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 230,
    marginBottom: 30,
    fontWeight: "bold",
  },
  card: {
    width: "100%",
    borderRadius: 12,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardInfo: {
    marginLeft: 16,
    flex: 1,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  roleDesc: {
    fontSize: 14,
    marginVertical: 4,
  },
  button: {
    marginTop: 12,
    borderRadius: 24,
    paddingVertical: 4,
  },
});

export default ProfileScreen;