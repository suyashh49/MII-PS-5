import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text, Button, Card, Divider, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

type HomeScreenMaidRouteProp = RouteProp<RootStackParamList, 'HomeMaid'>;
type HomeScreenMaidNavigationProp = StackNavigationProp<RootStackParamList, 'HomeMaid'>;

const HomeScreenMaid = () => {
  const route = useRoute<HomeScreenMaidRouteProp>();
  const navigation = useNavigation<HomeScreenMaidNavigationProp>();
  const { name, govtId, imageUrl } = route.params;
  const theme = useTheme();

  const handleSignOut = () => {
    // Add any sign-out logic if needed then navigate to the Welcome screen.
    navigation.navigate('Welcome');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.welcomeText, { color: theme.colors.onPrimary }]}>
          Welcome, {name}!
        </Text>
        <Button 
          mode="outlined" 
          onPress={handleSignOut}
          style={styles.logoutButton}
          labelStyle={{ color: theme.colors.onPrimary }}
        >
          Sign Out
        </Button>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Card style={styles.profileCard}>
          <Card.Title 
            title="Government ID Photo" 
            titleStyle={{ color: theme.colors.onBackground }} 
          />
          <Divider />
          <Card.Content style={styles.cardContent}>
            {govtId ? (
              <Image source={{ uri: govtId }} style={styles.image} />
            ) : (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                No ID photo available.
              </Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.profileCard}>
          <Card.Title 
            title="Your Photo" 
            titleStyle={{ color: theme.colors.onBackground }} 
          />
          <Divider />
          <Card.Content style={styles.cardContent}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} />
            ) : (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                No photo available.
              </Text>
            )}
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
  cardContent: {
    alignItems: 'center',
    padding: 16,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
});

export default HomeScreenMaid;
