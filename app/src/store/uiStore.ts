import { create } from 'zustand';
import type { BottomSheetType, ModalType } from '@/types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UIState {
  activeBottomSheet: BottomSheetType;
  activeModal: ModalType;
  toastQueue: Toast[];
  isLoading: boolean;
  openSheet: (sheet: BottomSheetType) => void;
  closeSheet: () => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  showToast: (type: Toast['type'], message: string) => void;
  dismissToast: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeBottomSheet: null,
  activeModal: null,
  toastQueue: [],
  isLoading: false,

  openSheet: (sheet) => set({ activeBottomSheet: sheet }),
  closeSheet: () => set({ activeBottomSheet: null }),

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),

  showToast: (type, message) => {
    const id = Date.now().toString();
    set((state) => ({ toastQueue: [...state.toastQueue, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({ toastQueue: state.toastQueue.filter((t) => t.id !== id) }));
    }, 4000);
  },

  dismissToast: (id) =>
    set((state) => ({ toastQueue: state.toastQueue.filter((t) => t.id !== id) })),

  setLoading: (loading) => set({ isLoading: loading }),
}));
