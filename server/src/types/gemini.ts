export type ExtractionCertainty = 'explicit' | 'inferred' | 'not_specified';

export interface ExtractedField<T> {
  value: T;
  source: ExtractionCertainty;
}

export interface RawGeminiExtraction {
  city: {
    value?: string;
    source: ExtractionCertainty;
  };
  locality: {
    value?: string;
    source: ExtractionCertainty;
  };
  maxMonthlyRent: {
    value?: number;
    source: ExtractionCertainty;
  };
  accommodationType: {
    value: 'womens_pg' | 'mens_pg' | 'coliving' | 'student_stay' | 'studio_apartment' | 'any';
    source: ExtractionCertainty;
  };
  genderPreference: {
    value: 'female' | 'male' | 'none_specified';
    source: ExtractionCertainty;
  };
  foodRequirements: {
    required: boolean;
    description?: string;
    source: ExtractionCertainty;
  };
  safetyRequirements: {
    items: string[];
    source: ExtractionCertainty;
  };
  amenities: {
    items: string[];
    source: ExtractionCertainty;
  };
  publicTransportRequirements: {
    metroRequired: boolean;
    busRequired: boolean;
    description?: string;
    source: ExtractionCertainty;
  };
  nearbyEssentialServices: {
    items: string[];
    source: ExtractionCertainty;
  };
  additionalPreferences: {
    items: string[];
    source: ExtractionCertainty;
  };
  checklistItems: Array<{
    label: string;
    category: 'budget' | 'type' | 'location' | 'safety' | 'food' | 'connectivity';
    certainty: ExtractionCertainty;
  }>;
  explanation: string;
}

export interface GeneratedChecklistItem {
  id: string;
  label: string;
  category: 'budget' | 'type' | 'location' | 'safety' | 'food' | 'connectivity';
  checked: boolean;
  source: 'ai_extracted' | 'user_added';
  certainty: ExtractionCertainty;
}

export interface ParseRequirementsSuccessResponse {
  success: true;
  rawPrompt: string;
  modelUsed: string;
  structuredRequirements: RawGeminiExtraction;
  generatedChecklist: GeneratedChecklistItem[];
  explanation: string;
  timestamp: string;
}

export interface ParseRequirementsErrorResponse {
  success: false;
  error: string;
  code: 'API_KEY_MISSING' | 'INVALID_INPUT' | 'GEMINI_TIMEOUT' | 'RATE_LIMIT_EXCEEDED' | 'GEMINI_ERROR';
  details?: string;
}
