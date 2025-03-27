import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import axios from 'axios';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login_Maid'>;

export default function LoginScreenMaid() {
  // Set initial value to include +91 prefix
  const [phone, setPhone] = useState("+91");
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const theme = useTheme();

  const handleGetStarted = async () => {
    console.log("Sending OTP to", phone);
    try {
      await axios.post('https://maid-in-india-nglj.onrender.com/api/maid/send-otp', { contact: phone });
      alert(`OTP sent to ${phone}`);
      navigation.navigate('Otp', { phone });
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Please try again.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.onBackground }]}>
        Enter your phone number
      </Text>
      <TextInput
        style={[
          styles.input,
          { color: theme.colors.onBackground, borderBottomColor: theme.colors.primary }
        ]}
        placeholder="Phone Number"
        placeholderTextColor={theme.colors.onSurfaceVariant}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(text) => setPhone(text)}
      />
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleGetStarted}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Send OTP
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    borderBottomWidth: 1,
    width: 200,
    marginVertical: 10,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 32,
    width: "100%",
    marginBottom: 48,
    alignItems: "center",
  },
  button: {
    width: '90%',
    borderRadius: 30,
    //marginTop: 5,
    paddingVertical: 2,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    textTransform: 'none',
    fontWeight: 'bold',
  },
});