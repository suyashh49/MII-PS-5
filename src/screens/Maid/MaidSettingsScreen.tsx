// src/screens/Maid/MaidSettingsScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, List, Divider, Switch, useTheme, Card } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useMaidAuth } from '../../hooks/useMaidauth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import i18n from '../../locales/i18n';
import theme from '../../config/theme';

const MaidSettingsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { logoutMaid } = useMaidAuth();
  const { t } = useTranslation();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
  
  const handleSignOut = async () => {
    Alert.alert(
      t('logout_confirmation'),
      t('logout_message'),
      [
        {
          text: t('cancel'),
          style: 'cancel'
        },
        {
          text: t('logout'),
          onPress: async () => {
            await logoutMaid();
            navigation.navigate('Welcome' as never);
          },
          style: 'destructive'
        }
      ]
    );
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setSelectedLanguage(lang);
    AsyncStorage.setItem('userLanguage', lang);
  };

  const renderLanguageOption = (language: string, label: string) => {
    return (
      <TouchableOpacity
        style={[
          styles.languageOption,
          selectedLanguage === language && { backgroundColor: theme.colors.primary + '20' }
        ]}
        onPress={() => changeLanguage(language)}
      >
        <Text style={[
          styles.languageText,
          selectedLanguage === language && { color: theme.colors.primary, fontWeight: 'bold' }
        ]}>
          {label}
        </Text>
        {selectedLanguage === language && (
          <MaterialCommunityIcons name="check" size={20} color={theme.colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
      </View> */}

      <Card style={styles.section}>
        <Card.Content>
          <Text style={styles.sectionTitle}>{t('account')}</Text>
          <List.Item
            title={t('profile')}
            description={t('view_edit_profile')}
            left={props => <List.Icon {...props} icon="account" color={theme.colors.primary} />}
            onPress={() => navigation.navigate('Profile' as never)}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <Divider />
          <List.Item
            title={t('notifications')}
            description={t('manage_notifications')}
            left={props => <List.Icon {...props} icon="bell" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color={theme.colors.primary}
              />
            )}
          />
          {/* <Divider /> */}
          {/* <List.Item
            title={t('location_services')}
            description={t('enable_location_services')}
            left={props => <List.Icon {...props} icon="map-marker" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                color={theme.colors.primary}
              />
            )}
          /> */}
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text style={styles.sectionTitle}>{t('appearance')}</Text>
          <List.Item
            title={t('dark_mode')}
            description={t('enable_dark_mode')}
            left={props => <List.Icon {...props} icon="theme-light-dark" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider />
          <List.Item
            title={t('language')}
            description={t('select_language')}
            left={props => <List.Icon {...props} icon="translate" color={theme.colors.primary} />}
            onPress={() => {}}
          />
          <View style={styles.languageContainer}>
            {renderLanguageOption('en', t('english'))}
            {renderLanguageOption('hi', t('hindi'))}
            {renderLanguageOption('ma', t('marathi'))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text style={styles.sectionTitle}>{t('support')}</Text>
          <List.Item
            title={t('help_center')}
            description={t('get_help')}
            left={props => <List.Icon {...props} icon="help-circle" color={theme.colors.primary} />}
            onPress={() => {}}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <Divider />
          <List.Item
            title={t('about')}
            description={t('about_app')}
            left={props => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
            onPress={() => {}}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <Divider />
          <List.Item
            title={t('privacy_policy')}
            left={props => <List.Icon {...props} icon="shield-account" color={theme.colors.primary} />}
            onPress={() => {}}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </Card.Content>
      </Card>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
        onPress={handleSignOut}
      >
        <MaterialCommunityIcons name="logout" size={20} color="#fff" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Maid In India v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1368A4',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor:theme.colors.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  languageContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  languageText: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    color: '#888',
    fontSize: 14,
  },
});

export default MaidSettingsScreen;