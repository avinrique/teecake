import React from 'react';
import { Camera, Edit3, Settings } from 'lucide-react';
import { EditableText } from './EditableText';
import { useTypography } from '../context/TypographyContext';

export interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  customLogoUrl?: string | null;
  showText?: boolean;
  brandName?: string;
  brandSubtitle?: string;
  isEditable?: boolean;
  onUpdateBrandName?: (val: string) => void;
  onUpdateBrandSubtitle?: (val: string) => void;
  onOpenBrandEditor?: () => void;
  onUploadLogo?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  customLogoUrl,
  showText = true,
  brandName = 'TeeCake',
  brandSubtitle = 'CREATIONS',
  isEditable = false,
  onUpdateBrandName,
  onUpdateBrandSubtitle,
  onOpenBrandEditor,
  onUploadLogo,
}) => {
  const { getTextFormatting } = useTypography();
  const nameFormat = getTextFormatting('brandName');
  const subFormat = getTextFormatting('brandSubtitle');

  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14 sm:w-16 sm:h-16',
    lg: 'w-20 h-20 sm:w-24 sm:h-24',
    xl: 'w-28 h-28 sm:w-36 sm:h-36',
  };

  const displayName = brandName || 'TeeCake';
  const displaySubtitle = brandSubtitle || 'CREATIONS';

  // Dynamic SVG text sizing to ensure long custom bakery names fit within the floral garland medallion
  const svgNameFontSize = displayName.length > 14 ? 14 : displayName.length > 9 ? 18 : 23;
  const svgSubtitleFontSize = displaySubtitle.length > 15 ? 6.5 : displaySubtitle.length > 10 ? 7.5 : 9;

  const handleScrollToHome = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('textarea')) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const homeEl = document.getElementById('home') || document.getElementById('hero');
    if (homeEl) {
      homeEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`flex items-center gap-3 shrink-0 relative group/brand ${className}`}>
      
      {/* Circular Logo Medallion or Uploaded Image */}
      <div
        onClick={handleScrollToHome}
        className="relative shrink-0 cursor-pointer"
        title="TeeCake Creations - Return to Home"
      >
        {customLogoUrl ? (
          <img
            src={customLogoUrl}
            alt={`${displayName} ${displaySubtitle} Logo`}
            referrerPolicy="no-referrer"
            className={`${sizeMap[size]} object-cover rounded-full border-2 border-[#d99f9f] shadow-md shrink-0 transition-transform duration-200 group-hover/brand:scale-105`}
          />
        ) : (
          <div
            className={`relative ${sizeMap[size]} rounded-full overflow-hidden shrink-0 shadow-md transition-transform group-hover/brand:scale-105 duration-300`}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xs">
              <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fffaf6" />
                  <stop offset="100%" stopColor="#f7ece3" />
                </linearGradient>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d8a867" />
                  <stop offset="50%" stopColor="#f3d79f" />
                  <stop offset="100%" stopColor="#b4833e" />
                </linearGradient>
                <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f7bcc7" />
                  <stop offset="100%" stopColor="#e38294" />
                </linearGradient>
              </defs>

              {/* Outer Circular Ring */}
              <circle cx="100" cy="100" r="96" fill="url(#bgGrad)" stroke="#e4a8b2" strokeWidth="4" />
              <circle cx="100" cy="100" r="92" fill="none" stroke="#d59a7a" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

              {/* Floral Garland Leaves & Flowers */}
              {/* Top Peonies */}
              <circle cx="58" cy="54" r="16" fill="url(#roseGrad)" opacity="0.9" />
              <circle cx="52" cy="50" r="10" fill="#fcd7df" opacity="0.95" />
              <circle cx="142" cy="72" r="15" fill="url(#roseGrad)" opacity="0.9" />
              <circle cx="148" cy="74" r="9" fill="#fcd7df" opacity="0.95" />
              
              {/* Side Roses */}
              <circle cx="78" cy="108" r="13" fill="url(#roseGrad)" opacity="0.9" />
              <circle cx="138" cy="102" r="13" fill="url(#roseGrad)" opacity="0.9" />

              {/* Green Vines & Leaves */}
              <path d="M42,70 Q30,55 45,40 Q55,50 42,70 Z" fill="#6f8f74" />
              <path d="M158,55 Q170,40 155,30 Q145,45 158,55 Z" fill="#6f8f74" />
              <path d="M165,95 Q178,105 160,115 Q152,102 165,95 Z" fill="#7a9880" />
              <path d="M35,95 Q20,105 38,118 Q46,105 35,95 Z" fill="#7a9880" />

              {/* Gold Berries */}
              <circle cx="36" cy="78" r="3.5" fill="url(#goldGrad)" />
              <circle cx="44" cy="85" r="3.5" fill="url(#goldGrad)" />
              <circle cx="160" cy="80" r="3.5" fill="url(#goldGrad)" />
              <circle cx="166" cy="88" r="3.5" fill="url(#goldGrad)" />

              {/* Teacup Saucer */}
              <ellipse cx="100" cy="118" rx="38" ry="8" fill="#ffffff" stroke="#c99750" strokeWidth="2" />
              <ellipse cx="100" cy="117" rx="32" ry="5" fill="#f9efe5" />

              {/* Teacup Body */}
              <path d="M72,82 C74,108 85,116 100,116 C115,116 126,108 128,82 Z" fill="#ffffff" stroke="#c99750" strokeWidth="2" />
              
              {/* Teacup Gold Filigree Heart Motif */}
              <path d="M92,95 C88,90 92,86 96,89 C100,86 104,90 100,95 L96,98 Z" fill="#d8a867" />
              <circle cx="96" cy="104" r="2.5" fill="#e38294" />
              <path d="M84,92 Q88,98 94,100" stroke="#c99750" strokeWidth="1.2" fill="none" />
              <path d="M108,92 Q104,98 98,100" stroke="#c99750" strokeWidth="1.2" fill="none" />

              {/* Teacup Handle */}
              <path d="M127,85 C140,86 142,105 125,107" fill="none" stroke="#c99750" strokeWidth="2.5" strokeLinecap="round" />

              {/* Cupcake Base & Paper Liner inside Teacup */}
              <path d="M83,78 L87,66 L113,66 L117,78 Z" fill="#f3dbb3" stroke="#b4833e" strokeWidth="1" />
              <path d="M88,66 L86,78 M94,66 L93,78 M100,66 L100,78 M106,66 L107,78 M112,66 L114,78" stroke="#d5aa6e" strokeWidth="0.8" />

              {/* Cupcake Swirl Frosting */}
              <path d="M81,66 C80,60 88,54 100,54 C112,54 120,60 119,66 C118,70 82,70 81,66 Z" fill="#ffffff" stroke="#eec0c9" strokeWidth="1.2" />
              <path d="M87,58 C90,52 97,48 100,48 C103,48 110,52 113,58 Z" fill="#fff5f7" />

              {/* Strawberry on Top */}
              <path d="M96,48 C94,40 100,36 102,40 C104,36 106,44 98,49 Z" fill="#dc3545" />
              <circle cx="98" cy="42" r="0.8" fill="#ffd700" />
              <circle cx="100" cy="45" r="0.8" fill="#ffd700" />
              {/* Strawberry Leaves */}
              <path d="M95,40 Q99,41 100,38 Q101,41 105,40" fill="none" stroke="#2d6a4f" strokeWidth="1.5" />

              {/* Small Sugar Blossom on Cupcake */}
              <circle cx="109" cy="51" r="3" fill="#f8b6c4" />
              <circle cx="109" cy="51" r="1" fill="#fff" />

              {/* Dynamic Calligraphy Text in Base */}
              <text
                x="100"
                y="152"
                textAnchor="middle"
                fontFamily="Playfair Display, Georgia, serif"
                fontSize={svgNameFontSize}
                fontWeight="600"
                fill="#9e4c5b"
                letterSpacing="0.5"
              >
                {displayName}
              </text>

              {/* Dynamic Subtitle with divider lines */}
              <line x1="38" y1="167" x2="68" y2="167" stroke="#b4833e" strokeWidth="1.2" />
              <text
                x="100"
                y="170"
                textAnchor="middle"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontSize={svgSubtitleFontSize}
                fontWeight="600"
                fill="#855a29"
                letterSpacing="3.0"
              >
                {displaySubtitle}
              </text>
              <line x1="132" y1="167" x2="162" y2="167" stroke="#b4833e" strokeWidth="1.2" />
            </svg>
          </div>
        )}

        {/* Hover quick-action on logo to change or edit */}
        {isEditable && (onOpenBrandEditor || onUploadLogo) && (
          <button
            type="button"
            onClick={onOpenBrandEditor || onUploadLogo}
            className="absolute -bottom-1 -right-1 p-1 bg-[#9e4c5b] hover:bg-[#803845] text-white rounded-full shadow-md opacity-0 group-hover/brand:opacity-100 transition-opacity cursor-pointer z-10"
            title="Edit brand logo & size"
          >
            <Camera className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Brand Name & Subtitle beside Logo */}
      {showText && (
        <div
          onClick={handleScrollToHome}
          className="flex flex-col shrink-0 justify-center cursor-pointer"
          title="TeeCake Creations - Return to Home"
        >
          <div className="flex items-center gap-1.5">
            {isEditable && onUpdateBrandName ? (
              <EditableText
                value={displayName}
                onSave={onUpdateBrandName}
                textKey="brandName"
                label="Bakery Brand Name"
                as="h1"
                defaultWeight="bold"
                defaultAlign="left"
                className="font-serif-display text-2xl sm:text-[1.75rem] font-bold tracking-tight text-[#5a2732] leading-none whitespace-nowrap cursor-pointer hover:text-[#9e4c5b] transition-colors"
              />
            ) : (
              <span
                className={`font-serif-display text-2xl sm:text-[1.75rem] tracking-tight text-[#5a2732] leading-none whitespace-nowrap ${
                  nameFormat.fontWeight === 'extrabold'
                    ? 'font-black'
                    : nameFormat.fontWeight === 'semibold'
                    ? 'font-semibold'
                    : nameFormat.fontWeight === 'normal'
                    ? 'font-normal'
                    : 'font-bold'
                }`}
              >
                {displayName}
              </span>
            )}

            {/* Quick pencil button to open dedicated Brand & Typography Editor */}
            {isEditable && onOpenBrandEditor && (
              <button
                type="button"
                onClick={onOpenBrandEditor}
                className="p-1 text-stone-400 hover:text-[#9e4c5b] rounded hover:bg-[#faeaee] opacity-0 group-hover/brand:opacity-100 transition-opacity cursor-pointer"
                title="Open Brand Logo & Typography Editor"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="mt-1">
            {isEditable && onUpdateBrandSubtitle ? (
              <EditableText
                value={displaySubtitle}
                onSave={onUpdateBrandSubtitle}
                textKey="brandSubtitle"
                label="Brand Subtitle"
                as="span"
                defaultWeight="semibold"
                defaultAlign="left"
                className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-semibold text-[#9b6832] whitespace-nowrap cursor-pointer hover:text-[#7d5020] transition-colors block"
              />
            ) : (
              <span
                className={`text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-[#9b6832] whitespace-nowrap block ${
                  subFormat.fontWeight === 'bold'
                    ? 'font-bold'
                    : subFormat.fontWeight === 'extrabold'
                    ? 'font-black'
                    : subFormat.fontWeight === 'normal'
                    ? 'font-normal'
                    : 'font-semibold'
                }`}
              >
                {displaySubtitle}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
