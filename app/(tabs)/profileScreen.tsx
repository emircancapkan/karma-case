import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileEditSheet from '../components/ProfileEditSheet';
import { friendAPI } from '../src/api/apiClient';

interface FriendRequest {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  status?: string;
  message?: string;
}

export default function ProfileScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('requests');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    loadUserData();
    loadFriendData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUsername(user.username);
        setEmail(user.mail);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadFriendData = async () => {
    try {
      setIsLoading(true);
      const response = await friendAPI.getFriends();
      
      if (response.data) {
        // Separate friends and pending requests
        let allFriends = [];
        
        if (Array.isArray(response.data)) {
          allFriends = response.data;
        } else if (response.data.friends && Array.isArray(response.data.friends)) {
          allFriends = response.data.friends;
        }
        
        const acceptedFriends = allFriends.filter((f: any) => f.status === 'accepted');
        const pendingRequests = allFriends.filter((f: any) => f.status === 'pending');
        
        setFriends(acceptedFriends);
        setFriendRequests(pendingRequests);
      }
    } catch (error: any) {
      console.error('Error loading friends:', error);
      if (error.response?.status !== 401) {
        // Don't show alert for auth errors
        console.log('Failed to load friend data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    await loadFriendData();
    setRefreshing(false);
  };

  const handleAcceptRequest = async (friendId: string) => {
    try {
      await friendAPI.accept({ friendId });
      Alert.alert('Success', 'Friend request accepted!');
      await loadFriendData();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (friendId: string) => {
    try {
      await friendAPI.delete({ friendId });
      Alert.alert('Success', 'Friend request rejected');
      await loadFriendData();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject request');
    }
  };

  const handleProfileUpdate = () => {
    loadUserData();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Edit Modal */}
      <ProfileEditSheet
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onUpdate={handleProfileUpdate}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable
            style={styles.editButton}
            onPress={() => setShowEditProfile(true)}
          >
            <Ionicons name="pencil" size={22} color="#7C3AED" />
          </Pressable>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#9CA3AF" />
          </View>
          <Text style={styles.username}>@{username}</Text>
          <Text style={styles.email}>{email}</Text>
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

        {/* Content */}
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C3AED" />
            </View>
          ) : activeTab === 'requests' ? (
            friendRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No friend requests</Text>
              </View>
            ) : (
              friendRequests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestLeft}>
                    <View style={styles.requestAvatar}>
                      <Ionicons name="person" size={24} color="#7C3AED" />
                    </View>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestUsername}>@{request.username}</Text>
                      <Text style={styles.requestMessage}>
                        {request.message || 'Wants to add you as a friend'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.requestActions}>
                    <Pressable
                      style={styles.acceptButton}
                      onPress={() => handleAcceptRequest(request.id)}
                    >
                      <Ionicons name="checkmark" size={20} color="#10B981" />
                    </Pressable>
                    <Pressable
                      style={styles.rejectButton}
                      onPress={() => handleRejectRequest(request.id)}
                    >
                      <Ionicons name="close" size={20} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              ))
            )
          ) : (
            friends.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No friends yet</Text>
              </View>
            ) : (
              friends.map((friend) => (
                <View key={friend.id} style={styles.friendCard}>
                  <View style={styles.friendLeft}>
                    <View style={styles.friendAvatar}>
                      <Ionicons name="person" size={24} color="#7C3AED" />
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendUsername}>@{friend.username}</Text>
                      {friend.status && (
                        <Text style={styles.friendStatus}>{friend.status}</Text>
                      )}
                    </View>
                  </View>
                  <Pressable
                    style={styles.unfriendButton}
                    onPress={() => handleRejectRequest(friend.id)}
                  >
                    <Ionicons name="person-remove" size={20} color="#EF4444" />
                  </Pressable>
                </View>
              ))
            )
          )}
        </View>
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#7C3AED',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#7C3AED',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  requestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  requestMessage: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  friendStatus: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  unfriendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

