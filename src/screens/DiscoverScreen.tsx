import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useExplore, useLocation } from '@/src/hooks';
import { useAuthStore } from '@/src/store';
import { colors } from '@/src/theme';
import { MapMarker, FilterModal, FriendRequestModal } from '@/src/components/custom';
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
  const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

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

  const handleMarkerPress = useCallback((image: any) => {
    console.log('🎯 Marker pressed for user:', image.username);
    
    // Check if user has userId
    if (!image.userId) {
      showError('User ID not found');
      return;
    }

    // Set selected user and show modal
    setSelectedUser(image);
    setShowFriendRequestModal(true);
  }, []);

  const handleConfirmFriendRequest = useCallback(async () => {
    if (!selectedUser) return;

    setIsSendingRequest(true);
    try {
      console.log('📤 Sending friend request to:', selectedUser.userId);
      await api.friend.sendRequest({
        targetUserId: selectedUser.userId,
      });
      showSuccess(`Friend request sent to ${formatUsername(selectedUser.username || 'unknown')}!`);
      setShowFriendRequestModal(false);
    } catch (error: any) {
      console.error('❌ Error sending friend request:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to send friend request';
      showError(errorMessage);
    } finally {
      setIsSendingRequest(false);
    }
  }, [selectedUser]);

  const handleCloseFriendRequestModal = useCallback(() => {
    if (!isSendingRequest) {
      setShowFriendRequestModal(false);
      setSelectedUser(null);
    }
  }, [isSendingRequest]);

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

      {/* Friend Request Modal */}
      {selectedUser && (
        <FriendRequestModal
          visible={showFriendRequestModal}
          onClose={handleCloseFriendRequestModal}
          onConfirm={handleConfirmFriendRequest}
          username={selectedUser.username || 'unknown'}
          isLoading={isSendingRequest}
        />
      )}
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
