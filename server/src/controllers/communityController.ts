import { Request, Response } from 'express';
import { CommunityReportModel } from '../models/CommunityReport.js';
import { isDatabaseConnected } from '../config/db.js';
import { DEMO_COMMUNITY_REPORTS } from '../data/demoCommunity.js';

export class CommunityController {
  /**
   * GET /api/community/reports
   */
  public static async getReports(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.query;

      if (isDatabaseConnected()) {
        const query: any = {};
        if (propertyId && typeof propertyId === 'string') {
          query.propertyId = propertyId;
        }

        const reports = await CommunityReportModel.find(query).sort({ createdAt: -1 }).lean();

        res.json({
          success: true,
          count: reports.length,
          data: reports,
          source: 'database',
          isDemoData: false,
        });
        return;
      }

      // Read-only fallback
      console.warn('[CommunityController] Database disconnected. Serving marked demo community reports.');
      let filtered = [...DEMO_COMMUNITY_REPORTS];
      if (propertyId && typeof propertyId === 'string') {
        filtered = filtered.filter((r) => r.propertyId === propertyId);
      }

      res.json({
        success: true,
        count: filtered.length,
        data: filtered,
        source: 'demonstration_fallback',
        isDemoData: true,
        notice: 'DEMO DATA: Database is not connected. Serving static mock reports.',
      });
    } catch (error: any) {
      console.error('[CommunityController.getReports Error]', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve community reports.',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/community/reports
   */
  public static async createReport(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId, propertyName, reportType, observation, reportedByPseudonym } = req.body;

      if (!observation || typeof observation !== 'string' || observation.trim().length < 5) {
        res.status(400).json({
          success: false,
          error: 'An observation of at least 5 characters is required.',
        });
        return;
      }

      // Strict requirement: Never report success if database is not connected
      if (!isDatabaseConnected()) {
        res.status(503).json({
          success: false,
          error: 'Database is not connected. Community report cannot be saved persistently.',
          code: 'DATABASE_UNAVAILABLE',
        });
        return;
      }

      const validTypes = ['availability_update', 'water_supply', 'wifi_speed', 'food_quality', 'safety_lighting'];
      const finalType = validTypes.includes(reportType) ? reportType : 'availability_update';

      const newReport = await CommunityReportModel.create({
        id: `rep-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        propertyId: propertyId || 'TN-HYD-0101',
        propertyName: propertyName?.trim() || 'HITEC City Residency',
        reportedByPseudonym:
          reportedByPseudonym?.trim() || `VerifiedResident_${Math.floor(100 + Math.random() * 900)}`,
        reportType: finalType,
        observation: observation.trim(),
        moderationStatus: 'approved',
        upvotesCount: 1,
      });

      res.status(201).json({
        success: true,
        message: 'Community report successfully recorded and published to neighborhood feed.',
        data: newReport,
      });
    } catch (error: any) {
      console.error('[CommunityController.createReport Error]', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create community report.',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/community/reports/:id/upvote
   */
  public static async upvoteReport(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      if (!isDatabaseConnected()) {
        res.status(503).json({
          success: false,
          error: 'Database is not connected. Upvotes cannot be saved.',
          code: 'DATABASE_UNAVAILABLE',
        });
        return;
      }

      const report = await CommunityReportModel.findOneAndUpdate(
        { id },
        { $inc: { upvotesCount: 1 } },
        { new: true }
      );

      if (!report) {
        res.status(404).json({
          success: false,
          error: `Report with ID "${id}" was not found.`,
        });
        return;
      }

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      console.error('[CommunityController.upvoteReport Error]', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upvote report.',
        message: error.message,
      });
    }
  }
}
