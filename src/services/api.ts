// src/services/api.ts
import { User } from '../types';

// Replace with your actual backend URL
const API_URL = 'https://maid-in-india-nglj.onrender.com'; // 10.0.2.2 points to localhost on Android emulator

/**
 * Store user information in the Node.js backend
 */
export const storeUserInBackend = async (user: User): Promise<void> => {
  try {
    //
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: user.name,
        email: user.email
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to store user data');
    }

    const data = await response.json();
    console.log('User data stored successfully:', data);
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};