import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { useAuthStore } from '@/store';
import type {
  AdminStats,
  AdminConfig,
  Transaction,
  ContactSubmission,
  PropertyOwnerInquiry,
  AdminLoginRequest,
  AdminLoginResponse,
  GuestyEnvironment,
} from '@/types';

// ==================== AUTH ====================

export function useAdminLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  
  return useMutation({
    mutationFn: (data: AdminLoginRequest) => apiPost<AdminLoginResponse>('/admin/login', data),
    onSuccess: (data, variables) => {
      setAuth(data.access_token, variables.email);
    },
  });
}

export function useAdminMe() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return useQuery({
    queryKey: ['admin', 'me'],
    queryFn: () => apiGet<{ email: string; role: string }>('/admin/me'),
    enabled: isAuthenticated,
    retry: false,
  });
}

// ==================== STATS & CONFIG ====================

export function useAdminStats() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiGet<AdminStats>('/admin/stats'),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAdminConfig() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return useQuery({
    queryKey: ['admin', 'config'],
    queryFn: () => apiGet<AdminConfig>('/admin/config'),
    enabled: isAuthenticated,
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { guesty_environment?: GuestyEnvironment }) =>
      apiPost<{ success: boolean; changes: string[] }>('/admin/config', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

// ==================== TRANSACTIONS ====================

export function useAdminTransactions() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return useQuery({
    queryKey: ['admin', 'transactions'],
    queryFn: () => apiGet<Transaction[]>('/admin/transactions'),
    enabled: isAuthenticated,
  });
}

// ==================== CONTACTS ====================

export function useAdminContacts() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return useQuery({
    queryKey: ['admin', 'contacts'],
    queryFn: () => apiGet<ContactSubmission[]>('/admin/contacts'),
    enabled: isAuthenticated,
  });
}

// ==================== INQUIRIES ====================

export function useAdminInquiries() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return useQuery({
    queryKey: ['admin', 'inquiries'],
    queryFn: () => apiGet<PropertyOwnerInquiry[]>('/admin/owner-inquiries'),
    enabled: isAuthenticated,
  });
}

// ==================== ACTIONS ====================

export function useClearCache() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiPost<{ success: boolean; cleared: number }>('/admin/clear-cache'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useRefreshToken() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiPost<{ success: boolean; token_prefix: string; environment: string }>('/admin/refresh-token'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}
