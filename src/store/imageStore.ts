import { create } from 'zustand';
import type { GeneratedImage } from '@/src/types';

interface ImageState {
  images: GeneratedImage[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setImages: (images: GeneratedImage[]) => void;
  addImage: (image: GeneratedImage) => void;
  removeImage: (imageId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearImages: () => void;
}

export const useImageStore = create<ImageState>((set) => ({
  images: [],
  isLoading: false,
  error: null,

  setImages: (images) => {
    set({ images, error: null });
  },

  addImage: (image) => {
    set((state) => ({
      images: [image, ...state.images],
    }));
  },

  removeImage: (imageId) => {
    set((state) => ({
      images: state.images.filter((img) => img.id !== imageId),
    }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  clearImages: () => {
    set({ images: [], error: null });
  },
}));

