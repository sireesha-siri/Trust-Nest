import React from 'react';
import { 
  Building, 
  Users, 
  Home, 
  GraduationCap, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';
import { AccommodationCategory } from '../../types/property';
import { scrollToSection } from '../../utils/scrollUtils';
import { useToast } from '../../context/ToastContext';

interface AccommodationCategoriesProps {
  onSelectCategory: (category: AccommodationCategory | 'all') => void;
  selectedCategory: AccommodationCategory | 'all';
}

export const AccommodationCategories: React.FC<AccommodationCategoriesProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  const { showToast } = useToast();

  const categories = [
    {
      id: 'womens_pg' as AccommodationCategory,
      title: "Women's Executive PGs",
      description: 'Gated, verified security guards, biometric locks, and CCTV surveillance.',
      startingPrice: '₹9,500',
      icon: ShieldCheck,
      count: '2 Pilot Listings',
      accentColor: 'from-purple-500 to-indigo-600',
      tag: 'High Security',
    },
    {
      id: 'coliving' as AccommodationCategory,
      title: 'Co-Living Spaces',
      description: 'Ergonomic work desks, 300+ Mbps WiFi, rooftop lounges, and tech community.',
      startingPrice: '₹14,000',
      icon: Users,
      count: '1 Pilot Listing',
      accentColor: 'from-indigo-500 to-violet-600',
      tag: 'Work Friendly',
    },
    {
      id: 'mens_pg' as AccommodationCategory,
      title: "Men's PGs & Hostels",
      description: 'Affordable daily meals, walking distance to metro, power backup.',
      startingPrice: '₹8,500',
      icon: Building,
      count: '1 Pilot Listing',
      accentColor: 'from-blue-500 to-cyan-600',
      tag: 'Budget Friendly',
    },
    {
      id: 'studio_apartment' as AccommodationCategory,
      title: 'Studio Apartments',
      description: 'Private 1RK studio units with modular kitchenettes near Mindspace.',
      startingPrice: '₹22,000',
      icon: Home,
      count: '1 Pilot Listing',
      accentColor: 'from-emerald-500 to-teal-600',
      tag: 'Maximum Privacy',
    },
    {
      id: 'student_stay' as AccommodationCategory,
      title: 'Student Stays',
      description: 'Dedicated study zones, meal plans, and warden oversight near institutes.',
      startingPrice: '₹7,500',
      icon: GraduationCap,
      count: '1 Pilot Listing',
      accentColor: 'from-amber-500 to-orange-600',
      tag: 'Student Focused',
    },
  ];

  const handleCategoryClick = (category: AccommodationCategory | 'all', title?: string) => {
    const isClearing = category === 'all' || selectedCategory === category;
    const nextCategory = isClearing ? 'all' : category;
    onSelectCategory(nextCategory);

    if (isClearing) {
      showToast('Showing all accommodation categories', 'info');
    } else {
      showToast(`Filtered listings to ${title || category}`, 'info');
      // Smoothly navigate down to properties list so user immediately sees results
      setTimeout(() => {
        scrollToSection('properties-section', 84);
      }, 100);
    }
  };

  return (
    <section id="categories-section" className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#694CFF] bg-[#F3F0FF] px-3 py-1 rounded-full border border-[#694CFF]/20">
              Curated Stay Options
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
              Explore Accommodation Categories
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Tailored living spaces across HITEC City and Madhapur with separate verification streams.
            </p>
          </div>

          {selectedCategory !== 'all' && (
            <button
              onClick={() => handleCategoryClick('all')}
              className="text-xs font-semibold text-[#694CFF] hover:underline cursor-pointer self-start md:self-auto"
            >
              Clear filter (Show all categories)
            </button>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id, cat.title)}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                  isSelected 
                    ? 'bg-[#F3F0FF] border-[#694CFF] ring-2 ring-[#694CFF]/20 shadow-md scale-[1.02]' 
                    : 'bg-white border-gray-100 hover:border-[#694CFF]/30 hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.accentColor} text-white flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {cat.tag}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#694CFF] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Starts at</span>
                    <span className="font-bold text-gray-900">{cat.startingPrice}<span className="text-[10px] font-normal text-gray-500">/mo</span></span>
                  </div>

                  <span className={`text-[11px] font-bold flex items-center gap-0.5 ${
                    isSelected ? 'text-[#694CFF]' : 'text-gray-400 group-hover:text-[#694CFF]'
                  }`}>
                    {isSelected ? 'Selected' : 'View'} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
