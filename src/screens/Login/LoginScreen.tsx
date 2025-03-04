// src/screens/Login/LoginScreen.tsx
import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';

const LoginScreen = () => {
  const { login, isLoading } = useAuth();

  const handleGoogleSignIn = async () => {
    await login();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sign in</Text>
      <Text style={styles.subheader}>Use your Google Account</Text>
      
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#4285F4" />
          ) : (
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Image
                source={require('../../assets/google-icon.png')} // Add Google logo image to assets
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>
      
      <Text style={styles.privacyText}>
        By continuing, you agree to our terms of service and privacy policy.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#202124',
    alignSelf: 'flex-start',
  },
  subheader: {
    fontSize: 16,
    marginBottom: 32,
    color: '#5F6368',
    alignSelf: 'flex-start',
  },
  card: {
    width: '100%',
    borderRadius: 12,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dadce0',
    width: '100%',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#202124',
    fontWeight: '500',
  },
  privacyText: {
    marginTop: 24,
    fontSize: 14,
    color: '#5F6368',
    textAlign: 'center',
  },
});

export default LoginScreen;