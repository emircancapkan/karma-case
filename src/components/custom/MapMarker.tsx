import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '@/src/theme';
import type { GeneratedImage } from '@/src/types';
import { formatDate, formatUsername } from '@/src/utils/formatters';

interface MapMarkerProps {
  image: GeneratedImage;
  onPress?: (image: GeneratedImage) => void;
}

export const MapMarker: React.FC<MapMarkerProps> = ({ image, onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.content}
        onPress={() => onPress?.(image)}
        activeOpacity={0.8}
      >
        <View style={styles.textContainer}>
          <Text style={styles.username} numberOfLines={1}>
            {formatUsername(image.username || 'unknown')}
          </Text>
          <Text style={styles.timestamp} numberOfLines={1}>
            {formatDate(image.createdAt)}
          </Text>
        </View>
        <View style={styles.avatarContainer}>
          {image.url ? (
            <Image 
              source={{ uri: image.url }} 
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]} />
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.pointer} />
    </View>
  );
};

const MARKER_WIDTH = 170;
const MARKER_HEIGHT = 56;
const AVATAR_SIZE = 44;
const POINTER_SIZE = 12;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  content: {
    width: MARKER_WIDTH,
    height: MARKER_HEIGHT,
    backgroundColor: colors.white,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  avatarContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: colors.gray100,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarPlaceholder: {
    backgroundColor: colors.gray200,
  },
  pointer: {
    width: POINTER_SIZE,
    height: POINTER_SIZE,
    backgroundColor: colors.white,
    transform: [{ rotate: '45deg' }],
    marginTop: -POINTER_SIZE / 2,
  },
});

