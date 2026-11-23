import { Request, Response } from 'express';
import { PropertyModel } from '../models/Property.js';
import { DiscrepancyReportModel } from '../models/DiscrepancyReport.js';
import { isDatabaseConnected } from '../config/db.js';
import { DEMO_PROPERTIES } from '../data/demoProperties.js';

export class PropertyController {
  /**
   * GET /api/properties
   * Query parameters:
   * - category: string
   * - area: string
   * - maxRent: number
   * - search: string
   */
  public static async getProperties(req: Request, res: Response): Promise<void> {
    try {
      const { category, area, maxRent, search } = req.query;

      // 1. If MongoDB is connected, query the database
      if (isDatabaseConnected()) {
        const query: any = {};

        if (category && category !== 'all') {
          query.category = category;
        }

        if (area && area !== 'all') {
          query['location.area'] = area;
        }

        if (maxRent) {
          const parsedMaxRent = Number(maxRent);
          if (!isNaN(parsedMaxRent) && parsedMaxRent > 0) {
            query['pricing.startingRent'] = { $lte: parsedMaxRent };
          }
        }

        if (search && typeof search === 'string' && search.trim()) {
          const searchRegex = new RegExp(search.trim(), 'i');
          query.$or = [
            { name: searchRegex },
            { tagline: searchRegex },
            { 'location.address': searchRegex },
            { 'location.landmark': searchRegex },
          ];
        }

        const properties = await PropertyModel.find(query).sort({ 'verification.overallTrustScore': -1 }).lean();

        res.json({
          success: true,
          count: properties.length,
          data: properties,
          source: 'database',
          isDemoData: false,
        });
        return;
      }

      // 2. Read-only demonstration fallback when database is not connected
      console.warn('[PropertyController] Database disconnected. Serving marked demonstration properties.');
      let filtered = [...DEMO_PROPERTIES];

      if (category && category !== 'all') {
        filtered = filtered.filter((p) => p.category === category);
      }

      if (area && area !== 'all') {
        filtered = filtered.filter((p) => p.location.area === area);
      }

      if (maxRent) {
        const parsedMaxRent = Number(maxRent);
        if (!isNaN(parsedMaxRent) && parsedMaxRent > 0) {
          filtered = filtered.filter((p) => p.pricing.startingRent <= parsedMaxRent);
        }
      }

      if (search && typeof search === 'string' && search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.tagline.toLowerCase().includes(q) ||
            p.location.address.toLowerCase().includes(q)
        );
      }

      res.json({
        success: true,
        count: filtered.length,
        data: filtered,
        source: 'demonstration_fallback',
        isDemoData: true,
        notice: 'DEMO DATA: Database is not connected. Serving static mock dataset.',
      });
    } catch (error: any) {
      console.error('[PropertyController.getProperties Error]', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve properties.',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/properties/:id
   */
  public static async getPropertyById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      if (isDatabaseConnected()) {
        const property = await PropertyModel.findOne({ id }).lean();
        if (!property) {
          res.status(404).json({
            success: false,
            error: `Property with ID "${id}" was not found.`,
          });
          return;
        }

        res.json({
          success: true,
          data: property,
          source: 'database',
          isDemoData: false,
        });
        return;
      }

      // Fallback
      const property = DEMO_PROPERTIES.find((p) => p.id === id);
      if (!property) {
        res.status(404).json({
          success: false,
          error: `Demo property with ID "${id}" was not found.`,
        });
        return;
      }

      res.json({
        success: true,
        data: property,
        source: 'demonstration_fallback',
        isDemoData: true,
        notice: 'DEMO DATA: Database is not connected.',
      });
    } catch (error: any) {
      console.error('[PropertyController.getPropertyById Error]', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve property.',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/properties/:id/discrepancies
   */
  public static async createDiscrepancy(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { observation, reporterPseudonym } = req.body;

      if (!observation || typeof observation !== 'string' || observation.trim().length < 5) {
        res.status(400).json({
          success: false,
          error: 'A descriptive observation of at least 5 characters is required.',
        });
        return;
      }

      // Strict requirement: Never report success if database is not connected
      if (!isDatabaseConnected()) {
        res.status(503).json({
          success: false,
          error: 'Database is not connected. Discrepancy report cannot be recorded persistently.',
          code: 'DATABASE_UNAVAILABLE',
        });
        return;
      }

      // Check if property exists
      const property = await PropertyModel.findOne({ id }).lean();
      const propertyName = property ? property.name : 'Unknown Property';

      const discrepancy = await DiscrepancyReportModel.create({
        id: `disc-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        propertyId: id,
        propertyName,
        observation: observation.trim(),
        reporterPseudonym: reporterPseudonym?.trim() || `Anonymous_${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'pending_review',
        reportedAt: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: 'Property discrepancy report recorded successfully and queued for human verification.',
        data: discrepancy,
      });
    } catch (error: any) {
      console.error('[PropertyController.createDiscrepancy Error]', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record discrepancy report.',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/properties/:id/discrepancies
   */
  public static async getDiscrepancies(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      if (!isDatabaseConnected()) {
        res.json({
          success: true,
          count: 0,
          data: [],
          notice: 'Database is not connected.',
        });
        return;
      }

      const list = await DiscrepancyReportModel.find({ propertyId: id })
        .sort({ createdAt: -1 })
        .lean();

      res.json({
        success: true,
        count: list.length,
        data: list,
      });
    } catch (error: any) {
      console.error('[PropertyController.getDiscrepancies Error]', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve discrepancies.',
        message: error.message,
      });
    }
  }
}
