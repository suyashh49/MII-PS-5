import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Agenda as RawAgenda } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList, Booking } from '../../types';
import theme from '../../config/theme';

const Agenda = RawAgenda as unknown as React.ComponentType<any>;
const Tab = createBottomTabNavigator();

type HomeScreenMaidRouteProp = RouteProp<RootStackParamList, 'HomeMaid'>;
type HomeScreenMaidNavigationProp = any;

// Time slots available for selection
const timeSlots = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

const HomeScreenMaid: React.FC = () => {
  const route = useRoute<HomeScreenMaidRouteProp>();
  const navigation = useNavigation<HomeScreenMaidNavigationProp>();
  const { name } = route.params;
  const theme = useTheme();

  // Token and bookings state
  const [maidToken, setMaidToken] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [items, setItems] = useState<{ [date: string]: any[] }>({});

  useEffect(() => {
    AsyncStorage.getItem('token')
      .then(t => setMaidToken(t))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!maidToken) return;
    axios.get(
      'https://maid-in-india-nglj.onrender.com/api/worker/schedule',
      { headers: { Authorization: `Bearer ${maidToken}` } }
    )
      .then(res => setBookings(res.data))
      .catch(() => Alert.alert('Error', 'Failed to load bookings.'));
  }, [maidToken]);

  const getLocalDateString = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const generateCalendarItems = useCallback(() => {
    const today = new Date();
    const newItems: { [date: string]: any[] } = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      newItems[getLocalDateString(d)] = [];
    }
    bookings.forEach(b => {
      Object.keys(b.slot).forEach(dayName => {
        for (let i = 0; i < 30; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          if (d.toLocaleDateString('en-US', { weekday: 'long' }) === dayName) {
            const key = getLocalDateString(d);
            newItems[key].push({
              name: `Booking for ${b.userName}`,
              time: b.slot[dayName],
              location: b.userLocation,
              userContact: b.userContact,
            });
          }
        }
      });
    });
    setItems(newItems);
  }, [bookings]);

  useEffect(() => { generateCalendarItems(); }, [bookings, generateCalendarItems]);

  const renderItem = (item: any) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>Time: {item.time}</Text>
      <Text style={styles.itemText}>Location: {item.location || 'N/A'}</Text>
      <Text style={styles.itemText}>Contact: {item.userContact}</Text>
    </View>
  );

  const handleSignOut = () => navigation.navigate('Welcome');

  // Services Dropdown Component
  const ServicesDropdown = ({ 
    cleaning, 
    cooking,
    onServiceChange
  }: { 
    cleaning: boolean,
    cooking: boolean,
    onServiceChange: (service: 'cleaning' | 'cooking', value: boolean) => void 
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const theme = useTheme();

    // Get selected services text for display
    const getSelectedServicesText = () => {
      const selected = [];
      if (cleaning) selected.push('Cleaning');
      if (cooking) selected.push('Cooking');
      return selected.length > 0 ? selected.join(', ') : 'Select services';
    };

    return (
      <View style={styles.servicesContainer}>
        <Text style={styles.sectionTitle}>Services</Text>
        <TouchableOpacity 
          style={[styles.dropdownHeader, isOpen && styles.dropdownHeaderOpen]}
          onPress={() => setIsOpen(!isOpen)}
        >
          <Text style={styles.dropdownHeaderText}>
            {getSelectedServicesText()}
          </Text>
          <MaterialCommunityIcons 
            name={isOpen ? "chevron-up" : "chevron-down"} 
            size={24} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
        
        {isOpen && (
          <View style={styles.dropdownList}>
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => onServiceChange('cleaning', !cleaning)}
            >
              <MaterialCommunityIcons 
                name={cleaning ? "checkbox-marked" : "checkbox-blank-outline"} 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text style={styles.dropdownItemText}>Cleaning</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => onServiceChange('cooking', !cooking)}
            >
              <MaterialCommunityIcons 
                name={cooking ? "checkbox-marked" : "checkbox-blank-outline"} 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text style={styles.dropdownItemText}>Cooking</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Editable Profile Route
  const ProfileRoute = () => {
    const [profile, setProfile] = useState<any>({
      name: '', 
      gender: 'Male', 
      location: '', 
      govtId: '',
      timeAvailable: {}, 
      selectedTimeSlots: [], // For UI management
      cleaning: false,      // Boolean for cleaning service
      cooking: false,       // Boolean for cooking service
      pricePerService: '',
      contact: ''
    });
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
      AsyncStorage.getItem('token')
        .then(token => {
          if (!token) throw new Error('No token');
          return axios.get(
            'https://maid-in-india-nglj.onrender.com/api/maid/profile',
            { headers: { Authorization: `Bearer ${maidToken}` } }
          );
        })
        .then(res => {
          const data = res.data;
          console.log('Profile data:', data);
          const {
            name = '',
            gender = 'Male',
            contact = '',
            timeAvailable = {},
            cleaning = false,
            cooking = false,
            pricePerService = ''
          } = data || {};

          // Extract time slots from timeAvailable structure
          let selectedTimeSlots: string[] = [];
          if (timeAvailable && typeof timeAvailable === 'object' && Object.keys(timeAvailable).length > 0) {
            // Get time slots from the first day that has them
            const firstDayWithSlots = Object.keys(timeAvailable).find(day => 
              Array.isArray(timeAvailable[day]) && timeAvailable[day].length > 0
            );
            
            if (firstDayWithSlots) {
              selectedTimeSlots = [...timeAvailable[firstDayWithSlots]];
            }
          }

          setProfile({
            name,
            gender,
            contact,
            timeAvailable,
            selectedTimeSlots,
            cleaning: Boolean(cleaning),
            cooking: Boolean(cooking),
            pricePerService: pricePerService.toString()
          });
        })
        .catch(() => Alert.alert('Error', 'Failed to load profile'))
        .finally(() => setLoading(false));
    }, [maidToken]);

    const handleTimeSlotChange = (time: string) => {
      const updatedTimeSlots = profile.selectedTimeSlots.includes(time)
        ? profile.selectedTimeSlots.filter((t: string) => t !== time)
        : [...profile.selectedTimeSlots, time];
      
      // Update the profile state with new time slots
      setProfile({
        ...profile,
        selectedTimeSlots: updatedTimeSlots
      });
    };

    const handleServiceChange = (service: 'cleaning' | 'cooking', value: boolean) => {
      setProfile({
        ...profile,
        [service]: value
      });
    };

    const handleSave = () => {
      AsyncStorage.getItem('token')
        .then(token => {
          if (!token) throw new Error('No token');
          
          // Create timeAvailable object with the selected time slots for all days
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const timeAvailable = days.reduce((acc, day) => {
            acc[day] = profile.selectedTimeSlots;
            return acc;
          }, {} as { [key: string]: string[] });
          
          // Pass boolean values directly as expected by the backend
          const body = {
            name: profile.name,
            contact: profile.contact,
            timeAvailable,
            cleaning: profile.cleaning,
            cooking: profile.cooking,
            pricePerService: profile.pricePerService,
          };
          
          return axios.put(
            'https://maid-in-india-nglj.onrender.com/api/maid/profile',
            body,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        })
        .then(() => Alert.alert('Success', 'Profile updated'))
        .catch(() => Alert.alert('Error', 'Failed to update profile'));
    };

    if (loading) {
      return <View style={styles.center}><Text>Loading...</Text></View>;
    }

    return (
      <ScrollView contentContainerStyle={styles.formContainer}>
        <TextInput
          label="Name"
          value={profile.name}
          onChangeText={text => setProfile({ ...profile, name: text })}
          style={styles.input}
        />
        <TextInput
          label="Contact Number"
          value={profile.contact}
          onChangeText={text => {
            // Allow only "+91" followed by up to 10 digits
            if (/^\+91\d{0,10}$/.test(text) || text === '') {
              setProfile({ ...profile, contact: text });
            }
          }}
          style={styles.input}
          placeholder="+911234567890"
          keyboardType="phone-pad"
          maxLength={13} // +91 plus 10 digits
        />
        
        {/* Time Available Picker */}
        <Text style={styles.sectionTitle}>Time Available</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue=""
            onValueChange={(time) => {
              if (time) {
                handleTimeSlotChange(time);
              }
            }}
            style={styles.picker}
          >
            <Picker.Item label="Select time slots" value="" />
            {timeSlots.map((time) => (
              <Picker.Item key={time} label={time} value={time} />
            ))}
          </Picker>
        </View>
        
        {/* Selected Time Slots Display */}
        <View style={styles.selectedTimes}>
          {profile.selectedTimeSlots.map((time: string, index: number) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.selectedTime, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleTimeSlotChange(time)}
            >
              <Text style={{ color: theme.colors.onPrimary }}>{time}</Text>
              <MaterialCommunityIcons name="close" size={14} color={theme.colors.onPrimary} style={styles.closeIcon} />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Services Multi-select Dropdown */}
        <ServicesDropdown 
          cleaning={profile.cleaning}
          cooking={profile.cooking}
          onServiceChange={handleServiceChange}
        />
        
        <TextInput
          label="Price for Service"
          keyboardType="numeric"
          value={profile.pricePerService}
          onChangeText={text => setProfile({
            ...profile,
            pricePerService: text
          })}
          style={styles.input}
        />
        
        <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
          Save Profile
        </Button>
      </ScrollView>
    );
  };

  // EarningsRoute remains unchanged
  const EarningsRoute = () => (
    <View style={styles.center}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>Earnings (Coming Soon)</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.welcomeText, { color: theme.colors.onPrimary }]}>Welcome, {name}!</Text>
        <Button
          mode="outlined"
          onPress={handleSignOut}
          labelStyle={{ color: theme.colors.onPrimary }}
          style={styles.logoutButton}
        >
          Sign Out
        </Button>
      </View>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let icon = 'calendar';
            if (route.name === 'Calendar') icon = 'calendar';
            if (route.name === 'Profile') icon = 'account';
            if (route.name === 'Earnings') icon = 'cash';
            return <MaterialCommunityIcons name={icon} color={color} size={size} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { backgroundColor: theme.colors.background },
        })}
      >
        <Tab.Screen
          name="Calendar"
          component={() => (
            <Agenda
              items={items}
              loadItemsForMonth={generateCalendarItems}
              selected={getLocalDateString(new Date())}
              renderItem={renderItem}
              renderEmptyDate={() => (
                <View style={styles.emptyDate}>
                  <Text style={[styles.emptyText, { color: theme.colors.primary }]}>
                    No work scheduled
                  </Text>
                </View>
              )}
              rowHasChanged={(r1: any, r2: any) => r1.name !== r2.name}
              theme={{
                agendaTodayColor: theme.colors.primary,
                dotColor: theme.colors.onPrimary,
                selectedDayBackgroundColor: theme.colors.primary
              }}
            />
          )}
        />
        <Tab.Screen name="Profile" component={ProfileRoute} />
        <Tab.Screen name="Earnings" component={EarningsRoute} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 24, paddingTop: 60
  },
  welcomeText: { fontSize: 24, fontWeight: 'bold' },
  logoutButton: { borderColor: '#fff' },
  item: {
    backgroundColor: '#fff', padding: 12, marginRight: 10,
    marginTop: 17, borderRadius: 6, elevation: 2
  },
  itemText: { fontSize: 16, color: '#333' },
  emptyDate: {
    height: 40, flex: 1, paddingTop: 20,
    justifyContent: 'center', backgroundColor: '#f5f5f5', alignItems: 'center'
  },
  emptyText: { fontSize: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, marginBottom: 10 },
  formContainer: { padding: 16 , color: theme.colors.background},
  input: { marginBottom: 12, backgroundColor: theme.colors.surface },
  sectionTitle: {fontSize: 16, marginTop: 10, marginBottom: 3, marginLeft: 6 },
  pickerContainer: {
    borderBottomWidth: 1,
    marginTop: 1,
    borderBottomColor: '#cfcfcf',
    marginVertical: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  selectedTimes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
    marginBottom: 16,
  },
  selectedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  closeIcon: {
    marginLeft: 4,
  },
  saveButton: { marginTop: 16 },
  // Styles for services dropdown
  servicesContainer: {
    marginVertical: 10,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#cfcfcf',
    borderRadius: 4,
    marginBottom: 5,
  },
  dropdownHeaderOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownHeaderText: {
    fontSize: 16,
  },
  dropdownList: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#cfcfcf',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: '#fff',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default HomeScreenMaid;