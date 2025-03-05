import { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OtpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Otp'>;
type OtpScreenRouteProp = RouteProp<RootStackParamList, 'Otp'>;

export default function OTPVerificationScreen() {
    const [otp, setOtp] = useState("");
    const navigation = useNavigation<OtpScreenNavigationProp>();
    const route = useRoute<OtpScreenRouteProp>();
    const { phone } = route.params;
  
    const verifyOTP = async () => {
      console.log("Verifying OTP for", phone);
      try {
        const response = await axios.post<{ token: string }>('http://192.168.193.5:5000/api/maid/verify-otp', {
          contact: phone,
          otp: otp,
        });
  
        if (response.status === 200) {
          const { token } = response.data;
          await AsyncStorage.setItem('token', token);
          Alert.alert("OTP Verified! Logging in...");
          navigation.replace('MaidProfile');
        } else {
          Alert.alert("OTP Verification failed. Please try again.");
        }
      } catch (error) {
        console.error("Error verifying OTP:", error);
        Alert.alert("Error verifying OTP. Please try again.");
      }
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>OTP Verification</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          keyboardType="numeric"
          value={otp}
          onChangeText={setOtp}
        />
        <Button title="Verify OTP" onPress={verifyOTP} />
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
    },
    input: {
      borderBottomWidth: 1,
      width: 200,
      marginVertical: 10,
      textAlign: 'center',
    },
  });