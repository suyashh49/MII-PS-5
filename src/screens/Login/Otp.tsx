import React, { useRef, useState } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMaidAuth } from '../../hooks/useMaidauth';
import i18n from '../../locales/i18n'; 
import { useTranslation } from 'react-i18next';

type OtpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Otp'>;
type OtpScreenRouteProp = RouteProp<RootStackParamList, 'Otp'>;

export default function OTPVerificationScreen() {
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const navigation = useNavigation<OtpScreenNavigationProp>();
  const route = useRoute<OtpScreenRouteProp>();
  const { phone } = route.params;
  const theme = useTheme();
  const { loginMaid } = useMaidAuth();
  const { t } = useTranslation();

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    const newOtpArray = [...otpArray];
    newOtpArray[index] = value;
    setOtpArray(newOtpArray);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async () => {
    const otp = otpArray.join('');
    if (otp.length < 6) {
      Alert.alert(t('error'), t('enter_otp'));
      return;
    }
    try {
      const response = await axios.post<{ token: string }>('https://maid-in-india-nglj.onrender.com/api/maid/verify-otp', {
        contact: phone,
        otp: otp,
      });

      if (response.status === 200) {
        const { token } = response.data;
        await AsyncStorage.setItem('token', token);
        Alert.alert(t('success'), t('otp_verified'));
        
        const maidResponse = await axios.get('https://maid-in-india-nglj.onrender.com/api/maid/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const maidData = maidResponse.data;

        await loginMaid(token, maidData);
        // navigation logic...
      }
    } catch (error) {
      console.error(t('otp_error'), error);
      Alert.alert(t('error'), t('error_verify_otp'));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        {t('otp_verification')}
      </Text>
      <View style={styles.otpContainer}>
        {otpArray.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={ref => (inputRefs.current[idx] = ref)}
            style={[
              styles.otpInput,
              { 
                color: theme.colors.onBackground, 
                borderBottomColor: theme.colors.primary 
              }
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={value => handleOtpChange(value, idx)}
            onKeyPress={e => handleKeyPress(e, idx)}
            autoFocus={idx === 0}
            placeholder="•"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            textAlign="center"
          />
        ))}
      </View>
      <Button
        mode="contained"
        onPress={verifyOTP}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {t('verify_otp')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  otpInput: {
    borderBottomWidth: 2,
    width: 36,
    height: 48,
    fontSize: 24,
    marginHorizontal: 4,
    textAlign: 'center',
  },
  button: {
    width: '90%',
    borderRadius: 30,
    marginTop: 32,
    marginBottom: 48,
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