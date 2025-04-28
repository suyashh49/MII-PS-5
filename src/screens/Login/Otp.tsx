import React, { useState } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeMaid from '../Home/HomeScreenMaid'
import { useMaidAuth } from '../../hooks/useMaidauth';
type OtpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Otp'>;
type OtpScreenRouteProp = RouteProp<RootStackParamList, 'Otp'>;

export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState("");
  const navigation = useNavigation<OtpScreenNavigationProp>();
  const route = useRoute<OtpScreenRouteProp>();
  const { phone } = route.params;
  const theme = useTheme();
  const { loginMaid } = useMaidAuth();

  const verifyOTP = async () => {
    console.log("Verifying OTP for", phone);
    try {
      //
      const response = await axios.post<{ token: string }>('https://maid-in-india-nglj.onrender.com/api/maid/verify-otp', {
        contact: phone,
        otp: otp,
      });

      if (response.status === 200) {
        const { token } = response.data;
        await AsyncStorage.setItem('token', token);
        Alert.alert("OTP Verified! Logging in...");
        const maidResponse = await axios.get('https://maid-in-india-nglj.onrender.com/api/maid/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const maidData = maidResponse.data;

        //       await loginMaid(token, maidData);

        //       if (maidData.profileCreated === true) {
        //         navigation.navigate('HomeMaid', { name: maidData.name, govtId: maidData.govtId, imageUrl: maidData.imageUrl });
        //         return;
        //       }

        //       navigation.replace('MaidProfile');
        //     } else {
        //       Alert.alert("OTP Verification failed. Please try again.");
        //     }
        //   } catch (error) {
        //     console.error("Error verifying OTP:", error);
        //     Alert.alert("Error verifying OTP. Please try again.");
        //   }
        // };

        await loginMaid(token, maidData);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      Alert.alert("Error verifying OTP. Please try again.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>OTP Verification</Text>
      <TextInput
        style={[styles.input, { color: theme.colors.onBackground, borderBottomColor: theme.colors.primary }]}
        placeholder="Enter OTP"
        placeholderTextColor={theme.colors.onSurfaceVariant}
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
      />
      <Button
        mode="contained"
        onPress={verifyOTP}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        Verify OTP
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
  input: {
    borderBottomWidth: 1,
    width: 200,
    marginVertical: 10,
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