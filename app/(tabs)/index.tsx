import { imageAPI } from '@/app/src/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
}

export default function HomeScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [credits, setCredits] = useState(5); // Mock credits, should come from user context

  // Fetch user's generated images on mount
  useEffect(() => {
    // Check if user is authenticated before fetching
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        // User is authenticated, fetch data
        await loadUserData();
        await fetchGeneratedImages();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.credits !== undefined) {
          setCredits(user.credits);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchGeneratedImages = async () => {
    try {
      setIsLoading(true);
      const response = await imageAPI.getImages();
      
      if (response.data) {
        // Handle different response formats
        const imageData = Array.isArray(response.data) 
          ? response.data 
          : response.data.images || response.data.data || [];
        
        const images = imageData.map((img: any) => ({
          id: img.id || img._id || Date.now().toString(),
          url: img.imageUrl || img.generatedImageUrl || img.url || img.image,
          prompt: img.prompt || '',
          createdAt: img.createdAt || new Date().toISOString(),
        }));
        
        setGeneratedImages(images);
      }
    } catch (error: any) {
      // Don't show alert for 401 errors (user might be new with no images)
      if (error.response?.status !== 401) {
        console.error('Error fetching images:', error);
      }
      // Set empty array if no images or error
      setGeneratedImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGeneratedImages();
    await loadUserData();
    setRefreshing(false);
  };

  const requestPermissions = async () => {
    // Request camera/media library permission
    const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaStatus.status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return false;
    }

    // Request location permission
    const locationStatus = await Location.requestForegroundPermissionsAsync();
    if (locationStatus.status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your location');
      return false;
    }

    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      Alert.alert('No image', 'Please select an image first');
      return;
    }

    if (!prompt.trim()) {
      Alert.alert('No prompt', 'Please describe your image');
      return;
    }

    if (credits < 1) {
      Alert.alert('No credits', 'You need credits to generate images');
      return;
    }

    try {
      setIsGenerating(true);

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Create FormData
      const formData = new FormData();
      
      // Add image file
      const filename = selectedImage.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: selectedImage,
        name: filename,
        type,
      } as any);

      // Add location and prompt
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      formData.append('prompt', prompt);

      // Upload and generate
      const response = await imageAPI.upload(formData);

      if (response.data) {
        // Show success message
        Alert.alert('Success', 'Image generated successfully!');
        
        // Refresh images list
        await fetchGeneratedImages();
        
        // Update credits
        await loadUserData();
        
        // Reset form
        setSelectedImage(null);
        setPrompt('');
      }
    } catch (error) {
      console.error('Generation error:', error);
      Alert.alert('Error', 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="camera" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.logoText}>
              Karma.<Text style={styles.logoAI}>AI</Text>
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.creditsContainer}>
              <Text style={styles.creditIcon}>🪙</Text>
              <Text style={styles.creditsText}>{credits}</Text>
              <Text style={styles.creditsLabel}>credits</Text>
            </View>
            <Pressable style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Create or Edit Photos</Text>
        <Text style={styles.subtitle}>AI Magic at your fingertips</Text>

        {/* Image Upload Area */}
        <Pressable style={styles.uploadArea} onPress={pickImage}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.cameraButton}>
                <Ionicons name="camera" size={32} color="#6B7280" />
              </View>
            </View>
          )}
        </Pressable>

        {/* Prompt Input */}
        <Text style={styles.promptLabel}>Describe your image</Text>
        <TextInput
          style={styles.promptInput}
          placeholder="Enter the prompt"
          placeholderTextColor="#D1D5DB"
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Generate Button */}
        <Pressable
          style={[
            styles.generateButton,
            (!selectedImage || !prompt.trim() || isGenerating) && styles.generateButtonDisabled,
          ]}
          onPress={handleGenerate}
          disabled={!selectedImage || !prompt.trim() || isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.generateButtonText}>Generate (1 Credit)</Text>
          )}
        </Pressable>

        {/* Results Section */}
        <Text style={styles.resultsTitle}>Results</Text>
        
        {generatedImages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No generated images yet</Text>
            <Text style={styles.emptyStateSubtext}>Upload a photo and describe it to get started</Text>
          </View>
        ) : (
          <View style={styles.resultsGrid}>
            {generatedImages.map((image) => (
              <View key={image.id} style={styles.resultItem}>
                <Image source={{ uri: image.url }} style={styles.resultImage} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  logoAI: {
    color: '#7C3AED',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  creditIcon: {
    fontSize: 16,
  },
  creditsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  creditsLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  settingsButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  uploadArea: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  uploadPlaceholder: {
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  cameraButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
  },
  promptLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  promptInput: {
    marginHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#000000',
    minHeight: 100,
    marginBottom: 20,
  },
  generateButton: {
    marginHorizontal: 20,
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  generateButtonDisabled: {
    backgroundColor: '#C4B5FD',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
    paddingBottom: 100,
  },
  resultItem: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 8,
  },
  resultImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});

