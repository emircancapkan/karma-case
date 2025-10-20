import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/src/hooks';
import { Input, Avatar } from '@/src/components/common';
import { colors, spacing, typography, borderRadius, shadows } from '@/src/theme';
import type { ProfileEditSheetProps } from '@/src/types';

export const ProfileEditSheet: React.FC<ProfileEditSheetProps> = React.memo(({
  visible,
  onClose,
  onUpdate,
}) => {
  const { user, updateProfile, isLoading } = useUser();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible && user) {
      setUsername(user.username || '');
      setEmail(user.mail || user.email || '');
      setPassword('');
      setErrors({});
    }
  }, [visible, user]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (password && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [username, email, password]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    const updateData: any = {
      username: username.trim(),
      mail: email.trim(),
    };

    if (password.trim()) {
      updateData.password = password.trim();
    }

    const result = await updateProfile(updateData);

    if (result.success) {
      onUpdate?.();
      onClose();
    }
  }, [username, email, password, validateForm, updateProfile, onUpdate, onClose]);

  const handleClose = useCallback(() => {
    setPassword('');
    setErrors({});
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile Edit</Text>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Avatar */}
          <View style={styles.avatarContainer}>
            <Avatar size="2xl" />
          </View>

          {/* Form */}
          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            autoCapitalize="none"
            error={errors.username}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter new password (optional)"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
});

ProfileEditSheet.displayName = 'ProfileEditSheet';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
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
    paddingHorizontal: spacing.xl,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  saveButton: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primary,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    backgroundColor: colors.buttonDisabled,
    opacity: 0.6,
  },
});

