import { StructuredAccommodationRequirements } from '../types/aiSearch';

export const DEFAULT_STRUCTURED_REQUIREMENTS: StructuredAccommodationRequirements = {
  city: { value: 'Hyderabad', source: 'explicit' },
  locality: { value: 'HITEC City', source: 'explicit' },
  maxMonthlyRent: { value: 12000, source: 'explicit' },
  accommodationType: { value: 'womens_pg', source: 'explicit' },
  genderPreference: { value: 'female', source: 'explicit' },
  foodRequirements: { required: true, description: '3 meals included', source: 'explicit' },
  safetyRequirements: { items: ['CCTV surveillance', '24/7 Security guard', 'Biometric access'], source: 'explicit' },
  amenities: { items: ['High Speed WiFi', 'Power Backup'], source: 'inferred' },
  publicTransportRequirements: { metroRequired: true, busRequired: false, description: 'Proximity to Metro transit (Blue Line)', source: 'explicit' },
  nearbyEssentialServices: { items: ['Hospitals (Medicover/KIMS)'], source: 'explicit' },
  additionalPreferences: { items: ['Software engineering job relocation'], source: 'inferred' },
  checklistItems: [],
  explanation: 'Extracted requirements for women\'s PG in HITEC City / Madhapur under ₹12,000 with meals, CCTV, and metro.',
};
