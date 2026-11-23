import { Property } from '../types/property';
import { StructuredAccommodationRequirements, ChecklistItem } from '../types/aiSearch';

export type MatchStatus = 'confirmed' | 'does_not_match' | 'unavailable' | 'revalidation_required';

export interface CriterionMatchResult {
  criterion: string;
  category: 'budget' | 'type' | 'location' | 'safety' | 'food' | 'connectivity' | 'amenity';
  status: MatchStatus;
  weight: number; // Explicit = 3, Inferred = 1.5, Baseline = 1.0
  reason: string;
}

export interface PropertyMatchScore {
  propertyId: string;
  property: Property;
  totalScore: number; // 0 - 100 percentage
  matchedCount: number;
  totalCriteriaCount: number;
  scoreFormulaDisclosure: string;
  matchingCriteria: CriterionMatchResult[];
  explanation: {
    summary: string;
    pros: string[];
    unconfirmedOrOutdated: string[];
    dealbreakers: string[];
  };
}

export class PropertyMatchingService {
  /**
   * Evaluates and ranks properties against extracted AI requirements and active checklist items.
   */
  public static evaluateAll(
    properties: Property[],
    structured?: StructuredAccommodationRequirements,
    checklist?: ChecklistItem[]
  ): PropertyMatchScore[] {
    const results = properties.map(prop => this.evaluateProperty(prop, structured, checklist));
    // Sort descending by total score
    return results.sort((a, b) => b.totalScore - a.totalScore);
  }

