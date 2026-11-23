import React, { useState, useEffect } from 'react';
import { DemoNoticeBanner } from '../components/common/DemoNoticeBanner';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/home/HeroSection';
import { SearchFlowExplainer } from '../components/home/SearchFlowExplainer';
import { AccommodationCategories } from '../components/home/AccommodationCategories';
import { FeaturedProperties } from '../components/home/FeaturedProperties';
import { HumanAIVerificationSection } from '../components/home/HumanAIVerificationSection';
import { CityIntelligencePreview } from '../components/home/CityIntelligencePreview';
import { CommunitySection } from '../components/home/CommunitySection';
import { ContributeEarnSection } from '../components/home/ContributeEarnSection';
import { TrustPrivacySection } from '../components/home/TrustPrivacySection';
import { OwnersSection } from '../components/home/OwnersSection';
import { AuthModal } from '../components/common/AuthModal';
import { DEMO_PROPERTIES } from '../data/demoProperties';
import { Property, AccommodationCategory } from '../types/property';
import { ChecklistItem, StructuredAccommodationRequirements } from '../types/aiSearch';
import { DEFAULT_STRUCTURED_REQUIREMENTS } from '../constants/aiDefaults';
import { PropertyService } from '../services/propertyService';

export const HomePage: React.FC = () => {
  const [allProperties, setAllProperties] = useState<Property[]>(DEMO_PROPERTIES);
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>(DEMO_PROPERTIES);
  const [selectedCategory, setSelectedCategory] = useState<AccommodationCategory | 'all'>('all');
  const [activeChecklist, setActiveChecklist] = useState<ChecklistItem[]>([]);
  const [structuredRequirements, setStructuredRequirements] = useState<StructuredAccommodationRequirements | undefined>(DEFAULT_STRUCTURED_REQUIREMENTS);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [_loadingProperties, setLoadingProperties] = useState(true);
  const [_isDemoFallback, setIsDemoFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;
    PropertyService.getProperties()
      .then((res) => {
        if (!isMounted) return;
        setAllProperties(res.properties);
        setDisplayedProperties(res.properties);
        setIsDemoFallback(res.isFallback);
        setLoadingProperties(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('[HomePage] Failed to fetch properties, using demo fallback:', err);
        setAllProperties(DEMO_PROPERTIES);
        setDisplayedProperties(DEMO_PROPERTIES);
        setIsDemoFallback(true);
        setLoadingProperties(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFilteredResults = (
    results: Property[], 
    checklist: ChecklistItem[], 
    structured?: StructuredAccommodationRequirements
  ) => {
    setDisplayedProperties(results);
    setActiveChecklist(checklist);
    if (structured) {
      setStructuredRequirements(structured);
    }
  };

  const handleClearFilter = () => {
    setDisplayedProperties(allProperties);
    setSelectedCategory('all');
    setActiveChecklist([]);
    setStructuredRequirements(DEFAULT_STRUCTURED_REQUIREMENTS);
  };

  const scrollToAISearch = () => {
    const el = document.getElementById('ai-search-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] text-[#1F2937]">
      {/* 1. Hackathon Pilot Banner */}
      <DemoNoticeBanner />

      {/* 2. Responsive Navigation Bar */}
      <Navbar 
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onScrollToAISearch={scrollToAISearch}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 3. Hero Section with AI Search Box */}
        <HeroSection
          properties={allProperties}
          onFilteredResults={handleFilteredResults}
          onClearFilter={handleClearFilter}
        />

        {/* 4. How AI-Powered Search Works */}
        <SearchFlowExplainer />

        {/* 5. Accommodation Categories */}
        <AccommodationCategories
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            if (cat === 'all') {
              setDisplayedProperties(allProperties);
              setActiveChecklist([]);
              setStructuredRequirements(DEFAULT_STRUCTURED_REQUIREMENTS);
            } else {
              // If current displayedProperties has no matches for this category,
              // restore allProperties so the user can explore this category cleanly
              const hasMatching = displayedProperties.some(p => p.category === cat);
              if (!hasMatching) {
                setDisplayedProperties(allProperties);
              }
            }
          }}
        />

        {/* 6. Featured Grounded Properties with Granular Verification */}
        <FeaturedProperties
          properties={displayedProperties}
          selectedCategory={selectedCategory}
          activeChecklist={activeChecklist}
          structuredRequirements={structuredRequirements}
          onResetFilter={handleClearFilter}
        />

        {/* 7. Human + AI Verification Architecture */}
        <HumanAIVerificationSection />

        {/* 8. Explore City: Public Resources, Transit & Hospitals */}
        <CityIntelligencePreview />

        {/* 9. Community Contributions & Observations */}
        <CommunitySection />

        {/* 10. Contribute and Earn Opportunities */}
        <ContributeEarnSection />

        {/* 11. Safety, Governance & Trust Privacy */}
        <TrustPrivacySection />

        {/* 12. For Owners & Partners */}
        <OwnersSection />
      </main>

      {/* 13. Responsive Comprehensive Footer */}
      <Footer />

      {/* 14. Interactive Auth / Register Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};
