import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Platform, Text } from 'react-native';
import React from 'react';

export const DiscoverScreen: React.FC = React.memo(() => {
  if (Platform.OS === 'ios') {
    return <AppleMaps.View style={{ flex: 1 }} />;
  } else if (Platform.OS === 'android') {
    return <GoogleMaps.View style={{ flex: 1 }} />;
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
});

DiscoverScreen.displayName = 'DiscoverScreen';