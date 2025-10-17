import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography } from '@/src/theme';

interface GeneratingOverlayProps {
  visible: boolean;
}

export const GeneratingOverlay: React.FC<GeneratingOverlayProps> = ({ visible }) => {
  const dotsAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate dots ...
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotsAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(dotsAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      dotsAnimation.setValue(0);
    }
  }, [visible, dotsAnimation]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
    >
      <LinearGradient
        colors={['#E8E8FF', '#F0E8FF', '#E8D8FF']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.generatingText}>Generating...</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your results are being prepared, please do not{'\n'}
            close the application.
          </Text>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingText: {
    fontSize: 32,
    fontWeight: '400',
    color: colors.white,
    letterSpacing: 0.5,
  },
  footer: {
    paddingBottom: 60,
    paddingHorizontal: 40,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

