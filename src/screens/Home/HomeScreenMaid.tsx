import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
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
import { Card, Title, Paragraph, DataTable, List } from 'react-native-paper';
import dayjs from 'dayjs';
import { LineChart, BarChart, PieChart, ContributionGraph } from 'react-native-chart-kit';


const windowWidth = Dimensions.get('window').width;

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
      .then(res => {
        setBookings(res.data);
        console.log('Bookings data:', res.data);
      })
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

  const EarningsRoute = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('week'); // 'week', 'month', 'year'
    const [selectedTab, setSelectedTab] = useState('summary'); // 'summary', 'details', 'analysis'

    // Reuse bookings state from parent component instead of fetching again
    // Calculate earnings data
    const earningsData = useMemo(() => {
      if (!bookings || bookings.length === 0) return null;

      // Get current period start and end dates based on selected range
      const now = dayjs();
      let startDate;

      if (dateRange === 'week') {
        startDate = now.subtract(7, 'day');
      } else if (dateRange === 'month') {
        startDate = now.subtract(30, 'day');
      } else {
        startDate = now.subtract(365, 'day');
      }

      // Calculate total earnings from bookings
      const totalEarnings = bookings.reduce((sum, booking) => sum + (booking.cost || 0), 0);

      // Count bookings by service type
      const serviceBreakdown = bookings.reduce((acc: Record<string, number>, booking) => {
        const service = booking.service || 'other';
        acc[service] = (acc[service] || 0) + 1;
        return acc;
      }, {});

      // Generate daily earnings data
      const dailyData = [];
      const daysInPeriod = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 12;
      const labels = [];
      const data = [];

      for (let i = 0; i < daysInPeriod; i++) {
        const date = dateRange === 'year'
          ? now.subtract(i, 'month').format('MMM')
          : now.subtract(i, 'day').format('DD');

        // Count bookings on this date/month (using simulated data)
        const count = Math.floor(Math.random() * 3); // Simulating 0-2 bookings per day
        const dailyEarning = count * (bookings[0]?.cost || 800); // Use first booking cost or default to 800

        labels.unshift(date);
        data.unshift(dailyEarning);
      }

      // Calculate upcoming earnings (next 7 days)
      const upcomingEarnings = bookings.length * (bookings[0]?.cost || 0) / 4; // Simple estimation

      // Prepare data for pie chart
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

      // Service earnings for bar chart
      const barChartData = {
        labels: ['Cooking', 'Cleaning'],
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
    }, [bookings, dateRange]);

    // For the payment history table
    const renderPaymentHistory = () => {
      if (!bookings || bookings.length === 0) {
        return (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>No payment history available</Text>
            </Card.Content>
          </Card>
        );
      }

      return (
        <Card style={styles.tableCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Payment History</Title>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Client</DataTable.Title>
                <DataTable.Title>Service</DataTable.Title>
                <DataTable.Title numeric>Amount</DataTable.Title>
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

    // Default chart configuration
    const chartConfig = {
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
      strokeWidth: 2,
      barPercentage: 0.7,
      useShadowColorFromDataset: false,
      decimalPlaces: 0,
    };

    // Clear loading state when bookings data is available
    useEffect(() => {
      if (bookings && bookings.length > 0) {
        setLoading(false);
      }
    }, [bookings]);

    // Loading state
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text>Loading earnings data...</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.container}>
        {/* Date Range Selector */}
        <View style={styles.dateRangeSelector}>
          <TouchableOpacity
            style={[styles.dateRangeButton, dateRange === 'week' && styles.dateRangeButtonActive]}
            onPress={() => setDateRange('week')}
          >
            <Text style={dateRange === 'week' ? styles.dateRangeTextActive : styles.dateRangeText}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateRangeButton, dateRange === 'month' && styles.dateRangeButtonActive]}
            onPress={() => setDateRange('month')}
          >
            <Text style={dateRange === 'month' ? styles.dateRangeTextActive : styles.dateRangeText}>
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateRangeButton, dateRange === 'year' && styles.dateRangeButtonActive]}
            onPress={() => setDateRange('year')}
          >
            <Text style={dateRange === 'year' ? styles.dateRangeTextActive : styles.dateRangeText}>
              Year
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
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
              Summary
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
              Details
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
              Analysis
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'summary' && (
          <>
            {/* Earnings Summary */}
            <View style={styles.summaryContainer}>
              <Card style={styles.totalEarningsCard}>
                <Card.Content>
                  <Text style={styles.earningsLabel}>Total Earnings</Text>
                  <Text style={styles.earningsValue}>₹{earningsData?.totalEarnings || 0}</Text>
                  <Text style={styles.earningsPeriod}>
                    {dateRange === 'week' ? 'This Week' : dateRange === 'month' ? 'This Month' : 'This Year'}
                  </Text>
                </Card.Content>
              </Card>

              <View style={styles.metricsRow}>
                <Card style={styles.metricCard}>
                  <Card.Content>
                    <MaterialCommunityIcons name="calendar-check" size={24} color={theme.colors.primary} />
                    <Text style={styles.metricLabel}>Bookings</Text>
                    <Text style={styles.metricValue}>{earningsData?.bookingsCount || 0}</Text>
                  </Card.Content>
                </Card>

                <Card style={styles.metricCard}>
                  <Card.Content>
                    <MaterialCommunityIcons name="currency-inr" size={24} color="#4CAF50" />
                    <Text style={styles.metricLabel}>Upcoming</Text>
                    <Text style={styles.metricValue}>₹{earningsData?.upcomingEarnings || 0}</Text>
                  </Card.Content>
                </Card>
              </View>
            </View>

            {/* Earnings Chart */}
            <Card style={styles.chartCard}>
              <Card.Content>
                <Title style={styles.cardTitle}>Earnings Trend</Title>
                <View style={styles.chartContainer}>
                  {earningsData?.lineChartData && (
                    <LineChart
                    data={earningsData.lineChartData}
                    width={windowWidth - 60}
                    height={220}
                    chartConfig={{
                      ...chartConfig,
                      backgroundColor: theme.colors.background,
                      backgroundGradientFrom: theme.colors.background,
                      backgroundGradientTo: theme.colors.background,
                      color: (opacity = 1) => `rgba(19, 104, 164, ${opacity})`,  // Changed to theme.colors.primary
                      strokeWidth: 2,
                      barPercentage: 0.7,
                      useShadowColorFromDataset: false,
                      decimalPlaces: 0,
                      propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: theme.colors.primary,
                        color: theme.colors.primary,
                      }
                    }}
                    bezier
                    style={styles.chart}
                    yAxisLabel="₹"
                  />
                  )}
                </View>
              </Card.Content>
            </Card>

            {/* Service Breakdown */}
            <Card style={styles.chartCard}>
              <Card.Content>
                <Title style={styles.cardTitle}>Service Breakdown</Title>
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
                <Title style={styles.cardTitle}>Earnings by Service</Title>
                <View style={styles.chartContainer}>
                  {earningsData?.barChartData && (
                    <BarChart
                    data={earningsData.barChartData}
                    width={windowWidth - 60}
                    height={220}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => `rgba(19, 104, 164, ${opacity})`,  // Changed to theme.colors.primary
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
                <Title style={styles.cardTitle}>Earnings Insights</Title>
                <View style={styles.insightRow}>
                  <MaterialCommunityIcons name="trending-up" size={24} color="#4CAF50" />
                  <View style={styles.insightTextContainer}>
                    <Text style={styles.insightTitle}>Most Profitable Service</Text>
                    <Text style={styles.insightValue}>
                      {bookings.filter(b => b.service === 'cooking').length >=
                        bookings.filter(b => b.service === 'cleaning').length ? 'Cooking' : 'Cleaning'}
                    </Text>
                  </View>
                </View>

                <View style={styles.insightRow}>
                  <MaterialCommunityIcons name="calendar-clock" size={24} color={theme.colors.primary} />
                  <View style={styles.insightTextContainer}>
                    <Text style={styles.insightTitle}>Busiest Day</Text>
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
                    <Text style={styles.insightTitle}>Average Per Booking</Text>
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
});
export default HomeScreenMaid;