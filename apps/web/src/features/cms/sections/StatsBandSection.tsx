import React from 'react';

export const StatsBandSection = ({ data }: any) => {
  return (
    <div className="py-16 bg-[#161618] border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {data.stats?.map((stat: any, idx: number) => (
            <div key={idx} className="text-center">
              <p className="text-4xl md:text-5xl font-playfair text-[#D4AF37] mb-2">{stat.value}</p>
              <p className="text-xs uppercase tracking-widest text-[#A1A1AA]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
