import { useState } from 'react';
import { api } from '@/src/api';
import { useAuthStore } from '@/src/store';
import type { UpdateUserPayload } from '@/src/api/endpoints/user';
import { showError, showSuccess } from '@/src/utils/helpers';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/src/config/constants';

export const useUser = () => {
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const updateProfile = async (data: UpdateUserPayload) => {
    setIsLoading(true);
    try {
      const response = await api.user.update(data);
      
      if (response.data) {
        updateUser(data);
        showSuccess(SUCCESS_MESSAGES.profileUpdated);
        return { success: true };
      }
      
      return { success: false };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || ERROR_MESSAGES.generic;
      showError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    setIsLoading(true);
    try {
      await api.user.delete();
      showSuccess(SUCCESS_MESSAGES.accountDeleted);
      return { success: true };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || ERROR_MESSAGES.generic;
      showError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePremium = async (plan: 'annual' | 'weekly') => {
    setIsLoading(true);
    try {
      const response = await api.user.purchase();
      
      if (response.data.success) {
        updateUser({
          isPremium: true,
          credits: -1, // unlimited
          membershipPlan: plan,
        });
        showSuccess(SUCCESS_MESSAGES.purchaseSuccess);
        return { success: true };
      }
      
      return { success: false };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || ERROR_MESSAGES.generic;
      showError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    updateProfile,
    deleteAccount,
    purchasePremium,
  };
};

