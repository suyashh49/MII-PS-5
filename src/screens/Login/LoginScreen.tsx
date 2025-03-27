import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, useTheme } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';

const LoginScreen = () => {
  const { login, isLoading } = useAuth();
  const theme = useTheme();

  const handleGoogleSignIn = async () => {
    await login();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.onBackground }]}>Sign in</Text>
      <Text style={[styles.subheader, { color: theme.colors.onSurfaceVariant }]}>Use your Google Account</Text>
      
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <TouchableOpacity
              style={[styles.googleButton, { borderColor: theme.colors.outline }]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Image
                source={require('../../assets/google-icon.png')} // Add Google logo image to assets
                style={styles.googleIcon}
              />
              <Text style={[styles.googleButtonText, { color: '#000000' }]}>Sign in with Google</Text>
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>
      
      <Text style={[styles.privacyText, { color: theme.colors.onSurfaceVariant }]}>
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
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    alignSelf: 'center',
  },
  subheader: {
    fontSize: 16,
    marginBottom: 32,
    alignSelf: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 40,
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
    borderRadius: 24,
    borderWidth: 1,
    width: '100%',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  privacyText: {
    marginTop: 24,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoginScreen;