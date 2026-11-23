import { CommunityReport, ContributorMilestone } from '../types/community';

export const DEMO_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'rep-01',
    propertyId: 'TN-HYD-0101',
    propertyName: 'Ananya Executive Women’s Coliving',
    reportedByPseudonym: 'Resident_HydTech_22',
    reportType: 'wifi_speed',
    observation: 'Tested broadband during peak hours (8 PM - 11 PM): consistently getting 240+ Mbps. Very reliable for remote work meetings.',
    createdAt: '2026-11-18',
    moderationStatus: 'approved',
    upvotesCount: 14,
  },
  {
    id: 'rep-02',
    propertyId: 'TN-HYD-0101',
    propertyName: 'Ananya Executive Women’s Coliving',
    reportedByPseudonym: 'Madhapur_Commuter',
    reportType: 'safety_lighting',
    observation: 'New streetlights installed on the lane from Durgam Cheruvu metro to this PG. Walking back at 10 PM feels well-lit and secure.',
    createdAt: '2026-11-17',
    moderationStatus: 'approved',
    upvotesCount: 19,
  },
  {
    id: 'rep-03',
    propertyId: 'TN-HYD-0102',
    propertyName: 'CyberNest Urban Coliving Suites',
    reportedByPseudonym: 'Engineer_VittalRao',
    reportType: 'availability_update',
    observation: 'One double-sharing room on 3rd floor was vacated yesterday. Good timing for anyone moving before 1st of next month.',
    createdAt: '2026-11-19',
    moderationStatus: 'approved',
    upvotesCount: 8,
  },
  {
    id: 'rep-04',
    propertyId: 'TN-HYD-0103',
    propertyName: 'Srinivasa Men’s PG & Residency',
    reportedByPseudonym: 'AyyappaSociety_Guy',
    reportType: 'availability_update',
    observation: 'Double sharing rooms are currently occupied. Warden informed vacancies might open next month.',
    createdAt: '2026-11-16',
    moderationStatus: 'approved',
    upvotesCount: 11,
  },
];

export const CONTRIBUTOR_ROLES: ContributorMilestone[] = [
  {
    role: 'Field Researcher',
    description: 'Conducts physical verification visits, records photographic evidence of rooms, verifies washroom cleanliness, and logs safety equipment.',
    responsibilities: [
      'Perform scheduled physical property walkthroughs',
      'Upload geotagged photographic evidence of rooms, pantry, and fire exits',
      'Validate CCTV functionality and security guard presence',
      'Audit room vacancy claims with caretakers',
    ],
    status: 'Pilot Exploration',
  },
  {
    role: 'Local Information Collector',
    description: 'Maps neighbourhood safety, pedestrian lighting, metro feeder accessibility, and public emergency infrastructure in HITEC City & Madhapur.',
    responsibilities: [
      'Document late-night transit connectivity & feeder auto stands',
      'Verify 24/7 operations of local pharmacies and medical clinics',
      'Report street lighting gaps or public utility disruptions',
    ],
    status: 'Pilot Exploration',
  },
  {
    role: 'Community Moderator',
    description: 'Reviews community submissions, flags suspicious or spam reviews, and ensures peer reports remain anonymous and fact-based.',
    responsibilities: [
      'Moderate resident updates for factual accuracy',
      'Protect community member privacy and pseudonyms',
      'Prevent promotional manipulation or fabricated complaints',
    ],
    status: 'Future Scope',
  },
];
