import { apiFetch } from './apiClient';
import { Property, AccommodationCategory } from '../types/property';
import { DEMO_PROPERTIES } from '../data/demoProperties';

export interface PropertiesResponse {
  success: boolean;
  count: number;
  data: Property[];
  source: 'database' | 'demonstration_fallback';
  isDemoData?: boolean;
}

export class PropertyService {
  /**
   * Fetches property listings from the TrustNest backend API.
   * If the backend or database is unreachable, safely falls back to marked demonstration data.
   */
  public static async getProperties(params?: {
    category?: AccommodationCategory | 'all';
    area?: string;
    maxRent?: number;
    search?: string;
  }): Promise<{ properties: Property[]; isFallback: boolean; source: string }> {
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'all') query.append('category', params.category);
      if (params?.area && params.area !== 'all') query.append('area', params.area);
      if (params?.maxRent) query.append('maxRent', String(params.maxRent));
      if (params?.search && params.search.trim()) query.append('search', params.search.trim());

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await apiFetch<PropertiesResponse>(`/api/properties${qs}`);

      return {
        properties: res.data || [],
        isFallback: res.source === 'demonstration_fallback',
        source: res.source,
      };
    } catch (err) {
      console.warn('[PropertyService] API unreachable. Using marked demo properties fallback.', err);
      return {
        properties: DEMO_PROPERTIES,
        isFallback: true,
        source: 'demonstration_fallback',
      };
    }
  }

  /**
   * Fetches a single property by its ID.
   */
  public static async getPropertyById(id: string): Promise<Property | null> {
    try {
      const res = await apiFetch<{ success: boolean; data: Property }>(`/api/properties/${id}`);
      return res.data || null;
    } catch {
      return DEMO_PROPERTIES.find((p) => p.id === id) || null;
    }
  }

  /**
   * Submits a discrepancy report to the database for human moderator review.
   * Strictly propagates errors if database is unavailable.
   */
  public static async submitDiscrepancy(
    propertyId: string,
    data: { observation: string; reporterPseudonym?: string }
  ): Promise<{ success: boolean; message: string; data?: any }> {
    return await apiFetch<{ success: boolean; message: string; data?: any }>(
      `/api/properties/${propertyId}/discrepancies`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }
}
