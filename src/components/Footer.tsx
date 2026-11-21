import React from 'react';
import { BrandLogo } from './BrandLogo';
import { CafeContactDetails, BackdropSettings, PageTexts } from '../types';
import { Sparkles, MapPin, Phone, Mail, Heart, Sliders, Instagram } from 'lucide-react';
import { InstagramQrCard } from './InstagramQrCard';

interface FooterProps {
  contact: CafeContactDetails;
  backdropSettings: BackdropSettings;
  onUpdateBackdropSettings: (settings: BackdropSettings) => void;
  onOpenBackdropSelector?: () => void;
  onOpenEditContact: () => void;
  onUpdateContact?: (contact: CafeContactDetails) => void;
  customLogoUrl?: string | null;
  itemCount?: number;
  pageTexts?: PageTexts;
}

export const Footer: React.FC<FooterProps> = ({
  contact,
  backdropSettings,
  onUpdateBackdropSettings,
  onOpenBackdropSelector,
  onOpenEditContact,
  onUpdateContact,
  customLogoUrl,
  itemCount,
  pageTexts,
}) => {
  return (
    <footer className="relative z-10 bg-[#fffdfa]/95 border-t border-[#edd4d9] pt-14 pb-10 text-[#4a2e33] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-[#ebd0d6] items-start">
          
          {/* Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo
              size="lg"
              customLogoUrl={customLogoUrl}
              brandName={pageTexts?.brandName || 'TeeCake'}
              brandSubtitle={pageTexts?.brandSubtitle || 'CREATIONS'}
            />
            <p className="font-victorian italic text-base text-[#6f404b] leading-relaxed max-w-sm">
              &ldquo;{contact.tagline}&rdquo;
            </p>
            <p className="text-xs text-[#7e535c] leading-relaxed max-w-sm">
              Dedicated to the timeless 19th-century hearth tradition of slow-fermented crusts, English tea cakes, and authentic Victorian confections.
            </p>
            
            <div className="space-y-1.5 pt-1 text-xs text-[#633f47]">
              <p>
                Location: <span className="font-medium text-[#4a1c26]">{contact.cityStateZip}</span>
              </p>
              <p>
                Call / WhatsApp: <a href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`} className="font-medium text-[#4a1c26] hover:text-[#9e4c5b]">{contact.phone}</a>
              </p>
              <p>
                Email: <a href={`mailto:${contact.email}`} className="font-medium text-[#4a1c26] hover:text-[#9e4c5b]">{contact.email}</a>
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fcedf0] rounded-full text-xs font-mono text-[#8b3d4d] border border-[#ebd0d6]">
              <Sparkles className="w-3.5 h-3.5 text-[#c99750]" /> {contact.domain}
            </div>
          </div>

          {/* Blossoms Backdrop Ambience & Quick Controls (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-victorian font-bold text-base text-[#4a1c26] flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#c99750]" /> Blossoms Ambience
              </h4>
              <button
                onClick={onOpenEditContact}
                className="text-[11px] text-[#9e4c5b] hover:underline font-semibold cursor-pointer"
              >
                Edit Details
              </button>
            </div>

            <p className="text-xs text-[#7e535c] leading-relaxed">
              Curated classical temple & blooming flower backdrops auto-rotating smoothly behind the artisan pastry showcase.
            </p>

            {/* Flower & Blossom Backdrop Loop & Opacity Quick Toggle */}
            <div className="pt-2 text-xs space-y-2">
              <span className="text-stone-600 block flex items-center justify-between">
                <span className="font-medium text-[#7a3b47]">Endless Loop Status:</span>
                <span className="text-[11px] text-[#915f69] font-mono font-bold">
                  {backdropSettings.autoRotate ? `Auto (${backdropSettings.intervalSeconds || 10}s)` : 'Paused'}
                </span>
              </span>
              <div className="flex items-center justify-between gap-2 bg-white/70 border border-[#f0d8de] rounded-xl p-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#7a3b47] font-medium">Opacity:</span>
                  <input
                    type="range"
                    min="0.2"
                    max="0.85"
                    step="0.05"
                    value={backdropSettings.opacity}
                    onChange={(e) =>
                      onUpdateBackdropSettings({
                        ...backdropSettings,
                        opacity: parseFloat(e.target.value),
                      })
                    }
                    className="w-20 sm:w-24 accent-[#9e4c5b] cursor-pointer"
                  />
                  <span className="font-mono text-xs font-bold text-[#8b3d4d]">
                    {Math.round(backdropSettings.opacity * 100)}%
                  </span>
                </div>
                {onOpenBackdropSelector && (
                  <button
                    onClick={onOpenBackdropSelector}
                    className="text-[11px] underline text-[#9e4c5b] font-medium hover:text-[#7a3b47] cursor-pointer"
                  >
                    Timer & Loops
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Instagram Page & Scannable QR Code (5 cols) */}
          <div id="footer-instagram" className="lg:col-span-5 space-y-3 scroll-mt-10">
            <InstagramQrCard
              contact={contact}
              onUpdateContact={onUpdateContact}
              variant="footer"
            />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p className="flex items-center gap-1 text-center sm:text-left">
            &copy; {new Date().getFullYear()} {contact.name} &bull; Artisanal Bakery Portfolio &bull; All Rights Reserved.
          </p>
          <p className="flex items-center gap-1 text-stone-400">
            Artisanal Home Bakehouse &bull; Handcrafted Small-Batch Confections
          </p>
        </div>
      </div>
    </footer>
  );
};
