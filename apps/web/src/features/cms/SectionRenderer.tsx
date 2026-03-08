import React from 'react';
import { HeroSection } from './sections/HeroSection';
import { FeatureGridSection } from './sections/FeatureGridSection';
import { PropertyHighlightSection } from './sections/PropertyHighlightSection';
import { CtaBannerSection } from './sections/CtaBannerSection';
import { FaqSection } from './sections/FaqSection';
import { RichTextSection } from './sections/RichTextSection';
import { PricingTableSection } from './sections/PricingTableSection';
import { AreaGuideSection } from './sections/AreaGuideSection';
import { ComparisonTableSection } from './sections/ComparisonTableSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { PropertyCollectionSection } from './sections/PropertyCollectionSection';
import { StatsBandSection } from './sections/StatsBandSection';

const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  hero: HeroSection,
  featureGrid: FeatureGridSection,
  propertyHighlight: PropertyHighlightSection,
  ctaBanner: CtaBannerSection,
  faq: FaqSection,
  richText: RichTextSection,
  pricingTable: PricingTableSection,
  areaGuide: AreaGuideSection,
  comparisonTable: ComparisonTableSection,
  howItWorks: HowItWorksSection,
  propertyCollection: PropertyCollectionSection,
  statsBand: StatsBandSection,
};

export const SectionRenderer: React.FC<{ sections: any[] }> = ({ sections }) => {
  if (!sections) return null;

  return (
    <>
      {sections
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((section) => {
          const Component = SECTION_COMPONENTS[section.type];
          if (!Component) {
             console.warn(`CMS: Component for section type "${section.type}" not found.`);
             return null;
          }
          return (
            <section key={section.id} id={section.id} className="relative w-full">
              <Component data={section.data} />
            </section>
          );
        })}
    </>
  );
};
