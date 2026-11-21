import React from 'react';
import {
  Clock,
  Phone,
  Mail,
  Edit2,
  Sparkles,
  ShoppingBag,
  Heart,
  MessageCircle,
  Instagram,
  QrCode,
} from 'lucide-react';
import { CafeContactDetails, PageTexts } from '../types';
import { EditableText } from './EditableText';

interface LocationAndHoursProps {
  contact: CafeContactDetails;
  onOpenEditModal: () => void;
  pageTexts?: PageTexts;
  onUpdatePageText?: (field: keyof PageTexts, value: string) => void;
}

export const LocationAndHours: React.FC<LocationAndHoursProps> = ({
  contact,
  onOpenEditModal,
  pageTexts,
  onUpdatePageText,
}) => {
  const heading = pageTexts?.locationHeading || 'Contact & Custom Orders';
  const subheading =
    pageTexts?.locationSubheading ||
    'Handcrafted fresh to order from our home kitchen atelier in Newcastle upon Tyne. Connect with us for custom celebration cakes and small-batch morning treats.';

  return (
    <section id="location-hours" className="py-14 md:py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fcedf0] border border-[#e8c0c8] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#9e4c5b]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#7a3b47]">
              Home Kitchen Atelier & Custom Bakes
            </span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#4a1c26] tracking-tight mb-3 text-center flex flex-col items-center justify-center">
            <EditableText
              value={heading}
              onSave={(val) => onUpdatePageText?.('locationHeading', val)}
              textKey="locationHeading"
              label="Contact Section Title"
              as="span"
              defaultAlign="center"
              className="text-center"
            />
          </h2>
          <div className="font-serif-subtle italic text-base sm:text-lg text-[#6f404b] leading-relaxed text-center flex flex-col items-center justify-center">
            <EditableText
              value={subheading}
              onSave={(val) => onUpdatePageText?.('locationSubheading', val)}
              textKey="locationSubheading"
              label="Contact Section Subtitle"
              multiline
              as="span"
              defaultAlign="center"
              className="text-center"
            />
          </div>

          <div className="mt-3">
            <button
              onClick={onOpenEditModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#8b3d4d] bg-white/90 border border-[#e8c0c8] rounded-full hover:bg-[#fff0f3] cursor-pointer shadow-2xs transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Contact Number, Email & Hours
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          
          {/* Left Column: Direct Inquiries (Phone & Email) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Direct Contact Card */}
            <div className="bg-[#fffdfb]/95 border border-[#edd7dd] rounded-2xl p-6 sm:p-7 shadow-sm backdrop-blur-xs">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#f2dbe0]">
                <div className="p-2.5 bg-[#fae6ea] text-[#9e4c5b] rounded-xl">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-display text-xl font-bold text-[#4a1c26]">
                    Direct Inquiries & Orders
                  </h3>
                  <span className="text-xs text-stone-500">Call, WhatsApp or Email Us</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Phone & WhatsApp */}
                <div className="p-3.5 bg-[#fdf5f7] border border-[#f3d3dc] rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-[#9e4c5b] shadow-2xs">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-[#8a5762] uppercase tracking-wider block">
                        Contact / WhatsApp Number
                      </span>
                      <a
                        href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                        className="text-base font-bold text-[#4a1c26] hover:text-[#9e4c5b] transition-colors"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                  <a
                    href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                    className="px-3 py-1 bg-[#9e4c5b] text-white text-xs font-semibold rounded-full hover:bg-[#853c49] transition-colors shrink-0"
                  >
                    Call Now
                  </a>
                </div>

                {/* Email Address */}
                <div className="p-3.5 bg-[#fdf5f7] border border-[#f3d3dc] rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-[#9e4c5b] shadow-2xs">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-[#8a5762] uppercase tracking-wider block">
                        Direct Email
                      </span>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-sm font-semibold text-[#4a1c26] hover:text-[#9e4c5b] transition-colors break-all"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </div>
                  <a
                    href={`mailto:${contact.email}`}
                    className="px-3 py-1 bg-white border border-[#e8c0c8] text-[#8b3d4d] text-xs font-semibold rounded-full hover:bg-[#faeaee] transition-colors shrink-0"
                  >
                    Send Email
                  </a>
                </div>

                {/* Instagram & QR Code Quick Banner */}
                <div className="pt-2">
                  <a
                    href="#footer-instagram"
                    onClick={(e) => {
                      const el = document.getElementById('footer-instagram');
                      if (el) {
                        e.preventDefault();
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#fcf0f3] to-[#fae6ea] border border-[#ebd0d6] hover:border-[#9e4c5b] hover:shadow-2xs transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-white text-[#9e4c5b] rounded-lg group-hover:scale-105 transition-transform">
                        <Instagram className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#4a1c26] block">
                          Follow on Instagram
                        </span>
                        <span className="text-[11px] text-[#80505a]">
                          {contact.socials?.instagram || '@TeeCake_Creations'}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9e4c5b] bg-white px-2.5 py-1 rounded-full border border-[#ebd0d6]">
                      <QrCode className="w-3.5 h-3.5 text-[#9e4c5b]" /> Scan QR Code &darr;
                    </span>
                  </a>
                </div>

                {/* Home Bakehouse note */}
                <div className="flex items-start gap-2.5 pt-2 text-xs text-[#704852] leading-relaxed">
                  <Heart className="w-4 h-4 text-[#c99750] shrink-0 mt-0.5" />
                  <span>
                    Crafted from our artisanal home kitchen atelier in <strong>Newcastle upon Tyne</strong>. All bakes are made to order in small batches with advance reservation.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Inquiries Hours & Pre-Order Policy */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Opening Hours Card */}
            <div className="bg-[#fffdfb]/95 border border-[#edd7dd] rounded-2xl p-6 sm:p-7 shadow-sm backdrop-blur-xs">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#f2dbe0]">
                <div className="p-2.5 bg-[#fae6ea] text-[#9e4c5b] rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-display text-xl font-bold text-[#4a1c26]">
                    Order & Inquiries Schedule
                  </h3>
                  <span className="text-xs text-stone-500">Fresh bakes scheduled by order</span>
                </div>
              </div>

              <div className="space-y-4">
                {contact.hours.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-dashed border-[#f2dbe0] last:border-b-0 last:pb-0 gap-1"
                  >
                    <div>
                      <span className="font-medium text-sm text-[#4a1c26] block">
                        {h.days}
                      </span>
                      {h.note && (
                        <span className="text-[11px] text-[#8a5762]">
                          {h.note}
                        </span>
                      )}
                    </div>
                    <span className="font-serif-display font-semibold text-sm text-[#854522]">
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Pre-Orders & Pickup Policy */}
            <div className="bg-[#fcf5f1]/95 border border-[#eed4c8] rounded-2xl p-6 shadow-sm backdrop-blur-xs">
              <div className="flex items-center gap-2.5 text-[#854522] mb-2 font-serif-display font-semibold text-base">
                <ShoppingBag className="w-4 h-4 text-[#c99750]" /> Pre-Orders & Collection Notice
              </div>
              <p className="text-xs text-[#6f4b3d] leading-relaxed mb-4">
                {contact.pickupNotice}
              </p>
              <div className="pt-3 border-t border-[#f0ded5] flex items-center justify-between">
                <span className="text-xs font-medium text-[#854522]">Have a custom cake inquiry?</span>
                <a
                  href={`mailto:${contact.email}?subject=Custom%20Cake%20Inquiry%20-%20TeeCake%20Creations`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#9e4c5b] text-white hover:bg-[#853c49] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Inquire via Email
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