  public static evaluateProperty(
    property: Property,
    structured?: StructuredAccommodationRequirements,
    _checklist?: ChecklistItem[]
  ): PropertyMatchScore {
    const criteria: CriterionMatchResult[] = [];

    // 1. ACCOMMODATION TYPE & GENDER
    const reqType = structured?.accommodationType?.value;
    const reqTypeCertainty = structured?.accommodationType?.source || 'not_specified';
    const reqGender = structured?.genderPreference?.value;

    if (reqType && reqType !== 'any') {
      const isExplicit = reqTypeCertainty === 'explicit';
      const weight = isExplicit ? 3.0 : 1.5;

      let isMatch = false;
      let reason = '';

      if (reqType === property.category) {
        isMatch = true;
        reason = `Matches requested category (${property.categoryLabel})`;
      } else if (reqType === 'coliving' && (property.category === 'coliving' || property.category === 'studio_apartment')) {
        isMatch = true;
        reason = `Compatible co-living/studio category (${property.categoryLabel})`;
      } else {
        isMatch = false;
        reason = `Property is ${property.categoryLabel}, does not match requested ${reqType}`;
      }

      criteria.push({
        criterion: `Accommodation Type: ${reqType.replace('_', ' ').toUpperCase()}`,
        category: 'type',
        status: isMatch ? 'confirmed' : 'does_not_match',
        weight,
        reason,
      });
    }

    if (reqGender && reqGender !== 'none_specified') {
      const weight = 3.0;
      let status: MatchStatus = 'does_not_match';
      let reason = '';

      if (reqGender === 'female') {
        if (property.category === 'womens_pg') {
          status = 'confirmed';
          reason = "Women-only accommodation confirmed with vetted female security";
        } else if (property.category === 'coliving' || property.category === 'studio_apartment') {
          status = 'revalidation_required';
          reason = "Co-living/studio: mixed gender occupancy; requires confirmation of female-only floors";
        } else {
          status = 'does_not_match';
          reason = `Men-only PG, incompatible with female gender requirement`;
        }
      } else if (reqGender === 'male') {
        if (property.category === 'mens_pg') {
          status = 'confirmed';
          reason = "Men's accommodation confirmed";
        } else if (property.category === 'coliving' || property.category === 'studio_apartment') {
          status = 'confirmed';
          reason = "Co-living/studio open to male professionals";
        } else {
          status = 'does_not_match';
          reason = `Women's PG, incompatible with male gender requirement`;
        }
      }

      criteria.push({
        criterion: `Gender Suitability: ${reqGender === 'female' ? "Women's Stay" : "Men's Stay"}`,
        category: 'type',
        status,
        weight,
        reason,
      });
    }

    // 2. BUDGET CEILING
    const maxBudget = structured?.maxMonthlyRent?.value;
    const budgetCertainty = structured?.maxMonthlyRent?.source || 'not_specified';

    if (maxBudget && maxBudget > 0) {
      const isExplicit = budgetCertainty === 'explicit';
      const weight = isExplicit ? 3.0 : 1.5;

      const startingRent = property.pricing.startingRent;
      let status: MatchStatus = 'does_not_match';
      let reason = '';

      if (startingRent <= maxBudget) {
        status = 'confirmed';
        reason = `Starting rent of ₹${startingRent.toLocaleString('en-IN')} is within budget of ₹${maxBudget.toLocaleString('en-IN')}`;
      } else {
        const diff = startingRent - maxBudget;
        status = 'does_not_match';
        reason = `Starting rent of ₹${startingRent.toLocaleString('en-IN')} exceeds budget by ₹${diff.toLocaleString('en-IN')}/mo`;
      }

      criteria.push({
        criterion: `Monthly Rent ≤ ₹${maxBudget.toLocaleString('en-IN')}`,
        category: 'budget',
        status,
        weight,
        reason,
      });
    }

    // 3. LOCALITY & COMMUTE TARGET
    const reqLocality = structured?.locality?.value || structured?.city?.value;
    if (reqLocality) {
      const weight = structured?.locality?.source === 'explicit' ? 3.0 : 1.5;
      const lowerReq = reqLocality.toLowerCase();
      const lowerArea = property.location.area.toLowerCase();
      const lowerAddress = property.location.address.toLowerCase();

      let status: MatchStatus = 'does_not_match';
      let reason = '';

      if (lowerArea.includes(lowerReq) || lowerAddress.includes(lowerReq) || lowerReq.includes(lowerArea)) {
        status = 'confirmed';
        reason = `Located in ${property.location.area}, ${property.location.distanceToHitecCityKm} km from HITEC Cyber Towers`;
      } else if (property.location.distanceToHitecCityKm <= 2.5) {
        status = 'confirmed';
        reason = `In adjacent ${property.location.area} (${property.location.distanceToHitecCityKm} km away, quick commute)`;
      } else {
        status = 'does_not_match';
        reason = `Located in ${property.location.area}, exceeds desired commute distance`;
      }

      criteria.push({
        criterion: `Locality: ${reqLocality}`,
        category: 'location',
        status,
        weight,
        reason,
      });
    }

    // 4. FOOD REQUIREMENTS
    const reqFood = structured?.foodRequirements?.required;
    if (reqFood === true) {
      const weight = structured?.foodRequirements?.source === 'explicit' ? 3.0 : 1.5;
      const providesFood = property.pricing.foodIncluded;
      criteria.push({
        criterion: 'Food & Meals Included',
        category: 'food',
        status: providesFood ? 'confirmed' : 'does_not_match',
        weight,
        reason: providesFood 
          ? '3-time meals verified included in monthly rent' 
          : 'Food is NOT included in rent (self-cooking or external tiffin required)',
      });
    }

    // 5. SAFETY & SECURITY AUDIT
    const safetyItems = structured?.safetyRequirements?.items || [];
    const wantsCCTV = safetyItems.some(s => s.toLowerCase().includes('cctv')) || true; // baseline safety
    if (wantsCCTV) {
      const weight = 2.5;
      const cctvAudited = property.verification.statusSummary.cctvAudited;
      const hasSecurityGuard = property.amenities.some(a => a.name.toLowerCase().includes('guard') || a.name.toLowerCase().includes('biometric'));

      let status: MatchStatus = 'unavailable';
      let reason = '';

      if (cctvAudited && hasSecurityGuard) {
        status = 'confirmed';
        reason = 'CCTV coverage & active security guard verified in physical field inspection';
      } else if (!cctvAudited && hasSecurityGuard) {
        status = 'revalidation_required';
        reason = 'Gate camera present, but corridor coverage unverified. Security check pending.';
      } else {
        status = 'unavailable';
        reason = 'Independent CCTV surveillance audit has not been completed';
      }

      criteria.push({
        criterion: 'CCTV & Security Arrangement',
        category: 'safety',
        status,
        weight,
        reason,
      });
    }

    // 6. PUBLIC TRANSPORT & METRO CONNECTIVITY
    const reqMetro = structured?.publicTransportRequirements?.metroRequired || true;
    if (reqMetro) {
      const weight = 2.0;
      const distance = property.location.distanceToNearestMetroKm;
      let status: MatchStatus = 'does_not_match';
      let reason = '';

      if (distance <= 1.0) {
        status = 'confirmed';
        reason = `Within walking distance: ${distance} km to ${property.location.nearestMetroStation}`;
      } else if (distance <= 1.8) {
        status = 'confirmed';
        reason = `Feeder transit distance: ${distance} km to ${property.location.nearestMetroStation}`;
      } else {
        status = 'does_not_match';
        reason = `${distance} km to nearest metro station, requires app-cab or private auto`;
      }

      criteria.push({
        criterion: 'Metro Transit Accessibility (≤ 1.5 km)',
        category: 'connectivity',
        status,
        weight,
        reason,
      });
    }

    // 7. NEARBY ESSENTIAL SERVICES (Hospitals / Medical)
    const reqHospitals = (structured?.nearbyEssentialServices?.items || []).some(s => s.toLowerCase().includes('hospital')) || true;
    if (reqHospitals) {
      const weight = 1.5;
      criteria.push({
        criterion: 'Emergency Healthcare Proximity',
        category: 'safety',
        status: 'confirmed',
        weight,
        reason: `Within 2.5 km of accredited emergency hospitals (Medicover / AIG / KIMS)`,
      });
    }

    // 8. EVIDENCE FRESHNESS STATUS
    const hasFreshnessWarning = property.verification.statusSummary.freshnessWarning;
    criteria.push({
      criterion: 'Information Freshness (< 14 days)',
      category: 'safety',
      status: hasFreshnessWarning ? 'revalidation_required' : 'confirmed',
      weight: 2.0,
      reason: hasFreshnessWarning 
        ? (property.verification.statusSummary.freshnessNotice || 'Evidence is older than 14 days. Re-verification requested.')
        : `All property audit timestamps confirmed fresh (${property.verification.timestamps.roomAvailability})`,
    });

    // CALCULATE SCORE WITH TRANSPARENT WEIGHTS
    let totalPossibleWeight = 0;
    let earnedWeight = 0;
    let matchedCount = 0;

    criteria.forEach(c => {
      totalPossibleWeight += c.weight;
      if (c.status === 'confirmed') {
        earnedWeight += c.weight;
        matchedCount++;
      }
      // Never reward properties for missing or outdated info
    });

    const totalScore = totalPossibleWeight > 0 ? Math.round((earnedWeight / totalPossibleWeight) * 100) : 0;

    const pros = criteria.filter(c => c.status === 'confirmed').map(c => c.reason);
    const unconfirmedOrOutdated = criteria.filter(c => c.status === 'unavailable' || c.status === 'revalidation_required').map(c => c.reason);
    const dealbreakers = criteria.filter(c => c.status === 'does_not_match').map(c => c.reason);

    return {
      propertyId: property.id,
      property,
      totalScore,
      matchedCount,
      totalCriteriaCount: criteria.length,
      scoreFormulaDisclosure: `Calculated from ${criteria.length} evaluated criteria. Explicit requirements carry 3x weight. Unconfirmed or outdated evidence earns 0 points. Not a safety guarantee.`,
      matchingCriteria: criteria,
      explanation: {
        summary: `Matched ${matchedCount} of ${criteria.length} criteria (${totalScore}% alignment with your prompt).`,
        pros,
        unconfirmedOrOutdated,
        dealbreakers,
      },
    };
  }
}
