import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SearchParams, GuestInfo, EntityId, ISODateString } from '@/types';

// ==================== SEARCH STORE ====================
interface SearchState {
  params: SearchParams;
  setParams: (params: Partial<SearchParams>) => void;
  resetParams: () => void;
}

const defaultSearchParams: SearchParams = {
  guests: 2,
};

export const useSearchStore = create<SearchState>((set) => ({
  params: defaultSearchParams,
  setParams: (params) => set((state) => ({ params: { ...state.params, ...params } })),
  resetParams: () => set({ params: defaultSearchParams }),
}));

// ==================== BOOKING FLOW STORE ====================
interface BookingFlowState {
  listingId: EntityId | null;
  quoteId: EntityId | null;
  checkIn: ISODateString | null;
  checkOut: ISODateString | null;
  guests: number;
  guestInfo: GuestInfo | null;
  step: 'search' | 'detail' | 'quote' | 'checkout' | 'confirmation';
  
  setListing: (listingId: EntityId) => void;
  setDates: (checkIn: ISODateString, checkOut: ISODateString) => void;
  setGuests: (guests: number) => void;
  setQuote: (quoteId: EntityId) => void;
  setGuestInfo: (info: GuestInfo) => void;
  setStep: (step: BookingFlowState['step']) => void;
  reset: () => void;
}

export const useBookingFlowStore = create<BookingFlowState>(
  persist(
    (set) => ({
      listingId: null,
      quoteId: null,
      checkIn: null,
      checkOut: null,
      guests: 2,
      guestInfo: null,
      step: 'search',
      
      setListing: (listingId) => set({ listingId, step: 'detail' }),
      setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),
      setGuests: (guests) => set({ guests }),
      setQuote: (quoteId) => set({ quoteId, step: 'quote' }),
      setGuestInfo: (guestInfo) => set({ guestInfo }),
      setStep: (step) => set({ step }),
      reset: () => set({
        listingId: null,
        quoteId: null,
        checkIn: null,
        checkOut: null,
        guests: 2,
        guestInfo: null,
        step: 'search',
      }),
    }),
    {
      name: 'cvpm-booking-flow',
    }
  ) as never
);

// ==================== AUTH STORE ====================
interface AuthState {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  
  setAuth: (token: string, email: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>(
  persist(
    (set) => ({
      token: null,
      email: null,
      isAuthenticated: false,
      
      setAuth: (token, email) => {
        localStorage.setItem('admin_token', token);
        set({ token, email, isAuthenticated: true });
      },
      clearAuth: () => {
        localStorage.removeItem('admin_token');
        set({ token: null, email: null, isAuthenticated: false });
      },
    }),
    {
      name: 'cvpm-auth',
    }
  ) as never
);

// ==================== UI STORE ====================
interface UIState {
  contactModalOpen: boolean;
  ownerModalOpen: boolean;
  mobileMenuOpen: boolean;
  
  openContactModal: () => void;
  closeContactModal: () => void;
  openOwnerModal: () => void;
  closeOwnerModal: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  contactModalOpen: false,
  ownerModalOpen: false,
  mobileMenuOpen: false,
  
  openContactModal: () => set({ contactModalOpen: true }),
  closeContactModal: () => set({ contactModalOpen: false }),
  openOwnerModal: () => set({ ownerModalOpen: true }),
  closeOwnerModal: () => set({ ownerModalOpen: false }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
}));
