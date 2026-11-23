import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  ShieldAlert, 
  Briefcase, 
  Sparkles, 
  Menu, 
  X, 
  User, 
  ChevronRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { scrollToSection } from '../../utils/scrollUtils';

interface NavbarProps {
  onOpenAuthModal?: () => void;
  onScrollToAISearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenAuthModal, 
  onScrollToAISearch 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'stays' | 'city' | 'community' | 'safety' | 'earn' | 'owners'>('home');

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);

          // Scroll spy: check which section is currently active in the viewport
          const sections: { id: typeof activeTab; elementId: string }[] = [
            { id: 'owners', elementId: 'owners-section' },
            { id: 'earn', elementId: 'contribute-section' },
            { id: 'safety', elementId: 'safety-section' },
            { id: 'community', elementId: 'community-section' },
            { id: 'city', elementId: 'city-intelligence-section' },
            { id: 'stays', elementId: 'properties-section' },
            { id: 'home', elementId: 'hero' },
          ];

          const targetY = 120; // viewport threshold below navbar
          for (const sec of sections) {
            const el = document.getElementById(sec.elementId);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= targetY && rect.bottom > targetY) {
                setActiveTab(sec.id);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home', href: '#hero', icon: Sparkles },
    { id: 'stays', label: 'Find Stay', href: '#properties-section', icon: Building2 },
    { id: 'city', label: 'Explore City', href: '#city-intelligence-section', icon: MapPin },
    { id: 'community', label: 'Community', href: '#community-section', icon: Users },
    { id: 'safety', label: 'Safety & Support', href: '#safety-section', icon: ShieldAlert },
    { id: 'earn', label: 'Contribute & Earn', href: '#contribute-section', icon: Briefcase },
    { id: 'owners', label: 'For Owners', href: '#owners-section', icon: ShieldCheck },
  ];

  const handleNavClick = (id: typeof activeTab, href: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    scrollToSection(href, 84);
  };

  const handleAISearchClick = () => {
    setMobileMenuOpen(false);
    if (onScrollToAISearch) {
      onScrollToAISearch();
    } else {
      scrollToSection('ai-search-anchor', 84);
    }
  };

  return (
    <header 
      className={`sticky top-0 z-30 transition-colors duration-200 py-3.5 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' 
          : 'bg-white/90 backdrop-blur-sm border-b border-gray-100/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a 
            href="#hero" 
            onClick={(e) => { e.preventDefault(); handleNavClick('home', '#hero'); }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#694CFF] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-[#694CFF]/20 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-gray-900">
                  Trust<span className="text-[#694CFF]">Nest</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F3F0FF] text-[#694CFF] px-1.5 py-0.5 rounded border border-[#694CFF]/20">
                  HYD Pilot
                </span>
              </div>
              <span className="text-[10.5px] text-gray-500 font-medium tracking-tight -mt-0.5 hidden sm:block">
                Human + AI City Intelligence
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.id as typeof activeTab, link.href);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActive 
                      ? 'text-[#694CFF] bg-[#F3F0FF] font-semibold' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Action CTA buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={handleAISearchClick}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-[#694CFF] bg-[#F3F0FF] hover:bg-[#EBE5FF] border border-[#694CFF]/20 transition-all cursor-pointer hover:shadow-sm"
              title="Jump to AI Search Box"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#694CFF]" />
              <span>AI Search</span>
            </button>

            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 transition-colors cursor-pointer shadow-2xs"
              title="Resident Accounts Roadmap"
            >
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span>Accounts</span>
              <span className="text-[9.5px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                Coming Soon
              </span>
            </button>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={handleAISearchClick}
              className="p-2 rounded-lg bg-[#F3F0FF] text-[#694CFF] cursor-pointer hover:bg-[#EBE5FF]"
              title="Search with AI"
              aria-label="AI Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="p-3 bg-[#F8F7FF] rounded-xl border border-indigo-50 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Pilot Area: HITEC City & Madhapur
            </div>
            <span className="text-[10px] text-[#694CFF] font-bold uppercase bg-white px-2 py-0.5 rounded border border-[#694CFF]/20">
              Verified Pilot
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              const isActive = activeTab === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.id as typeof activeTab, link.href);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-[#694CFF] text-white font-semibold shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white/80' : 'text-gray-400'}`} />
                </a>
              );
            })}
          </div>

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <div className="p-3 bg-[#F8F7FF] rounded-xl border border-indigo-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Guest Access Enabled
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  No Login Required
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Search accommodation, run AI queries, and compare stays without creating an account.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal?.();
                }}
                className="text-[11px] font-semibold text-[#694CFF] hover:underline pt-1 flex items-center gap-1 cursor-pointer"
              >
                <span>Resident Accounts (Coming Soon in Phase 6)</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
