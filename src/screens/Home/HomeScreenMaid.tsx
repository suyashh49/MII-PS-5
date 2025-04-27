// import React, { useEffect, useState, useCallback, useMemo } from 'react';
// import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
// import { Text, Button, TextInput, useTheme, Menu } from 'react-native-paper';
// import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import { Agenda as RawAgenda } from 'react-native-calendars';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Picker } from '@react-native-picker/picker';
// import { RootStackParamList, Booking } from '../../types';
// import theme from '../../config/theme';
// import { Card, Title, Paragraph, DataTable, List } from 'react-native-paper';
// import dayjs from 'dayjs';
// import { LineChart, BarChart, PieChart, ContributionGraph } from 'react-native-chart-kit';

// import { useRef } from 'react';
// import { Linking, Platform } from 'react-native';
// import Geocoder from 'react-native-geocoding';
// import { useMaidAuth } from '../../hooks/useMaidauth';
// import { useTranslation } from 'react-i18next';
// import i18n from '../../locales/i18n';

// Geocoder.init('AIzaSyAPQtPZzAuyG4dyEP-45rf8FtOr6pSUBsg');

// const windowWidth = Dimensions.get('window').width;

// const Agenda = RawAgenda as unknown as React.ComponentType<any>;
// const Tab = createBottomTabNavigator();

// type HomeScreenMaidRouteProp = RouteProp<RootStackParamList, 'HomeMaid'>;
// type HomeScreenMaidNavigationProp = any;

// // Time slots available for selection
// const timeSlots = [
//   '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
//   '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
// ];

// const HomeScreenMaid: React.FC = () => {
//   const route = useRoute<HomeScreenMaidRouteProp>();
//   const navigation = useNavigation<HomeScreenMaidNavigationProp>();
//   const { name } = route.params;
//   const theme = useTheme();
//   const { logoutMaid } = useMaidAuth();
//   const { t } = useTranslation();
//   const changeLanguage = (lang: string) => {
//     i18n.changeLanguage(lang);
//   };

//   const menuRef = useRef<View>(null);
//   const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
//   const [menuVisible, setMenuVisible] = useState<boolean>(false);
//   const [languageSubmenuVisible, setLanguageSubmenuVisible] = useState<boolean>(false);

//   const showMenu = () => {
//     if (menuRef.current) {
//       menuRef.current.measure((x, y, width, height, pageX, pageY) => {
//         setMenuAnchor({ x: pageX, y: pageY });
//         setMenuVisible(true);
//       });
//     }
//   };

//   // Token and bookings state
//   const [maidToken, setMaidToken] = useState<string | null>(null);
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [items, setItems] = useState<{ [date: string]: any[] }>({});


//   const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);


//   const [cardAnimations, setCardAnimations] = useState<{ [key: string]: Animated.Value }>({});


//   useEffect(() => {
//     AsyncStorage.getItem('token')
//       .then(t => setMaidToken(t))
//       .catch(console.error);
//   }, []);

//   useEffect(() => {
//     if (!maidToken) return;
//     axios.get(
//       'https://maid-in-india-nglj.onrender.com/api/worker/schedule',
//       { headers: { Authorization: `Bearer ${maidToken}` } }
//     )
//       .then(res => {
//         setBookings(res.data);
//         console.log('Bookings data:', res.data);
//       })
//       .catch(() => Alert.alert('Error', 'Failed to load bookings.'));


//   }, [maidToken]);

//   const getLocalDateString = (d: Date) =>
//     `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

//   const generateCalendarItems = useCallback(() => {
//     const today = new Date();
//     const newItems: { [date: string]: any[] } = {};
//     for (let i = 0; i < 30; i++) {
//       const d = new Date(today);
//       d.setDate(today.getDate() + i);
//       newItems[getLocalDateString(d)] = [];
//     }
//     bookings.forEach((b, bookingIndex) => {
//       Object.keys(b.slot).forEach(dayName => {
//         for (let i = 0; i < 30; i++) {
//           const d = new Date(today);
//           d.setDate(today.getDate() + i);
//           if (d.toLocaleDateString('en-US', { weekday: 'long' }) === dayName) {
//             const key = getLocalDateString(d);
//             const uniqueId = `booking-${bookingIndex}-${dayName}-${i}`;
//             newItems[key].push({
//               id: uniqueId,
//               name: `Booking for ${b.userName}`,
//               time: b.slot[dayName],
//               location: b.userLocation,
//               userContact: b.userContact,
//               service: b.service,
//             });
//           }
//         }
//       });
//     });
//     setItems(newItems);
//   }, [bookings]);

//   useEffect(() => { generateCalendarItems(); }, [bookings, generateCalendarItems]);

//   // Function to toggle card expansion
//   const toggleCardExpansion = (id: string) => {
//     setExpandedBookingId(expandedBookingId === id ? null : id);
//   };


//   // Function to open Google Maps with directions
//   const openDirections = async (location: string) => {
//     try {
//       if (!location || location === 'N/A') {
//         Alert.alert('Error', 'No location information available');
//         return;
//       }

//       // First try using Geocoder to get coordinates
//       try {
//         const response = await Geocoder.from(location);
//         if (response.results && response.results.length > 0) {
//           const { lat, lng } = response.results[0].geometry.location;
//           const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

//           const canOpen = await Linking.canOpenURL(url);
//           if (canOpen) {
//             await Linking.openURL(url);
//             return;
//           }
//         }
//       } catch (geocodeError) {
//         console.log('Geocoding error, falling back to address search', geocodeError);
//       }

//       // Fallback to direct address search if geocoding fails
//       const encodedAddress = encodeURIComponent(location);
//       const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

//       const canOpenFallback = await Linking.canOpenURL(fallbackUrl);
//       if (canOpenFallback) {
//         await Linking.openURL(fallbackUrl);
//       } else {
//         Alert.alert('Error', 'Cannot open Google Maps');
//       }
//     } catch (error) {
//       console.error('Error opening maps:', error);
//       Alert.alert('Error', 'Failed to open directions');
//     }
//   };

//   const renderItem = (item: any) => {
//     const isExpanded = expandedBookingId === item.id;
//     return (
//       <Card style={[styles.bookingCard, isExpanded && styles.expandedCard]}>
//         <TouchableOpacity
//           onPress={() => toggleCardExpansion(item.id)}
//           activeOpacity={0.7}
//         >
//           <Card.Content style={styles.cardContent}>
//             <View style={styles.bookingRow}>
//               <View style={styles.maidDetails}>
//                 <Text style={styles.bookingTitle}>{item.name}</Text>
//                 <View style={styles.infoRow}>
//                   <MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#1368A4" style={styles.infoIcon} />
//                   <Text style={styles.infoText}>{item.service}</Text>
//                 </View>
//                 <View style={styles.infoRow}>
//                   <MaterialCommunityIcons name="phone" size={16} color="#1368A4" style={styles.infoIcon} />
//                   <Text style={styles.infoText}>{item.userContact}</Text>
//                 </View>
//                 <View style={styles.infoRow}>
//                   <MaterialCommunityIcons name="map-marker" size={16} color="#1368A4" style={styles.infoIcon} />
//                   <Text style={styles.infoText} numberOfLines={2}>{item.location || 'N/A'}</Text>
//                 </View>
//               </View>
//               <View style={styles.timeContainer}>
//                 <Text style={styles.timeLabel}>Time</Text>
//                 <Text style={styles.timeValue}>{item.time}</Text>
//               </View>
//             </View>

//             {isExpanded && (
//               <View style={styles.actionButtonsContainer}>
//                 <Button
//                   mode="contained"
//                   onPress={() => openDirections(item.location)}
//                   style={styles.actionButton}
//                   icon="map-marker-radius"
//                   labelStyle={styles.buttonLabel}
//                 >
//                   Directions
//                 </Button>
//                 <Button
//                   mode="contained"
//                   onPress={() => {
//                     const phoneNumber = item.userContact;
//                     if (!phoneNumber || phoneNumber === 'N/A') {
//                       Alert.alert('Error', 'No contact information available');
//                       return;
//                     }
//                     Linking.openURL(`tel:${phoneNumber}`);
//                   }}
//                   style={[styles.actionButton2]}
//                   icon="phone"
//                   labelStyle={styles.buttonLabel}
//                 >
//                   Call
//                 </Button>
//               </View>
//             )}
//           </Card.Content>
//         </TouchableOpacity>
//       </Card>
//     );
//   };

//   const handleSignOut = async () => {
//     await logoutMaid(); // This clears maid token and data
//     navigation.navigate('Welcome');
//   };

//   //

