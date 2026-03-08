import React from 'react';
import { HeroBlock } from '@/components/cms/HeroBlock';
import { FeaturesBlock } from '@/components/cms/FeaturesBlock';
import { PropertyGridBlock } from '@/components/cms/PropertyGridBlock';
import { CTABlock } from '@/components/cms/CTABlock';

// Horus Zenith Expanded Sections
const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  hero: HeroBlock,
  features: FeaturesBlock,
  property_grid: PropertyGridBlock,
  cta: CTABlock,
  // Placeholders for expanded sections
  areaGuide: ({ content }: any) => <div className="py-10 bg-card border border-border rounded-none p-10">Area Guide: {content.heading}</div>,
  testimonialList: ({ content }: any) => <div className="py-10 bg-card border border-border rounded-none p-10">Testimonials</div>,
  faq: ({ content }: any) => <div className="py-10 bg-card border border-border rounded-none p-10">FAQ</div>,
  richText: ({ content }: any) => <div className="py-10 bg-card border border-border rounded-none p-10">Rich Text</div>,
  ctaBanner: ({ content }: any) => <div className="py-10 bg-card border border-border rounded-none p-10">CTA Banner</div>,
  logoCloud: ({ content }: any) => <div className="py-10 bg-card border border-border rounded-none p-10">Logo Cloud</div>,
  pricingTable: ({ content }: any) => <div className="py-10 bg-card border border-border rounded-none p-10">Pricing</div>,
  comparisonTable: ({ content }: any) => <div className="py-10 bg-card border border-border rounded-none p-10">Comparison</div>,
  howItWorks: ({ content }: any) => <div className="py-10 bg-card border border-border rounded-none p-10">How It Works</div>,
  propertyCollection: ({ content }: any) => <div className="py-10 bg-card border border-border rounded-none p-10">Collection</div>,
};

export const RenderPageSections: React.FC<{ sections: any[] }> = ({ sections }) => {
  if (!sections) return null;

  return (
    <>
      {sections
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((section) => {
          const Component = SECTION_COMPONENTS[section.type] || SECTION_COMPONENTS[section.blockType];
          if (!Component) return null;
          return <Component key={section.id || section.blockId} content={section.data || section.content} />;
        })}
    </>
  );
};
