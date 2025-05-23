import React, { useState } from 'react';
import { StyleSheet, View, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Title, useTheme, IconButton } from 'react-native-paper';
import axios from 'axios';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import theme from '../../config/theme';

type FeedbackRouteProp = RouteProp<RootStackParamList, 'Feedback'>;

const Feedback = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { params } = useRoute<FeedbackRouteProp>();
  const { bookingId } = params; 
  const { user } = useAuth();
  
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('Error', 'Please enter your feedback.');
      return;
    }
    if (rating === 0) {
      Alert.alert('Error', 'Please provide a rating.');
      return;
    }
    setLoading(true);
    try {
      const storedToken = user?.token;
      await axios.post(
        'https://maid-in-india-nglj.onrender.com/api/maid/feedback',
        {
          bookingId,
          review: feedbackText,
          rating,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );
      Alert.alert(
        'Success', 
        'Feedback submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'There was an error submitting your feedback.');
    } finally {
      setLoading(false);
    }
  };

  
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <IconButton
          key={i}
          icon={i <= rating ? 'star' : 'star-outline'}
          iconColor="gold"
          size={30}
          onPress={() => setRating(i)}
        />
      );
    }
    return <View style={styles.starContainer}>{stars}</View>;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <IconButton
          icon="arrow-left"
          iconColor={theme.colors.onPrimary}
          size={28}
          onPress={() => navigation.goBack()}
        />
        <Title style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
          Feedback
        </Title>
      </View>

      <View style={styles.content}>
        {/* <Title style={[styles.title, { color: theme.colors.primary }]}>
          Give Feedback for {bookingId}
        </Title> */}
        {/* <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          Booking ID: {bookingId}
        </Text> */}
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          Your Rating:
        </Text>
        {renderStars()}
        <TextInput
          label="Your Feedback"
          mode="outlined"
          value={feedbackText}
          onChangeText={setFeedbackText}
          style={styles.input}
          multiline
          numberOfLines={4}
          placeholder="Enter your feedback here..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 0.85,
    textAlign: 'center',
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
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: theme.colors.surface,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default Feedback;
