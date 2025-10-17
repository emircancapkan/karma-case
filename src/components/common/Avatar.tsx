import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, avatarSizes } from '@/src/theme';

interface AvatarProps {
  imageUri?: string;
  name?: string;
  size?: keyof typeof avatarSizes;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  imageUri,
  name,
  size = 'md',
  style,
}) => {
  const avatarSize = avatarSizes[size];
  const iconSize = avatarSize * 0.5;
  const fontSize = avatarSize * 0.4;

  const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        },
        style,
      ]}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[
            styles.image,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        />
      ) : name ? (
        <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
      ) : (
        <Ionicons name="person" size={iconSize} color={colors.gray400} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

