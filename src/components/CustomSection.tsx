import React from 'react';
import { Sparkles, ArrowRight, Tag, Edit2 } from 'lucide-react';
import { PageSection } from '../types';
import { EditableText } from './EditableText';

interface CustomSectionProps {
  section: PageSection;
  onEditSection: (section: PageSection) => void;
}

export const CustomSection: React.FC<CustomSectionProps> = ({
  section,
  onEditSection,
}) => {
  const content = section.customContent || {
    heading: section.title,
    subheading: 'Custom created artisanal experience',
    badgeText: 'Special Feature',
    bodyText: 'We welcome you to explore our bespoke offerings, carefully designed and prepared with passion.',
    layout: 'split-image-right',
  };

  const layout = content.layout || 'split-image-right';

  return (
    <section id={section.id} className="py-14 md:py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center justify-center">
          {content.badgeText && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fcedf0] border border-[#e8c0c8] mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#c99750]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#7a3b47]">
                {content.badgeText}
              </span>
            </div>
          )}

          <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#4a1c26] tracking-tight mb-3 text-center flex flex-col items-center justify-center">
            <EditableText
              value={content.heading}
              onSave={(val) =>
                onEditSection({
                  ...section,
                  title: val,
                  customContent: { ...content, heading: val },
                })
              }
              textKey={`custom_${section.id}_heading`}
              label="Section Heading"
              as="span"
              defaultAlign="center"
              className="text-center"
            />
          </h2>

          {content.subheading && (
            <div className="font-serif-subtle italic text-base sm:text-lg text-[#5a222e] leading-relaxed text-center flex flex-col items-center justify-center">
              <EditableText
                value={content.subheading}
                onSave={(val) =>
                  onEditSection({
                    ...section,
                    customContent: { ...content, subheading: val },
                  })
                }
                textKey={`custom_${section.id}_subheading`}
                defaultWeight="semibold"
                defaultAlign="center"
                label="Section Subtitle"
                multiline
                as="span"
                className="text-center"
              />
            </div>
          )}

          <div className="mt-3">
            <button
              onClick={() => onEditSection(section)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#8b3d4d] bg-white/90 border border-[#e8c0c8] rounded-full hover:bg-[#fff0f3] cursor-pointer shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Section Content
            </button>
          </div>
        </div>

        {/* Content Body Based on Layout */}
        {layout === 'feature-cards' && content.items && content.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.items.map((item) => (
              <div
                key={item.id}
                className="bg-[#fffdfb]/90 border border-[#edd7dd] rounded-2xl p-7 shadow-sm hover:shadow-md transition-all backdrop-blur-xs flex flex-col justify-between"
              >
                <div>
                  {item.tag && (
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#faeaee] text-[#8b3d4d] rounded-full border border-[#f0cdd5] mb-3">
                      {item.tag}
                    </span>
                  )}
                  <h3 className="font-serif-display text-xl font-bold text-[#4a1c26] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#5e4348] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#fffdfb]/90 border border-[#edd7dd] rounded-2xl p-6 sm:p-10 shadow-sm backdrop-blur-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Text Column */}
            <div className={`${content.imageUrl ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
              <p className="text-base sm:text-lg text-[#472c32] leading-relaxed whitespace-pre-line font-medium">
                {content.bodyText}
              </p>

              {content.ctaText && (
                <div className="pt-2">
                  <a
                    href={content.ctaLink || '#location-hours'}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#9e4c5b] hover:bg-[#853c49] text-white font-semibold text-xs tracking-wide transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <span>{content.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Optional Image Column */}
            {content.imageUrl && (
              <div className="lg:col-span-5">
                <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-[#e8c0c8] shadow-md bg-stone-100">
                  <img
                    src={content.imageUrl}
                    alt={content.imageAlt || content.heading}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
