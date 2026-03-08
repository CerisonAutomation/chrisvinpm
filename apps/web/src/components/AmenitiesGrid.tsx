import React from 'react';
import { AmenityIcons } from '@/lib/icons';
import { Check } from 'lucide-react';

interface Props {
  amenities: string[];
  limit?: number;
}

export const AmenitiesGrid: React.FC<Props> = ({ amenities, limit }) => {
  const displayList = limit ? amenities.slice(0, limit) : amenities;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-8">
      {displayList.map((code) => {
        const Icon = AmenityIcons[code] || Check;
        const label = code.replace(/_/g, ' ').toLowerCase();

        return (
          <div key={code} className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-none bg-[#161618] border border-white/5 flex items-center justify-center group-hover:border-[#D4AF37]/50 transition-colors">
              <Icon className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#D4AF37] transition-colors" />
            </div>
            <span className="text-sm text-[#F5F5F0] capitalize truncate">{label}</span>
          </div>
        );
      })}
    </div>
  );
};
