import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useFriends } from '@/src/hooks';
import { Avatar, LoadingSpinner, EmptyState, Card } from '@/src/components/common';
import { ProfileEditSheet } from '@/src/components/custom';
import { colors, spacing, typography, borderRadius } from '@/src/theme';
import type { Friend } from '@/src/types';

export const ProfileScreen: React.FC = React.memo(() => {
  const { user } = useAuth();
  const { friends, pendingRequests, sentRequests, isLoading, fetchFriends, acceptRequest, rejectRequest, removeFriend } = useFriends();
  
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('requests');
  const [refreshing, setRefreshing] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFriends();
    setRefreshing(false);
  }, []);

  const handleProfileUpdate = useCallback(() => {
    // Profile updated, user data will be automatically refreshed via Zustand
  }, []);

  const renderRequestItem: ListRenderItem<Friend> = useCallback(({ item }) => (
    <Card style={styles.requestCard}>
      <View style={styles.requestLeft}>
        <Avatar name={item.username1 || item.username} size="md" />
        <View style={styles.requestInfo}>
          <Text style={styles.requestUsername}>@{item.username1 || item.username}</Text>
          <Text style={styles.requestMessage}>
            {item.message || 'Wants to add you as a friend'}
          </Text>
        </View>
      </View>
      <View style={styles.requestActions}>
        <Pressable
          style={styles.acceptButton}
          onPress={() => acceptRequest(item._id || item.id || '')}
        >
          <Ionicons name="checkmark" size={20} color={colors.success} />
        </Pressable>
        <Pressable
          style={styles.rejectButton}
          onPress={() => rejectRequest(item._id || item.id || '')}
        >
          <Ionicons name="close" size={20} color={colors.error} />
        </Pressable>
      </View>
    </Card>
  ), [acceptRequest, rejectRequest]);

  const renderFriendItem: ListRenderItem<Friend> = useCallback(({ item }) => (
    <Card style={styles.friendCard}>
      <View style={styles.friendLeft}>
        <Avatar name={item.username1 || item.username} size="md" />
        <View style={styles.friendInfo}>
          <Text style={styles.friendUsername}>@{item.username1 || item.username}</Text>
          {item.email && (
            <Text style={styles.friendStatus}>{item.email}</Text>
          )}
        </View>
      </View>
      <Pressable
        style={styles.unfriendButton}
        onPress={() => removeFriend(item._id || item.id || '')}
      >
        <Ionicons name="trash" size={20} color={colors.black} />
      </Pressable>
    </Card>
  ), [removeFriend]);

  const keyExtractor = useCallback((item: Friend, index: number) => 
    item._id || item.id || `item-${index}`, 
  []);

  const renderHeader = useCallback(() => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable
          style={styles.editButton}
          onPress={() => setShowEditProfile(true)}
        >
          <Ionicons name="pencil" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <Avatar name={user?.username} size="xl" />
        <Text style={styles.username}>@{user?.username}</Text>
        <Text style={styles.email}>{user?.mail}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
            Friends
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            Friend Requests
          </Text>
        </Pressable>
      </View>
    </>
  ), [user, activeTab]);

  const renderSentRequestItem: ListRenderItem<Friend> = useCallback(({ item }) => (
    <Card style={styles.requestCard}>
      <View style={styles.requestLeft}>
        <Avatar name={item.username2 || item.username} size="md" />
        <View style={styles.requestInfo}>
          <Text style={styles.requestUsername}>@{item.username2 || item.username}</Text>
          <Text style={styles.requestMessage}>
            Friend request sent
          </Text>
        </View>
      </View>
      <View style={styles.requestActions}>
        <Pressable
          style={styles.cancelButton}
          onPress={() => removeFriend(item._id || item.id || '')}
        >
          <Ionicons name="trash" size={20} color={colors.error} />
        </Pressable>
      </View>
    </Card>
  ), [removeFriend]);

  const renderEmptyRequests = useCallback(() => (
    <EmptyState
      icon="people-outline"
      title="No friend requests"
      message="You don't have any pending friend requests"
    />
  ), []);

  const renderEmptySentRequests = useCallback(() => (
    <EmptyState
      icon="send-outline"
      title="No sent requests"
      message="You haven't sent any friend requests yet"
    />
  ), []);

  const renderEmptyFriends = useCallback(() => (
    <EmptyState
      icon="people-outline"
      title="No friends yet"
      message="Start adding friends to share your AI creations"
    />
  ), []);

  const getCurrentData = () => {
    switch (activeTab) {
      case 'friends':
        return friends;
      case 'requests':
        return [...pendingRequests, ...sentRequests];
      default:
        return [];
    }
  };

  const getCurrentRenderItem = () => {
    switch (activeTab) {
      case 'friends':
        return renderFriendItem;
      case 'requests':
        return (props: any) => {
          const { item } = props;
          // Check if this is a sent request (user1 === current user)
          const userId = user?.id || user?._id;
          const isSentRequest = item.user1 === userId;
          return isSentRequest ? renderSentRequestItem(props) : renderRequestItem(props);
        };
      default:
        return renderFriendItem;
    }
  };

  const getCurrentEmpty = () => {
    switch (activeTab) {
      case 'friends':
        return renderEmptyFriends;
      case 'requests':
        return renderEmptyRequests;
      default:
        return renderEmptyFriends;
    }
  };

  const currentData = getCurrentData();
  const currentRenderItem = getCurrentRenderItem();
  const currentEmpty = getCurrentEmpty();

  return (
    <SafeAreaView style={styles.container}>
      <ProfileEditSheet
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onUpdate={handleProfileUpdate}
      />

      {isLoading ? (
        <LoadingSpinner message="Loading..." />
      ) : (
        <FlatList
          data={currentData}
          renderItem={currentRenderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={currentEmpty}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
    </SafeAreaView>
  );
});

ProfileScreen.displayName = 'ProfileScreen';

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
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  username: {
    ...typography.h4,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body,
    color: colors.primary,
    backgroundColor: colors.primaryBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius['2xl'],
  },
  tabActive: {
    backgroundColor: colors.white,
    
  },
  tabText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  flatListContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  requestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  requestUsername: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  requestMessage: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  friendUsername: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  friendStatus: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: spacing.xs / 2,
  },
  unfriendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sentStatus: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

