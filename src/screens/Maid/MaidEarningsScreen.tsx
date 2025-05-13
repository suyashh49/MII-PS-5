// src/screens/Maid/MaidEarningsScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, Title, DataTable, useTheme } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Booking } from '../../types';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import theme from '../../config/theme';

const windowWidth = Dimensions.get('window').width;

const MaidEarningsScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');
  const [selectedTab, setSelectedTab] = useState('summary');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [maidToken, setMaidToken] = useState<string | null>(null);

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
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load bookings:', error);
        setLoading(false);
      });
  }, [maidToken]);

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f7f7',
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
    backgroundColor: '#fff',
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
    backgroundColor: '#1368A4',
  },
  dateRangeText: {
    color: '#666',
    fontWeight: '500',
  },
  dateRangeTextActive: {
    color: '#fff',
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
    backgroundColor: '#fff',
    elevation: 1,
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#1368A4',
  },
  tabText: {
    marginLeft: 4,
    color: '#333',
    fontWeight: '500',
  },
  tabTextActive: {
    marginLeft: 4,
    color: '#1368A4',
    fontWeight: '600',
  },
  summaryContainer: {
    marginBottom: 16,
  },
  totalEarningsCard: {
    backgroundColor: '#1368A4',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 4,
  },
  earningsLabel: {
    color: '#fff',
    fontSize: 16,
  },
  earningsValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  earningsPeriod: {
    color: '#fff',
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
    backgroundColor:theme.colors.background,
  },
  metricLabel: {
    color: '#333',
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
    backgroundColor: '#fff',
  },
  chartContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
  },
  emptyCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  insightsCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "white",
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  insightTextContainer: {
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    color: '#666',
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default MaidEarningsScreen;