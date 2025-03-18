import React, { useState } from 'react';
import { StyleSheet, View, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Title, useTheme } from 'react-native-paper';
import axios from 'axios';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

type FeedbackRouteProp = RouteProp<RootStackParamList, 'Feedback'>;

const Feedback = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { params } = useRoute<FeedbackRouteProp>();
  const { bookingId } = params;

  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('Error', 'Please enter your feedback.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('https://maid-in-india-nglj.onrender.com/api/maid/feedback', {
        bookingId, // send the booking id
        feedback: feedbackText,
      });
      Alert.alert('Success', 'Feedback submitted successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'There was an error submitting your feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <Title style={[styles.title, { color: 'blue' }]}>Give Feedback</Title>
        <Text style={[styles.label, { color: 'blue' }]}>
          Booking ID: {bookingId}
        </Text>
        <TextInput
          label="Your Feedback"
          mode="outlined"
          value={feedbackText}
          onChangeText={setFeedbackText}
          style={styles.input}
          multiline
          numberOfLines={4}
          placeholder="Enter your feedback here..."
          placeholderTextColor="grey"
        />
        <Button
          mode="contained"
          onPress={handleSubmitFeedback}
          loading={loading}
          style={styles.button}
        >
          Submit Feedback
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default Feedback;