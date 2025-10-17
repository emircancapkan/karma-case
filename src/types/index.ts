// ============================================
// USER TYPES
// ============================================

export interface User {
  id?: string;
  username: string;
  mail: string;
  email?: string;
  credits?: number;
  isPremium?: boolean;
  membershipPlan?: 'annual' | 'weekly' | null;
  membershipStartDate?: string;
  avatar?: string;
}

export interface UserData extends User {
  token?: string;
}

// ============================================
// AUTH TYPES
// ============================================

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  password: string;
  mail: string;
  code?: string | number;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message?: string;
}

// ============================================
// IMAGE TYPES
// ============================================

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
  userId?: string;
  latitude?: number;
  longitude?: number;
}

export interface ImageUploadData {
  file: any;
  latitude: number;
  longitude: number;
  prompt: string;
}

export interface ImageFilters {
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
  userId?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

// ============================================
// FRIEND TYPES
// ============================================

export interface Friend {
  id: string;
  username: string;
  email?: string;
  mail?: string;
  avatar?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  message?: string;
}

export interface FriendRequest {
  targetUserId: string;
}

export interface FriendActionRequest {
  friendId: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// NAVIGATION TYPES
// ============================================

export type RootStackParamList = {
  index: undefined;
  welcome: undefined;
  login: undefined;
  signup: undefined;
  membershipScreen: undefined;
  '(tabs)': undefined;
};

export type TabParamList = {
  index: undefined;
  discoverScreen: undefined;
  profileScreen: undefined;
};

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

export interface ProfileEditSheetProps extends ModalProps {
  onUpdate?: () => void;
}

export interface SettingsSheetProps extends ModalProps {}

// ============================================
// FORM TYPES
// ============================================

export interface LoginFormValues {
  username: string;
  password: string;
}

export interface SignupFormValues {
  username: string;
  password: string;
  mail: string;
  code: string;
}

export type SignupStep = 'username' | 'password' | 'mailVerification' | 'code';
export type LoginStep = 'username' | 'password';
export type MembershipPlan = 'annual' | 'weekly';

// ============================================
// UTILITY TYPES
// ============================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

