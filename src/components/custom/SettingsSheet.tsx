import React, { useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import { useAuth, useUser } from '@/src/hooks';
import { showConfirmation } from '@/src/utils/helpers';
import { colors, spacing, typography, borderRadius } from '@/src/theme';
import type { SettingsSheetProps } from '@/src/types';
import type { RootStackParamList } from '@/src/navigation/types';
import { APP_CONFIG } from '@/src/config/constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
  showArrow?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = React.memo(({
  icon,
  title,
  subtitle,
  onPress,
  iconColor = colors.primary,
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
      {showArrow && <Ionicons name="chevron-forward" size={20} color={colors.gray400} />}
    </View>
  </Pressable>
));

SettingsItem.displayName = 'SettingsItem';

export const SettingsSheet: React.FC<SettingsSheetProps> = React.memo(({
  visible,
  onClose,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();
  const { deleteAccount } = useUser();

  const handleLogOut = useCallback(() => {
    showConfirmation(
      'Log Out',
      'Are you sure you want to log out?',
      async () => {
        await logout();
        onClose();
      }
    );
  }, [logout, onClose]);

  const handleDeleteAccount = useCallback(() => {
    showConfirmation(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      async () => {
        const result = await deleteAccount();
        if (result.success) {
          await logout();
          onClose();
        }
      }
    );
  }, [deleteAccount, logout, onClose]);

  const handleMembershipStatus = useCallback(() => {
    navigation.navigate('Membership');
    onClose();
  }, [navigation, onClose]);

  const handleOpenLink = useCallback(async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Error opening browser:', error);
    }
  }, []);

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
            <Ionicons name="close" size={28} color={colors.textPrimary} />
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
                subtitle={user?.isPremium ? 'Premium' : 'Standard'}
                onPress={handleMembershipStatus}
              />
              <SettingsItem
                icon="refresh-circle-outline"
                title="Restore purchases"
                onPress={() => {}}
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
                onPress={() => {}}
              />
              <SettingsItem
                icon="heart-circle-outline"
                title="Rate us"
                onPress={() => {}}
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
                onPress={() => handleOpenLink(APP_CONFIG.privacyPolicyUrl)}
              />
              <SettingsItem
                icon="globe-outline"
                title="Terms of Service"
                onPress={() => handleOpenLink(APP_CONFIG.termsOfServiceUrl)}
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
              />
              <SettingsItem
                icon="trash-outline"
                title="Delete Account"
                onPress={handleDeleteAccount}
                iconColor={colors.error}
              />
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>2025 {APP_CONFIG.name}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
});

SettingsSheet.displayName = 'SettingsSheet';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
    marginRight: spacing.md,
  },
  settingsItemTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingsItemSubtitle: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  footer: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
    marginVertical: spacing['4xl'],
  },
});

