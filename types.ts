

export type AdminRole = 'super_admin' | 'editor' | 'viewer';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  label: string;
  content: string; // JSON string of SiteContent
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'tel' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select type
}

export interface SectionStyle {
  paddingTop: number;
  paddingBottom: number;
  backgroundColor?: string;
  isDark?: boolean;
  spacingUnit?: 'px' | 'rem' | 'vh';
}

export interface TypographyStyle {
  fontSize: number;
  fontWeight: string | number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  letterSpacing: number;
  lineHeight: number;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: NavLink[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface KdpCategory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface Project {
  id: string;
  title: string;
  bookType: string;
  description: string;
  imageUrl: string;
  category: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  content: string;
  role: string;
  avatarUrl?: string;
}

// --- NEW BUILDER TYPES ---

export type BuilderElementType = 'section' | 'container' | 'row' | 'column' | 'text' | 'heading' | 'image' | 'button' | 'icon' | 'card' | 'divider' | 'spacer';

export interface BuilderStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  color?: string;
  padding?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  margin?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  width?: string;
  maxWidth?: string;
  minWidth?: string;
  height?: string;
  minHeight?: string;
  borderRadius?: string;
  border?: string;
  borderTop?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRight?: string;
  boxShadow?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  display?: 'flex' | 'block' | 'grid' | 'none' | 'inline-block';
  flexDirection?: 'row' | 'column';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  gap?: string;
  gridTemplateColumns?: string;
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  flex?: string;
}

export interface BuilderElement {
  id: string;
  type: BuilderElementType;
  name?: string; // Display name in tree
  content?: string; // Text content or Image URL
  style: BuilderStyle;
  children?: BuilderElement[];
  props?: Record<string, any>; // Extra props like href, iconName etc.
}

// -------------------------

export interface SiteContent {
  general: {
    name: string;
    logoUrl?: string;
    heroGreeting?: string;
    title: string;
    description: string;
    heroImage: string;
    aboutImage?: string;
    email: string;
    phone?: string;
    linkedin?: string;
    fiverr?: string;
    heroCtaText?: string;
    heroCtaLink?: string;
    brandColor?: string;
    secondaryColor?: string;
    buttonStyle?: 'rounded' | 'square' | 'pill';
  };
  header: {
    sticky: boolean;
    menuItems: NavLink[];
    customHtml?: string;
    layout: 'standard' | 'centered';
  };
  footer: {
    columns: FooterColumn[];
    copyright: string;
    customHtml?: string;
    showSocials: boolean;
  };
  typography: {
    heroTitle: TypographyStyle;
    heroSubtitle: TypographyStyle;
    sectionTitle: TypographyStyle;
    sectionSubtitle: TypographyStyle;
    bodyText: TypographyStyle;
    fontFamilyHeading: string;
    fontFamilyBody: string;
  };
  sectionHeaders: Record<string, { title: string; subtitle: string }>;
  sectionStyles: Record<string, SectionStyle>;
  about: { content: string; expertises: string[] };
  services: Service[];
  kdpCategories: KdpCategory[];
  portfolio: Project[];
  promotions: Promotion[];
  testimonials: Testimonial[];
  enabledSections: Record<string, boolean>;
  
  // Updated Structure
  pageStructure: { home: string[] };
  
  // New: Custom Builder Sections
  customSections: Record<string, BuilderElement>; 

  contactForm: {
    fields: FormField[];
    submitButtonText: string;
    successMessage: string;
    enableSpamProtection: boolean;
  };
  advanced: {
    customCss?: string;
    headHtml?: string;
    seo: { title: string; description: string };
  };
  adminSettings: {
    role: AdminRole;
    isDraft: boolean;
    lastPublishedAt?: number;
  };
}