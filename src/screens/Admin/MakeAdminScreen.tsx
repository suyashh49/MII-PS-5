import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_BASE_URL = 'https://maid-in-india-nglj.onrender.com/api'

export default function MakeAdminScreen() {
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [token, setToken] = useState<string>('')

  // Load auth token once on mount
  useEffect(() => {
    ;(async () => {
      try {
        const rawUser = await AsyncStorage.getItem('user')
        if (rawUser) {
          const userObj = JSON.parse(rawUser)
          setToken(userObj.token || '')
        }
      } catch (e) {
        console.error('Error loading auth token:', e)
      }
    })()
  }, [])

  const handleMakeAdmin = async () => {
    if (!email.trim()) {
      Alert.alert('Validation', 'Please enter an email address.')
      return
    }
    if (!token) {
      Alert.alert('Authentication', 'No auth token available.')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(
        `${API_BASE_URL}/worker/make-admin`,
        { email: email.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      Alert.alert('Success', res.data.message || 'User has been granted admin rights.')
      setEmail('')
    } catch (err: any) {
      console.error('Error making admin:', err)
      Alert.alert('Error', err.response?.data?.message || 'Failed to make admin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>User Email:</Text>
      <TextInput
        style={styles.input}
        placeholder="user@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleMakeAdmin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Make Admin</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
