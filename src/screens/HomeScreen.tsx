import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useImages, useImagePicker, useLocation } from '@/src/hooks';
import { EmptyState, LoadingSpinner } from '@/src/components/common';
import { SettingsSheet, GeneratingOverlay } from '@/src/components/custom';
import { colors, spacing, typography, borderRadius, shadows } from '@/src/theme';
import { showError, showSuccess } from '@/src/utils/helpers';
import { formatCredits } from '@/src/utils/formatters';
import { ERROR_MESSAGES, APP_CONFIG } from '@/src/config/constants';
import type { RootStackParamList } from '@/src/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = React.memo(() => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { images, isLoading, fetchImages, generateImage, isGenerating } = useImages();
  const { selectedImage, pickFromLibrary, clearImage } = useImagePicker();
  const { getCurrentLocation } = useLocation();
  
  const [prompt, setPrompt] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchImages();
    setRefreshing(false);
  }, [fetchImages]);

  const handleGenerate = useCallback(async () => {
    if (!selectedImage) {
      showError(ERROR_MESSAGES.noImageSelected);
      return;
    }

    if (!prompt.trim()) {
      showError(ERROR_MESSAGES.noPrompt);
      return;
    }

    if (!user?.isPremium && (user?.credits ?? 0) < 1) {
      navigation.navigate('Membership');
      return;
    }

    const location = await getCurrentLocation();
    if (!location) return;

    // Create FormData
    const formData = new FormData();
    const filename = selectedImage.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const extension = match ? match[1].toLowerCase() : 'jpeg';

    // Map extension to mime type (type-safe)
    const mimeTypes: Record<string, 'image/jpeg' | 'image/jpg' | 'image/png'> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    };

    const type = mimeTypes[extension] || 'image/jpeg';

    formData.append('file', {
      uri: selectedImage,
      name: filename,
      type,
    } as any);

    formData.append('latitude', location.latitude.toString());
    formData.append('longitude', location.longitude.toString());
    formData.append('prompt', prompt);

    // Debug: Log the data being sent
    console.log('🚀 Generating image with:');
    console.log('  📸 Image:', filename);
    console.log('  📍 Location:', location);
    console.log('  ✍️  Prompt:', prompt);

    const result = await generateImage(formData);

    if (result.success && result.data) {
      clearImage();
      setPrompt('');
      
      // Navigate to Result screen
      navigation.navigate('Result', {
        imageUrl: result.data.url,
        imageId: result.data.id,
      });
    }
  }, [selectedImage, prompt, user, getCurrentLocation, generateImage, clearImage, navigation]);

  const isPremium = user?.isPremium ?? false;
  const credits = user?.credits ?? 0;
  const isButtonDisabled = !selectedImage || !prompt.trim() || isGenerating;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <SettingsSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <GeneratingOverlay visible={isGenerating} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="camera" size={24} color={colors.white} />
            </View>
            <Text style={styles.logoText}>
              {APP_CONFIG.name.split('.')[0]}.<Text style={styles.logoAI}>{APP_CONFIG.name.split('.')[1]}</Text>
            </Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.creditsContainer}>
              {isPremium ? (
                <>
                  <Text style={styles.creditIcon}>⭐</Text>
                  <Text style={styles.premiumText}>Premium</Text>
                </>
              ) : (
                <>
                  <Text style={styles.creditIcon}>🪙</Text>
                  <Text style={styles.creditsText}>{formatCredits(credits)}</Text>
                  <Text style={styles.creditsLabel}>credits</Text>
                </>
              )}
            </View>
            <Pressable
              style={styles.settingsButton}
              onPress={() => setShowSettings(true)}
            >
              <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Create or Edit Photos</Text>
        <Text style={styles.subtitle}>AI Magic at your fingertips</Text>

        {/* Image Upload Area */}
        <Pressable style={styles.uploadPlaceholder} onPress={pickFromLibrary}>
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={styles.selectedImage}
            />
          ) : (
            <View style={styles.cameraButton}>
              <Ionicons name="camera" size={32} color={colors.textSecondary} />
            </View>
          )}
        </Pressable>

        {/* Prompt Input */}
        <Text style={styles.promptLabel}>Describe your image</Text>
        <TextInput
          style={styles.promptInput}
          placeholder="Enter the prompt"
          placeholderTextColor={colors.textPlaceholder}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          blurOnSubmit={false}
          returnKeyType="default"
        />

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, isButtonDisabled && styles.buttonDisabled]}
          onPress={handleGenerate}
          disabled={isButtonDisabled}
          activeOpacity={0.8}
        >
          {isGenerating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.generateButtonText}>
              {isPremium ? 'Generate' : 'Generate (1 Credit)'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Results Section */}
        <Text style={styles.resultsTitle}>Results</Text>

        {isLoading ? (
          <LoadingSpinner message="Loading images..." />
        ) : images.length === 0 ? (
          <EmptyState
            icon="images-outline"
            title="No generated images yet"
            message="Upload a photo and describe it to get started"
          />
        ) : (
          <View style={styles.resultsGrid}>
            {images.map((image, index) => (
              <Pressable 
                key={image.id || `image-${index}`} 
                style={styles.resultItem}
                onPress={() => navigation.navigate('Result', { imageUrl: image.url, imageId: image.id })}
              >
                <Image source={{ uri: image.url }} style={styles.resultImage} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
});

HomeScreen.displayName = 'HomeScreen';

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
    paddingVertical: spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    ...typography.h5,
    color: colors.textPrimary,
  },
  logoAI: {
    color: colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius['2xl'],
    gap: spacing.xs,
  },
  creditIcon: {
    fontSize: 16,
  },
  creditsText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  creditsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing['2xl'],
  },
  uploadPlaceholder: {
    height: 200,
    width: 200,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  cameraButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.xl,
  },
  promptLabel: {
    ...typography.label,
    color: colors.textPrimary,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  promptInput: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 100,
    marginBottom: spacing.xl,
  },
  generateButton: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing['3xl'],
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primary,
  },
  generateButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    backgroundColor: colors.buttonDisabled,
    opacity: 0.6,
  },
  resultsTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: 100,
  },
  resultItem: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: spacing.sm,
  },
  resultImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.lg,
  },
});

