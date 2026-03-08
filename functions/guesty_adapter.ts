import axios, { AxiosInstance } from 'axios';
import { TokenManager } from './token_manager';
import { logger } from 'firebase-functions';

/**
 * Horus Zenith - Production-Grade Guesty BEAPI Adapter
 * Handles Auth, Retries, and Error Normalization.
 */
export class GuestyAdapter {
  private client: AxiosInstance;
  private tokenManager: TokenManager;
  private baseUrl: string;

  constructor() {
    this.tokenManager = TokenManager.getInstance();
    this.baseUrl = process.env.GUESTY_ENVIRONMENT === 'sandbox'
      ? 'https://booking-sandbox.guesty.com/api'
      : 'https://booking-api.guesty.com/v1';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
    });

    // Request Interceptor: Inject Token
    this.client.interceptors.request.use(async (config) => {
      const token = await this.tokenManager.getToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    // Response Interceptor: Handle Retries (429, 5xx)
    this.client.interceptors.response.use(null, async (error) => {
      const { config, response } = error;

      if (!config || !response) return Promise.reject(error);

      const retryable = response.status === 429 || response.status >= 500;
      const count = config.__retryCount || 0;

      if (retryable && count < 3) {
        config.__retryCount = count + 1;
        const delay = Math.pow(2, count) * 1000 + Math.random() * 1000;
        logger.warn(`Guesty API: Retrying ${config.url} (Attempt ${count + 1}) after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.client(config);
      }

      return Promise.reject(error);
    });
  }

  async getListings(params: any) {
    const resp = await this.client.get('/listings', { params });
    return resp.data;
  }

  async createQuote(payload: any) {
    const resp = await this.client.post('/reservations/quotes', payload);
    return resp.data;
  }

  async createInstantReservation(quoteId: string, payload: any) {
    const resp = await this.client.post(`/reservations/quotes/${quoteId}/instant`, payload);
    return resp.data;
  }

  async verifyPayment(reservationId: string) {
    // Note: Documentation says verify-payment is under /reservations/:id/verify-payment
    const resp = await this.client.post(`/reservations/${reservationId}/verify-payment`);
    return resp.data;
  }

  async getReservation(reservationId: string) {
    const resp = await this.client.get(`/reservations/${reservationId}/details`);
    return resp.data;
  }
}
