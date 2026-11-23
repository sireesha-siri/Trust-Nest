import { apiFetch } from './apiClient';
import { CommunityReport } from '../types/community';
import { DEMO_COMMUNITY_REPORTS } from '../data/demoCommunity';

export class CommunityService {
  /**
   * Fetches community reports from the TrustNest backend API.
   */
  public static async getReports(propertyId?: string): Promise<{
    reports: CommunityReport[];
    isFallback: boolean;
    source: string;
  }> {
    try {
      const qs = propertyId ? `?propertyId=${encodeURIComponent(propertyId)}` : '';
      const res = await apiFetch<{ success: boolean; data: CommunityReport[]; source: string }>(
        `/api/community/reports${qs}`
      );

      return {
        reports: res.data || [],
        isFallback: res.source === 'demonstration_fallback',
        source: res.source,
      };
    } catch (err) {
      console.warn('[CommunityService] API unreachable. Using marked demo community reports fallback.', err);
      return {
        reports: DEMO_COMMUNITY_REPORTS,
        isFallback: true,
        source: 'demonstration_fallback',
      };
    }
  }

  /**
   * Submits a new community ground observation to the persistent database.
   * Throws if database is unavailable or write fails (never fakes persistence).
   */
  public static async submitReport(report: {
    propertyId: string;
    propertyName: string;
    reportType: string;
    observation: string;
    reportedByPseudonym?: string;
  }): Promise<{ success: boolean; message: string; data: CommunityReport }> {
    return await apiFetch<{ success: boolean; message: string; data: CommunityReport }>(
      '/api/community/reports',
      {
        method: 'POST',
        body: JSON.stringify(report),
      }
    );
  }

  /**
   * Upvotes a community report.
   */
  public static async upvoteReport(reportId: string): Promise<CommunityReport> {
    const res = await apiFetch<{ success: boolean; data: CommunityReport }>(
      `/api/community/reports/${reportId}/upvote`,
      { method: 'POST' }
    );
    return res.data;
  }
}