//   const ServicesDropdown = ({
//     cleaning,
//     cooking,
//     onServiceChange
//   }: {
//     cleaning: boolean,
//     cooking: boolean,
//     onServiceChange: (service: 'cleaning' | 'cooking', value: boolean) => void
//   }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const theme = useTheme();


//     const getSelectedServicesText = () => {
//       const selected = [];
//       if (cleaning) selected.push('Cleaning');
//       if (cooking) selected.push('Cooking');
//       return selected.length > 0 ? selected.join(', ') : 'Select services';
//     };

//     return (
//       <View style={styles.servicesContainer}>
//         <Text style={styles.sectionTitle}>Services</Text>
//         <TouchableOpacity
//           style={[styles.dropdownHeader, isOpen && styles.dropdownHeaderOpen]}
//           onPress={() => setIsOpen(!isOpen)}
//         >
//           <Text style={styles.dropdownHeaderText}>
//             {getSelectedServicesText()}
//           </Text>
//           <MaterialCommunityIcons
//             name={isOpen ? "chevron-up" : "chevron-down"}
//             size={24}
//             color={theme.colors.primary}
//           />
//         </TouchableOpacity>

//         {isOpen && (
//           <View style={styles.dropdownList}>
//             <TouchableOpacity
//               style={styles.dropdownItem}
//               onPress={() => onServiceChange('cleaning', !cleaning)}
//             >
//               <MaterialCommunityIcons
//                 name={cleaning ? "checkbox-marked" : "checkbox-blank-outline"}
//                 size={24}
//                 color={theme.colors.primary}
//               />
//               <Text style={styles.dropdownItemText}>Cleaning</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.dropdownItem}
//               onPress={() => onServiceChange('cooking', !cooking)}
//             >
//               <MaterialCommunityIcons
//                 name={cooking ? "checkbox-marked" : "checkbox-blank-outline"}
//                 size={24}
//                 color={theme.colors.primary}
//               />
//               <Text style={styles.dropdownItemText}>Cooking</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     );
//   };

//   // Editable Profile Route
//   const ProfileRoute = () => {
//     const [profile, setProfile] = useState<any>({
//       name: '',
//       gender: 'Male',
//       location: '',
//       govtId: '',
//       timeAvailable: {},
//       selectedTimeSlots: [], // For UI management
//       cleaning: false,      // Boolean for cleaning service
//       cooking: false,       // Boolean for cooking service
//       pricePerService: '',
//       contact: ''
//     });
//     const [loading, setLoading] = useState<boolean>(true);
//     const [errors, setErrors] = useState<{ [K in keyof typeof profile]?: string }>({});

//     const validate = () => {
//       const errs: typeof errors = {};
//       if (!profile.name.trim()) errs.name = 'Name is required';
//       if (!/^\+91\d{10}$/.test(profile.contact)) errs.contact = 'Enter a valid +91xxxxxxxxxx number';
//       if (profile.selectedTimeSlots.length === 0) errs.timeAvailable = 'Select at least one time slot';
//       if (!profile.cleaning && !profile.cooking) errs.services = 'Pick cleaning, cooking, or both';
//       if (!/^\d+(\.\d{1,2})?$/.test(profile.pricePerService) || Number(profile.pricePerService) <= 0)
//         errs.pricePerService = 'Enter a positive number';
//       setErrors(errs);
//       return Object.keys(errs).length === 0;
//     };

//     useEffect(() => {
//       AsyncStorage.getItem('token')
//         .then(token => {
//           if (!token) throw new Error('No token');
//           return axios.get(
//             'https://maid-in-india-nglj.onrender.com/api/maid/profile',
//             { headers: { Authorization: `Bearer ${maidToken}` } }
//           );
//         })
//         .then(res => {
//           const data = res.data;
//           console.log('Profile data:', data);
//           const {
//             name = '',
//             gender = 'Male',
//             contact = '',
//             timeAvailable = {},
//             cleaning = false,
//             cooking = false,
//             pricePerService = ''
//           } = data || {};


//           let selectedTimeSlots: string[] = [];
//           if (timeAvailable && typeof timeAvailable === 'object' && Object.keys(timeAvailable).length > 0) {

//             const firstDayWithSlots = Object.keys(timeAvailable).find(day =>
//               Array.isArray(timeAvailable[day]) && timeAvailable[day].length > 0
//             );

//             if (firstDayWithSlots) {
//               selectedTimeSlots = [...timeAvailable[firstDayWithSlots]];
//             }
//           }

//           setProfile({
//             name,
//             gender,
//             contact,
//             timeAvailable,
//             selectedTimeSlots,
//             cleaning: Boolean(cleaning),
//             cooking: Boolean(cooking),
//             pricePerService: pricePerService.toString()
//           });
//         })
//         .catch(() => Alert.alert('Error', 'Failed to load profile'))
//         .finally(() => setLoading(false));
//     }, [maidToken]);

//     const handleTimeSlotChange = (time: string) => {
//       const updatedTimeSlots = profile.selectedTimeSlots.includes(time)
//         ? profile.selectedTimeSlots.filter((t: string) => t !== time)
//         : [...profile.selectedTimeSlots, time];


//       setProfile({
//         ...profile,
//         selectedTimeSlots: updatedTimeSlots
//       });
//     };

//     const handleServiceChange = (service: 'cleaning' | 'cooking', value: boolean) => {
//       setProfile({
//         ...profile,
//         [service]: value
//       });
//     };

//     const handleSave = () => {

//       if (!validate()) {
//         Alert.alert('Validation error', 'Please fix the highlighted fields.');
//         return;
//       }

//       AsyncStorage.getItem('token')
//         .then(token => {
//           if (!token) throw new Error('No token');


//           const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
//           const timeAvailable = days.reduce((acc, day) => {
//             acc[day] = profile.selectedTimeSlots;
//             return acc;
//           }, {} as { [key: string]: string[] });


//           const body = {
//             name: profile.name,
//             contact: profile.contact,
//             timeAvailable,
//             cleaning: profile.cleaning,
//             cooking: profile.cooking,
//             pricePerService: profile.pricePerService,
//           };

//           return axios.put(
//             'https://maid-in-india-nglj.onrender.com/api/maid/profile',
//             body,
//             { headers: { Authorization: `Bearer ${token}` } }
//           );
//         })
//         .then(() => Alert.alert('Success', 'Profile updated'))
//         .catch(() => Alert.alert('Error', 'Failed to update profile'));
//     };

//     if (loading) {
//       return <View style={styles.center}><Text>Loading...</Text></View>;
//     }

//     return (
//       <ScrollView contentContainerStyle={styles.formContainer}>
//         <TextInput
//           label="Name"
//           value={profile.name}
//           onChangeText={text => setProfile({ ...profile, name: text })}
//           style={styles.input}
//         />
//         {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}


//         <TextInput
//           label="Contact Number"
//           value={profile.contact}
//           onChangeText={text => {
//             if (/^\+91\d{0,10}$/.test(text) || text === '') {
//               setProfile({ ...profile, contact: text });
//             }
//           }}
//           style={styles.input}
//           placeholder="+911234567890"
//           keyboardType="phone-pad"
//           maxLength={13}
//         />
//         {errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}



//         {/* Time Available Picker */}
//         <Text style={styles.sectionTitle}>Time Available</Text>
//         <View style={styles.pickerContainer}>
//           <Picker
//             selectedValue=""
//             onValueChange={(time) => {
//               if (time) {
//                 handleTimeSlotChange(time);
//               }
//             }}
//             style={styles.picker}
//           >
//             <Picker.Item label="Select time slots" value="" />
//             {timeSlots.map((time) => (
//               <Picker.Item key={time} label={time} value={time} />
//             ))}
//           </Picker>
//         </View>
//         {errors.timeAvailable && <Text style={styles.errorText}>{errors.timeAvailable}</Text>}

//         {/* Selected Time Slots Display */}
//         <View style={styles.selectedTimes}>
//           {profile.selectedTimeSlots.map((time: string, index: number) => (
//             <TouchableOpacity
//               key={index}
//               style={[styles.selectedTime, { backgroundColor: theme.colors.primary }]}
//               onPress={() => handleTimeSlotChange(time)}
//             >
//               <Text style={{ color: theme.colors.onPrimary }}>{time}</Text>
//               <MaterialCommunityIcons name="close" size={14} color={theme.colors.onPrimary} style={styles.closeIcon} />
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Services Multi-select Dropdown */}
//         <ServicesDropdown
//           cleaning={profile.cleaning}
//           cooking={profile.cooking}
//           onServiceChange={handleServiceChange}
//         />
//         {errors.services && <Text style={styles.errorText}>{errors.services}</Text>}


//         <TextInput
//           label="Price for Service"
//           keyboardType="numeric"
//           value={profile.pricePerService}
//           onChangeText={text => setProfile({
//             ...profile,
//             pricePerService: text
//           })}
//           style={styles.input}
//         />
//         {errors.pricePerService && <Text style={styles.errorText}>{errors.pricePerService}</Text>}


