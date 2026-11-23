export interface CommunityReport {
  id: string;
  propertyId: string;
  propertyName: string;
  reportedByPseudonym: string; // Protects reviewer identity
  reportType: 'availability_update' | 'water_supply' | 'wifi_speed' | 'food_quality' | 'safety_lighting';
  observation: string;
  createdAt: string;
  moderationStatus: 'approved' | 'in_review';
  upvotesCount: number;
}

export interface ContributorMilestone {
  role: string;
  description: string;
  responsibilities: string[];
  status: 'Future Scope' | 'Pilot Exploration';
}
