import React, { useState } from 'react';
import {
  X,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  PlusCircle,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
  Sparkles,
  Link,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { PageSection, CustomSectionContent } from '../types';

interface ManageSectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: PageSection[];
  onMoveSection: (index: number, direction: 'up' | 'down') => void;
  onUpdateSection: (updated: PageSection) => void;
  onDeleteSection: (id: string) => void;
  onAddSection: (newSection: Omit<PageSection, 'id' | 'order'>, insertAfterOrder?: number) => void;
  onResetDefaultSections: () => void;
  insertAfterOrder?: number;
}

export const ManageSectionsModal: React.FC<ManageSectionsModalProps> = ({
  isOpen,
  onClose,
  sections,
  onMoveSection,
  onUpdateSection,
  onDeleteSection,
  onAddSection,
  onResetDefaultSections,
  insertAfterOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'reorder' | 'add' | 'edit'>('reorder');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editNavLabel, setEditNavLabel] = useState('');
  const [editShowInNav, setEditShowInNav] = useState(true);
  const [editCustomContent, setEditCustomContent] = useState<CustomSectionContent>({
    heading: '',
    subheading: '',
    badgeText: '',
    bodyText: '',
    imageUrl: '',
    ctaText: '',
    ctaLink: '',
  });

  // Add new section form state
  const [newTitle, setNewTitle] = useState('');
  const [newNavLabel, setNewNavLabel] = useState('');
  const [newShowInNav, setNewShowInNav] = useState(true);
  const [newTemplate, setNewTemplate] = useState<'story' | 'wedding' | 'tea' | 'reviews' | 'blank'>('tea');
  const [newBadge, setNewBadge] = useState('New Offering');
  const [newHeading, setNewHeading] = useState('Seasonal Afternoon Tea Service');
  const [newSubheading, setNewSubheading] = useState('An exquisite multi-tier floral experience served with rare estate teas.');
  const [newBody, setNewBody] = useState('Join us in our sunlit parlor for three tiers of handmade savory brioche, fresh scones with clotted cream, and delicate seasonal petit fours.');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=1000&auto=format&fit=crop');
  const [newCtaText, setNewCtaText] = useState('Reserve a Table');
  const [newCtaLink, setNewCtaLink] = useState('#location-hours');

  if (!isOpen) return null;

  const handleStartEdit = (sec: PageSection) => {
    setEditingSectionId(sec.id);
    setEditTitle(sec.title);
    setEditNavLabel(sec.navLabel);
    setEditShowInNav(sec.showInNav);
    if (sec.customContent) {
      setEditCustomContent({ ...sec.customContent });
    } else {
      setEditCustomContent({
        heading: sec.title,
        subheading: '',
        badgeText: '',
        bodyText: '',
        imageUrl: '',
        ctaText: '',
        ctaLink: '',
      });
    }
    setActiveTab('edit');
  };

  const handleSaveEdit = () => {
    if (!editingSectionId) return;
    const current = sections.find((s) => s.id === editingSectionId);
    if (!current) return;

    const updated: PageSection = {
      ...current,
      title: editTitle.trim() || current.title,
      navLabel: editNavLabel.trim() || current.navLabel,
      showInNav: editShowInNav,
      customContent: current.type === 'custom' ? editCustomContent : current.customContent,
    };

    onUpdateSection(updated);
    setActiveTab('reorder');
    setEditingSectionId(null);
  };

  const applyTemplate = (tpl: 'story' | 'wedding' | 'tea' | 'reviews' | 'blank') => {
    setNewTemplate(tpl);
    switch (tpl) {
      case 'wedding':
        setNewTitle('Bespoke Wedding & Event Cakes');
        setNewNavLabel('Wedding Cakes');
        setNewBadge('Celebration Artistry');
        setNewHeading('Architectural & Floral Celebration Cakes');
        setNewSubheading('Crafted to be the centerpiece of your most unforgettable milestones.');
        setNewBody('Every celebration cake begins with a private tasting and floral consultation. From hand-sculpted sugar flowers to delicate gold leaf leafing, each layer is freshly baked to order.');
        setNewImageUrl('https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=1000&auto=format&fit=crop');
        setNewCtaText('Inquire for Your Date');
        setNewCtaLink('#location-hours');
        break;
      case 'story':
        setNewTitle('Our Kitchen Heritage & Story');
        setNewNavLabel('Our Story');
        setNewBadge('Artisan Heritage');
        setNewHeading('Baking with Patience, Flora & Tradition');
        setNewSubheading('Founded on centuries of French viennoiserie and botanical pairing.');
        setNewBody('Our founders set out to marry classical Parisian baking techniques with the tranquil beauty of edible botanicals. Each dawn, our kitchen blooms with sourdough starters, fresh European butter, and Madagascar vanilla.');
        setNewImageUrl('https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop');
        setNewCtaText('Visit Our Bakery');
        setNewCtaLink('#location-hours');
        break;
      case 'reviews':
        setNewTitle('Guest Praise & Press Features');
        setNewNavLabel('Guest Reviews');
        setNewBadge('Accolades & Love');
        setNewHeading('What Our Connoisseurs Say');
        setNewSubheading('Loved by pastry enthusiasts and travelers from around the world.');
        setNewBody('“The finest croissant and floral teacakes west of Paris. Stepping inside TeeCake Creations is an escape into calm, golden sweetness.” — San Francisco Chronicle & Gourmet Traveler');
        setNewImageUrl('https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop');
        setNewCtaText('See Location & Hours');
        setNewCtaLink('#location-hours');
        break;
      case 'blank':
        setNewTitle('Custom Showcase Section');
        setNewNavLabel('Custom Section');
        setNewBadge('Special Showcase');
        setNewHeading('New Bakery Feature');
        setNewSubheading('Describe your custom announcement, catering, or new collection here.');
        setNewBody('Add detailed description, ingredients, or story about your bakery.');
        setNewImageUrl('https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop');
        setNewCtaText('Learn More');
        setNewCtaLink('#location-hours');
        break;
      case 'tea':
      default:
        setNewTitle('Seasonal Afternoon Tea Service');
        setNewNavLabel('Afternoon Tea');
        setNewBadge('Parlor Experience');
        setNewHeading('Seasonal Afternoon Tea Service');
        setNewSubheading('An exquisite multi-tier floral experience served with rare estate teas.');
        setNewBody('Join us in our sunlit parlor for three tiers of handmade savory brioche, fresh scones with clotted cream, and delicate seasonal petit fours.');
        setNewImageUrl('https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=1000&auto=format&fit=crop');
        setNewCtaText('Reserve a Table');
        setNewCtaLink('#location-hours');
        break;
    }
  };

  const handleCreateNewSection = () => {
    const slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `section-${Date.now()}`;

    const newSection: Omit<PageSection, 'id' | 'order'> = {
      type: 'custom',
      title: newTitle || 'Custom Section',
      navLabel: newNavLabel || newTitle || 'New Section',
      showInNav: newShowInNav,
      visible: true,
      customContent: {
        heading: newHeading,
        subheading: newSubheading,
        badgeText: newBadge,
        bodyText: newBody,
        imageUrl: newImageUrl,
        ctaText: newCtaText,
        ctaLink: newCtaLink,
        layout: 'split-image-right',
      },
    };

    onAddSection(newSection, insertAfterOrder);
    setActiveTab('reorder');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fffdfb] rounded-2xl shadow-2xl border border-[#ebd0d6] w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ebd0d6] bg-[#faeaee]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#9e4c5b] text-white rounded-lg shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl font-bold text-[#4a1c26]">
                Page Sections & Navigation Manager
              </h2>
              <p className="text-xs text-[#6e3943]">
                Swap section positions, edit titles, create new sections, and automatically sync navigation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-white border-b border-stone-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('reorder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                activeTab === 'reorder'
                  ? 'bg-[#9e4c5b] text-white shadow-2xs'
                  : 'text-[#6e3943] hover:bg-[#faeaee]'
              }`}
            >
              📑 Reorder & Manage Sections ({sections.length})
            </button>
            <button
              onClick={() => {
                applyTemplate('tea');
                setActiveTab('add');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                activeTab === 'add'
                  ? 'bg-[#9e4c5b] text-white shadow-2xs'
                  : 'text-[#6e3943] hover:bg-[#faeaee]'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" /> + Create New Section
            </button>
          </div>

          <button
            onClick={onResetDefaultSections}
            className="inline-flex items-center gap-1 text-[11px] text-[#9e4c5b] hover:text-[#783944] font-semibold cursor-pointer"
            title="Reset sections to default order"
          >
            <RotateCcw className="w-3 h-3" /> Reset Defaults
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: REORDER & MANAGE */}
          {activeTab === 'reorder' && (
            <div>
              <div className="bg-[#fcf3f5] border border-[#ebd0d6] rounded-xl p-3 text-xs text-[#7a3b47] mb-4 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#c99750] shrink-0" />
                  <span>
                    Use <strong>Move Up</strong> and <strong>Move Down</strong> to swap sections. The Header Navigation links update immediately!
                  </span>
                </span>
                <span className="text-[11px] font-mono opacity-80">
                  {sections.filter((s) => s.visible).length} visible
                </span>
              </div>

              <div className="space-y-2.5">
                {sections.map((sec, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === sections.length - 1;

                  return (
                    <div
                      key={sec.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        sec.visible
                          ? 'bg-white border-[#ebd0d6] hover:border-[#dfaeb9] shadow-2xs'
                          : 'bg-stone-50 border-stone-200 opacity-60'
                      }`}
                    >
                      {/* Left info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-[#fcedf0] text-[#8b3d4d] flex items-center justify-center font-mono text-xs font-bold shrink-0">
                          {idx + 1}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-[#4a1c26] truncate">
                              {sec.title}
                            </h4>
                            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-stone-100 text-stone-600 border border-stone-200 uppercase">
                              {sec.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                            <span>
                              Nav link: <strong>&ldquo;{sec.navLabel}&rdquo;</strong>
                            </span>
                            {sec.showInNav ? (
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px] font-semibold">
                                ✓ in nav
                              </span>
                            ) : (
                              <span className="text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded text-[10px]">
                                hidden from nav
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right controls: Up, Down, Edit, Toggle, Delete */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onMoveSection(idx, 'up')}
                          disabled={isFirst}
                          className={`p-1.5 rounded-lg border text-stone-700 transition-colors cursor-pointer ${
                            isFirst
                              ? 'opacity-25 border-stone-200 cursor-not-allowed'
                              : 'hover:bg-[#faeaee] border-stone-200 hover:border-[#e8c0c8] hover:text-[#9e4c5b]'
                          }`}
                          title="Move section UP"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onMoveSection(idx, 'down')}
                          disabled={isLast}
                          className={`p-1.5 rounded-lg border text-stone-700 transition-colors cursor-pointer ${
                            isLast
                              ? 'opacity-25 border-stone-200 cursor-not-allowed'
                              : 'hover:bg-[#faeaee] border-stone-200 hover:border-[#e8c0c8] hover:text-[#9e4c5b]'
                          }`}
                          title="Move section DOWN"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleStartEdit(sec)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-[#faeaee] hover:border-[#e8c0c8] text-stone-700 hover:text-[#9e4c5b] transition-colors cursor-pointer"
                          title="Edit section title and navigation label"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            onUpdateSection({
                              ...sec,
                              visible: !sec.visible,
                            })
                          }
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            sec.visible
                              ? 'border-stone-200 hover:bg-stone-100 text-stone-600'
                              : 'border-stone-200 bg-stone-200 text-stone-400'
                          }`}
                          title={sec.visible ? 'Hide section from page' : 'Show section on page'}
                        >
                          {sec.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        {sections.length > 1 && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete the "${sec.title}" section from the website?`)) {
                                onDeleteSection(sec.id);
                              }
                            }}
                            className="p-1.5 rounded-lg border border-stone-200 hover:bg-red-50 hover:border-red-200 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete this section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CREATE NEW SECTION */}
          {activeTab === 'add' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5e2632] mb-2">
                  Choose a Pre-Configured Section Template:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'tea', label: '☕ Afternoon Tea' },
                    { id: 'wedding', label: '🎂 Wedding Cakes' },
                    { id: 'story', label: '📖 Artisan Story' },
                    { id: 'reviews', label: '⭐ Guest Reviews' },
                    { id: 'blank', label: '✨ Blank Section' },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => applyTemplate(tpl.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        newTemplate === tpl.id
                          ? 'bg-[#9e4c5b] text-white border-[#853c49] shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-[#faeaee]'
                      }`}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Section Name / Internal Title *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Afternoon Tea Parlor"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Navigation Menu Label * (Appears in Header Navbar)
                  </label>
                  <input
                    type="text"
                    value={newNavLabel}
                    onChange={(e) => setNewNavLabel(e.target.value)}
                    placeholder="e.g. Afternoon Tea"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#e0c2c8] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#9e4c5b]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newShowInNav"
                  checked={newShowInNav}
                  onChange={(e) => setNewShowInNav(e.target.checked)}
                  className="rounded text-[#9e4c5b] focus:ring-[#9e4c5b]"
                />
                <label htmlFor="newShowInNav" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  Show link for this section in the Header navigation bar
                </label>
              </div>

              <div className="pt-3 border-t border-stone-200 space-y-3">
                <h5 className="font-serif-display font-bold text-sm text-[#4a1c26]">
                  Section Display Content
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={newBadge}
                      onChange={(e) => setNewBadge(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Headline Heading *
                    </label>
                    <input
                      type="text"
                      value={newHeading}
                      onChange={(e) => setNewHeading(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Subheading / Tagline
                  </label>
                  <input
                    type="text"
                    value={newSubheading}
                    onChange={(e) => setNewSubheading(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Body Paragraph Content
                  </label>
                  <textarea
                    rows={3}
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#e0c2c8] rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Button CTA Label
                    </label>
                    <input
                      type="text"
                      value={newCtaText}
                      onChange={(e) => setNewCtaText(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Photo Image URL
                    </label>
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('reorder')}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewSection}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#9e4c5b] hover:bg-[#853c49] cursor-pointer shadow-xs"
                >
                  Create & Insert Section
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: EDIT SECTION */}
          {activeTab === 'edit' && editingSectionId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h4 className="font-serif-display font-bold text-base text-[#4a1c26]">
                  Edit Section Settings: {editTitle}
                </h4>
                <button
                  onClick={() => setActiveTab('reorder')}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  ← Back to List
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#e0c2c8] rounded-lg focus:ring-2 focus:ring-[#9e4c5b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Navigation Bar Label * (Appears in Header)
                  </label>
                  <input
                    type="text"
                    value={editNavLabel}
                    onChange={(e) => setEditNavLabel(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#e0c2c8] rounded-lg focus:ring-2 focus:ring-[#9e4c5b]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editShowInNav"
                  checked={editShowInNav}
                  onChange={(e) => setEditShowInNav(e.target.checked)}
                  className="rounded text-[#9e4c5b] focus:ring-[#9e4c5b]"
                />
                <label htmlFor="editShowInNav" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  Show link for this section in the Header navigation bar
                </label>
              </div>

              {/* If it is a custom section, also allow editing content */}
              {sections.find((s) => s.id === editingSectionId)?.type === 'custom' && (
                <div className="pt-3 border-t border-stone-200 space-y-3">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#7a3b47]">
                    Custom Section Content
                  </h5>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Main Heading
                    </label>
                    <input
                      type="text"
                      value={editCustomContent.heading}
                      onChange={(e) =>
                        setEditCustomContent({
                          ...editCustomContent,
                          heading: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Subheading
                    </label>
                    <input
                      type="text"
                      value={editCustomContent.subheading}
                      onChange={(e) =>
                        setEditCustomContent({
                          ...editCustomContent,
                          subheading: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Body Text
                    </label>
                    <textarea
                      rows={3}
                      value={editCustomContent.bodyText}
                      onChange={(e) =>
                        setEditCustomContent({
                          ...editCustomContent,
                          bodyText: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={editCustomContent.imageUrl || ''}
                      onChange={(e) =>
                        setEditCustomContent({
                          ...editCustomContent,
                          imageUrl: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#e0c2c8] rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('reorder')}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#9e4c5b] hover:bg-[#853c49] cursor-pointer shadow-xs"
                >
                  Save Section Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
