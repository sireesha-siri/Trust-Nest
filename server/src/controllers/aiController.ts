import { Request, Response } from 'express';
import { GeminiService } from '../services/geminiService.js';

export class AIController {
  public static async parseRequirements(req: Request, res: Response): Promise<void> {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search prompt is required and must be a text string.',
          code: 'INVALID_INPUT',
        });
        return;
      }

      const trimmed = prompt.trim();
      if (trimmed.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Search prompt cannot be empty.',
          code: 'INVALID_INPUT',
        });
        return;
      }

      if (trimmed.length > 2000) {
        res.status(400).json({
          success: false,
          error: 'Search prompt exceeds the maximum allowed length of 2,000 characters.',
          code: 'INVALID_INPUT',
        });
        return;
      }

      const geminiService = GeminiService.getInstance();
      const result = await geminiService.extractRequirements(trimmed);

      res.status(200).json(result);
    } catch (err: any) {
      const code = err.code || 'GEMINI_ERROR';
      const message = err.message || 'Failed to process accommodation requirements with Gemini.';

      if (code === 'API_KEY_MISSING') {
        res.status(503).json({
          success: false,
          error: message,
          code: 'API_KEY_MISSING',
        });
        return;
      }

      if (code === 'GEMINI_TIMEOUT') {
        res.status(504).json({
          success: false,
          error: message,
          code: 'GEMINI_TIMEOUT',
        });
        return;
      }

      if (code === 'GEMINI_UNAVAILABLE') {
        res.status(503).json({
          success: false,
          error: message,
          code: 'GEMINI_UNAVAILABLE',
        });
        return;
      }

      if (code === 'RATE_LIMIT_EXCEEDED') {
        res.status(429).json({
          success: false,
          error: message,
          code: 'RATE_LIMIT_EXCEEDED',
        });
        return;
      }

      if (code === 'INVALID_API_KEY') {
        res.status(401).json({
          success: false,
          error: message,
          code: 'INVALID_API_KEY',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: message,
        code: 'GEMINI_ERROR',
      });
    }
  }

  public static async getStatus(req: Request, res: Response): Promise<void> {
    const geminiService = GeminiService.getInstance();
    const model = geminiService.getModelName() || 'NOT_CONFIGURED';
    res.status(200).json({
      service: 'Gemini AI Integration',
      configured: geminiService.isConfigured() && model !== 'NOT_CONFIGURED',
      model,
      status: geminiService.isConfigured() && model !== 'NOT_CONFIGURED' ? 'ready' : 'unconfigured_missing_key',
    });
  }
}
