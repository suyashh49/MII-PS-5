import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useLocalSearchParams } from "expo-router";

type OtpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Otp'>;

export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState("");
  const navigation = useNavigation<OtpScreenNavigationProp>();
  const { phone } = useLocalSearchParams();

  const verifyOTP = () => {
    console.log("Verifying OTP for", phone);
    alert("OTP Verified! Logging in...");
    navigation.replace('MaidProfile');
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20 }}>Enter OTP</Text>
      <TextInput
        style={{ borderBottomWidth: 1, width: 100, marginVertical: 10, textAlign: "center" }}
        placeholder="OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
      />
      <Button title="Verify OTP" onPress={verifyOTP} />
    </View>
  );
}