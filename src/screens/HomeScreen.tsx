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
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useImages, useImagePicker, useLocation } from '@/src/hooks';
import { EmptyState, LoadingSpinner } from '@/src/components/common';
import { GeneratingOverlay } from '@/src/components/custom';
import { colors, spacing, typography, borderRadius, shadows } from '@/src/theme';
import { showError } from '@/src/utils/helpers';
import { ERROR_MESSAGES } from '@/src/config/constants';
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

  useEffect(() => {
    if (user) {
      fetchImages();
    }
  }, [user?.id]); // Refetch images when user changes

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

    console.log('Generating image with:');
    console.log('Image:', filename);
    console.log('Location:', location);
    console.log('Prompt:', prompt);

    const result = await generateImage(formData);

    if (result.success && result.data) {
      clearImage();
      setPrompt('');
      
      if (!user?.isPremium && (user?.credits ?? 0) <= 1) {
        navigation.navigate('Membership');
        return;
      }
      
      // Navigate to Result screen
      navigation.navigate('Result', {
        imageUrl: result.data.url,
        imageId: result.data.id,
      });
    }
  }, [selectedImage, prompt, user, getCurrentLocation, generateImage, clearImage, navigation]);

  const isPremium = user?.isPremium ?? false;
  const isButtonDisabled = !selectedImage || !prompt.trim() || isGenerating;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />


      <GeneratingOverlay visible={isGenerating} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >

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
    </View>
  );
});

HomeScreen.displayName = 'HomeScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
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
    textAlign: 'center',
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

