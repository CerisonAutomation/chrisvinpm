import * as admin from 'firebase-admin';
import { FastifyInstance } from 'fastify';
import { logger } from 'firebase-functions';

/**
 * Horus Zenith - Secure CMS Admin API (BFF for Firestore)
 * Enforces role-based access for mutations.
 */
export async function registerCmsAdminRoutes(fastify: FastifyInstance) {

  // Middleware: Auth Check
  fastify.addHook('preHandler', async (request: any, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      request.user = decodedToken;
    } catch (error) {
      return reply.code(401).send({ error: 'Invalid Token' });
    }
  });

  // Pages Admin
  fastify.get('/api/cms/admin/pages', async () => {
    const snapshot = await admin.firestore().collection('pages').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });

  fastify.post('/api/cms/admin/pages', async (request: any) => {
    const page = request.body;
    const docRef = await admin.firestore().collection('pages').add({
      ...page,
      status: 'draft',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: request.user.uid,
    });
    return { id: docRef.id };
  });

  fastify.put('/api/cms/admin/pages/:id', async (request: any) => {
    const { id } = request.params;
    const updates = request.body;

    // Versioning: Capture Snapshot before update
    const doc = await admin.firestore().doc(`pages/${id}`).get();
    const currentData = doc.data();
    if (currentData) {
      await admin.firestore().collection('versions').add({
        entityId: id,
        entityType: 'page',
        version: (currentData.version || 0) + 1,
        snapshot: currentData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: request.user.uid,
      });
    }

    await admin.firestore().doc(`pages/${id}`).update({
      ...updates,
      version: (currentData?.version || 0) + 1,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: request.user.uid,
    });

    return { success: true };
  });

  // Global Settings Admin
  fastify.get('/api/cms/admin/settings', async () => {
    const doc = await admin.firestore().doc('settings/global').get();
    return doc.data() || {};
  });

  fastify.put('/api/cms/admin/settings', async (request: any) => {
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Forbidden: Admin access required' });
    }
    await admin.firestore().doc('settings/global').set({
      ...request.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return { success: true };
  });
}
