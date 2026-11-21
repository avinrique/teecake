export type DishCategory =
  | 'Cakes & TeaCakes'
  | 'Tarts & Macarons'
  | 'Pastries & Viennoiserie'
  | 'Artisan Breads & Cookies'
  | 'Savory'
  | 'Assorted Combo'
  | string;

export interface BakeryItem {
  id: string;
  name: string;
  category: DishCategory;
  price?: string; // Optional, taken out for all dishes as requested
  description: string;
  ingredients: string[];
  image: string;
  featured?: boolean; // true = Signature Dishes (5 dishes)
  inGallery?: boolean; // true = Dishes Gallery (20 dishes)
  dishType?: 'signature' | 'gallery' | 'both';
  order: number;
}

export interface LibraryPhoto {
  id: string;
  title: string;
  category: string;
  url: string;
  isCustom?: boolean;
  addedAt?: number;
}

export interface PageTexts {
  [key: string]: string | undefined;
  brandName?: string;
  brandSubtitle?: string;
  brandLogoSize?: 'sm' | 'md' | 'lg' | 'xl';
  heroEmblem: string;
  heroTitle: string;
  heroHeading?: string;
  heroSubheading: string;
  heroBadge1: string;
  heroBadge2: string;
  heroBadge3: string;
  heroCta1?: string;
  heroCta2?: string;
  signatureHeading: string;
  signatureSubheading: string;
  signatureEmblem: string;
  galleryHeading: string;
  gallerySubheading: string;
  galleryEmblem: string;
  allDishesHeading: string;
  allDishesSubheading: string;
  allDishesEmblem: string;
  quotesHeading: string;
  quotesSubheading: string;
  oliverQuote?: string;
  oliverQuoteAuthor?: string;
  locationHeading: string;
  locationSubheading: string;
  footerMotto?: string;
  footerCopyright?: string;
}

export interface CafeContactDetails {
  name: string;
  domain: string;
  tagline: string;
  subheading: string;
  address: string;
  cityStateZip: string;
  phone: string;
  email: string;
  hours: {
    days: string;
    time: string;
    note?: string;
  }[];
  socials: {
    instagram: string;
    facebook: string;
    pinterest: string;
    tiktok: string;
  };
  pickupNotice: string;
  instagramQrCodeUrl?: string | null;
}

export interface BakingQuote {
  id: string;
  quote: string;
  author: string;
  context?: string;
}

export interface BlossomPreset {
  id: string;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
}

export interface CustomUploadedBackdrop {
  id: string;
  name: string;
  imageUrl: string;
  createdAt?: string;
}

export interface BackdropSettings {
  imageUrl: string;
  presetName?: string;
  locationLabel?: string;
  activeWallpaperId?: string; // ID of the currently displayed wallpaper
  opacity: number; // 0.1 to 0.95
  blur: number; // 0 to 5px
  tint: 'warm-cream' | 'rose-blush' | 'vintage-gold' | 'clear' | 'victorian-sepia';
  backgroundColor?: string; // canvas parchment / solid color hex (default: #faf4ea)
  autoRotate: boolean; // default: false (static permanent background until user explicitly runs slideshow)
  intervalSeconds: number; // default: 10
  fadeDuration?: number; // transition fade duration in ms (default: 2500ms slow cross-dissolve)
  showTempleSilhouettes?: boolean; // toggle Torii gate & Pagoda temple silhouettes
  showPetals?: boolean; // toggle floating flower petals
  showVictorianSilhouettes?: boolean; // toggle Victorian London gas lamps & hearth
  transitionType?: 'crossfade' | 'zoom-fade' | 'gentle' | 'instant';
  customUploadedImages?: CustomUploadedBackdrop[]; // user uploaded background images from computer
  hiddenPresetIds?: string[]; // IDs of presets hidden/deleted by the user
  selectedWallpaperIds?: string[]; // IDs of wallpapers explicitly multi-selected to cycle in the active slideshow loop
  noWallpaperMode?: boolean; // pure Oliver Twist aged parchment paper background
}

export interface QuoteStyleSettings {
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  fontSize: 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  fontFamily: 'serif' | 'cormorant' | 'sans' | 'mono' | 'victorian' | 'cinzel';
  fontStyle: 'italic' | 'normal';
  textColor: string;
  textOpacity: number; // 0.6 to 1.0
  cardTheme: 'classic-light' | 'pure-white' | 'warm-cream' | 'rose-tint' | 'contrast-dark' | 'aged-parchment';
  cardOpacity: number; // 0.7 to 1.0
  textAlign?: 'left' | 'center' | 'right' | 'justify'; // default: 'center'
}

export interface TextFormatSetting {
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  fontSizeStep?: number; // -1 (small), 0 (normal), 1 (large +15%), 2 (extra large +30%), 3 (huge +50%), 4 (+75%)
  italic?: boolean;
  enhanceContrast?: boolean; // gentle text shadow or subtle backdrop for legibility over blossoms
  textAlign?: 'left' | 'center' | 'right'; // default: 'center'
  color?: string; // custom hex color e.g. #9e4c5b
  fontFamily?: 'serif' | 'sans' | 'mono' | 'playfair' | 'cormorant' | 'cursive' | 'victorian' | 'cinzel';
}

export interface SiteTypographySettings {
  globalScale: number; // 1.0, 1.1, 1.2, 1.3, 1.4
  globalWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  headingWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  headingScale: number; // 1.0 to 1.5
  headingAlign?: 'left' | 'center' | 'right'; // default: 'center'
  subheadingWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  subheadingScale: number; // 1.0 to 1.5
  subheadingAlign?: 'left' | 'center' | 'right'; // default: 'center'
  quoteAlign?: 'left' | 'center' | 'right' | 'justify'; // default: 'center'
  bodyWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  bodyScale: number; // 1.0 to 1.5
  enhanceAllContrast: boolean;
  customFormats: Record<string, TextFormatSetting>;
}

export type SectionType =
  | 'hero'
  | 'signature'
  | 'gallery'
  | 'all-dishes'
  | 'quotes'
  | 'location'
  | 'custom';

export interface CustomSectionItem {
  id: string;
  title: string;
  description: string;
  tag?: string;
}

export interface CustomSectionContent {
  heading: string;
  subheading: string;
  badgeText?: string;
  bodyText: string;
  imageUrl?: string;
  imageAlt?: string;
  ctaText?: string;
  ctaLink?: string;
  layout?: 'split-image-right' | 'split-image-left' | 'centered-card' | 'feature-cards';
  items?: CustomSectionItem[];
}

export interface PageSection {
  id: string; // anchor id, e.g. 'signature-menu', 'section-123'
  type: SectionType;
  title: string; // human readable name
  navLabel: string; // label in Header and mobile menu
  showInNav: boolean; // whether shown in navigation bar
  visible: boolean; // whether rendered on page
  order: number;
  customContent?: CustomSectionContent;
}

