import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminMaidsStackParamList } from '../../navigation/AdminMaidsStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../../hooks/useAuth';
import { IconButton, Menu } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { useIsFocused } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
type AllMaidsNavProp = StackNavigationProp<AdminMaidsStackParamList, 'AllMaids'>;

interface Props {
  navigation: AllMaidsNavProp;
}

interface Maid {
  maidId: number;
  name: string;
  contact: string;
}

export default function AllMaidsScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [maids, setMaids] = useState<Maid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const handleLogout = async () => {
    await logout();
  };
  // Load token once, then fetch maids
  useEffect(() => {
    (async () => {
      try {
        // 1️⃣ Load the stored user object
        const rawUser = await AsyncStorage.getItem('user');
        if (!rawUser) {
          console.warn('No user in AsyncStorage');
          setLoading(false);
          return;
        }
  
        // 2️⃣ Parse & extract token
        let authToken = '';
        try {
          const userObj = JSON.parse(rawUser);
          authToken = userObj.token ?? '';
        } catch {
          console.error('Failed to parse user JSON:', rawUser);
          setLoading(false);
          return;
        }
  
        if (!authToken) {
          console.warn('No token found in user object');
          setLoading(false);
          return;
        }
  
        setToken(authToken);
  
        // 3️⃣ Fetch maids with the real token
        const res = await axios.get(
          'https://maid-in-india-nglj.onrender.com/api/worker/get-all-maids',
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setMaids(res.data);
      } catch (err) {
        console.error('Error fetching maids:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Put logout menu in header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => setMenuVisible(true)}
              iconColor='white'
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleLogout();
            }}
            title="Logout"
            leadingIcon="logout"
          />
        </Menu>
      ),
    });
  }, [navigation, menuVisible, logout]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1368A4"/></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={maids}
        keyExtractor={item => item.maidId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('MaidFeedback', { maidId: item.maidId })}
          >
            <Text>{item.name}</Text>
            <Text>{item.contact}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f7f7f7' },
    list: { padding: 16 },
    item: {
      padding: 12,
      backgroundColor: '#fff',
      marginBottom: 12,
      borderRadius: 8,
    },
    comment: { fontSize: 14, marginBottom: 4 },
    rating: { fontSize: 12, color: '#666' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  })