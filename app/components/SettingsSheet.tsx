import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { userAPI } from '../src/api/apiClient';



interface SettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
  showArrow?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  iconColor = '#7C3AED',
  showArrow = true,
}) => (
  <Pressable style={styles.settingsItem} onPress={onPress}>
    <View style={styles.settingsItemLeft}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.settingsItemTitle}>{title}</Text>
    </View>
    <View style={styles.settingsItemRight}>
      {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
      {showArrow && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
    </View>
  </Pressable>
);

export default function SettingsSheet({ visible, onClose }: SettingsSheetProps) {
  
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.isPremium !== undefined) {
            setIsPremium(user.isPremium);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, [visible]);

  const handleLogOut = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userData');
            onClose();
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await userAPI.delete();
              Alert.alert('Account deleted successfully');
              onClose();
              router.replace('/welcome');
            } catch (error) {
              Alert.alert('Error deleting account');
            }
          },
        },
      ]
    );
  };

  const handleMembershipStatus = () => {
    router.push('/membershipScreen');
    onClose();
  };

  const handleRestorePurchases = () => {
    Alert.alert('Restore Purchases');
  };

  const handleContactUs = () => {
    Alert.alert('Contact Us');
  };

  const handleRateUs = () => {
    Alert.alert('Rate Us');
  };

  const handlePrivacyPolicy = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://www.google.com');
    } catch (error) {
      Alert.alert('Error', 'Unable to open the link');
    }
  };

  const handleTermsOfService = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://www.google.com');
    } catch (error) {
      Alert.alert('Error', 'Unable to open the link');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#1F2937" />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Membership Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Membership</Text>
            <View style={styles.sectionContent}>
              <SettingsItem
                icon="person-circle-outline"
                title="Membership status"
                subtitle={
                  isPremium ? 'Premium' : 'Standard'
                }
                onPress={handleMembershipStatus}
                iconColor="#7C3AED"
              />
              <SettingsItem
                icon="refresh-circle-outline"
                title="Restore purchases"
                onPress={handleRestorePurchases}
                iconColor="#7C3AED"
              />
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.sectionContent}>
              <SettingsItem
                icon="information-circle-outline"
                title="Contact us"
                onPress={handleContactUs}
                iconColor="#7C3AED"
              />
              <SettingsItem
                icon="heart-circle-outline"
                title="Rate us"
                onPress={handleRateUs}
                iconColor="#7C3AED"
              />
            </View>
          </View>

          {/* Legal Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal</Text>
            <View style={styles.sectionContent}>
              <SettingsItem
                icon="globe-outline"
                title="Privacy Policy"
                onPress={handlePrivacyPolicy}
                iconColor="#7C3AED"
              />
              <SettingsItem
                icon="globe-outline"
                title="Terms of Service"
                onPress={handleTermsOfService}
                iconColor="#7C3AED"
              />
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.sectionContent}>
              <SettingsItem
                icon="log-out-outline"
                title="Log Out"
                onPress={handleLogOut}
                iconColor="#7C3AED"
              />
              <SettingsItem
                icon="trash-outline"
                title="Delete Account"
                onPress={handleDeleteAccount}
                iconColor="#EF4444"
              />
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>2025 Karma.AI</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsItemTitle: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  footer: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 32,
  },
});

