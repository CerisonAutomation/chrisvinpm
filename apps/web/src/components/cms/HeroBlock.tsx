import React from 'react';
import { Button } from '@/components/ui/button';
import { SearchWidget } from '@/components/SearchWidget';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const HeroBlock: React.FC<{ content: any }> = ({ content }) => {
  const {
    headline = "Your Home in Malta, Looked After Like a Hotel",
    subheadline = "Handpicked luxury accommodations across Malta's most sought-after locations.",
    backgroundImage = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
    ctaText = "List Your Property",
    secondaryCtaText = "Book a Stay",
  } = content;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with subtle parallax-like effect via motion */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img
          src={backgroundImage}
          alt="Luxury villa"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F10] via-[#0F0F10]/40 to-transparent" />
        <div className="absolute inset-0 bg-black/30" />
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-32 pb-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 border border-[#D4AF37]/30 bg-[#D4AF37]/5 backdrop-blur-sm mb-6">
              <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-medium">
                Malta's Premier Property Management
              </span>
            </div>

            <h1 className="font-['Playfair_Display'] text-5xl md:text-6xl lg:text-7xl text-[#F5F5F0] mb-6 leading-[1.05]">
              {headline.split(',').map((part: string, i: number) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {i === 1 ? (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] italic">
                      {part}
                    </span>
                  ) : part}
                </React.Fragment>
              ))}
            </h1>

            <p className="text-lg md:text-xl text-[#A1A1AA] mb-10 max-w-2xl leading-relaxed">
              {subheadline}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-[0.15em] px-8 py-6 font-semibold shadow-lg shadow-[#D4AF37]/20 transition-all">
                {ctaText}
              </Button>
              <Button variant="outline" className="border-white/30 text-[#F5F5F0] hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-transparent rounded-none uppercase text-sm tracking-[0.15em] px-8 py-6">
                {secondaryCtaText}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-20 left-0 right-0 z-20 px-6 hidden lg:block">
        <div className="max-w-7xl mx-auto">
          <SearchWidget variant="hero" />
        </div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#A1A1AA]"
      >
        <span className="text-xs uppercase tracking-widest text-[10px]">Explore</span>
        <ChevronDown className="w-4 h-4 text-[#D4AF37]" />
      </motion.div>
    </section>
  );
};
