import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, logEvent, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;

export const initFirebase = (): { app: FirebaseApp | null; analytics: Analytics | null } => {
  if (!app && firebaseConfig.apiKey) {
    try {
      app = initializeApp(firebaseConfig);
      analytics = getAnalytics(app);
      console.log('Firebase initialized');
    } catch (error) {
      console.warn('Firebase initialization failed:', error);
    }
  }
  return { app, analytics };
};

export const trackEvent = (eventName: string, params: Record<string, unknown> = {}): void => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, params);
    } catch (error) {
      console.warn('Analytics event failed:', error);
    }
  }
};

// Pre-defined events for booking flow
export const trackPageView = (pageName: string): void => trackEvent('page_view', { page_name: pageName });
export const trackSearch = (params: Record<string, unknown>): void => trackEvent('search', params);
export const trackViewListing = (listingId: string, listingName: string): void => 
  trackEvent('view_item', { item_id: listingId, item_name: listingName });
export const trackBeginCheckout = (quoteId: string, value: number, currency: string): void => 
  trackEvent('begin_checkout', { quote_id: quoteId, value, currency });
export const trackPurchase = (reservationId: string, value: number, currency: string): void => 
  trackEvent('purchase', { transaction_id: reservationId, value, currency });

export default { initFirebase, trackEvent, trackPageView, trackSearch, trackViewListing, trackBeginCheckout, trackPurchase };
