import React from 'react';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

export const FeatureGridSection = ({ data }: any) => {
  return (
    <div className="py-24 bg-[#0F0F10]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-playfair text-[#F5F5F0] mb-4">{data.heading}</h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.features?.map((feature: any, idx: number) => {
            const IconComponent = (Icons as any)[feature.iconName] || Icons.Shield;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#161618] p-8 border border-white/5 group hover:border-[#D4AF37]/30 transition-all duration-500"
              >
                <div className="w-12 h-12 bg-[#D4AF37]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <IconComponent className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-playfair text-[#F5F5F0] mb-3">{feature.title}</h3>
                <p className="text-[#A1A1AA] text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
