import React from 'react';
import { HeroBlock } from './cms/HeroBlock';
import { FeaturesBlock } from './cms/FeaturesBlock';
import { PropertyGridBlock } from './cms/PropertyGridBlock';
import { CTABlock } from './cms/CTABlock';

interface BlockData {
  blockId: string;
  blockType: string;
  content: any;
  settings?: any;
  styles?: any;
  visible?: boolean;
}

export const BlockRenderer: React.FC<{ blocks: BlockData[] }> = ({ blocks }) => {
  return (
    <>
      {blocks
        .filter((block) => block.visible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((block) => {
          switch (block.blockType) {
            case 'hero':
              return <HeroBlock key={block.blockId} content={block.content} />;
            case 'features':
              return <FeaturesBlock key={block.blockId} content={block.content} />;
            case 'property_grid':
              return <PropertyGridBlock key={block.blockId} content={block.content} />;
            case 'cta':
              return <CTABlock key={block.blockId} content={block.content} />;
            default:
              return (
                <div key={block.blockId} className="py-10 text-center text-white/20 border border-dashed border-white/10">
                  Block type "{block.blockType}" not implemented
                </div>
              );
          }
        })}
    </>
  );
};
