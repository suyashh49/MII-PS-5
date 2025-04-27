import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import PhoneInput from 'react-native-phone-number-input';
import axios from 'axios';
import { LogBox } from 'react-native';
import theme from '../../config/theme';

LogBox.ignoreLogs([
  'CountryItem: Support for defaultProps will be removed',
]);

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login_Maid'>;

export default function LoginScreenMaid() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [formattedValue, setFormattedValue] = useState('');
  const [valid, setValid] = useState(false);
  const phoneInput = useRef<PhoneInput>(null);

  const navigation = useNavigation<LoginScreenNavigationProp>();
  const theme = useTheme();

  const handleGetStarted = async () => {
    const checkValid = phoneInput.current?.isValidNumber(phoneNumber);
    setValid(checkValid || false);

    // Regex for Indian phone number (10 digits, starts with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!checkValid || !phoneRegex.test(phoneNumber)) {
      alert('Please enter a valid phone number');
      return;
    }

    console.log("Sending OTP to", formattedValue);
    try {
      await axios.post('https://maid-in-india-nglj.onrender.com/api/maid/send-otp', { contact: formattedValue });
      alert(`OTP sent to ${formattedValue}`);
      navigation.navigate('Otp', { phone: formattedValue });
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

      <PhoneInput
        ref={phoneInput}
        defaultValue={phoneNumber}
        defaultCode="IN"
        layout="first"
        onChangeText={(text) => {

          if (text.length <= 10) {
            setPhoneNumber(text);
          }
        }}
        onChangeFormattedText={(text) => {
          setFormattedValue(text);
          setCountryCode(phoneInput.current?.getCallingCode() || '+91');
        }}
        withDarkTheme={theme.dark}
        withShadow
        autoFocus
        containerStyle={styles.phoneInputContainer}
        textContainerStyle={styles.phoneInputTextContainer}
        textInputStyle={{ color: theme.colors.onBackground }}
        textInputProps={{
          keyboardType: "number-pad",
          maxLength: 10,
          placeholder: "Enter phone number",
          placeholderTextColor: theme.colors.onSurfaceVariant,
        }}
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
  phoneInputContainer: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 25,
    backgroundColor: theme.colors.background,
  },
  phoneInputTextContainer: {
    borderRadius: 20,
    backgroundColor: 'transparent',
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