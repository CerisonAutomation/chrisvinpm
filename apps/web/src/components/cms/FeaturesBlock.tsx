import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

export const FeaturesBlock: React.FC<{ content: any }> = ({ content }) => {
  const {
    headline = "The CVPM Difference",
    subheadline = "Premium property management services",
    features = [
      { icon: "Shield", title: "Verified Properties", description: "All properties are personally inspected" },
      { icon: "Clock", title: "24/7 Support", description: "Round-the-clock guest assistance" },
      { icon: "Star", title: "Best Prices", description: "Price match guarantee" }
    ]
  } = content;

  return (
    <section className="py-24 md:py-32 bg-[#0F0F10]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium">
            Why Choose Us
          </span>
          <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#F5F5F0] mb-4">
            {headline}
          </h2>
          <p className="text-[#A1A1AA] max-w-2xl mx-auto">
            {subheadline}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature: any, i: number) => {
            const Icon = (LucideIcons as any)[feature.icon] || LucideIcons.HelpCircle;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 border border-white/5 bg-[#161618] hover:border-[#D4AF37]/30 transition-all duration-500"
              >
                <div className="w-14 h-14 border border-[#D4AF37]/30 bg-[#D4AF37]/5 flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/10 transition-all">
                  <Icon className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="text-white font-['Playfair_Display'] text-xl mb-3">{feature.title}</h3>
                <p className="text-[#A1A1AA] text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
