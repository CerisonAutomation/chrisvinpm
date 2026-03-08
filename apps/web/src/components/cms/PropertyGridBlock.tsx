import React from 'react';
import { useListings } from '@/hooks/useApi';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const PropertyGridBlock: React.FC<{ content: any }> = ({ content }) => {
  const {
    headline = "Exceptional Properties",
    subheadline = "Featured Collection",
    limit = 6,
    showViewAll = true
  } = content;

  const { data: listingsData, isLoading } = useListings({ limit });
  const listings = listingsData?.results || [];

  return (
    <section className="py-24 md:py-32 bg-[#0A0A0B]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium">
              {subheadline}
            </span>
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#F5F5F0]">
              {headline}
            </h2>
          </div>
          {showViewAll && (
            <Link
              to="/properties"
              className="hidden md:flex items-center gap-2 text-[#D4AF37] hover:text-[#E5C158] font-medium transition-colors group"
            >
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/3] bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing: any, i: number) => (
              <PropertyCard key={listing._id} listing={listing} index={i} />
            ))}
          </div>
        )}

        {showViewAll && (
          <div className="mt-12 text-center md:hidden">
            <Button
              asChild
              className="bg-[#D4AF37] text-black hover:bg-[#E5C158] rounded-none uppercase tracking-wider px-8 py-6 w-full sm:w-auto"
            >
              <Link to="/properties">
                View All Properties
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
