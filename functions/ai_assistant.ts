import * as admin from 'firebase-admin';
import { FastifyInstance } from 'fastify';
import { logger } from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Horus Zenith - Gemini AI Marketing Assistant
 * Powers CMS content generation, SEO, and localization.
 */
export async function registerAiAssistantRoutes(fastify: FastifyInstance) {

  fastify.post('/api/ai/generate', async (request: any, reply) => {
    const { type, context, tone = 'luxury' } = request.body;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return reply.code(500).send({ error: 'Gemini API Key not configured' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      You are a high-end hospitality marketing expert for CVPM (Christiano Vincenti Property Management).
      Your goal is to generate OMNI-PERFECT content for a luxury vacation rental platform in Malta.

      CONTENT TYPE: ${type}
      TONE: ${tone}
      CONTEXT: ${JSON.stringify(context)}

      Generate compelling, conversion-focused content.
      If generating a block, return valid JSON matching the schema.
      Return ONLY the generated content or JSON.
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Attempt to parse JSON if it looks like JSON
      let content = text;
      if (text.trim().startsWith('{')) {
        try { content = JSON.parse(text); } catch(e) {}
      }

      return { content };
    } catch (error: any) {
      logger.error('Gemini Generation Failed', error.message);
      return reply.code(500).send({ error: 'AI Generation Failed' });
    }
  });

  fastify.post('/api/ai/translate', async (request: any, reply) => {
    const { content, targetLanguage } = request.body;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) return reply.code(500).send({ error: 'AI Not Configured' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      Translate the following CMS content into ${targetLanguage}.
      Maintain the luxury tone and brand voice of CVPM.
      Keep the EXACT same JSON structure.
      CONTENT: ${JSON.stringify(content)}
      RETURN ONLY THE TRANSLATED JSON.
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error: any) {
      logger.error('Gemini Translation Failed', error.message);
      return reply.code(500).send({ error: 'Translation Failed' });
    }
  });
}
