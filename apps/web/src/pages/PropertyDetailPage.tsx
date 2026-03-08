import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AmenitiesGrid } from '@/components/AmenitiesGrid';
import { Loader2, Star, MapPin, Share2, Heart, Calendar, Users, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => apiGet<any>(`/listings/${id}`),
    enabled: !!id,
  });

  if (isLoading) return <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" /></div>;

  return (
    <div className="bg-[#0F0F10] min-h-screen">
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
            <div className="max-w-4xl">
               <div className="flex items-center gap-2 text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-black mb-4">
                 <Star className="w-3 h-3 fill-[#D4AF37]" /> Exceptional Luxury
               </div>
               <h1 className="text-4xl md:text-5xl font-playfair text-[#F5F5F0] leading-tight mb-4">{listing?.title}</h1>
               <div className="flex flex-wrap items-center gap-6 text-[#A1A1AA] text-sm">
                 <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#D4AF37]" /> {listing?.address?.city}, Malta</div>
                 <div className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Up to {listing?.accommodates} guests</div>
                 <div className="flex items-center gap-1.5 underline underline-offset-4 cursor-pointer hover:text-[#D4AF37] transition-colors">{listing?.reviewCount || 0} Reviews</div>
               </div>
            </div>

            <div className="flex items-start gap-3">
               <Button variant="outline" size="icon" className="rounded-none border-white/10 hover:bg-white/5"><Share2 className="w-4 h-4" /></Button>
               <Button variant="outline" size="icon" className="rounded-none border-white/10 hover:bg-white/5"><Heart className="w-4 h-4" /></Button>
            </div>
          </div>

          {/* Gallery Grid (Bento Style) */}
          <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[600px] mb-16">
             <div className="col-span-2 row-span-2 overflow-hidden bg-[#161618]">
                <img src={listing?.pictures?.[0]?.original} className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
             </div>
             <div className="col-span-1 row-span-1 overflow-hidden bg-[#161618]">
                <img src={listing?.pictures?.[1]?.original} className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
             </div>
             <div className="col-span-1 row-span-1 overflow-hidden bg-[#161618]">
                <img src={listing?.pictures?.[2]?.original} className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
             </div>
             <div className="col-span-2 row-span-1 overflow-hidden bg-[#161618]">
                <img src={listing?.pictures?.[3]?.original} className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16">
             <div>
                {/* Description */}
                <section className="mb-16">
                  <h2 className="text-2xl font-playfair text-[#F5F5F0] mb-6">About this sanctuary</h2>
                  <div className="prose prose-invert max-w-none text-[#A1A1AA] leading-relaxed font-manrope">
                    <p>{listing?.publicDescription || listing?.description}</p>
                  </div>
                </section>

                {/* Amenities */}
                <section className="mb-16 border-t border-white/5 pt-16">
                  <h2 className="text-2xl font-playfair text-[#F5F5F0] mb-8">Refined Amenities</h2>
                  <AmenitiesGrid amenities={listing?.amenities || []} />
                </section>

                {/* Terms */}
                <section className="mb-16 border-t border-white/5 pt-16">
                   <h2 className="text-2xl font-playfair text-[#F5F5F0] mb-6">Stay Conditions</h2>
                   <div className="bg-[#161618] border border-white/5 p-8 flex items-start gap-4">
                      <Info className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                      <p className="text-sm text-[#A1A1AA] leading-relaxed">{listing?.terms || 'Standard luxury stay terms apply.'}</p>
                   </div>
                </section>
             </div>

             {/* Booking Widget (Sticky) */}
             <div className="relative">
                <div className="sticky top-28 bg-[#161618] border border-white/10 p-8 shadow-2xl">
                   <div className="flex items-end justify-between mb-8 pb-8 border-b border-white/5">
                      <div>
                         <p className="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-black mb-1">Price from</p>
                         <h3 className="text-3xl font-playfair text-[#F5F5F0]">{listing?.prices?.currency} {listing?.prices?.basePrice}</h3>
                      </div>
                      <p className="text-sm text-[#A1A1AA]">per night</p>
                   </div>

                   <div className="space-y-4 mb-8">
                      <div className="grid grid-cols-2 bg-[#0F0F10] border border-white/5">
                         <div className="p-4 border-r border-white/5">
                            <label className="block text-[8px] uppercase tracking-widest text-[#D4AF37] font-black mb-1">Check In</label>
                            <div className="text-sm font-bold text-[#F5F5F0]">Add Date</div>
                         </div>
                         <div className="p-4">
                            <label className="block text-[8px] uppercase tracking-widest text-[#D4AF37] font-black mb-1">Check Out</label>
                            <div className="text-sm font-bold text-[#F5F5F0]">Add Date</div>
                         </div>
                      </div>
                      <div className="p-4 bg-[#0F0F10] border border-white/5">
                         <label className="block text-[8px] uppercase tracking-widest text-[#D4AF37] font-black mb-1">Guests</label>
                         <div className="text-sm font-bold text-[#F5F5F0]">2 Guests</div>
                      </div>
                   </div>

                   <Button
                     onClick={() => toast.success('Initializing Luxury Flow...')}
                     className="w-full py-8 bg-[#D4AF37] text-black font-black uppercase tracking-[0.3em] rounded-none hover:bg-[#E5C158] shadow-lg shadow-[#D4AF37]/10"
                   >
                     Reserve Stay <ArrowRight className="w-5 h-5 ml-3" />
                   </Button>

                   <p className="text-center text-[10px] text-[#A1A1AA] mt-6 uppercase tracking-widest">You won't be charged yet</p>
                </div>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
