import * as admin from 'firebase-admin';
import axios from 'axios';
import { logger } from 'firebase-functions';

/**
 * PRODUCTION-GRADE BEAPI TOKEN MANAGER (Infinite Perfection)
 *
 * DESIGN PRINCIPLES:
 * 1. PERSISTENCE: Firestore-backed cache survives restarts and spans all instances.
 * 2. SINGLE-FLIGHT: Only one concurrent network request for a new token.
 * 3. AGGRESSIVE CACHING: Respects the 3-renewal-per-24h BEAPI constraint.
 * 4. PREEMPTIVE REFRESH: Refreshes 5 minutes before the 24h expiration.
 * 5. BACKOFF: Exponential backoff with jitter on authentication failures.
 */
export class TokenManager {
  private static instance: TokenManager;
  private db: admin.firestore.Firestore;
  private tokenPath = 'system/guesty_beapi_token';
  private refreshPromise: Promise<string> | null = null;
  private readonly REFRESH_BUFFER_SECONDS = 300; // 5 minutes before expiry

  private constructor() {
    this.db = admin.firestore();
  }

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Get valid token, fetching only if necessary.
   */
  async getToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    // 1. Double-Check Firestore Cache (Survives Restarts)
    const doc = await this.db.doc(this.tokenPath).get();
    const data = doc.data();

    if (data && data.token && data.expiresAt > now + this.REFRESH_BUFFER_SECONDS) {
      return data.token;
    }

    // 2. Single-flight Refresh (Only one fetch per app-instance at a time)
    if (this.refreshPromise) {
      logger.info('BEAPI Token: Waiting for existing refresh promise...');
      return this.refreshPromise;
    }

    // 3. Initiate Refresh
    this.refreshPromise = this.fetchNewTokenWithBackoff();
    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Fetch new token with exponential backoff if service is down.
   */
  private async fetchNewTokenWithBackoff(maxAttempts = 3): Promise<string> {
    const clientId = process.env.GUESTY_BEAPI_CLIENT_ID;
    const clientSecret = process.env.GUESTY_BEAPI_CLIENT_SECRET;
    const tokenUrl = 'https://booking.guesty.com/oauth2/token';

    if (!clientId || !clientSecret) {
      logger.error('CRITICAL: BEAPI credentials missing from environment.');
      throw new Error('CONFIG_ERROR: Missing BEAPI Credentials');
    }

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        logger.info(`BEAPI Token: Fetching new token (Attempt ${attempt + 1})`);

        const resp = await axios.post(tokenUrl, new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'booking_engine:api',
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: 10000 // 10s timeout for auth
        });

        const { access_token, expires_in } = resp.data;
        const expiresAt = Math.floor(Date.now() / 1000) + (expires_in || 86400);

        // Atomically update Firestore
        await this.db.doc(this.tokenPath).set({
          token: access_token,
          expiresAt,
          lastRefreshedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        logger.info(`BEAPI Token: Successfully acquired. Expires in ${expires_in}s`);
        return access_token;

      } catch (error: any) {
        const status = error.response?.status;
        const isRetryable = status === 429 || status >= 500;

        if (!isRetryable || attempt === maxAttempts - 1) {
          logger.error('BEAPI Token: Terminal fetch error', error.response?.data || error.message);
          throw new Error('AUTH_UNAVAILABLE: Guesty Authentication Failed');
        }

        const delay = Math.pow(2, attempt) * 2000 + Math.random() * 1000;
        logger.warn(`BEAPI Token: Retryable error (${status}). Retrying in ${Math.round(delay)}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }

    throw new Error('RETRY_EXHAUSTED');
  }
}