//         <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
//           Save Profile
//         </Button>
//       </ScrollView>
//     );
//   };

//   const EarningsRoute = () => {
//     const theme = useTheme();
//     const [loading, setLoading] = useState(true);
//     const [dateRange, setDateRange] = useState('week');
//     const [selectedTab, setSelectedTab] = useState('summary');


//     const earningsData = useMemo(() => {
//       if (!bookings || bookings.length === 0) return null;


//       const now = dayjs();
//       let startDate;

//       if (dateRange === 'week') {
//         startDate = now.subtract(7, 'day');
//       } else if (dateRange === 'month') {
//         startDate = now.subtract(30, 'day');
//       } else {
//         startDate = now.subtract(365, 'day');
//       }


//       const totalEarnings = bookings.reduce((sum, booking) => sum + (booking.cost || 0), 0);


//       const serviceBreakdown = bookings.reduce((acc: Record<string, number>, booking) => {
//         const service = booking.service || 'other';
//         acc[service] = (acc[service] || 0) + 1;
//         return acc;
//       }, {});


//       const dailyData = [];
//       const daysInPeriod = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 12;
//       const labels = [];
//       const data = [];

//       for (let i = 0; i < daysInPeriod; i++) {
//         const date = dateRange === 'year'
//           ? now.subtract(i, 'month').format('MMM')
//           : now.subtract(i, 'day').format('DD');


//         const count = Math.floor(Math.random() * 3); // Simulating 0-2 bookings per day
//         const dailyEarning = count * (bookings[0]?.cost || 800); // Use first booking cost or default to 800

//         labels.unshift(date);
//         data.unshift(dailyEarning);
//       }


//       const upcomingEarnings = bookings.length * (bookings[0]?.cost || 0) / 1; // Simple estimation


//       const pieChartData = Object.keys(serviceBreakdown).map((key, index) => {
//         const colors = ['#FF8A65', '#64B5F6', '#81C784', '#FFD54F'];
//         return {
//           name: key.charAt(0).toUpperCase() + key.slice(1),
//           population: serviceBreakdown[key],
//           color: colors[index % colors.length],
//           legendFontColor: '#7F7F7F',
//           legendFontSize: 12
//         };
//       });


//       const barChartData = {
//         labels: ['Cooking', 'Cleaning'],
//         datasets: [
//           {
//             data: [
//               bookings.filter(b => b.service === 'cooking').reduce((sum, b) => sum + (b.cost || 0), 0),
//               bookings.filter(b => b.service === 'cleaning').reduce((sum, b) => sum + (b.cost || 0), 0)
//             ]
//           }
//         ]
//       };

//       return {
//         totalEarnings,
//         lineChartData: {
//           labels,
//           datasets: [{ data }]
//         },
//         pieChartData,
//         barChartData,
//         upcomingEarnings,
//         bookingsCount: bookings.length
//       };
//     }, [bookings, dateRange]);


//     const renderPaymentHistory = () => {
//       if (!bookings || bookings.length === 0) {
//         return (
//           <Card style={styles.emptyCard}>
//             <Card.Content>
//               <Text style={styles.emptyText}>No payment history available</Text>
//             </Card.Content>
//           </Card>
//         );
//       }

//       return (
//         <Card style={styles.tableCard}>
//           <Card.Content>
//             <Title style={styles.cardTitle}>Payment History</Title>
//             <DataTable>
//               <DataTable.Header>
//                 <DataTable.Title>Client</DataTable.Title>
//                 <DataTable.Title>Service</DataTable.Title>
//                 <DataTable.Title numeric>Amount</DataTable.Title>
//               </DataTable.Header>

//               {bookings.map((booking, index) => (
//                 <DataTable.Row key={index}>
//                   <DataTable.Cell>{booking.userName}</DataTable.Cell>
//                   <DataTable.Cell>{booking.service}</DataTable.Cell>
//                   <DataTable.Cell numeric>₹{booking.cost}</DataTable.Cell>
//                 </DataTable.Row>
//               ))}
//             </DataTable>
//           </Card.Content>
//         </Card>
//       );
//     };

//     // Default chart configuration
//     const chartConfig = {
//       backgroundGradientFrom: '#ffffff',
//       backgroundGradientTo: '#ffffff',
//       color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
//       strokeWidth: 2,
//       barPercentage: 0.7,
//       useShadowColorFromDataset: false,
//       decimalPlaces: 0,
//     };

//     // Clear loading state when bookings data is available
//     useEffect(() => {
//       setLoading(false);
//     }, [bookings]);

//     // Loading state
//     if (loading) {
//       return (
//         <View style={styles.loadingContainer}>
//           <Text>Loading earnings data...</Text>
//         </View>
//       );
//     }

