import { create } from 'zustand';

interface GuestState {
  isGuest: boolean;
  guestId: string | null;
  setGuestSession: (id: string) => void;
  clearSession: () => void;
}

export const useGuestStore = create<GuestState>((set) => ({
  isGuest: true,
  guestId: null,
  setGuestSession: (id) => set({ guestId: id, isGuest: true }),
  clearSession: () => set({ guestId: null }),
}));
