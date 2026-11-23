import { Request, Response } from 'express';
import { CityServiceModel } from '../models/CityService.js';
import { isDatabaseConnected } from '../config/db.js';
import { DEMO_CITY_SERVICES } from '../data/demoCityServices.js';

export class CityServiceController {
  /**
   * GET /api/city-services
   * Query parameters:
   * - category: string
   * - area: string
   */
  public static async getCityServices(req: Request, res: Response): Promise<void> {
    try {
      const { category, area } = req.query;

      if (isDatabaseConnected()) {
        const query: any = {};

        if (category && category !== 'all') {
          query.category = category;
        }

        if (area && area !== 'all') {
          query.area = area;
        }

        const services = await CityServiceModel.find(query).sort({ distanceFromCyberTowersKm: 1 }).lean();

        res.json({
          success: true,
          count: services.length,
          data: services,
          source: 'database',
          isDemoData: false,
        });
        return;
      }

      // Read-only demonstration fallback
      console.warn('[CityServiceController] Database disconnected. Serving marked demonstration city services.');
      let filtered = [...DEMO_CITY_SERVICES];

      if (category && category !== 'all') {
        filtered = filtered.filter((s) => s.category === category);
      }

      if (area && area !== 'all') {
        filtered = filtered.filter((s) => s.area === area);
      }

      res.json({
        success: true,
        count: filtered.length,
        data: filtered,
        source: 'demonstration_fallback',
        isDemoData: true,
        notice: 'DEMO DATA: Database is not connected. Serving static mock city services.',
      });
    } catch (error: any) {
      console.error('[CityServiceController.getCityServices Error]', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve city services.',
        message: error.message,
      });
    }
  }
}
