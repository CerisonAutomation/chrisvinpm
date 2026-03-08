import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';

interface CMSData {
  hero?: {
    headline?: string;
    subheadline?: string;
    backgroundImage?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  features?: {
    headline?: string;
    items?: Array<{ icon: string; title: string; description: string }>;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  [key: string]: unknown;
}

interface CMSContextType {
  cms: CMSData;
  loading: boolean;
  refresh: () => Promise<void>;
}

const CMSContext = createContext<CMSContextType | null>(null);

export function CMSProvider({ children }: { children: React.ReactNode }) {
  const [cms, setCms] = useState<CMSData>({});
  const [loading, setLoading] = useState(true);

  const fetchCMS = async () => {
    try {
      const data = await apiGet<CMSData>('/cms/site');
      setCms(data);
    } catch (error) {
      console.error('Failed to load CMS:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMS();
  }, []);

  return (
    <CMSContext.Provider value={{ cms, loading, refresh: fetchCMS }}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
}
