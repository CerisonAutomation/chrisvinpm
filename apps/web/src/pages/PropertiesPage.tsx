import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { PropertyCard } from '@/features/booking/components/PropertyCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Loader2, SlidersHorizontal, Map as MapIcon, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PropertiesPage() {
  const [view, setView] = useState<'grid' | 'map'>('grid');

  const { data, isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: () => apiGet<any>('/listings?limit=20'),
  });

  const listings = data?.results || [];

  return (
    <div className="bg-[#0F0F10] min-h-screen">
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Search Summary & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 border-b border-white/5 pb-8">
            <div>
              <h1 className="text-3xl font-playfair text-[#F5F5F0]">Properties in Malta</h1>
              <p className="text-[#A1A1AA] text-sm mt-1">{listings.length} exceptional stays found</p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-white/10 rounded-none h-11 px-6 text-xs uppercase tracking-widest font-bold">
                <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
              </Button>
              <div className="flex bg-[#161618] border border-white/10 p-1">
                <Button
                  onClick={() => setView('grid')}
                  className={`h-9 px-4 rounded-none ${view === 'grid' ? 'bg-[#D4AF37] text-black' : 'bg-transparent text-[#A1A1AA]'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setView('map')}
                  className={`h-9 px-4 rounded-none ${view === 'map' ? 'bg-[#D4AF37] text-black' : 'bg-transparent text-[#A1A1AA]'}`}
                >
                  <MapIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-40">
              <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map((listing: any, idx: number) => (
                <PropertyCard key={listing._id} listing={listing} index={idx} />
              ))}
            </div>
          ) : (
            <div className="h-[600px] bg-[#161618] border border-white/5 flex items-center justify-center">
               <p className="text-[#A1A1AA] italic">Interactive Map View Integration...</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
