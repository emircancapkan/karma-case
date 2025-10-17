import React, { useEffect, useCallback, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, typography, borderRadius } from '@/src/theme';
import { APP_CONFIG } from '@/src/config/constants';
import type { RootStackParamList } from '@/src/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC = React.memo(() => {
  const navigation = useNavigation<NavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Navigate to welcome screen after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>📸</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {APP_CONFIG.name.split('.')[0]}
              <Text style={styles.titleAI}>.{APP_CONFIG.name.split('.')[1]}</Text>
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
});

SplashScreen.displayName = 'SplashScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 56,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 32,
  },
  titleContainer: {
    flexDirection: 'row',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  titleAI: {
    color: colors.primary,
  },
});

