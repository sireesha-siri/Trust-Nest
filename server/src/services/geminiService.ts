import '../config/env.js';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  RawGeminiExtraction, 
  GeneratedChecklistItem, 
  ParseRequirementsSuccessResponse 
} from '../types/gemini.js';

const SYSTEM_INSTRUCTION = `You are TrustNest's Accommodation & City Intelligence requirement extractor for urban India (specifically pilot city Hyderabad: HITEC City, Madhapur, Gachibowli, Kondapur).

Your objective is to analyze conversational accommodation search queries and extract structured requirements into predictable JSON.

CRITICAL RULES:
1. For every requirement field, you MUST accurately assign 'source':
   - 'explicit': The user explicitly mentioned or requested this requirement (e.g. "under ₹12,000", "need food", "women's PG").
   - 'inferred': Logically deduced from context (e.g., "relocating near HITEC City" infers locality "HITEC City"; "women's PG" infers gender "female").
   - 'not_specified': The user did NOT specify or imply this requirement.
2. DO NOT invent preferences that the user did not provide. If a budget or locality is not mentioned, mark its source as 'not_specified' and set value to null.
3. For 'checklistItems', generate concise, user-friendly checklist labels (e.g. "Women's Accommodation", "Monthly rent under ₹12,000", "3 Meals Included", "CCTV & Security Guard", "Proximity to Metro"). Each item must specify its category ('budget', 'type', 'location', 'safety', 'food', 'connectivity') and its certainty ('explicit', 'inferred', 'not_specified').
4. Keep the 'explanation' to a clear 1-2 sentence factual summary of what was extracted.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    city: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING },
        source: { type: Type.STRING, enum: ['explicit', 'inferred', 'not_specified'] },
      },
      required: ['source'],
    },
    locality: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING },
        source: { type: Type.STRING, enum: ['explicit', 'inferred', 'not_specified'] },
      },
      required: ['source'],
    },
    maxMonthlyRent: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.INTEGER },
        source: { type: Type.STRING, enum: ['explicit', 'inferred', 'not_specified'] },
      },
      required: ['source'],
    },
    accommodationType: {
      type: Type.OBJECT,
      properties: {
        value: { 
          type: Type.STRING, 
          enum: ['womens_pg', 'mens_pg', 'coliving', 'student_stay', 'studio_apartment', 'any'] 
        },
        source: { type: Type.STRING, enum: ['explicit', 'inferred', 'not_specified'] },
      },
      required: ['value', 'source'],
    },
    genderPreference: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, enum: ['female', 'male', 'none_specified'] },
        source: { type: Type.STRING, enum: ['explicit', 'inferred', 'not_specified'] },
      },
      required: ['value', 'source'],
    },
    foodRequirements: {
      type: Type.OBJECT,
      properties: {
        required: { type: Type.BOOLEAN },
        description: { type: Type.STRING },
        source: { type: Type.STRING, enum: ['explicit', 'inferred', 'not_specified'] },
      },
      required: ['required', 'source'],
    },
    safetyRequirements: {
      type: Type.OBJECT,
      properties: {
        items: { type: Type.ARRAY, items: { type: Type.STRING } },
        source: { type: Type.STRING, enum: ['explicit', 'inferred', 'not_specified'] },
      },
      required: ['items', 'source'],
    },
    amenities: {
      type: Type.OBJECT,
      properties: {
        items: { type: Type.ARRAY, items: { type: Type.STRING } },
        source: { type: Type.STRING, enum: ['explicit', 'inferred', 'not_specified'] },
      },
      required: ['items', 'source'],
    },
    publicTransportRequirements: {
      type: Type.OBJECT,
      properties: {
        metroRequired: { type: Type.BOOLEAN },
        busRequired: { type: Type.BOOLEAN },
        description: { type: Type.STRING },
        source: { type: Type.STRING, enum: ['explicit', 'inferred', 'not_specified'] },
      },
      required: ['metroRequired', 'busRequired', 'source'],
    },
    nearbyEssentialServices: {
      type: Type.OBJECT,
      properties: {
        items: { type: Type.ARRAY, items: { type: Type.STRING } },
        source: { type: Type.STRING, enum: ['explicit', 'inferred', 'not_specified'] },
      },
      required: ['items', 'source'],
    },
    additionalPreferences: {
      type: Type.OBJECT,
      properties: {
        items: { type: Type.ARRAY, items: { type: Type.STRING } },
        source: { type: Type.STRING, enum: ['explicit', 'inferred', 'not_specified'] },
      },
      required: ['items', 'source'],
    },
    checklistItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          category: { 
            type: Type.STRING, 
            enum: ['budget', 'type', 'location', 'safety', 'food', 'connectivity'] 
          },
          certainty: { type: Type.STRING, enum: ['explicit', 'inferred', 'not_specified'] },
        },
        required: ['label', 'category', 'certainty'],
      },
    },
    explanation: { type: Type.STRING },
  },
  required: [
    'city',
    'locality',
    'maxMonthlyRent',
    'accommodationType',
    'genderPreference',
    'foodRequirements',
    'safetyRequirements',
    'amenities',
    'publicTransportRequirements',
    'nearbyEssentialServices',
    'checklistItems',
    'explanation',
  ],
};

export class GeminiService {
  private static instance: GeminiService;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  public isConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY;
    return Boolean(key && key.trim() !== '' && !key.includes('your_gemini_api_key_here'));
  }

  public getModelName(): string {
    return (process.env.GEMINI_MODEL || '').trim();
  }

  public async extractRequirements(prompt: string): Promise<ParseRequirementsSuccessResponse> {
    if (!this.isConfigured()) {
      const err = new Error('Gemini API key is not configured on the server. Please set GEMINI_API_KEY in server/.env.');
      (err as any).code = 'API_KEY_MISSING';
      throw err;
    }

    const activeModel = this.getModelName();
    if (!activeModel) {
      const err = new Error('Gemini model is not configured. Please set GEMINI_MODEL in server/.env.');
      (err as any).code = 'MODEL_NOT_CONFIGURED';
      throw err;
    }

    const apiKey = process.env.GEMINI_API_KEY!;
    const ai = new GoogleGenAI({ apiKey });

    const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS) || 60000;
    let timer: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        const timeoutError = new Error(`Gemini API request timed out after ${timeoutMs / 1000} seconds.`);
        (timeoutError as any).code = 'GEMINI_TIMEOUT';
        reject(timeoutError);
      }, timeoutMs);
    });

    console.log(`[GeminiService] Dispatched requirement extraction to model: ${activeModel}`);

    try {
      const generatePromise = ai.models.generateContent({
        model: activeModel,
        contents: [
          {
            role: 'user',
            parts: [{ text: `Extract accommodation and city requirements from this query:\n\n"${prompt}"` }],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.1,
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const rawText = response.text;

      if (!rawText) {
        throw new Error('Gemini returned an empty response.');
      }

      let parsedData: RawGeminiExtraction;
      try {
        parsedData = JSON.parse(rawText);
      } catch {
        throw new Error('Failed to parse structured JSON from Gemini response.');
      }

      // Convert checklist items into interactive items with unique IDs
      const generatedChecklist: GeneratedChecklistItem[] = (parsedData.checklistItems || []).map((item, index) => ({
        id: `ai-item-${Date.now()}-${index}`,
        label: item.label,
        category: item.category,
        checked: true,
        source: 'ai_extracted',
        certainty: item.certainty,
      }));

      return {
        success: true,
        rawPrompt: prompt,
        modelUsed: activeModel,
        structuredRequirements: parsedData,
        generatedChecklist,
        explanation: parsedData.explanation || 'Extracted structured accommodation criteria from your prompt.',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.code === 'GEMINI_TIMEOUT') {
        throw error;
      }

      const msg = error.message || String(error);
      if (msg.includes('503') || msg.toLowerCase().includes('high demand') || msg.toLowerCase().includes('unavailable')) {
        const unavailableErr = new Error(`The configured Gemini model (${activeModel}) is temporarily experiencing high demand on Google's servers. Please retry in a few moments.`);
        (unavailableErr as any).code = 'GEMINI_UNAVAILABLE';
        throw unavailableErr;
      }

      if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit')) {
        const rateLimitErr = new Error('Gemini API rate limit reached. Please wait a moment and retry.');
        (rateLimitErr as any).code = 'RATE_LIMIT_EXCEEDED';
        throw rateLimitErr;
      }

      if (msg.includes('API key') || msg.includes('401') || msg.includes('403')) {
        const authErr = new Error('Invalid or unauthorized Gemini API key.');
        (authErr as any).code = 'INVALID_API_KEY';
        throw authErr;
      }

      const genericErr = new Error(msg || 'An error occurred while communicating with Gemini AI.');
      (genericErr as any).code = 'GEMINI_ERROR';
      throw genericErr;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
