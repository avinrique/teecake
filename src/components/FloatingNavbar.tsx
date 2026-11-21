import React, { useState, useEffect } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';
import { PageSection } from '../types';

interface FloatingNavbarProps {
  sections: PageSection[];
  signatureCount: number;
  galleryCount: number;
  totalCount: number;
  brandName?: string;
  customLogoUrl?: string | null;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({
  sections,
  signatureCount,
  galleryCount,
  totalCount,
  brandName = 'TeeCake',
  customLogoUrl,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('home');

  // Compute dynamic navigation links from active sections
  const navLinks = sections && sections.length > 0
    ? sections
        .filter((s) => s.visible && s.showInNav)
        .map((s) => {
          let dynamicLabel = s.navLabel;
          if (s.id === 'signature-menu') {
            dynamicLabel = dynamicLabel.includes('(')
              ? dynamicLabel.replace(/\(\d+\)/, `(${signatureCount})`)
              : `${dynamicLabel} (${signatureCount})`;
          } else if (s.id === 'dishes-gallery') {
            dynamicLabel = dynamicLabel.includes('(')
              ? dynamicLabel.replace(/\(\d+\)/, `(${galleryCount})`)
              : `${dynamicLabel} (${galleryCount})`;
          } else if (s.id === 'all-dishes') {
            dynamicLabel = dynamicLabel.includes('(')
              ? dynamicLabel.replace(/\(\d+\)/, `(${totalCount})`)
              : `${dynamicLabel} (${totalCount})`;
          }
          return {
            id: s.id === 'hero' ? 'home' : s.id,
            label: dynamicLabel,
            href: s.id === 'hero' ? '#home' : `#${s.id}`,
          };
        })
    : [
        { id: 'home', label: 'Home', href: '#home' },
        { id: 'all-dishes', label: `All Creations (${totalCount})`, href: '#all-dishes' },
        { id: 'art-of-baking', label: 'Art of Baking', href: '#art-of-baking' },
        { id: 'signature-menu', label: `Signature Dishes (${signatureCount})`, href: '#signature-menu' },
        { id: 'location-hours', label: 'Location & Hours', href: '#location-hours' },
      ];

  // Listen to scroll to show/hide the floating bar and update active section spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Show floating bar once scrolled past top header (~140px)
      if (scrollY > 140) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Determine active section based on scroll position
      const sectionIds = navLinks.map((l) => l.id);
      let currentActive = 'home';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the section is around or above mid-screen, consider it active
          if (rect.top <= 220 && rect.bottom >= 120) {
            currentActive = id;
            break;
          }
        }
      }
      setActiveSectionId(currentActive);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navLinks]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSectionId('home');
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSectionId(id);
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSectionId('home');
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-3 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] sm:max-w-[90vw] md:max-w-4xl transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-3"
      role="navigation"
      aria-label="Floating section navigation"
    >
      <div className="bg-[#fffdfc]/92 backdrop-blur-md border border-[#ebd0d6] shadow-xl rounded-full px-2 py-1.5 sm:px-3.5 sm:py-2 flex items-center gap-1.5 sm:gap-2.5">
        
        {/* Brand Mini Monogram / Home Button */}
        <button
          type="button"
          onClick={handleScrollToTop}
          className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full text-xs font-bold text-[#5e2632] hover:bg-[#faeaee] transition-all cursor-pointer shrink-0 group border border-transparent hover:border-[#ebd0d6]"
          title="Return to Top"
        >
          {customLogoUrl ? (
            <img
              src={customLogoUrl}
              alt={brandName}
              className="w-5 h-5 rounded-full object-cover border border-[#ebd0d6]"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#9e4c5b] text-white flex items-center justify-center text-[10px] shadow-2xs font-serif font-black">
              T
            </div>
          )}
          <span className="font-serif-display hidden sm:inline text-xs font-bold tracking-tight text-[#4a1c26]">
            {brandName}
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-[#f0d8de] shrink-0 hidden sm:block" />

        {/* Scrollable Nav Options */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {navLinks.map((link) => {
            const isActive = activeSectionId === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 select-none whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#9e4c5b] text-white shadow-xs font-semibold'
                    : 'text-[#5e2632] hover:text-[#9e4c5b] hover:bg-[#faeaee] border border-transparent hover:border-[#ebd0d6]'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Back to Top Quick Glide Button */}
        <button
          type="button"
          onClick={handleScrollToTop}
          className="p-1 sm:p-1.5 rounded-full text-[#7a3b47] hover:text-white hover:bg-[#9e4c5b] transition-all cursor-pointer shrink-0 ml-0.5 border border-[#ebd0d6] hover:border-[#9e4c5b] shadow-2xs"
          title="Glide to top"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
    </div>
  );
};
