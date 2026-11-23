// Normalize API base URL: remove trailing slashes if provided, default to localhost:5000
const RAW_API_URL = (import.meta.env.VITE_API_URL ?? '').trim();
export const API_BASE_URL = RAW_API_URL 
  ? (RAW_API_URL.endsWith('/') ? RAW_API_URL.slice(0, -1) : RAW_API_URL) 
  : 'http://localhost:5000';

export interface ApiFetchError extends Error {
  status?: number;
  code?: string;
}

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || data.message || `Request failed with HTTP status ${response.status}`;
      const err: ApiFetchError = new Error(errorMsg);
      err.status = response.status;
      err.code = data.code;
      throw err;
    }

    return data as T;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkErr: ApiFetchError = new Error(`Cannot connect to TrustNest API at ${API_BASE_URL}.`);
      networkErr.code = 'NETWORK_ERROR';
      throw networkErr;
    }
    throw err;
  }
}
