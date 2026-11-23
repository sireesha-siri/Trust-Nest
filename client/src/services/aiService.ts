import { GeminiParseSuccessResponse, GeminiParseErrorResponse } from '../types/aiSearch';

// Normalize API base URL: remove trailing slashes if provided, default to localhost:5000
const RAW_API_URL = (import.meta.env.VITE_API_URL ?? '').trim();
const API_BASE_URL = RAW_API_URL 
  ? (RAW_API_URL.endsWith('/') ? RAW_API_URL.slice(0, -1) : RAW_API_URL) 
  : 'http://localhost:5000';

export interface AIServiceError {
  message: string;
  code?: 'API_KEY_MISSING' | 'INVALID_INPUT' | 'GEMINI_TIMEOUT' | 'RATE_LIMIT_EXCEEDED' | 'NETWORK_ERROR' | 'GEMINI_ERROR';
}

export class AIService {
  public static async parseRequirements(prompt: string): Promise<GeminiParseSuccessResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/parse-requirements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorData = data as GeminiParseErrorResponse;
        const err = new Error(errorData.error || 'Failed to extract requirements with Gemini AI.');
        (err as any).code = errorData.code || 'GEMINI_ERROR';
        throw err;
      }

      return data as GeminiParseSuccessResponse;
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        const networkErr = new Error(`Cannot connect to TrustNest backend API server at ${API_BASE_URL}.`);
        (networkErr as any).code = 'NETWORK_ERROR';
        throw networkErr;
      }
      throw err;
    }
  }

  public static async getStatus(): Promise<{ configured: boolean; model: string; status: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/status`);
      if (!response.ok) {
        return { configured: false, model: 'offline', status: 'offline' };
      }
      return await response.json();
    } catch {
      return { configured: false, model: 'offline', status: 'offline' };
    }
  }
}
