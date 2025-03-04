import { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login_Maid'>;

export default function LoginScreenMaid() {
  const [phone, setPhone] = useState("");
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleGetStarted = () => {
    console.log("Sending OTP to", phone);
    alert(`OTP sent to ${phone}`);
    navigation.navigate('Otp', { phone });
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20 }}>Enter your phone number</Text>
      <TextInput
        style={{ borderBottomWidth: 1, width: 200, marginVertical: 10, textAlign: "center" }}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
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
  buttonContainer: {
    marginTop: 32,
    width: "100%",
    marginBottom: 48,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 4,
    elevation: 2,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});