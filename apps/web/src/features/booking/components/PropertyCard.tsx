import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Bed, Bath, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PropertyCard({ listing, index }: any) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const price = listing.prices?.basePrice || 0;
  const currency = listing.prices?.currency || 'EUR';
  const image = listing.pictures?.[0]?.original || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => navigate(`/properties/${listing._id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer bg-[#161618] border border-white/5 overflow-hidden relative"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={listing.title}
          className={cn(
            "w-full h-full object-cover transition-transform duration-700 ease-out",
            isHovered ? "scale-110" : "scale-100"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10">
          <span className="text-sm font-bold text-[#F5F5F0]">{currency} {price}</span>
          <span className="text-[10px] text-[#A1A1AA] ml-1 uppercase">/ night</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-1 text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-black mb-2">
          <MapPin className="w-3 h-3" />
          {listing.address?.city || 'Malta'}
        </div>

        <h3 className="text-lg font-playfair text-[#F5F5F0] mb-4 line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
          {listing.title}
        </h3>

        <div className="flex items-center gap-4 text-[#A1A1AA] text-xs border-t border-white/5 pt-4">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {listing.accommodates} Guests
          </div>
          <div className="flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5" />
            {listing.bedrooms} Beds
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-3.5 h-3.5" />
            {listing.bathrooms} Baths
          </div>
        </div>
      </div>

      {/* Luxury Overlay */}
      <div className={cn(
        "absolute inset-0 bg-[#D4AF37]/5 flex items-center justify-center opacity-0 transition-opacity duration-300 pointer-events-none",
        isHovered && "opacity-100"
      )}>
        <div className="bg-[#D4AF37] text-black px-6 py-3 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          Discover Stay <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}
