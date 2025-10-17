import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useUser } from '@/src/hooks';
import { colors, spacing, typography, borderRadius, shadows } from '@/src/theme';
import type { MembershipPlan } from '@/src/types';
import type { RootStackParamList } from '@/src/navigation/types';
import { APP_CONFIG } from '@/src/config/constants';
import { showError } from '@/src/utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Membership'>;

export const MembershipScreen: React.FC = React.memo(() => {
  const navigation = useNavigation<NavigationProp>();
  const { purchasePremium, isLoading } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan>('annual');

  const handleContinue = useCallback(async () => {
    const result = await purchasePremium(selectedPlan);
    if (result.success) {
      navigation.goBack();
    }
  }, [selectedPlan, purchasePremium, navigation]);

  const handleTermsOfUse = useCallback(async () => {
    try {
      await WebBrowser.openBrowserAsync(APP_CONFIG.termsOfServiceUrl);
    } catch (error) {
      showError('Unable to open the link');
    }
  }, []);

  const handleRestorePurchase = useCallback(() => {
    // Implement restore purchase logic
    showError('Restore purchase.');
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationWrapper}>
            <Image
              source={require('../../assets/images/home_page.png')}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Unlimited Generate</Text>
        <Text style={styles.subtitle}>
          Create unlimited images with{'\n'}Premium Membership!
        </Text>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {/* Annual Plan */}
          <Pressable
            style={[
              styles.planCard,
              selectedPlan === 'annual' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('annual')}
          >
            <View style={styles.planLeft}>
              <View
                style={[
                  styles.radioButton,
                  selectedPlan === 'annual' && styles.radioButtonSelected,
                ]}
              >
                {selectedPlan === 'annual' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={styles.planTitle}>Annual 🔥</Text>
              <View style={styles.bestDealBadge}>
                <Text style={styles.bestDealText}>Best Deal ⚡</Text>
              </View>
            </View>
            <View style={styles.planRight}>
              <Text style={styles.planPrice}>$0.39</Text>
              <Text style={styles.planPeriod}> / week</Text>
            </View>
          </Pressable>

          {/* Weekly Plan */}
          <Pressable
            style={[
              styles.planCard,
              selectedPlan === 'weekly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('weekly')}
          >
            <View style={styles.planLeft}>
              <View
                style={[
                  styles.radioButton,
                  selectedPlan === 'weekly' && styles.radioButtonSelected,
                ]}
              >
                {selectedPlan === 'weekly' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={styles.planTitle}>Weekly 📌</Text>
            </View>
            <View style={styles.planRight}>
              <Text style={styles.planPrice}>$7.99</Text>
              <Text style={styles.planPeriod}> / week</Text>
            </View>
          </Pressable>
        </View>

        {/* Security Message */}
        <View style={styles.securityContainer}>
          <Ionicons name="shield-checkmark" size={20} color={colors.success} />
          <Text style={styles.securityText}>
            It is secured by the Apple. Cancel Anytime
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, isLoading && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </>
          )}
        </TouchableOpacity>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <Pressable onPress={handleTermsOfUse}>
            <Text style={styles.footerLinkText}>Terms of Use</Text>
          </Pressable>
          <Pressable onPress={handleRestorePurchase}>
            <Text style={styles.footerLinkText}>Restore Purchase</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
});

MembershipScreen.displayName = 'MembershipScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  illustrationContainer: {
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  illustrationWrapper: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 1,
    alignItems: 'center',
    marginBottom: '-20%',
  },
  illustrationImage: {
    width: '80%',
    height: '80%',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    marginTop: 0,
  },
  subtitle: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  plansContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  planCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.sm,
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBackground,
    borderWidth: 3,
    ...shadows.primary,
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  planTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bestDealBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  bestDealText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.white,
  },
  planRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    fontSize: 14
  },
  planPeriod: {
    ...typography.body,
    color: colors.textTertiary,
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  securityText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  continueButton: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.primary,
  },
  continueButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    backgroundColor: colors.buttonDisabled,
    opacity: 0.6,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['4xl'],
    paddingBottom: spacing['3xl'],
  },
  footerLinkText: {
    ...typography.body,
    color: colors.textTertiary,
  },
});