//     return (
//       <ScrollView style={styles.container}>
//         {/* Date Range Selector */}
//         <View style={styles.dateRangeSelector}>
//           <TouchableOpacity
//             style={[styles.dateRangeButton, dateRange === 'week' && styles.dateRangeButtonActive]}
//             onPress={() => setDateRange('week')}
//           >
//             <Text style={dateRange === 'week' ? styles.dateRangeTextActive : styles.dateRangeText}>
//               Week
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.dateRangeButton, dateRange === 'month' && styles.dateRangeButtonActive]}
//             onPress={() => setDateRange('month')}
//           >
//             <Text style={dateRange === 'month' ? styles.dateRangeTextActive : styles.dateRangeText}>
//               Month
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.dateRangeButton, dateRange === 'year' && styles.dateRangeButtonActive]}
//             onPress={() => setDateRange('year')}
//           >
//             <Text style={dateRange === 'year' ? styles.dateRangeTextActive : styles.dateRangeText}>
//               Year
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Tab Selector */}
//         <View style={styles.tabSelector}>
//           <TouchableOpacity
//             style={[styles.tabButton, selectedTab === 'summary' && styles.tabButtonActive]}
//             onPress={() => setSelectedTab('summary')}
//           >
//             <MaterialCommunityIcons
//               name="chart-box-outline"
//               size={20}
//               color={selectedTab === 'summary' ? theme.colors.primary : '#888'}
//             />
//             <Text style={selectedTab === 'summary' ? styles.tabTextActive : styles.tabText}>
//               Summary
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.tabButton, selectedTab === 'details' && styles.tabButtonActive]}
//             onPress={() => setSelectedTab('details')}
//           >
//             <MaterialCommunityIcons
//               name="format-list-bulleted"
//               size={20}
//               color={selectedTab === 'details' ? theme.colors.primary : '#888'}
//             />
//             <Text style={selectedTab === 'details' ? styles.tabTextActive : styles.tabText}>
//               Details
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.tabButton, selectedTab === 'analysis' && styles.tabButtonActive]}
//             onPress={() => setSelectedTab('analysis')}
//           >
//             <MaterialCommunityIcons
//               name="chart-line"
//               size={20}
//               color={selectedTab === 'analysis' ? theme.colors.primary : '#888'}
//             />
//             <Text style={selectedTab === 'analysis' ? styles.tabTextActive : styles.tabText}>
//               Analysis
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {selectedTab === 'summary' && (
//           <>
//             {/* Earnings Summary */}
//             <View style={styles.summaryContainer}>
//               <Card style={styles.totalEarningsCard}>
//                 <Card.Content>
//                   <Text style={styles.earningsLabel}>Total Earnings</Text>
//                   <Text style={styles.earningsValue}>₹{earningsData?.totalEarnings || 0}</Text>
//                   <Text style={styles.earningsPeriod}>
//                     {dateRange === 'week' ? 'This Week' : dateRange === 'month' ? 'This Month' : 'This Year'}
//                   </Text>
//                 </Card.Content>
//               </Card>

//               <View style={styles.metricsRow}>
//                 <Card style={styles.metricCard}>
//                   <Card.Content>
//                     <MaterialCommunityIcons name="calendar-check" size={24} color={theme.colors.primary} />
//                     <Text style={styles.metricLabel}>Bookings</Text>
//                     <Text style={styles.metricValue}>{earningsData?.bookingsCount || 0}</Text>
//                   </Card.Content>
//                 </Card>

//                 <Card style={styles.metricCard}>
//                   <Card.Content>
//                     <MaterialCommunityIcons name="currency-inr" size={24} color="#4CAF50" />
//                     <Text style={styles.metricLabel}>Upcoming</Text>
//                     <Text style={styles.metricValue}>₹{earningsData?.upcomingEarnings || 0}</Text>
//                   </Card.Content>
//                 </Card>
//               </View>
//             </View>

//             {/* Earnings Chart */}
//             {/* <Card style={styles.chartCard}> */}
//             {/* <Card.Content>
//                 <Title style={styles.cardTitle}>Earnings Trend</Title>
//                 <View style={styles.chartContainer}>
//                   {earningsData?.lineChartData && (
//                     <LineChart
//                     data={earningsData.lineChartData}
//                     width={windowWidth - 60}
//                     height={220}
//                     chartConfig={{
//                       ...chartConfig,
//                       backgroundColor: theme.colors.background,
//                       backgroundGradientFrom: theme.colors.background,
//                       backgroundGradientTo: theme.colors.background,
//                       color: (opacity = 1) => `rgba(19, 104, 164, ${opacity})`,  // Changed to theme.colors.primary
//                       strokeWidth: 2,
//                       barPercentage: 0.7,
//                       useShadowColorFromDataset: false,
//                       decimalPlaces: 0,
//                       propsForDots: {
//                         r: "6",
//                         strokeWidth: "2",
//                         stroke: theme.colors.primary,
//                         color: theme.colors.primary,
//                       }
//                     }}
//                     bezier
//                     style={styles.chart}
//                     yAxisLabel="₹"
//                   />
//                   )}
//                 </View>
//               </Card.Content> */}
//             {/* </Card> */}

//             {/* Service Breakdown */}
//             <Card style={styles.chartCard}>
//               <Card.Content>
//                 <Title style={styles.cardTitle}>Service Breakdown</Title>
//                 <View style={styles.pieChartContainer}>
//                   {earningsData?.pieChartData && earningsData.pieChartData.length > 0 && (
//                     <PieChart
//                       data={earningsData.pieChartData}
//                       width={windowWidth - 60}
//                       height={200}
//                       chartConfig={chartConfig}
//                       accessor="population"
//                       backgroundColor="transparent"
//                       paddingLeft="15"
//                       center={[0, 0]}
//                       absolute
//                     />
//                   )}
//                 </View>
//               </Card.Content>
//             </Card>
//           </>
//         )}

//         {selectedTab === 'details' && (
//           <>
//             {renderPaymentHistory()}
//           </>
//         )}

//         {selectedTab === 'analysis' && (
//           <>
//             <Card style={styles.chartCard}>
//               <Card.Content>
//                 <Title style={styles.cardTitle}>Earnings by Service</Title>
//                 <View style={styles.chartContainer}>
//                   {earningsData?.barChartData && (
//                     <BarChart
//                       data={earningsData.barChartData}
//                       width={windowWidth - 60}
//                       height={220}
//                       chartConfig={{
//                         ...chartConfig,
//                         color: (opacity = 1) => `rgba(19, 104, 164, ${opacity})`,  // Changed to theme.colors.primary
//                         barPercentage: 0.7,
//                       }}
//                       style={styles.chart}
//                       yAxisLabel="₹"
//                       yAxisSuffix=""
//                       fromZero
//                     />
//                   )}
//                 </View>
//               </Card.Content>
//             </Card>

//             <Card style={styles.insightsCard}>
//               <Card.Content>
//                 <Title style={styles.cardTitle}>Earnings Insights</Title>
//                 <View style={styles.insightRow}>
//                   <MaterialCommunityIcons name="trending-up" size={24} color="#4CAF50" />
//                   <View style={styles.insightTextContainer}>
//                     <Text style={styles.insightTitle}>Most Profitable Service</Text>
//                     <Text style={styles.insightValue}>
//                       {bookings.filter(b => b.service === 'cooking').length >=
//                         bookings.filter(b => b.service === 'cleaning').length ? 'Cooking' : 'Cleaning'}
//                     </Text>
//                   </View>
//                 </View>

//                 <View style={styles.insightRow}>
//                   <MaterialCommunityIcons name="calendar-clock" size={24} color={theme.colors.primary} />
//                   <View style={styles.insightTextContainer}>
//                     <Text style={styles.insightTitle}>Busiest Day</Text>
//                     <Text style={styles.insightValue}>
//                       {(() => {
//                         const dayCounts = bookings
//                           .flatMap(b => Object.keys(b.slot))
//                           .reduce((acc: Record<string, number>, day) => {
//                             acc[day] = (acc[day] || 0) + 1;
//                             return acc;
//                           }, {} as Record<string, number>);

//                         const busiestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
//                         return busiestDay ? busiestDay[0] : 'N/A';
//                       })()}
//                     </Text>
//                   </View>
//                 </View>

//                 <View style={styles.insightRow}>
//                   <MaterialCommunityIcons name="cash-multiple" size={24} color="#FF9800" />
//                   <View style={styles.insightTextContainer}>
//                     <Text style={styles.insightTitle}>Average Per Booking</Text>
//                     <Text style={styles.insightValue}>
//                       ₹{bookings.length > 0 ?
//                         Math.round(bookings.reduce((sum, b) => sum + (b.cost || 0), 0) / bookings.length) : 0}
//                     </Text>
//                   </View>
//                 </View>
//               </Card.Content>
//             </Card>
//           </>
//         )}
//       </ScrollView>
//     );
//   };

//   const renderMenu = () => {
//     return (
//       <Menu
//         visible={menuVisible}
//         onDismiss={() => setMenuVisible(false)}
//         anchor={menuAnchor}
//         style={{ marginTop: 40 }}
//       >
//         <Menu.Item
//           onPress={() => {
//             setLanguageSubmenuVisible(true);
//             setMenuVisible(false);
//           }}
//           title={t('selectLanguage')}
//           leadingIcon="translate"
//         />
//         <Menu.Item
//           onPress={() => {
//             setMenuVisible(false);
//             handleSignOut();
//           }}
//           title={t('logout')}
//           leadingIcon="logout"
//         />
//       </Menu>
//     );
//   };

//   const renderLanguageMenu = () => {
//     return (
//       <Menu
//         visible={languageSubmenuVisible}
//         onDismiss={() => setLanguageSubmenuVisible(false)}
//         anchor={menuAnchor}
//         style={{ marginTop: 40 }}
//       >
//         <Menu.Item
//           onPress={() => {
//             setLanguageSubmenuVisible(false);
//             changeLanguage('en');
//           }}
//           title="English"
//           //leadingIcon="check"
//           style={{ opacity: i18n.language === 'en' ? 1 : 0.6 }}
//         />
//         <Menu.Item
//           onPress={() => {
//             setLanguageSubmenuVisible(false);
//             changeLanguage('hi');
//           }}
//           title="हिंदी"
//           //leadingIcon="check"
//           style={{ opacity: i18n.language === 'hi' ? 1 : 0.6 }}
//         />
//         <Menu.Item
//           onPress={() => {
//             setLanguageSubmenuVisible(false);
//             changeLanguage('ma');
//           }}
//           title="मराठी"
//           //leadingIcon="check"
//           style={{ opacity: i18n.language === 'hi' ? 1 : 0.6 }}
//         />
//       </Menu>
//     );
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
//              <Text style={[styles.welcomeText, { color: theme.colors.onPrimary }]}>{t('welcomemaid')}, {name}!</Text>
//              <TouchableOpacity
//                ref={menuRef}
//                onPress={showMenu}
//                style={styles.menuButton}
//              >
//                <MaterialCommunityIcons
//                  name="dots-vertical"
//                  size={24}
//                  color={theme.colors.onPrimary}
//                />
//              </TouchableOpacity>
//            </View>

//       <Tab.Navigator
//         screenOptions={({ route }) => ({
//           headerShown: false,
//           tabBarIcon: ({ color, size }) => {
//             let icon = 'calendar';
//             if (route.name === 'Calendar') icon = 'calendar';
//             if (route.name === 'Profile') icon = 'account';
//             if (route.name === 'Earnings') icon = 'cash';
//             return <MaterialCommunityIcons name={icon} color={color} size={size} />;
//           },
//           tabBarActiveTintColor: theme.colors.primary,
//           tabBarInactiveTintColor: 'gray',
//           tabBarStyle: { backgroundColor: theme.colors.background },
//         })}
//       >
//         <Tab.Screen
//           name="Calendar"
//           component={() => (
//             <Agenda
//               items={items}
//               loadItemsForMonth={generateCalendarItems}
//               selected={getLocalDateString(new Date())}
//               renderItem={renderItem}
//               renderEmptyDate={() => (
//                 <View style={styles.emptyDate}>
//                   <Text style={[styles.emptyText, { color: theme.colors.primary }]}>
//                     No work scheduled
//                   </Text>
//                 </View>
//               )}
//               rowHasChanged={(r1: any, r2: any) => r1.name !== r2.name}
//               theme={{
//                 agendaTodayColor: theme.colors.primary,
//                 dotColor: theme.colors.onPrimary,
//                 selectedDayBackgroundColor: theme.colors.primary
//               }}
//             />
//           )}
//         />
//         <Tab.Screen name="Profile" component={ProfileRoute} />
//         <Tab.Screen name="Earnings" component={EarningsRoute} />
//       </Tab.Navigator>
//       {renderMenu()}
//       {renderLanguageMenu()}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
//     padding: 24, paddingTop: 60
//   },
//   welcomeText: { fontSize: 24, fontWeight: 'bold' },
//   logoutButton: { borderColor: '#fff' },
//   item: {
//     backgroundColor: '#fff', padding: 12, marginRight: 10,
//     marginTop: 17, borderRadius: 6, elevation: 2
//   },
//   itemText: { fontSize: 16, color: '#333', fontWeight: 'bold' },
//   emptyDate: {
//     height: 40, flex: 1, paddingTop: 20,
//     justifyContent: 'center', backgroundColor: '#f5f5f5', alignItems: 'center'
//   },
//   // emptyText: { fontSize: 15 },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   title: { fontSize: 18, marginBottom: 10 },
//   formContainer: { padding: 16, color: theme.colors.background },
//   input: { marginBottom: 12, backgroundColor: theme.colors.surface },
//   sectionTitle: { fontSize: 16, marginTop: 10, marginBottom: 3, marginLeft: 6 },
//   pickerContainer: {
//     borderBottomWidth: 1,
//     marginTop: 1,
//     borderBottomColor: '#cfcfcf',
//     marginVertical: 8,
//   },
//   picker: {
//     height: 50,
//     width: '100%',
//   },
//   selectedTimes: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginVertical: 8,
//     marginBottom: 16,
//   },
//   selectedTime: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     margin: 4,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//   },
//   closeIcon: {
//     marginLeft: 4,
//   },
//   saveButton: { marginTop: 16 },
//   // Styles for services dropdown
//   servicesContainer: {
//     marginVertical: 10,
//   },
//   dropdownHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 10,
//     borderWidth: 1,
//     borderColor: '#cfcfcf',
//     borderRadius: 4,
//     marginBottom: 5,
//   },
//   dropdownHeaderOpen: {
//     borderBottomLeftRadius: 0,
//     borderBottomRightRadius: 0,
//   },
//   dropdownHeaderText: {
//     fontSize: 16,
//   },
//   dropdownList: {
//     borderWidth: 1,
//     borderTopWidth: 0,
//     borderColor: '#cfcfcf',
//     borderBottomLeftRadius: 4,
//     borderBottomRightRadius: 4,
//     backgroundColor: '#fff',
//   },
//   dropdownItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   dropdownItemText: {
//     marginLeft: 10,
//     fontSize: 16,
//   },

//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: theme.colors.background,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   dateRangeSelector: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 16,
//     backgroundColor: theme.colors.background,
//     borderRadius: 8,
//     padding: 4,
//     elevation: 2,
//   },
//   dateRangeButton: {
//     flex: 1,
//     paddingVertical: 8,
//     alignItems: 'center',
//     borderRadius: 6,
//   },
//   dateRangeButtonActive: {
//     backgroundColor: theme.colors.primary,
//   },
//   dateRangeText: {
//     color: '#666',
//     fontWeight: '500',
//   },
//   dateRangeTextActive: {
//     color: theme.colors.background,
//     fontWeight: '500',
//   },
//   tabSelector: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   tabButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     marginHorizontal: 4,
//     borderRadius: 8,
//     backgroundColor: theme.colors.background,
//     elevation: 1,
//   },
//   tabButtonActive: {
//     backgroundColor: theme.colors.background,
//     borderBottomWidth: 2,
//     borderBottomColor: theme.colors.primary,
//   },
//   tabText: {
//     marginLeft: 4,
//     color: theme.colors.onBackground,
//     fontWeight: '500',
//   },
//   tabTextActive: {
//     marginLeft: 4,
//     color: theme.colors.primary,
//     fontWeight: '600',
//   },
//   summaryContainer: {
//     marginBottom: 16,
//   },
//   totalEarningsCard: {
//     backgroundColor: theme.colors.primary,
//     borderRadius: 12,
//     marginBottom: 12,
//     elevation: 4,
//   },
//   earningsLabel: {
//     color: theme.colors.onPrimary,
//     fontSize: 16,
//   },
//   earningsValue: {
//     color: theme.colors.onPrimary,
//     fontSize: 32,
//     fontWeight: 'bold',
//     marginVertical: 6,
//   },
//   earningsPeriod: {
//     color: theme.colors.onPrimary,
//     fontSize: 14,
//   },
//   metricsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   metricCard: {
//     flex: 1,
//     marginHorizontal: 4,
//     borderRadius: 12,
//     elevation: 2,
//   },
//   metricLabel: {
//     color: theme.colors.onBackground,
//     fontSize: 14,
//     marginTop: 6,
//   },
//   metricValue: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginTop: 2,
//   },
//   chartCard: {
//     marginBottom: 16,
//     borderRadius: 12,
//     elevation: 2,
//   },
//   chartContainer: {
//     marginTop: 10,
//     alignItems: 'center',
//   },
//   chart: {
//     marginVertical: 8,
//     borderRadius: 16,
//     backgroundColor: theme.colors.background,
//   },
//   pieChartContainer: {
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   cardTitle: {
//     fontSize: 18,
//     marginBottom: 12,
//   },
//   tableCard: {
//     marginBottom: 16,
//     borderRadius: 12,
//     elevation: 2,
//   },
//   emptyCard: {
//     marginBottom: 16,
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   emptyText: {
//     color: theme.colors.onBackground,
//     fontSize: 16,
//   },
//   insightsCard: {
//     marginBottom: 16,
//     borderRadius: 12,
//     elevation: 2,
//   },
//   insightRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: theme.colors.surface,
//   },
//   insightTextContainer: {
//     marginLeft: 12,
//   },
//   insightTitle: {
//     fontSize: 14,
//     color: theme.colors.onBackground,
//   },
//   insightValue: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginTop: 2,
//   },
//   // header: {
//   //   flexDirection: 'row', 
//   //   justifyContent: 'space-between', 
//   //   alignItems: 'center',
//   //   padding: 24, 
//   //   paddingTop: 60
//   // },
//   // welcomeText: { 
//   //   fontSize: 24, 
//   //   fontWeight: 'bold' 
//   // },
//   // logoutButton: { 
//   //   borderColor: '#fff' 
//   // },
//   // item: {
//   //   backgroundColor: '#fff', 
//   //   padding: 12, 
//   //   marginRight: 10,
//   //   marginTop: 17, 
//   //   borderRadius: 6, 
//   //   elevation: 2,
//   //   overflow: 'hidden'
//   // },
//   itemContent: {
//     flex: 1
//   },
//   // itemText: { 
//   //   fontSize: 16, 
//   //   color: '#333',
//   //   marginBottom: 2
//   // },
//   directionsButton: {
//     marginTop: 10,
//     borderRadius: 4
//   },
//   directionsButtonText: {
//     fontSize: 14
//   },
//   // emptyDate: {
//   //   height: 40, 
//   //   flex: 1, 
//   //   paddingTop: 20,
//   //   justifyContent: 'center', 
//   //   backgroundColor: '#f5f5f5', 
//   //   alignItems: 'center'
//   // },
//   // center: { 
//   //   flex: 1, 
//   //   justifyContent: 'center', 
//   //   alignItems: 'center' 
//   // },
//   expandedItem: {
//     minHeight: 180,
//     elevation: 6,
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 4.65,
//   },
//   callButton: {
//     marginTop: 10,
//     borderRadius: 4,
//     backgroundColor: '#4CAF50'
//   },
//   bookingCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     elevation: 3,
//     marginVertical: 8,
//     marginHorizontal: 4,
//     overflow: 'hidden',
//   },
//   expandedCard: {
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   cardContent: {
//     padding: 12,
//   },
//   bookingRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   maidDetails: {
//     flex: 3,
//     paddingRight: 10,
//   },
//   bookingTitle: {
//     fontSize: 17,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 8,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   infoIcon: {
//     marginRight: 6,
//   },
//   infoText: {
//     fontSize: 14,
//     color: '#555',
//     flex: 1,
//   },
//   timeContainer: {
//     flex: 1,
//     backgroundColor: '#F0F8FF',
//     borderRadius: 8,
//     padding: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   timeLabel: {
//     fontSize: 12,
//     color: '#666',
//     fontWeight: '500',
//   },
//   timeValue: {
//     fontSize: 18,
//     color: '#1368A4',
//     fontWeight: 'bold',
//     marginTop: 2,
//   },
//   actionButtonsContainer: {
//     marginTop: 14,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#EEE',
//   },
//   actionButton: {
//     flex: 1,
//     marginHorizontal: 4,
//     borderRadius: 8,
//   },
//   actionButton2: {
//     flex: 1,
//     marginHorizontal: 4,
//     borderRadius: 8,
//     backgroundColor: '#4CAF50',
//   },
//   // callButton: {
//   //   backgroundColor: '#4CAF50',
//   // },
//   buttonLabel: {
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   errorText: {
//     color: theme.colors.error || 'red',
//     fontSize: 12,
//     marginBottom: 8,
//     marginLeft: 4
//   },
//   menuButton: {
//     padding: 8,
//   },
// });
// export default HomeScreenMaid;

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Text, Button, TextInput, useTheme, Menu } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Agenda as RawAgenda } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList, Booking } from '../../types';
import theme from '../../config/theme';
import { Card, Title, Paragraph, DataTable, List } from 'react-native-paper';
import dayjs from 'dayjs';
import { LineChart, BarChart, PieChart, ContributionGraph } from 'react-native-chart-kit';
import { useRef } from 'react';
import { Linking, Platform } from 'react-native';
import Geocoder from 'react-native-geocoding';
import { useMaidAuth } from '../../hooks/useMaidauth';
import { useTranslation } from 'react-i18next';
import i18n from '../../locales/i18n';

Geocoder.init('AIzaSyAPQtPZzAuyG4dyEP-45rf8FtOr6pSUBsg');

const windowWidth = Dimensions.get('window').width;

const Agenda = RawAgenda as unknown as React.ComponentType<any>;
const Tab = createBottomTabNavigator();

type HomeScreenMaidRouteProp = RouteProp<RootStackParamList, 'HomeMaid'>;
type HomeScreenMaidNavigationProp = any;

const timeSlots = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

const HomeScreenMaid: React.FC = () => {
  const route = useRoute<HomeScreenMaidRouteProp>();
  const navigation = useNavigation<HomeScreenMaidNavigationProp>();
  const { name } = route.params;
  const theme = useTheme();
  const { logoutMaid } = useMaidAuth();
  const { t } = useTranslation();
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const menuRef = useRef<View>(null);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [languageSubmenuVisible, setLanguageSubmenuVisible] = useState<boolean>(false);

  const showMenu = () => {
    if (menuRef.current) {
      menuRef.current.measure((x, y, width, height, pageX, pageY) => {
        setMenuAnchor({ x: pageX, y: pageY });
        setMenuVisible(true);
      });
    }
  };

  const [maidToken, setMaidToken] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [items, setItems] = useState<{ [date: string]: any[] }>({});
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [cardAnimations, setCardAnimations] = useState<{ [key: string]: Animated.Value }>({});

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
      .then(res => {
        setBookings(res.data);
      })
      .catch(() => Alert.alert(t('error'), t('failed_load_bookings')));
  }, [maidToken, t]);

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
    bookings.forEach((b, bookingIndex) => {
      Object.keys(b.slot).forEach(dayName => {
        for (let i = 0; i < 30; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          if (d.toLocaleDateString('en-US', { weekday: 'long' }) === dayName) {
            const key = getLocalDateString(d);
            const uniqueId = `booking-${bookingIndex}-${dayName}-${i}`;
            newItems[key].push({
              id: uniqueId,
              name: `${t('booking')} ${b.userName}`,
              time: b.slot[dayName],
              location: b.userLocation,
              userContact: b.userContact,
              service: b.service,
            });
          }
        }
      });
    });
    setItems(newItems);
  }, [bookings, t]);

  useEffect(() => { generateCalendarItems(); }, [bookings, generateCalendarItems]);

  const toggleCardExpansion = (id: string) => {
    setExpandedBookingId(expandedBookingId === id ? null : id);
  };

  const openDirections = async (location: string) => {
    try {
      if (!location || location === 'N/A') {
        Alert.alert(t('error'), t('no_location_info'));
        return;
      }

      try {
        const response = await Geocoder.from(location);
        if (response.results && response.results.length > 0) {
          const { lat, lng } = response.results[0].geometry.location;
          const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
            return;
          }
        }
      } catch (geocodeError) {
        console.log('Geocoding error', geocodeError);
      }

      const encodedAddress = encodeURIComponent(location);
      const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      const canOpenFallback = await Linking.canOpenURL(fallbackUrl);
      if (canOpenFallback) {
        await Linking.openURL(fallbackUrl);
      } else {
        Alert.alert(t('error'), t('cannot_open_maps'));
      }
    } catch (error) {
      console.error('Error opening maps:', error);
      Alert.alert(t('error'), t('failed_open_directions'));
    }
  };

  const renderItem = (item: any) => {
    const isExpanded = expandedBookingId === item.id;
    return (
      <Card style={[styles.bookingCard, isExpanded && styles.expandedCard]}>
        <TouchableOpacity
          onPress={() => toggleCardExpansion(item.id)}
          activeOpacity={0.7}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.bookingRow}>
              <View style={styles.maidDetails}>
                <Text style={styles.bookingTitle}>{item.name}</Text>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#1368A4" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{item.service}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="phone" size={16} color="#1368A4" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{item.userContact}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker" size={16} color="#1368A4" style={styles.infoIcon} />
                  <Text style={styles.infoText} numberOfLines={2}>{item.location || 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeLabel}>{t('time')}</Text>
                <Text style={styles.timeValue}>{item.time}</Text>
              </View>
            </View>

            {isExpanded && (
              <View style={styles.actionButtonsContainer}>
                <Button
                  mode="contained"
                  onPress={() => openDirections(item.location)}
                  style={styles.actionButton}
                  icon="map-marker-radius"
                  labelStyle={styles.buttonLabel}
                >
                  {t('directions')}
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    const phoneNumber = item.userContact;
                    if (!phoneNumber || phoneNumber === 'N/A') {
                      Alert.alert(t('error'), t('no_contact_info'));
                      return;
                    }
                    Linking.openURL(`tel:${phoneNumber}`);
                  }}
                  style={[styles.actionButton2]}
                  icon="phone"
                  labelStyle={styles.buttonLabel}
                >
                  {t('call')}
                </Button>
              </View>
            )}
          </Card.Content>
        </TouchableOpacity>
      </Card>
    );
  };

  const handleSignOut = async () => {
    await logoutMaid();
    navigation.navigate('Welcome');
  };

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

    const getSelectedServicesText = () => {
      const selected = [];
      if (cleaning) selected.push(t('cleaning'));
      if (cooking) selected.push(t('cooking'));
      return selected.length > 0 ? selected.join(', ') : t('select_services');
    };

    return (
      <View style={styles.servicesContainer}>
        <Text style={styles.sectionTitle}>{t('services')}</Text>
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
              <Text style={styles.dropdownItemText}>{t('cleaning')}</Text>
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
              <Text style={styles.dropdownItemText}>{t('cooking')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const ProfileRoute = () => {
    const [profile, setProfile] = useState<any>({
      name: '',
      gender: 'Male',
      location: '',
      govtId: '',
      timeAvailable: {},
      selectedTimeSlots: [],
      cleaning: false,
      cooking: false,
      pricePerService: '',
      contact: ''
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [errors, setErrors] = useState<{ [K in keyof typeof profile]?: string }>({});

    const validate = () => {
      const errs: typeof errors = {};
      if (!profile.name.trim()) errs.name = t('name_required');
      if (!/^\+91\d{10}$/.test(profile.contact)) errs.contact = t('valid_contact');
      if (profile.selectedTimeSlots.length === 0) errs.timeAvailable = t('select_time_slots');
      if (!profile.cleaning && !profile.cooking) errs.services = t('select_services');
      if (!/^\d+(\.\d{1,2})?$/.test(profile.pricePerService) || Number(profile.pricePerService) <= 0)
        errs.pricePerService = t('positive_number');
      setErrors(errs);
      return Object.keys(errs).length === 0;
    };

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
          const {
            name = '',
            gender = 'Male',
            contact = '',
            timeAvailable = {},
            cleaning = false,
            cooking = false,
            pricePerService = ''
          } = data || {};

          let selectedTimeSlots: string[] = [];
          if (timeAvailable && typeof timeAvailable === 'object' && Object.keys(timeAvailable).length > 0) {
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
        .catch(() => Alert.alert(t('error'), t('failed_load_profile')))
        .finally(() => setLoading(false));
    }, [maidToken, t]);

    const handleTimeSlotChange = (time: string) => {
      const updatedTimeSlots = profile.selectedTimeSlots.includes(time)
        ? profile.selectedTimeSlots.filter((t: string) => t !== time)
        : [...profile.selectedTimeSlots, time];

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
      if (!validate()) {
        Alert.alert(t('error'), t('fix_highlighted_fields'));
        return;
      }

      AsyncStorage.getItem('token')
        .then(token => {
          if (!token) throw new Error('No token');

          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const timeAvailable = days.reduce((acc, day) => {
            acc[day] = profile.selectedTimeSlots;
            return acc;
          }, {} as { [key: string]: string[] });

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
        .then(() => Alert.alert(t('success'), t('profile_updated')))
        .catch(() => Alert.alert(t('error'), t('failed_update_profile')));
    };

    if (loading) {
      return <View style={styles.center}><Text>{t('loading')}</Text></View>;
    }

    return (
      <ScrollView contentContainerStyle={styles.formContainer}>
        <TextInput
          label={t('name')}
          value={profile.name}
          onChangeText={text => setProfile({ ...profile, name: text })}
          style={styles.input}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <TextInput
          label={t('contact_number')}
          value={profile.contact}
          onChangeText={text => {
            if (/^\+91\d{0,10}$/.test(text) || text === '') {
              setProfile({ ...profile, contact: text });
            }
          }}
          style={styles.input}
          placeholder="+911234567890"
          keyboardType="phone-pad"
          maxLength={13}
        />
        {errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}

        <Text style={styles.sectionTitle}>{t('time_available')}</Text>
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
            <Picker.Item label={t('select_time_slots')} value="" />
            {timeSlots.map((time) => (
              <Picker.Item key={time} label={time} value={time} />
            ))}
          </Picker>
        </View>
        {errors.timeAvailable && <Text style={styles.errorText}>{errors.timeAvailable}</Text>}

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

        <ServicesDropdown
          cleaning={profile.cleaning}
          cooking={profile.cooking}
          onServiceChange={handleServiceChange}
        />
        {errors.services && <Text style={styles.errorText}>{errors.services}</Text>}

        <TextInput
          label={t('price_service')}
          keyboardType="numeric"
          value={profile.pricePerService}
          onChangeText={text => setProfile({
            ...profile,
            pricePerService: text
          })}
          style={styles.input}
        />
        {errors.pricePerService && <Text style={styles.errorText}>{errors.pricePerService}</Text>}

        <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
          {t('save_profile')}
        </Button>
      </ScrollView>
    );
  };

  const EarningsRoute = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('week');
    const [selectedTab, setSelectedTab] = useState('summary');

    const earningsData = useMemo(() => {
      if (!bookings || bookings.length === 0) return null;

      const now = dayjs();
      let startDate;

      if (dateRange === 'week') {
        startDate = now.subtract(7, 'day');
      } else if (dateRange === 'month') {
        startDate = now.subtract(30, 'day');
      } else {
        startDate = now.subtract(365, 'day');
      }

      const totalEarnings = bookings.reduce((sum, booking) => sum + (booking.cost || 0), 0);

      const serviceBreakdown = bookings.reduce((acc: Record<string, number>, booking) => {
        const service = booking.service || 'other';
        acc[service] = (acc[service] || 0) + 1;
        return acc;
      }, {});

      const dailyData = [];
      const daysInPeriod = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 12;
      const labels = [];
      const data = [];

      for (let i = 0; i < daysInPeriod; i++) {
        const date = dateRange === 'year'
          ? now.subtract(i, 'month').format('MMM')
          : now.subtract(i, 'day').format('DD');

        const count = Math.floor(Math.random() * 3);
        const dailyEarning = count * (bookings[0]?.cost || 800);

        labels.unshift(date);
        data.unshift(dailyEarning);
      }

      const upcomingEarnings = bookings.length * (bookings[0]?.cost || 0) / 1;

      const pieChartData = Object.keys(serviceBreakdown).map((key, index) => {
        const colors = ['#FF8A65', '#64B5F6', '#81C784', '#FFD54F'];
        return {
          name: key.charAt(0).toUpperCase() + key.slice(1),
          population: serviceBreakdown[key],
          color: colors[index % colors.length],
          legendFontColor: '#7F7F7F',
          legendFontSize: 12
        };
      });

      const barChartData = {
        labels: [t('cooking'), t('cleaning')],
        datasets: [
          {
            data: [
              bookings.filter(b => b.service === 'cooking').reduce((sum, b) => sum + (b.cost || 0), 0),
              bookings.filter(b => b.service === 'cleaning').reduce((sum, b) => sum + (b.cost || 0), 0)
            ]
          }
        ]
      };

      return {
        totalEarnings,
        lineChartData: {
          labels,
          datasets: [{ data }]
        },
        pieChartData,
        barChartData,
        upcomingEarnings,
        bookingsCount: bookings.length
      };
    }, [bookings, dateRange, t]);

    const renderPaymentHistory = () => {
      if (!bookings || bookings.length === 0) {
        return (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>{t('no_payment_history')}</Text>
            </Card.Content>
          </Card>
        );
      }

      return (
        <Card style={styles.tableCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('payment_history')}</Title>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>{t('client')}</DataTable.Title>
                <DataTable.Title>{t('service')}</DataTable.Title>
                <DataTable.Title numeric>{t('amount')}</DataTable.Title>
              </DataTable.Header>

              {bookings.map((booking, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell>{booking.userName}</DataTable.Cell>
                  <DataTable.Cell>{booking.service}</DataTable.Cell>
                  <DataTable.Cell numeric>₹{booking.cost}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>
      );
    };

    const chartConfig = {
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
      strokeWidth: 2,
      barPercentage: 0.7,
      useShadowColorFromDataset: false,
      decimalPlaces: 0,
    };

    useEffect(() => {
      setLoading(false);
    }, [bookings]);

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text>{t('loading')}</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.container}>
        <View style={styles.dateRangeSelector}>
          <TouchableOpacity
            style={[styles.dateRangeButton, dateRange === 'week' && styles.dateRangeButtonActive]}
            onPress={() => setDateRange('week')}
          >
            <Text style={dateRange === 'week' ? styles.dateRangeTextActive : styles.dateRangeText}>
              {t('week')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateRangeButton, dateRange === 'month' && styles.dateRangeButtonActive]}
            onPress={() => setDateRange('month')}
          >
            <Text style={dateRange === 'month' ? styles.dateRangeTextActive : styles.dateRangeText}>
              {t('month')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateRangeButton, dateRange === 'year' && styles.dateRangeButtonActive]}
            onPress={() => setDateRange('year')}
          >
            <Text style={dateRange === 'year' ? styles.dateRangeTextActive : styles.dateRangeText}>
              {t('year')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'summary' && styles.tabButtonActive]}
            onPress={() => setSelectedTab('summary')}
          >
            <MaterialCommunityIcons
              name="chart-box-outline"
              size={20}
              color={selectedTab === 'summary' ? theme.colors.primary : '#888'}
            />
            <Text style={selectedTab === 'summary' ? styles.tabTextActive : styles.tabText}>
              {t('summary')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'details' && styles.tabButtonActive]}
            onPress={() => setSelectedTab('details')}
          >
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={20}
              color={selectedTab === 'details' ? theme.colors.primary : '#888'}
            />
            <Text style={selectedTab === 'details' ? styles.tabTextActive : styles.tabText}>
              {t('details')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'analysis' && styles.tabButtonActive]}
            onPress={() => setSelectedTab('analysis')}
          >
            <MaterialCommunityIcons
              name="chart-line"
              size={20}
              color={selectedTab === 'analysis' ? theme.colors.primary : '#888'}
            />
            <Text style={selectedTab === 'analysis' ? styles.tabTextActive : styles.tabText}>
              {t('analysis')}
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'summary' && (
          <>
            <View style={styles.summaryContainer}>
              <Card style={styles.totalEarningsCard}>
                <Card.Content>
                  <Text style={styles.earningsLabel}>{t('total_earnings')}</Text>
                  <Text style={styles.earningsValue}>₹{earningsData?.totalEarnings || 0}</Text>
                  <Text style={styles.earningsPeriod}>
                    {dateRange === 'week' ? t('this_week') : 
                     dateRange === 'month' ? t('this_month') : t('this_year')}
                  </Text>
                </Card.Content>
              </Card>

              <View style={styles.metricsRow}>
                <Card style={styles.metricCard}>
                  <Card.Content>
                    <MaterialCommunityIcons name="calendar-check" size={24} color={theme.colors.primary} />
                    <Text style={styles.metricLabel}>{t('bookings')}</Text>
                    <Text style={styles.metricValue}>{earningsData?.bookingsCount || 0}</Text>
                  </Card.Content>
                </Card>

                <Card style={styles.metricCard}>
                  <Card.Content>
                    <MaterialCommunityIcons name="currency-inr" size={24} color="#4CAF50" />
                    <Text style={styles.metricLabel}>{t('upcoming')}</Text>
                    <Text style={styles.metricValue}>₹{earningsData?.upcomingEarnings || 0}</Text>
                  </Card.Content>
                </Card>
              </View>
            </View>

            <Card style={styles.chartCard}>
              <Card.Content>
                <Title style={styles.cardTitle}>{t('service_breakdown')}</Title>
                <View style={styles.pieChartContainer}>
                  {earningsData?.pieChartData && earningsData.pieChartData.length > 0 && (
                    <PieChart
                      data={earningsData.pieChartData}
                      width={windowWidth - 60}
                      height={200}
                      chartConfig={chartConfig}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      center={[0, 0]}
                      absolute
                    />
                  )}
                </View>
              </Card.Content>
            </Card>
          </>
        )}

        {selectedTab === 'details' && (
          <>
            {renderPaymentHistory()}
          </>
        )}

        {selectedTab === 'analysis' && (
          <>
            <Card style={styles.chartCard}>
              <Card.Content>
                <Title style={styles.cardTitle}>{t('earnings_by_service')}</Title>
                <View style={styles.chartContainer}>
                  {earningsData?.barChartData && (
                    <BarChart
                      data={earningsData.barChartData}
                      width={windowWidth - 60}
                      height={220}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(19, 104, 164, ${opacity})`,
                        barPercentage: 0.7,
                      }}
                      style={styles.chart}
                      yAxisLabel="₹"
                      yAxisSuffix=""
                      fromZero
                    />
                  )}
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.insightsCard}>
              <Card.Content>
                <Title style={styles.cardTitle}>{t('earnings_insights')}</Title>
                <View style={styles.insightRow}>
                  <MaterialCommunityIcons name="trending-up" size={24} color="#4CAF50" />
                  <View style={styles.insightTextContainer}>
                    <Text style={styles.insightTitle}>{t('most_profitable_service')}</Text>
                    <Text style={styles.insightValue}>
                      {bookings.filter(b => b.service === 'cooking').length >=
                        bookings.filter(b => b.service === 'cleaning').length ? 
                        t('cooking') : t('cleaning')}
                    </Text>
                  </View>
                </View>

                <View style={styles.insightRow}>
                  <MaterialCommunityIcons name="calendar-clock" size={24} color={theme.colors.primary} />
                  <View style={styles.insightTextContainer}>
                    <Text style={styles.insightTitle}>{t('busiest_day')}</Text>
                    <Text style={styles.insightValue}>
                      {(() => {
                        const dayCounts = bookings
                          .flatMap(b => Object.keys(b.slot))
                          .reduce((acc: Record<string, number>, day) => {
                            acc[day] = (acc[day] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);

                        const busiestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
                        return busiestDay ? busiestDay[0] : 'N/A';
                      })()}
                    </Text>
                  </View>
                </View>

                <View style={styles.insightRow}>
                  <MaterialCommunityIcons name="cash-multiple" size={24} color="#FF9800" />
                  <View style={styles.insightTextContainer}>
                    <Text style={styles.insightTitle}>{t('average_per_booking')}</Text>
                    <Text style={styles.insightValue}>
                      ₹{bookings.length > 0 ?
                        Math.round(bookings.reduce((sum, b) => sum + (b.cost || 0), 0) / bookings.length) : 0}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
    );
  };

  const renderMenu = () => {
    return (
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={menuAnchor}
        style={{ marginTop: 40 }}
      >
        <Menu.Item
          onPress={() => {
            setLanguageSubmenuVisible(true);
            setMenuVisible(false);
          }}
          title={t('select_language')}
          leadingIcon="translate"
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            handleSignOut();
          }}
          title={t('logout')}
          leadingIcon="logout"
        />
      </Menu>
    );
  };

  const renderLanguageMenu = () => {
    return (
      <Menu
        visible={languageSubmenuVisible}
        onDismiss={() => setLanguageSubmenuVisible(false)}
        anchor={menuAnchor}
        style={{ marginTop: 40 }}
      >
        <Menu.Item
          onPress={() => {
            setLanguageSubmenuVisible(false);
            changeLanguage('en');
          }}
          title={t('english')}
          style={{ opacity: i18n.language === 'en' ? 1 : 0.6 }}
        />
        <Menu.Item
          onPress={() => {
            setLanguageSubmenuVisible(false);
            changeLanguage('hi');
          }}
          title={t('hindi')}
          style={{ opacity: i18n.language === 'hi' ? 1 : 0.6 }}
        />
        <Menu.Item
          onPress={() => {
            setLanguageSubmenuVisible(false);
            changeLanguage('ma');
          }}
          title={t('marathi')}
          style={{ opacity: i18n.language === 'ma' ? 1 : 0.6 }}
        />
      </Menu>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.welcomeText, { color: theme.colors.onPrimary }]}>
          {t('welcomemaid')}, {name}!
        </Text>
        <TouchableOpacity
          ref={menuRef}
          onPress={showMenu}
          style={styles.menuButton}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={theme.colors.onPrimary}
          />
        </TouchableOpacity>
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
                    {t('no_work_scheduled')}
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
      {renderMenu()}
      {renderLanguageMenu()}
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
  itemText: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  emptyDate: {
    height: 40, flex: 1, paddingTop: 20,
    justifyContent: 'center', backgroundColor: '#f5f5f5', alignItems: 'center'
  },
  // emptyText: { fontSize: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, marginBottom: 10 },
  formContainer: { padding: 16, color: theme.colors.background },
  input: { marginBottom: 12, backgroundColor: theme.colors.surface },
  sectionTitle: { fontSize: 16, marginTop: 10, marginBottom: 3, marginLeft: 6 },
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

  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 4,
    elevation: 2,
  },
  dateRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  dateRangeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  dateRangeText: {
    color: '#666',
    fontWeight: '500',
  },
  dateRangeTextActive: {
    color: theme.colors.background,
    fontWeight: '500',
  },
  tabSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    elevation: 1,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    marginLeft: 4,
    color: theme.colors.onBackground,
    fontWeight: '500',
  },
  tabTextActive: {
    marginLeft: 4,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  summaryContainer: {
    marginBottom: 16,
  },
  totalEarningsCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 4,
  },
  earningsLabel: {
    color: theme.colors.onPrimary,
    fontSize: 16,
  },
  earningsValue: {
    color: theme.colors.onPrimary,
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  earningsPeriod: {
    color: theme.colors.onPrimary,
    fontSize: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    elevation: 2,
  },
  metricLabel: {
    color: theme.colors.onBackground,
    fontSize: 14,
    marginTop: 6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 2,
  },
  chartCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  chartContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
  },
  pieChartContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  tableCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  emptyCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: theme.colors.onBackground,
    fontSize: 16,
  },
  insightsCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  insightTextContainer: {
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    color: theme.colors.onBackground,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  // header: {
  //   flexDirection: 'row', 
  //   justifyContent: 'space-between', 
  //   alignItems: 'center',
  //   padding: 24, 
  //   paddingTop: 60
  // },
  // welcomeText: { 
  //   fontSize: 24, 
  //   fontWeight: 'bold' 
  // },
  // logoutButton: { 
  //   borderColor: '#fff' 
  // },
  // item: {
  //   backgroundColor: '#fff', 
  //   padding: 12, 
  //   marginRight: 10,
  //   marginTop: 17, 
  //   borderRadius: 6, 
  //   elevation: 2,
  //   overflow: 'hidden'
  // },
  itemContent: {
    flex: 1
  },
  // itemText: { 
  //   fontSize: 16, 
  //   color: '#333',
  //   marginBottom: 2
  // },
  directionsButton: {
    marginTop: 10,
    borderRadius: 4
  },
  directionsButtonText: {
    fontSize: 14
  },
  // emptyDate: {
  //   height: 40, 
  //   flex: 1, 
  //   paddingTop: 20,
  //   justifyContent: 'center', 
  //   backgroundColor: '#f5f5f5', 
  //   alignItems: 'center'
  // },
  // center: { 
  //   flex: 1, 
  //   justifyContent: 'center', 
  //   alignItems: 'center' 
  // },
  expandedItem: {
    minHeight: 180,
    elevation: 6,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  callButton: {
    marginTop: 10,
    borderRadius: 4,
    backgroundColor: '#4CAF50'
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    marginVertical: 8,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  expandedCard: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 12,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  maidDetails: {
    flex: 3,
    paddingRight: 10,
  },
  bookingTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  timeContainer: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 18,
    color: '#1368A4',
    fontWeight: 'bold',
    marginTop: 2,
  },
  actionButtonsContainer: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  actionButton2: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  // callButton: {
  //   backgroundColor: '#4CAF50',
  // },
  buttonLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  errorText: {
    color: theme.colors.error || 'red',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4
  },
  menuButton: {
    padding: 8,
  },
});


export default HomeScreenMaid;
