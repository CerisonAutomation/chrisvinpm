import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import type {
  Listing,
  ListingsResponse,
  Quote,
  QuoteRequest,
  CheckoutRequest,
  CheckoutResponse,
  SearchParams,
  CalendarDay,
  PublicConfig,
} from '@/types';

// ==================== LISTINGS ====================

export function useListings(params: SearchParams & { limit?: number; cursor?: string }) {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: () => apiGet<ListingsResponse>('/listings', { params }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useListing(id: string, checkIn?: string, checkOut?: string) {
  return useQuery({
    queryKey: ['listing', id, checkIn, checkOut],
    queryFn: () => apiGet<Listing>(`/listings/${id}`, { params: { checkIn, checkOut } }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useListingCalendar(id: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['calendar', id, from, to],
    queryFn: () => apiGet<{ calendar: CalendarDay[] }>(`/listings/${id}/calendar`, { params: { from_date: from, to_date: to } }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== QUOTES ====================

export function useCreateQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: QuoteRequest) => apiPost<Quote>('/quotes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

export function useQuote(quoteId: string) {
  return useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => apiGet<Quote>(`/quotes/${quoteId}`),
    enabled: !!quoteId,
    staleTime: 2 * 60 * 1000, // 2 minutes (quotes can expire)
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quoteId, coupon }: { quoteId: string; coupon: string }) =>
      apiPost<Quote>(`/quotes/${quoteId}/coupons`, { coupons: coupon }),
    onSuccess: (_, { quoteId }) => {
      queryClient.invalidateQueries({ queryKey: ['quote', quoteId] });
    },
  });
}

// ==================== CHECKOUT ====================

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (data: CheckoutRequest) => apiPost<CheckoutResponse>('/checkout/create-session', data),
  });
}

export function useCheckoutStatus(sessionId: string) {
  return useQuery({
    queryKey: ['checkout-status', sessionId],
    queryFn: () => apiGet<{ payment_status: string; reservation_id?: string }>(`/checkout/status/${sessionId}`),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling once payment is complete
      if (data?.payment_status === 'paid' || data?.payment_status === 'failed') {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
  });
}

// ==================== CONFIG ====================

export function usePublicConfig() {
  return useQuery({
    queryKey: ['config', 'public'],
    queryFn: () => apiGet<PublicConfig>('/config/public'),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// ==================== CONTACT ====================

export function useSubmitContact() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
      apiPost<{ success: boolean }>('/contact', data),
  });
}

export function useSubmitOwnerInquiry() {
  return useMutation({
    mutationFn: (data: {
      propertyType: string;
      location: string;
      bedrooms?: string;
      bathrooms?: string;
      maxGuests?: string;
      name: string;
      email: string;
      phone: string;
      servicesInterested?: string;
      currentlyListed?: string;
      additionalInfo?: string;
    }) => apiPost<{ success: boolean }>('/property-owner-inquiry', data),
  });
}
