import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { GuestyAdapter } from './guesty_adapter';
import { registerCmsAdminRoutes } from './cms_admin';
import { registerAiAssistantRoutes } from './ai_assistant';
import { logger } from 'firebase-functions';

admin.initializeApp();

const fastify = Fastify({
  logger: false, // Use Firebase logger instead
});

// Production middleware
fastify.register(cors);
fastify.register(helmet, { contentSecurityPolicy: false });

const guesty = new GuestyAdapter();

// Health check
fastify.get('/api/health', async () => ({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  environment: process.env.GUESTY_ENVIRONMENT || 'production',
}));

// Booking Endpoints
fastify.get('/api/listings', async (request: any) => {
  try {
    return await guesty.getListings(request.query);
  } catch (error: any) {
    logger.error('API Error: Listings', error.response?.data || error.message);
    throw error;
  }
});

fastify.post('/api/quotes', async (request: any) => {
  try {
    return await guesty.createQuote(request.body);
  } catch (error: any) {
    logger.error('API Error: Quotes', error.response?.data || error.message);
    throw error;
  }
});

fastify.post('/api/quotes/:id/instant-charge', async (request: any) => {
  try {
    return await guesty.createInstantReservation(request.params.id, request.body);
  } catch (error: any) {
    logger.error('API Error: Instant Charge', error.response?.data || error.message);
    throw error;
  }
});

// CMS Admin & AI Routes
registerCmsAdminRoutes(fastify);
registerAiAssistantRoutes(fastify);

// CMS Endpoints (Firestore Proxy)
fastify.get('/api/cms/pages/:slug', async (request: any) => {
  const { slug } = request.params;
  const { locale = 'en' } = request.query;

  const snapshot = await admin.firestore()
    .collection('pages')
    .where('slug', '==', slug)
    .where('locale', '==', locale)
    .where('status', '==', 'published')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return fastify.httpErrors.notFound('Page not found');
  }

  return snapshot.docs[0].data();
});

fastify.get('/api/cms/settings', async () => {
  const doc = await admin.firestore().doc('settings/global').get();
  return doc.data() || {};
});

// Error handling wrapper for Firebase Functions
export const api = functions.https.onRequest(async (req, res) => {
  await fastify.ready();
  fastify.server.emit('request', req, res);
});
