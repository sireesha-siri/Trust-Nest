import { apiFetch } from './apiClient';
import { CityServiceItem, ServiceCategory } from '../types/city';
import { DEMO_CITY_SERVICES } from '../data/demoCityServices';

export interface CityServicesResponse {
  success: boolean;
  count: number;
  data: CityServiceItem[];
  source: 'database' | 'demonstration_fallback';
  isDemoData?: boolean;
}

export class CityService {
  /**
   * Fetches verified civic services and transit nodes from the TrustNest backend API.
   * Safely falls back to marked demo data if backend is offline.
   */
  public static async getCityServices(params?: {
    category?: ServiceCategory | 'all';
    area?: string;
  }): Promise<{ services: CityServiceItem[]; isFallback: boolean; source: string }> {
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'all') query.append('category', params.category);
      if (params?.area && params.area !== 'all') query.append('area', params.area);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await apiFetch<CityServicesResponse>(`/api/city-services${qs}`);

      return {
        services: res.data || [],
        isFallback: res.source === 'demonstration_fallback',
        source: res.source,
      };
    } catch (err) {
      console.warn('[CityService] API unreachable. Using marked demo city services fallback.', err);
      return {
        services: DEMO_CITY_SERVICES,
        isFallback: true,
        source: 'demonstration_fallback',
      };
    }
  }
}
