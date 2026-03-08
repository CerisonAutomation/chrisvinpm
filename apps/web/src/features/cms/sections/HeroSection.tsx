import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const HeroSection = ({ data }: any) => {
  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Parallax & Overlay */}
      {data.backgroundImageUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={data.backgroundImageUrl}
            className="w-full h-full object-cover"
            alt={data.heading}
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        </div>
      )}

      <div className="container relative z-10 mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-playfair text-[#F5F5F0] leading-tight mb-6">
            {data.heading}
          </h1>
          {data.subheading && (
            <p className="text-lg md:text-xl text-[#A1A1AA] font-manrope max-w-2xl mb-10 leading-relaxed">
              {data.subheading}
            </p>
          )}

          <div className="flex flex-wrap gap-4">
            {data.primaryCtaLabel && (
              <button className="bg-[#D4AF37] text-[#0F0F10] px-8 py-4 font-bold uppercase tracking-widest text-sm rounded-none hover:bg-[#E5C158] transition-all duration-300 flex items-center gap-2">
                {data.primaryCtaLabel}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {data.secondaryCtaLabel && (
              <button className="border border-[#D4AF37] text-[#D4AF37] px-8 py-4 font-bold uppercase tracking-widest text-sm rounded-none hover:bg-[#D4AF37]/10 transition-all duration-300">
                {data.secondaryCtaLabel}
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Decorative Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0F0F10] to-transparent z-10" />
    </div>
  );
};
