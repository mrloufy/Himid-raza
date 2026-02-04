import { SiteContent } from './types';

const defaultSectionStyle = {
  paddingTop: 80,
  paddingBottom: 80,
  backgroundColor: '',
  isDark: false
};

export const INITIAL_CONTENT: SiteContent = {
  general: {
    name: "Hamid Raza",
    logoUrl: "",
    heroGreeting: "Hi I am",
    title: "Amazon KDP Publishing Expert",
    description: "Helping authors publish, optimize, and sell books on Amazon with professional precision. From formatting to launch strategy, I turn your manuscript into a masterpiece.",
    heroImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
    aboutImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800",
    email: "razah3812@gmail.com",
    fiverr: "https://fiverr.com/hamidraza",
    linkedin: "https://linkedin.com/in/hamidraza",
    heroCtaText: "Hire Me",
    heroCtaLink: "#contact",
    brandColor: "#FD6F00",
    secondaryColor: "#111827",
    buttonStyle: 'rounded',
  },
  header: {
    sticky: true,
    layout: 'standard',
    menuItems: [
      { id: 'h1', label: 'Home', href: '#home' },
      { id: 'h2', label: 'About', href: '#about' },
      { id: 'h3', label: 'Services', href: '#services' },
      { id: 'h4', label: 'Categories', href: '#kdpCategories' },
      { id: 'h5', label: 'Portfolio', href: '#portfolio' },
      { id: 'h6', label: 'Testimonials', href: '#testimonials' },
      { id: 'h7', label: 'Contact', href: '#contact' },
    ],
    customHtml: ""
  },
  footer: {
    showSocials: true,
    copyright: "Amazon KDP Specialist. All Rights Reserved.",
    columns: [
      {
        id: 'fcol1',
        title: 'Navigation',
        links: [
          { id: 'fl1', label: 'Home', href: '#home' },
          { id: 'fl2', label: 'About Me', href: '#about' },
          { id: 'fl3', label: 'Services', href: '#services' },
          { id: 'fl4', label: 'Portfolio', href: '#portfolio' },
        ]
      }
    ],
    customHtml: ""
  },
  typography: {
    fontFamilyHeading: "'Poppins', sans-serif",
    fontFamilyBody: "'Inter', sans-serif",
    heroTitle: { fontSize: 72, fontWeight: "700", color: "#111827", textAlign: "left", letterSpacing: -2, lineHeight: 1.1 },
    heroSubtitle: { fontSize: 24, fontWeight: "700", color: "#FD6F00", textAlign: "left", letterSpacing: 0, lineHeight: 1.2 },
    sectionTitle: { fontSize: 48, fontWeight: "700", color: "#111827", textAlign: "center", letterSpacing: -1, lineHeight: 1.2 },
    sectionSubtitle: { fontSize: 16, fontWeight: "400", color: "#4B5563", textAlign: "center", letterSpacing: 0, lineHeight: 1.6 },
    bodyText: { fontSize: 16, fontWeight: "400", color: "#4B5563", textAlign: "left", letterSpacing: 0, lineHeight: 1.6 }
  },
  sectionHeaders: {
    about: { title: "About Me", subtitle: "" },
    services: { title: "Services", subtitle: "Specialized Amazon KDP services tailored to ensure your book stands out." },
    kdpCategories: { title: "KDP Categories", subtitle: "Expertise across all major book categories on Amazon." },
    portfolio: { title: "My Projects", subtitle: "Recent success stories and designs." },
    promotions: { title: "Special Offers", subtitle: "Exclusive deals for new authors." },
    testimonials: { title: "Testimonials", subtitle: "What authors say about my work." },
    contact: { title: "Lets Design Together", subtitle: "Ready to turn your manuscript into a bestseller? Enter your email and let's get started." }
  },
  sectionStyles: {
    home: { ...defaultSectionStyle, paddingTop: 120, paddingBottom: 60 },
    about: { ...defaultSectionStyle },
    services: { ...defaultSectionStyle, backgroundColor: '' },
    kdpCategories: { ...defaultSectionStyle },
    promotions: { ...defaultSectionStyle, backgroundColor: '' },
    portfolio: { ...defaultSectionStyle, backgroundColor: '' },
    testimonials: { ...defaultSectionStyle },
    contact: { ...defaultSectionStyle, backgroundColor: '', paddingTop: 120, paddingBottom: 120 }
  },
  about: {
    content: "I am a dedicated Amazon KDP expert with years of experience helping authors turn their manuscripts into professional, best-selling books. I navigate the complexities of publishing so you can focus on writing.",
    expertises: ["Book Publishing", "Formatting", "Cover Compliance", "KDP Optimization"]
  },
  services: [
    { id: '1', title: "KDP Account Setup", description: "Complete guidance on setting up your KDP account, tax information, and bank details correctly.", iconName: "Settings" },
    { id: '2', title: "Book Formatting", description: "Professional internal layout design for Paperback, Hardcover, and eBook formats.", iconName: "BookOpen" },
    { id: '3', title: "Cover Design Compliance", description: "Ensuring your cover meets Amazon's strict print and digital specifications.", iconName: "Image" },
    { id: '4', title: "Keyword Research", description: "In-depth research to find high-traffic, low-competition keywords to boost visibility.", iconName: "Search" },
    { id: '5', title: "A+ Content Design", description: "Visually stunning A+ content to increase conversion rates on your book's sales page.", iconName: "Layout" },
    { id: '6', title: "Launch Support", description: "Strategic assistance during the upload and launch phase to ensure a smooth release.", iconName: "Rocket" }
  ],
  kdpCategories: [
    { id: 'cat1', title: "Literature and Fiction", description: "Classic and contemporary fiction formatting and layout.", imageUrl: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&q=80&w=800" },
    { id: 'cat2', title: "Children’s Books", description: "Colorful layouts, age-appropriate typography, and illustration handling.", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800" },
    { id: 'cat3', title: "Romance", description: "Captivating designs and formatting for love stories.", imageUrl: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&q=80&w=800" },
    { id: 'cat4', title: "Self Help", description: "Clean and motivational layouts for non-fiction.", imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800" }
  ],
  portfolio: [
    { id: '1', title: "The Silent Ocean", bookType: "Paperback & eBook", category: "Literature and Fiction", description: "Complete formatting and launch support for a mystery novel.", imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800" },
    { id: '2', title: "Path to Wellness", bookType: "Paperback", category: "Self Help", description: "Professional interior formatting and Amazon publishing strategy.", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800" }
  ],
  promotions: [
    { id: 'p1', title: "New Author Bundle", description: "Get 20% off when you book formatting and cover design together.", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800" }
  ],
  testimonials: [
    { id: 't1', clientName: "Sarah Jenkins", role: "Novel Author", content: "Hamid made the publishing process so simple. My book looks amazing on both Kindle and Print!", avatarUrl: "https://i.pravatar.cc/150?u=sarah" }
  ],
  enabledSections: { home: true, about: true, services: true, kdpCategories: true, promotions: true, portfolio: true, testimonials: true, contact: true },
  pageStructure: { home: ['home', 'about', 'services', 'kdpCategories', 'promotions', 'portfolio', 'testimonials', 'contact'] },
  
  customSections: {},

  contactForm: {
    fields: [
      { id: 'f1', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
      { id: 'f2', label: 'Email Address', type: 'email', required: true, placeholder: 'john@example.com' },
      { id: 'f3', label: 'Project Details', type: 'textarea', required: false, placeholder: 'Tell me about your book...' }
    ],
    submitButtonText: "Send Proposal",
    successMessage: "Thank you! I will get back to you within 24 hours.",
    enableSpamProtection: true
  },
  advanced: { seo: { title: "Hamid Raza | Amazon KDP Expert", description: "Professional KDP publishing services for authors worldwide." } },
  adminSettings: { role: 'super_admin', isDraft: true }
};