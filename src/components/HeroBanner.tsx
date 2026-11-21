import React from 'react';
import { Sparkles, Utensils, Images, Heart, ChevronDown, Grid, Edit3 } from 'lucide-react';
import { CafeContactDetails, PageTexts } from '../types';
import { EditableText } from './EditableText';

interface HeroBannerProps {
  contact: CafeContactDetails;
  pageTexts: PageTexts;
  onUpdatePageText: (field: keyof PageTexts, value: string) => void;
  onOpenAddModal: () => void;
  photoCount: number;
  signatureCount?: number;
  galleryCount?: number;
  onOpenPageTextModal?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  contact,
  pageTexts,
  onUpdatePageText,
  onOpenAddModal,
  photoCount,
  signatureCount = 5,
  galleryCount = 20,
  onOpenPageTextModal,
}) => {
  return (
    <section id="home" data-section="hero" className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden scroll-mt-24">
      <span id="hero" className="sr-only" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Top Pill Emblem (Editable) */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fffaf6]/90 border border-[#e6bdc6] shadow-sm mb-6 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#c99750]" />
            <EditableText
              value={pageTexts.heroEmblem}
              onSave={(val) => onUpdatePageText('heroEmblem', val)}
              textKey="heroEmblem"
              label="Hero Emblem"
              className="text-xs font-semibold uppercase tracking-widest text-[#7a3b47]"
            />
          </div>

          {/* Main Title (Editable) */}
          <h1 className="font-serif-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#4a1c26] leading-[1.12] mb-6 text-center flex flex-col items-center justify-center">
            <EditableText
              value={pageTexts.heroHeading || pageTexts.heroTitle}
              onSave={(val) => onUpdatePageText('heroHeading', val)}
              textKey="heroHeading"
              label="Hero Main Heading"
              as="span"
              defaultAlign="center"
              className="text-center"
            />
          </h1>

          {/* Subheading (Editable, Bolder and Scalable with high contrast for floral background) */}
          <div className="font-serif-subtle italic text-lg sm:text-xl md:text-2xl text-[#4a1823] leading-relaxed max-w-2xl mx-auto mb-8 text-center flex flex-col items-center justify-center">
            <EditableText
              value={pageTexts.heroSubheading}
              onSave={(val) => onUpdatePageText('heroSubheading', val)}
              textKey="heroSubheading"
              defaultWeight="bold"
              defaultAlign="center"
              label="Hero Subheading"
              multiline
              as="span"
              className="text-center"
            />
          </div>

          {/* Feature Badges (Directly editable on-click or hover) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-10 text-xs sm:text-sm text-[#5d3039]">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fffaf6]/90 hover:bg-white border border-[#eed7dc] hover:border-[#9e4c5b]/40 shadow-2xs backdrop-blur-xs transition-colors">
              <Heart className="w-3.5 h-3.5 text-[#d97c8d] shrink-0 pointer-events-none" />
              <EditableText
                value={pageTexts.heroBadge1 || 'Pure European Butter & Madagascar Vanilla'}
                onSave={(val) => onUpdatePageText('heroBadge1', val)}
                textKey="heroBadge1"
                label="Feature Badge 1"
                as="span"
                className="font-medium"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fffaf6]/90 hover:bg-white border border-[#eed7dc] hover:border-[#9e4c5b]/40 shadow-2xs backdrop-blur-xs transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-[#c99750] shrink-0 pointer-events-none" />
              <EditableText
                value={pageTexts.heroBadge2 || 'Hand-Crafted Daily Fresh Batches'}
                onSave={(val) => onUpdatePageText('heroBadge2', val)}
                textKey="heroBadge2"
                label="Feature Badge 2"
                as="span"
                className="font-medium"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fffaf6]/90 hover:bg-white border border-[#eed7dc] hover:border-[#9e4c5b]/40 shadow-2xs backdrop-blur-xs transition-colors">
              <Images className="w-3.5 h-3.5 text-[#b37748] shrink-0 pointer-events-none" />
              <EditableText
                value={pageTexts.heroBadge3 || `${photoCount} Curated Creations`}
                onSave={(val) => onUpdatePageText('heroBadge3', val)}
                textKey="heroBadge3"
                label="Feature Badge 3"
                as="span"
                className="font-medium"
              />
            </div>

            {onOpenPageTextModal && (
              <button
                type="button"
                onClick={onOpenPageTextModal}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/85 hover:bg-[#faeaee] text-[#823b49] hover:text-[#9e4c5b] border border-[#ebd0d6] hover:border-[#9e4c5b] text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                title="Open Text & Badges Editor"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#9e4c5b]" />
                <span>Edit Badges</span>
              </button>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="#signature-menu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#9e4c5b] hover:bg-[#853c49] text-white font-semibold text-sm tracking-wide transition-all shadow-md hover:shadow-xl cursor-pointer"
            >
              <Utensils className="w-4 h-4" /> Signature Dishes ({signatureCount})
            </a>
            <a
              href="#dishes-gallery"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/90 hover:bg-white text-[#5e2632] border border-[#e4b3bc] font-semibold text-sm tracking-wide transition-all shadow-sm hover:shadow-md cursor-pointer backdrop-blur-xs"
            >
              <Images className="w-4 h-4 text-[#9e4c5b]" /> Dishes Gallery ({galleryCount})
            </a>
            <a
              href="#all-dishes"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#faeaee] hover:bg-[#f5d9e0] text-[#7a3242] border border-[#e8c0c8] font-semibold text-sm tracking-wide transition-all shadow-sm hover:shadow-md cursor-pointer backdrop-blur-xs"
            >
              <Grid className="w-4 h-4 text-[#9e4c5b]" /> View All {photoCount} Creations
            </a>
          </div>
        </div>
      </div>

      {/* Down arrow anchor */}
      <div className="flex justify-center mt-12">
        <a
          href="#signature-menu"
          className="p-2 text-[#9e4c5b]/60 hover:text-[#9e4c5b] transition-colors animate-bounce"
          aria-label="Scroll down to menu"
        >
          <ChevronDown className="w-6 h-6" />
        </a>
      </div>
    </section>
  );
};
