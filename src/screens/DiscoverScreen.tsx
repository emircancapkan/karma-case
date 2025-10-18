import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useExplore, useLocation } from '@/src/hooks';
import { useAuthStore } from '@/src/store';
import { colors } from '@/src/theme';
import { MapMarker, FilterModal } from '@/src/components/custom';
import { api } from '@/src/api';
import { showSuccess, showError } from '@/src/utils/helpers';
import { formatUsername } from '@/src/utils/formatters';

const INITIAL_REGION = {
  latitude: 41.0082,
  longitude: 28.9784,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const DiscoverScreen: React.FC = React.memo(() => {
  const { user } = useAuthStore();
  const { location, getCurrentLocation } = useLocation();
  const { images, isLoading, fetchExploreImages } = useExplore();
  const [region, setRegion] = useState(INITIAL_REGION);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentRange, setCurrentRange] = useState(10);

  // Debug images
  console.log('🗺️ Images count:', images.length);
  console.log('🗺️ Images data:', images);

  useEffect(() => {
    // Get user's current location
    const initLocation = async () => {
      console.log('🔍 Getting user location...');
      const userLocation = await getCurrentLocation();
      console.log('📍 User location:', userLocation);
      
      if (userLocation) {
        setRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

        // Fetch images near user's location
        console.log('🌐 Fetching explore images...');
        await fetchExploreImages({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          range: 10, // 10km range
        });
      }
    };

    initLocation();
  }, []);

  const handleSettingsPress = () => {
    // Navigate to settings or open settings modal
    console.log('Settings pressed');
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleFilterApply = async (range: number) => {
    console.log('🔍 Applying filter with range:', range);
    setCurrentRange(range);
    
    if (location) {
      await fetchExploreImages({
        latitude: location.latitude,
        longitude: location.longitude,
        range: range,
      });
    }
  };

  const handleMarkerPress = async (image: any) => {
    console.log('🎯 Marker pressed for user:', image.username);
    
    // Check if user has userId
    if (!image.userId) {
      showError('User ID not found');
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      'Send Friend Request',
      `Do you want to send a friend request to ${formatUsername(image.username || 'unknown')}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Request',
          onPress: async () => {
            try {
              console.log('📤 Sending friend request to:', image.userId);
              await api.friend.sendRequest({
                targetUserId: image.userId,
              });
              showSuccess(`Friend request sent to ${formatUsername(image.username || 'unknown')}!`);
            } catch (error: any) {
              console.error('❌ Error sending friend request:', error);
              const errorMessage = error?.response?.data?.message || 'Failed to send friend request';
              showError(errorMessage);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      >
        {images
          .filter((image) => image.latitude && image.longitude)
          .map((image) => (
            <Marker
              key={image.id}
              coordinate={{
                latitude: image.latitude!,
                longitude: image.longitude!,
              }}
            >
              <MapMarker image={image} onPress={handleMarkerPress} />
            </Marker>
          ))}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="camera" size={24} color={colors.white} />
          </View>
          <Text style={styles.logoText}>
            Karma<Text style={styles.logoAccent}>.AI</Text>
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.creditsContainer}>
            <Ionicons name="images" size={16} color={colors.primary} />
            <Text style={styles.creditsText}>
              {user?.credits || 0} <Text style={styles.creditsLabel}>credits</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsPress}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color={colors.gray600} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={handleFilterPress}
        activeOpacity={0.7}
      >
        <Ionicons name="options" size={24} color={colors.primary} />
      </TouchableOpacity>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        currentRange={currentRange}
      />
    </View>
  );
});

DiscoverScreen.displayName = 'DiscoverScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
  },
  logoAccent: {
    color: colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  creditsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  creditsLabel: {
    fontWeight: '400',
    color: colors.textSecondary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
