// src/screens/Maid/MaidProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

const timeSlots = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

const MaidProfileScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
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
  const [errors, setErrors] = useState<{ [K in keyof typeof profile]?: string }>({});
  const [maidToken, setMaidToken] = useState<string | null>(null);

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
        setMaidToken(token);
        if (!token) throw new Error('No token');
        return axios.get(
          'https://maid-in-india-nglj.onrender.com/api/maid/profile',
          { headers: { Authorization: `Bearer ${token}` } }
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
  }, [t]);

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

    if (!maidToken) {
      Alert.alert(t('error'), t('no_token'));
      return;
    }

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

    axios.put(
      'https://maid-in-india-nglj.onrender.com/api/maid/profile',
      body,
      { headers: { Authorization: `Bearer ${maidToken}` } }
    )
      .then(() => Alert.alert(t('success'), t('profile_updated')))
      .catch(() => Alert.alert(t('error'), t('failed_update_profile')));
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

      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleSave}
      >
        <Text style={{ color: theme.colors.onPrimary, textAlign: 'center' }}>
          {t('save_profile')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
      },
      formContainer: { 
        padding: 16, 
        paddingTop: 30,
        paddingBottom: 50
      },
      input: { 
        marginBottom: 12, 
        backgroundColor: '#fff' 
      },
      sectionTitle: { 
        fontSize: 16, 
        marginTop: 10, 
        marginBottom: 3, 
        marginLeft: 6 
      },
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
      saveButton: { 
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
        elevation: 2
      },
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
      errorText: {
        color: '#EA4335',
        fontSize: 12,
        marginBottom: 8,
        marginLeft: 4
      },
    });
    
    export default MaidProfileScreen;