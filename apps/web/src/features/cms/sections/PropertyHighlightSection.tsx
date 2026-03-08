import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { PropertyCard } from '@/features/booking/components/PropertyCard';
import { Loader2 } from 'lucide-react';

export const PropertyHighlightSection = ({ data }: any) => {
  const { data: listings, isLoading } = useQuery({
    queryKey: ['listings-highlight', data.listingIds],
    queryFn: async () => {
      const results = await Promise.all(
        (data.listingIds || []).map((id: string) => apiGet(`/listings/${id}`))
      );
      return results;
    },
    enabled: !!data.listingIds?.length,
  });

  return (
    <div className="py-24 bg-[#0F0F10] border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-playfair text-[#F5F5F0] mb-4">{data.heading}</h2>
            <div className="w-20 h-1 bg-[#D4AF37]" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
          </div>
        ) : (
          <div className={data.layout === 'carousel' ? 'flex overflow-x-auto gap-6 pb-4 scrollbar-hide' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'}>
            {listings?.map((listing: any, idx: number) => (
              <div key={listing._id} className={data.layout === 'carousel' ? 'min-w-[350px]' : ''}>
                <PropertyCard listing={listing} index={idx} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
