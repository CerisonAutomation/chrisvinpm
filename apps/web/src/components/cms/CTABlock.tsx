import React from 'react';
import { Button } from '@/components/ui/button';
import { useModal } from '@/context/ModalContext';
import { ArrowRight, Phone } from 'lucide-react';

export const CTABlock: React.FC<{ content: any }> = ({ content }) => {
  const {
    headline = "Your Perfect Malta Getaway Awaits",
    subheadline = "Start Your Journey",
    description = "Whether you're seeking a romantic retreat, a family adventure, or a luxurious escape, our handpicked collection has the perfect property for you.",
    primaryCtaText = "Browse Properties",
    primaryCtaLink = "/properties",
    secondaryCtaText = "Contact Us",
    backgroundImage = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80"
  } = content;

  const { openContact } = useModal();

  return (
    <section className="py-24 md:py-32 bg-[#0A0A0B] relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt="Luxury interior"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B] via-[#0A0A0B]/90 to-[#0A0A0B]/70" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium">
            {subheadline}
          </span>
          <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#F5F5F0] mb-6">
            {headline.includes('Awaits') ? (
               <>
               {headline.replace('Awaits', '')}
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3]">Awaits</span>
               </>
            ) : headline}
          </h2>
          <p className="text-[#A1A1AA] text-lg mb-8 leading-relaxed">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-[0.15em] px-8 py-6 font-semibold shadow-lg shadow-[#D4AF37]/20"
            >
              {primaryCtaText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={() => openContact()}
              variant="outline"
              className="border-white/30 text-[#F5F5F0] hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-transparent rounded-none uppercase text-sm tracking-[0.15em] px-8 py-6"
            >
              <Phone className="w-4 h-4 mr-2" />
              {secondaryCtaText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
