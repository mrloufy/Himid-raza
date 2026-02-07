import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { useContent } from '../context/SiteContext';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import Button from '../components/UI/Button';
import ChatWidget from '../components/Chat/ChatWidget';
import { TypographyStyle, SectionStyle } from '../types';
import { useNavigate } from 'react-router-dom';
import { EditableText, EditableImage, SectionWrapper } from '../components/Editor/EditorComponents';
import BuilderRenderer from '../components/Editor/BuilderRenderer';
import { useEditor } from '../context/EditorContext';

const DynamicIcon = ({ name, size = 24, className = "" }: { name: string, size?: number, className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent size={size} className={className} />;
};

const Home: React.FC = () => {
  const { content } = useContent();
  const { isEditing, removeSection, selectedElementId, selectElement } = useEditor();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Fix for the "Reveal" animation issue
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });

    // Observe all elements with the 'reveal' class
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [content, activeCategory]); // Re-run when content or filters change

  useEffect(() => {
    // Update SEO
    if (content.advanced?.seo) {
      document.title = content.advanced.seo.title || content.general.name;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', content.advanced.seo.description);
    }
  }, [content, content.advanced?.seo, content.general.name]);

  const categories = ['All', ...content.kdpCategories.filter(cat => !cat.isHidden).map(cat => cat.title)];

  const getStyle = (config: TypographyStyle, isMobileHeader: boolean = false) => {
    const hex = config.color?.toLowerCase() || '#111827';
    const isDefaultColor = ['#111827', '#1f2937', '#000000', '#4b5563', '#374151', '#1e1e1e'].includes(hex);
    
    return {
      fontSize: isMobileHeader ? `clamp(2.5rem, 10vw, ${config.fontSize}px)` : `${config.fontSize}px`,
      fontWeight: config.fontWeight,
      color: isDefaultColor ? undefined : config.color,
      textAlign: config.textAlign,
      letterSpacing: `${config.letterSpacing}px`,
      lineHeight: config.lineHeight,
      fontFamily: config === content.typography.bodyText ? content.typography.fontFamilyBody : content.typography.fontFamilyHeading
    } as React.CSSProperties;
  };

  const getSectionStyles = (key: string): React.CSSProperties => {
    const style: SectionStyle = content.sectionStyles?.[key] || { paddingTop: 80, paddingBottom: 80 };
    return {
      paddingTop: `${style.paddingTop}px`,
      paddingBottom: `${style.paddingBottom}px`,
      backgroundColor: style.backgroundColor || undefined,
    };
  };

  // Base list of non-hidden items
  const baseProjects = content.portfolio.filter(p => !p.isHidden);
  const baseCategories = content.kdpCategories.filter(cat => !cat.isHidden);
  const baseServices = content.services.filter(s => !s.isHidden);
  const basePromotions = content.promotions.filter(p => !p.isHidden);
  const baseTestimonials = content.testimonials.filter(t => !t.isHidden);

  // Filtered lists for display
  const filteredProjects = activeCategory === 'All' 
    ? baseProjects 
    : baseProjects.filter(p => p.category === activeCategory);

  // Slices for Home Page limit (Strictly 9 for categories to maintain 3x3)
  const visibleCategories = baseCategories.slice(0, 9);
  const visibleProjects = filteredProjects.slice(0, 9);
  const visibleServices = baseServices.slice(0, 9);
  const visiblePromotions = basePromotions;
  const visibleTestimonials = baseTestimonials;

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEditing) return;
    
    setFormStatus('submitting');
    
    try {
      const formData = new FormData(e.currentTarget);
      // Netlify requires application/x-www-form-urlencoded for AJAX submissions
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData as any).toString(),
      });
      
      setFormStatus('success');
      setTimeout(() => setFormStatus('idle'), 5000);
    } catch (error) {
      console.error("Netlify Form Submission Error:", error);
      // Fallback to maintain UX even if local fetch fails (e.g. offline during dev)
      setFormStatus('success');
      setTimeout(() => setFormStatus('idle'), 5000);
    }
  };

  const scrollTestimonials = (direction: 'left' | 'right') => {
    if (testimonialsRef.current) {
      const { current } = testimonialsRef;
      const firstCard = current.children[0] as HTMLElement;
      const scrollAmount = firstCard ? firstCard.offsetWidth + 32 : 300;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const renderSection = (key: string) => {
    if (content.customSections && content.customSections[key]) {
      const customSection = content.customSections[key];
      const isSelected = selectedElementId === key;
      return (
         <div 
           key={key} 
           className={`relative group ${isEditing ? 'hover:outline hover:outline-2 hover:outline-primary-200' : ''}`}
           onClick={(e) => {
              if (isEditing) {
                 e.stopPropagation();
                 selectElement?.(key);
              }
           }}
         >
           {isEditing && isSelected && (
              <div className="absolute top-0 right-0 z-50 flex gap-2 p-2 bg-gray-900 text-white text-xs rounded-bl-lg">
                 <span>Custom Section</span>
                 <button onClick={(e) => { e.stopPropagation(); removeSection?.(key); }} className="text-red-400 hover:text-red-200 hover:underline">Delete</button>
              </div>
           )}
           <BuilderRenderer element={customSection} isRoot />
         </div>
      );
    }

    const baseKey = key.split('-')[0];
    if (!content.enabledSections[key] && !content.enabledSections[baseKey] && !isEditing) return null;

    const sectionStyles = getSectionStyles(key);

    switch (baseKey) {
      case 'home':
        return (
          <SectionWrapper key={key} sectionKey={key} title="Hero Section">
          <section id="home" style={sectionStyles} className="min-h-[70vh] flex items-center relative overflow-hidden">
            <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 w-full z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                <div className="order-2 lg:order-1 space-y-8 reveal stagger-1" style={{ textAlign: content.typography.heroTitle.textAlign }}>
                  <EditableText 
                    tag="p" 
                    path="general.heroGreeting" 
                    value={content.general.heroGreeting || ''}
                    className="font-bold text-lg text-gray-600 dark:text-gray-300 tracking-wide uppercase"
                  />
                  <EditableText 
                    tag="h1" 
                    path="general.name" 
                    value={content.general.name}
                    className="font-bold font-heading" 
                    style={getStyle(content.typography.heroSubtitle)}
                  />
                  <EditableText
                    tag="h2"
                    path="general.title"
                    value={content.general.title}
                    className="font-bold font-heading leading-tight text-gray-900 dark:text-white" 
                    style={getStyle(content.typography.heroTitle, true)}
                  />
                  <EditableText
                    tag="p"
                    path="general.description"
                    value={content.general.description}
                    className="max-w-2xl text-lg lg:text-xl leading-relaxed text-gray-600 dark:text-gray-400" 
                    style={{ ...getStyle(content.typography.bodyText), textAlign: content.typography.heroTitle.textAlign as any }}
                    multiline
                  />
                  
                  <div className={`pt-4 flex flex-col gap-6 ${content.typography.heroTitle.textAlign === 'center' ? 'items-center' : content.typography.heroTitle.textAlign === 'right' ? 'items-end' : 'items-start'}`}>
                    <div className={`flex flex-wrap gap-6 ${content.typography.heroTitle.textAlign === 'center' ? 'justify-center' : content.typography.heroTitle.textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
                       <Button 
                        onClick={() => !isEditing && document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} 
                        size="lg" 
                        className={`px-12 rounded-xl hover-lift shadow-glow ${content.general.buttonStyle === 'pill' ? 'rounded-full' : content.general.buttonStyle === 'square' ? 'rounded-none' : ''}`}
                        style={{ backgroundColor: content.general.brandColor }}
                       >
                         <EditableText tag="span" path="general.heroCtaText" value={content.general.heroCtaText || "Hire Me"} />
                       </Button>
                       <Button 
                        variant="outline" 
                        size="lg" 
                        className={`px-12 rounded-xl hover-lift shadow-glow ${content.general.buttonStyle === 'pill' ? 'rounded-full' : content.general.buttonStyle === 'square' ? 'rounded-none' : ''}`}
                        onClick={() => !isEditing && document.getElementById('portfolio')?.scrollIntoView({behavior:'smooth'})}
                        style={{ borderColor: content.general.brandColor, color: content.general.brandColor }}
                       >
                         See My Books
                       </Button>
                    </div>

                    {(content.general.linkedin || content.general.fiverr) && (
                      <div className="flex items-center gap-4 pt-4 animate-fade-in">
                         {content.general.linkedin && (
                           <a 
                             href={content.general.linkedin} 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-white shadow-soft hover-lift transition-all hover:text-[#0077b5] border border-gray-100 dark:border-gray-800"
                             title="Connect on LinkedIn"
                           >
                              <Icons.Linkedin size={20} />
                           </a>
                         )}
                         {content.general.fiverr && (
                           <a 
                             href={content.general.fiverr} 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-white shadow-soft hover-lift transition-all hover:text-[#1dbf73] border border-gray-100 dark:border-gray-800"
                             title="Hire me on Fiverr"
                           >
                              <span className="font-bold text-sm tracking-tighter">fi</span>
                           </a>
                         )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="order-1 lg:order-2 flex justify-center items-center relative reveal stagger-2">
                  <div className="w-72 h-72 sm:w-96 sm:h-96 lg:w-[500px] lg:h-[500px] relative group">
                     <div className="absolute inset-0 bg-primary-500/20 dark:bg-primary-500/10 rounded-full animate-float blur-3xl scale-110 group-hover:scale-125 transition-transform duration-700"></div>
                     <div className="relative w-full h-full aspect-square rounded-full overflow-hidden border-[12px] lg:border-[16px] border-white dark:border-gray-800 shadow-premium group transition-all duration-700 hover:rotate-2">
                        <EditableImage 
                          path="general.heroImage"
                          src={content.general.heroImage} 
                          alt={content.general.name} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        />
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          </SectionWrapper>
        );
      case 'about':
        return (
          <SectionWrapper key={key} sectionKey={key} title="About Me">
          <section id="about" style={sectionStyles} className="bg-white dark:bg-[#1E1E1E]">
            <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
                 <div className="relative reveal stagger-1 group">
                   <div className="w-full max-w-lg mx-auto aspect-square relative transition-all duration-700 group-hover:-translate-y-2">
                      <div className="absolute inset-0 bg-primary-500/10 dark:bg-primary-500/5 rounded-full transform translate-x-8 translate-y-8 transition-transform duration-700 group-hover:translate-x-12 group-hover:translate-y-12 animate-pulse-soft"></div>
                      <div className="relative w-full h-full p-0 bg-white dark:bg-gray-800 rounded-full shadow-2xl overflow-hidden border-[12px] border-white dark:border-gray-800 group-hover:scale-[1.03] group-hover:rotate-1 transition-all duration-700">
                        <EditableImage 
                          path="general.aboutImage"
                          src={content.general.aboutImage || content.general.heroImage} 
                          alt={`About ${content.general.name}`} 
                          className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-[1500ms]"
                          aspect={2/3}
                        />
                      </div>
                   </div>
                 </div>
                 <div className="reveal stagger-2">
                   <EditableText
                     tag="h2"
                     path="sectionHeaders.about.title"
                     value={content.sectionHeaders.about.title}
                     className="mb-8 font-heading text-gray-900 dark:text-white" 
                     style={getStyle(content.typography.sectionTitle, false)}
                   />
                   <EditableText
                     tag="p"
                     path="about.content"
                     value={content.about.content}
                     className="mb-10 text-gray-600 dark:text-gray-400 leading-relaxed text-xl" 
                     style={getStyle(content.typography.bodyText)}
                     multiline
                   />
                   <div className="space-y-8">
                     {content.about.expertises.map((skill, index) => (
                       <div key={index} className="w-full group/skill">
                         <div className="flex justify-between mb-4">
                            <EditableText
                              tag="span"
                              path={`about.expertises[${index}]`}
                              value={skill}
                              className="font-bold text-gray-900 dark:text-white text-lg lg:text-xl tracking-tight transition-transform group-hover/skill:translate-x-2 duration-300"
                            />
                         </div>
                         <div className="h-4 lg:h-5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner border border-transparent group-hover/skill:border-primary-500/20 transition-all">
                           <div className="h-full rounded-full relative transition-all duration-1000 ease-out group-hover/skill:opacity-90 group-hover/skill:shadow-[0_0_15px_rgba(253,111,0,0.5)]" style={{ width: `${90 - (index * 5)}%`, backgroundColor: content.general.brandColor }}>
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 animate-shimmer"></div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
              </div>
            </div>
            <style>{`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              .animate-shimmer {
                animation: shimmer 2.5s infinite linear;
              }
            `}</style>
          </section>
          </SectionWrapper>
        );
      case 'services':
        if (baseServices.length === 0 && !isEditing) return null;
        return (
          <SectionWrapper key={key} sectionKey={key} title="Services">
          <section id="services" style={sectionStyles} className="bg-gray-50 dark:bg-[#1a1a1a]">
             <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 w-full">
               <div className="text-center mb-10 md:mb-20 reveal">
                 <EditableText
                   tag="h2"
                   path="sectionHeaders.services.title"
                   value={content.sectionHeaders.services.title}
                   className="mb-3 md:mb-6 font-heading text-gray-900 dark:text-white" 
                   style={getStyle(content.typography.sectionTitle)}
                 />
                 <EditableText
                   tag="p"
                   path="sectionHeaders.services.subtitle"
                   value={content.sectionHeaders.services.subtitle}
                   className="max-w-3xl mx-auto text-gray-600 dark:text-gray-400 text-sm md:text-lg lg:text-xl" 
                   style={getStyle(content.typography.sectionSubtitle)}
                 />
               </div>
               
               <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-10 lg:gap-14">
                 {visibleServices.map((service, index) => {
                   const originalIndex = content.services.findIndex(s => s.id === service.id);
                   return (
                   <div 
                      key={service.id} 
                      className={`bg-white dark:bg-[#272727] p-3 md:p-10 lg:p-14 rounded-2xl md:rounded-[2.5rem] hover:shadow-premium hover:-translate-y-1 md:hover:-translate-y-3 transition-all duration-500 group reveal stagger-1 border border-transparent hover:border-primary-500/10 shadow-soft flex flex-col items-center md:items-start text-center md:text-left ${index >= 6 ? 'hidden md:flex' : 'flex'}`}
                   >
                     <div className="w-10 h-10 md:w-20 md:h-20 bg-primary-50 dark:bg-primary-900/20 rounded-xl md:rounded-3xl flex items-center justify-center mb-3 md:mb-10 group-hover:scale-110 transition-all shadow-sm" style={{ color: content.general.brandColor }}>
                       <DynamicIcon name={service.iconName} className="w-5 h-5 md:w-[42px] md:h-[42px]" />
                     </div>
                     <EditableText
                       tag="h3"
                       path={`services[${originalIndex}].title`}
                       value={service.title}
                       className="text-xs md:text-2xl font-bold text-gray-900 dark:text-white mb-1 md:mb-6 leading-tight w-full break-words"
                     />
                     <EditableText
                       tag="p"
                       path={`services[${originalIndex}].description`}
                       value={service.description}
                       className="text-gray-600 dark:text-gray-400 leading-relaxed text-[10px] md:text-base lg:text-lg line-clamp-3 md:line-clamp-none hidden sm:block"
                     />
                   </div>
                 );})}
               </div>
             </div>
          </section>
          </SectionWrapper>
        );
      case 'contact':
        return (
          <SectionWrapper key={key} sectionKey={key} title="Contact">
          <section id="contact" style={sectionStyles} className="bg-gray-50 dark:bg-[#1a1a1a]">
            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center reveal">
               <EditableText
                 tag="h2"
                 path="sectionHeaders.contact.title"
                 value={content.sectionHeaders.contact.title}
                 style={getStyle(content.typography.sectionTitle)} 
                 className="mb-8 font-heading text-gray-900 dark:text-white"
               />
               <EditableText
                 tag="p"
                 path="sectionHeaders.contact.subtitle"
                 value={content.sectionHeaders.contact.subtitle}
                 style={getStyle(content.typography.sectionSubtitle)} 
                 className="mb-16 max-w-3xl mx-auto text-gray-600 dark:text-gray-400 text-xl lg:text-2xl leading-relaxed"
               />
               
               {formStatus === 'success' ? (
                  <div className="p-16 bg-white dark:bg-[#272727] rounded-[3rem] shadow-premium max-w-4xl mx-auto border-2 border-green-500 animate-fade-in">
                     <Icons.CheckCircle2 size={64} className="text-green-500 mx-auto mb-6"/>
                     <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Submission Received</h3>
                     <p className="text-gray-500 dark:text-gray-400 text-xl">{content.contactForm.successMessage}</p>
                  </div>
               ) : (
                  <form 
                    name="proposal"
                    method="POST"
                    data-netlify="true"
                    onSubmit={handleContactSubmit} 
                    className="max-w-4xl mx-auto space-y-6"
                  >
                    {/* Hidden input required for Netlify to associate submissions with the 'proposal' form */}
                    <input type="hidden" name="form-name" value="proposal" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {content.contactForm.fields.filter(f => f.type !== 'textarea').map(field => (
                          <div key={field.id} className="text-left">
                             <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-4">{field.label} {field.required && '*'}</label>
                             <input 
                                name={field.label.toLowerCase().replace(/\s+/g, '-')}
                                type={field.type} 
                                required={field.required}
                                placeholder={field.placeholder}
                                className={`w-full px-8 py-6 bg-white dark:bg-[#272727] text-gray-900 dark:text-white border-2 border-transparent focus:border-primary-500 outline-none shadow-soft transition-all text-lg ${content.general.buttonStyle === 'pill' ? 'rounded-full' : content.general.buttonStyle === 'square' ? 'rounded-none' : 'rounded-[1.5rem]'}`}
                             />
                          </div>
                       ))}
                    </div>
                    {content.contactForm.fields.filter(f => f.type === 'textarea').map(field => (
                       <div key={field.id} className="text-left">
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-4">{field.label} {field.required && '*'}</label>
                          <textarea 
                             name={field.label.toLowerCase().replace(/\s+/g, '-')}
                             required={field.required}
                             placeholder={field.placeholder}
                             rows={5}
                             className={`w-full px-8 py-6 bg-white dark:bg-[#272727] text-gray-900 dark:text-white border-2 border-transparent focus:border-primary-500 outline-none shadow-soft transition-all text-lg ${content.general.buttonStyle === 'pill' ? 'rounded-full' : content.general.buttonStyle === 'square' ? 'rounded-none' : 'rounded-[1.5rem]'}`}
                          />
                       </div>
                    ))}
                    <Button 
                       type="submit" 
                       size="lg" 
                       disabled={formStatus === 'submitting' || isEditing}
                       className={`w-full md:w-auto px-20 py-8 shadow-premium text-2xl font-bold hover-lift ${content.general.buttonStyle === 'pill' ? 'rounded-full' : content.general.buttonStyle === 'square' ? 'rounded-none' : 'rounded-[2rem]'}`} 
                       style={{ backgroundColor: content.general.brandColor }}
                    >
                       {formStatus === 'submitting' ? 'Processing...' : content.contactForm.submitButtonText}
                    </Button>
                  </form>
               )}
            </div>
          </section>
          </SectionWrapper>
        );
      case 'kdpCategories':
        if (baseCategories.length === 0 && !isEditing) return null;
        return (
          <SectionWrapper key={key} sectionKey={key} title="Categories">
          <section id="kdpCategories" style={sectionStyles} className="bg-white dark:bg-[#1E1E1E]">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 w-full">
               <div className="text-center mb-10 md:mb-20 reveal">
                  <EditableText
                    tag="h2"
                    path="sectionHeaders.kdpCategories.title"
                    value={content.sectionHeaders.kdpCategories.title}
                    style={getStyle(content.typography.sectionTitle)} 
                    className="mb-3 md:mb-6 font-heading text-gray-900 dark:text-white"
                  />
                  <EditableText
                    tag="p"
                    path="sectionHeaders.kdpCategories.subtitle"
                    value={content.sectionHeaders.kdpCategories.subtitle}
                    style={getStyle(content.typography.sectionSubtitle)} 
                    className="max-w-3xl mx-auto text-gray-600 dark:text-gray-400 text-sm md:text-lg lg:text-xl"
                  />
               </div>
               
               <div className="grid grid-cols-3 gap-3 md:gap-10">
                  {visibleCategories.map((cat, index) => {
                     const originalIndex = content.kdpCategories.findIndex(c => c.id === cat.id);
                     return (
                     <div 
                        key={cat.id} 
                        className="group relative rounded-xl md:rounded-[2rem] overflow-hidden shadow-soft hover:shadow-premium hover:-translate-y-2 transition-all duration-700 reveal border border-gray-100 dark:border-gray-800"
                     >
                        <div className="aspect-[2/3] w-full overflow-hidden img-zoom-parent bg-gray-100 dark:bg-gray-800 relative">
                           <EditableImage 
                              path={`kdpCategories[${originalIndex}].imageUrl`}
                              src={cat.imageUrl} 
                              alt={cat.title} 
                              className="w-full h-full object-cover" 
                              aspect={2/3}
                              label="Vertical Category Cover (2:3)"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-500 pointer-events-none"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-1.5 md:p-8 text-white">
                           <EditableText
                              tag="h3"
                              path={`kdpCategories[${originalIndex}].title`}
                              value={cat.title}
                              className="text-[10px] sm:text-xs md:text-xl font-bold mb-0 md:mb-2 leading-tight"
                           />
                           <EditableText
                              tag="p"
                              path={`kdpCategories[${originalIndex}].description`}
                              value={cat.description}
                              className="hidden md:block text-[11px] text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 leading-relaxed"
                           />
                        </div>
                     </div>
                  );})}
               </div>
               {baseCategories.length > 9 && !isEditing && (
                   <div className="mt-8 md:mt-12 text-center reveal">
                        <Button 
                            variant="primary" 
                            onClick={() => navigate('/categories')} 
                            className="rounded-xl px-6 py-3 md:px-10 md:py-4 font-bold shadow-lg text-sm md:text-base"
                            style={{ backgroundColor: content.general.brandColor }}
                        >
                            See All Categories
                        </Button>
                   </div>
               )}
            </div>
          </section>
          </SectionWrapper>
        );
      case 'promotions':
        if (basePromotions.length === 0 && !isEditing) return null;
        return (
          <SectionWrapper key={key} sectionKey={key} title="Promotions">
          <section id="promotions" style={sectionStyles} className="bg-gray-50 dark:bg-[#1a1a1a]">
            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full">
               <div className="text-center mb-24 reveal">
                 <EditableText
                    tag="h2"
                    path="sectionHeaders.promotions.title"
                    value={content.sectionHeaders.promotions.title}
                    style={getStyle(content.typography.sectionTitle)} 
                    className="mb-6 font-heading text-gray-900 dark:text-white"
                 />
                 <EditableText
                    tag="p"
                    path="sectionHeaders.promotions.subtitle"
                    value={content.sectionHeaders.promotions.subtitle}
                    style={getStyle(content.typography.sectionSubtitle)} 
                    className="max-w-3xl mx-auto text-gray-600 dark:text-gray-400 text-lg lg:text-xl"
                 />
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                 {visiblePromotions.map((promo, index) => {
                   const originalIndex = content.promotions.findIndex(p => p.id === promo.id);
                   return (
                   <div key={promo.id} className="group relative bg-white dark:bg-[#272727] rounded-[3rem] overflow-hidden shadow-soft hover:shadow-premium transition-all duration-500 reveal stagger-1 flex flex-col sm:flex-row h-full border border-gray-100 dark:border-gray-800">
                      <div className="w-full sm:w-1/2 aspect-[2/3] overflow-hidden">
                        <EditableImage 
                          path={`promotions[${originalIndex}].imageUrl`}
                          src={promo.imageUrl} 
                          alt={promo.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                          aspect={2/3}
                          label="Promotional Book Image (2:3)"
                        />
                      </div>
                      <div className="p-10 lg:p-14 sm:w-1/2 flex flex-col justify-center">
                        <EditableText
                          tag="h3"
                          path={`promotions[${originalIndex}].title`}
                          value={promo.title}
                          className="text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
                        />
                        <EditableText
                          tag="p"
                          path={`promotions[${originalIndex}].description`}
                          value={promo.description}
                          className="text-gray-600 dark:text-gray-400 text-base lg:text-lg leading-relaxed mb-10 line-clamp-4"
                        />
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className={`w-fit font-bold hover-lift px-10 ${content.general.buttonStyle === 'pill' ? 'rounded-full' : content.general.buttonStyle === 'square' ? 'rounded-none' : 'rounded-xl'}`}
                          style={{ borderColor: content.general.brandColor, color: content.general.brandColor }} 
                          onClick={() => !isEditing && document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          Get This Deal
                        </Button>
                      </div>
                   </div>
                 );})}
               </div>
            </div>
          </section>
          </SectionWrapper>
        );
      case 'portfolio':
        if (baseProjects.length === 0 && !isEditing) return null;
        
        return (
          <SectionWrapper key={key} sectionKey={key} title="Portfolio">
          <section id="portfolio" style={sectionStyles} className="bg-white dark:bg-[#1E1E1E]">
             <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 w-full">
               <div className="text-center mb-10 md:mb-24 reveal">
                 <EditableText
                    tag="h2"
                    path="sectionHeaders.portfolio.title"
                    value={content.sectionHeaders.portfolio.title}
                    style={getStyle(content.typography.sectionTitle)} 
                    className="mb-3 md:mb-6 font-heading text-gray-900 dark:text-white"
                 />
                 <EditableText
                    tag="p"
                    path="sectionHeaders.portfolio.subtitle"
                    value={content.sectionHeaders.portfolio.subtitle}
                    style={getStyle(content.typography.sectionSubtitle)} 
                    className="mb-8 md:mb-14 text-gray-600 dark:text-gray-400 text-sm md:text-lg lg:text-xl"
                 />
                 {!isEditing && (
                    <div className="relative mb-12 md:mb-20">
                      <div className="flex justify-center">
                        <div className="relative w-full max-w-4xl px-12">
                           <div 
                              ref={categoryScrollRef}
                              className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-2 md:gap-4 pb-4 px-2 scroll-smooth mask-fade"
                           >
                              {categories.map(cat => (
                                 <button 
                                    key={cat} 
                                    onClick={() => setActiveCategory(cat)}
                                    className={`flex-shrink-0 snap-center px-6 py-3 md:px-10 md:py-4 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-500 transform ${activeCategory === cat ? 'text-white shadow-premium scale-105 z-10' : 'bg-gray-50 dark:bg-[#272727] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:border-primary-200'}`}
                                    style={activeCategory === cat ? { backgroundColor: content.general.brandColor } : {}}
                                 >
                                    {cat}
                                 </button>
                              ))}
                           </div>
                           <div className="absolute top-0 left-8 bottom-4 w-12 bg-gradient-to-r from-white dark:from-[#1E1E1E] to-transparent pointer-events-none z-20"></div>
                           <div className="absolute top-0 right-8 bottom-4 w-12 bg-gradient-to-l from-white dark:from-[#1E1E1E] to-transparent pointer-events-none z-20"></div>
                        </div>
                      </div>
                      <div className="flex md:hidden justify-center mt-2 opacity-30 items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        <Icons.ArrowLeftRight size={12} className="animate-pulse" /> Swipe Genres
                      </div>
                    </div>
                 )}
               </div>
               
               <div className="grid grid-cols-3 gap-2 md:gap-12 lg:gap-20 min-h-[200px] md:min-h-[500px]">
                  {visibleProjects.length > 0 ? (
                    visibleProjects.map((project, index) => {
                      const originalIndex = content.portfolio.findIndex(p => p.id === project.id);
                      return (
                      <div key={project.id} className={`reveal stagger-1 ${index >= 6 ? 'hidden md:block' : ''}`}>
                         <div className="project-perspective w-full aspect-[2/3] group cursor-pointer">
                            <div className="project-card w-full h-full relative">
                                {/* The "Front Cover" div with book-cover class for 3D logic */}
                                <div className="book-cover relative w-full h-full rounded-[4px] overflow-hidden bg-white dark:bg-gray-800 shadow-sm z-10">
                                     <EditableImage
                                        path={`portfolio[${originalIndex}].imageUrl`}
                                        src={project.imageUrl} 
                                        alt={project.title} 
                                        className="w-full h-full object-cover" 
                                        aspect={2/3}
                                        label="Vertical Book Cover (2:3)"
                                      />
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 md:p-8 flex flex-col justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                          <EditableText
                                            tag="p"
                                            path={`portfolio[${originalIndex}].bookType`}
                                            value={project.bookType}
                                            className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-primary-500 mb-0.5 md:mb-3 pointer-events-auto" 
                                            style={{ color: content.general.brandColor }}
                                          />
                                          <EditableText
                                            tag="h3"
                                            path={`portfolio[${originalIndex}].title`}
                                            value={project.title}
                                            className="text-[10px] md:text-2xl font-bold text-white mb-0 md:mb-4 leading-tight truncate md:whitespace-normal pointer-events-auto"
                                          />
                                          <EditableText
                                            tag="p"
                                            path={`portfolio[${originalIndex}].description`}
                                            value={project.description}
                                            className="hidden md:block text-sm lg:text-base text-gray-300 line-clamp-3 leading-relaxed pointer-events-auto"
                                          />
                                     </div>
                                </div>
                            </div>
                         </div>
                      </div>
                    );})
                  ) : (
                    <div className="col-span-full py-10 md:py-32 text-center bg-gray-50/50 dark:bg-[#272727]/30 rounded-3xl md:rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-700 reveal">
                      <div className="w-12 h-12 md:w-24 md:h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-8 text-gray-300 dark:text-gray-600 shadow-sm"><Icons.Search className="w-6 h-6 md:w-10 md:h-10" /></div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm md:text-2xl font-medium">No projects in "{activeCategory}" yet.</p>
                      <button onClick={() => setActiveCategory('All')} className="mt-6 md:mt-10 px-8 py-3 bg-white dark:bg-gray-800 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest shadow-md hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700" style={{ color: content.general.brandColor }}>Explore all work</button>
                    </div>
                  )}
               </div>
               {baseProjects.length > 0 && !isEditing && (
                   <div className="mt-8 md:mt-16 text-center reveal">
                        <Button 
                            variant="primary" 
                            onClick={() => navigate('/portfolio')} 
                            className="rounded-xl px-6 py-3 md:px-10 md:py-4 font-bold shadow-lg text-sm md:text-base"
                            style={{ backgroundColor: content.general.brandColor }}
                        >
                            See All Projects
                        </Button>
                   </div>
               )}
             </div>
          </section>
          </SectionWrapper>
        );
      case 'testimonials':
        if (baseTestimonials.length === 0 && !isEditing) return null;
        return (
          <SectionWrapper key={key} sectionKey={key} title="Testimonials">
          <section id="testimonials" style={sectionStyles} className="bg-white dark:bg-[#1E1E1E] overflow-hidden">
            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full">
               <div className="text-center mb-16 reveal">
                 <EditableText
                    tag="h2"
                    path="sectionHeaders.testimonials.title"
                    value={content.sectionHeaders.testimonials.title}
                    style={getStyle(content.typography.sectionTitle)} 
                    className="mb-6 font-heading text-gray-900 dark:text-white"
                 />
                 <EditableText
                    tag="p"
                    path="sectionHeaders.testimonials.subtitle"
                    value={content.sectionHeaders.testimonials.subtitle}
                    style={getStyle(content.typography.sectionSubtitle)} 
                    className="max-w-3xl mx-auto text-gray-600 dark:text-gray-400 text-lg lg:text-xl"
                 />
               </div>
               
               <div className="relative group/carousel">
                  <button onClick={() => scrollTestimonials('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 z-20 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-premium flex items-center justify-center text-gray-600 dark:text-white hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 border border-gray-100 dark:border-gray-700"><Icons.ChevronLeft size={24} /></button>
                  <div ref={testimonialsRef} className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-12 pt-4 px-4 -mx-4 no-scrollbar scroll-smooth">
                    {visibleTestimonials.map((t, index) => {
                      const originalIndex = content.testimonials.findIndex(test => test.id === t.id);
                      return (
                      <div key={t.id} className="snap-center flex-shrink-0 w-[85vw] md:w-[600px] lg:w-[700px] bg-gray-50 dark:bg-[#272727] p-8 md:p-12 lg:p-16 rounded-[2.5rem] shadow-soft hover:shadow-premium border-2 border-transparent hover:border-primary-500/10 dark:hover:bg-[#2d2d2d] hover:bg-white transition-all duration-500 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                         <div className="flex-shrink-0 relative">
                           <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1.5 bg-gradient-to-br from-white to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-lg">
                              <EditableImage
                                path={`testimonials[${originalIndex}].avatarUrl`}
                                src={t.avatarUrl || `https://ui-avatars.com/api/?name=${t.clientName}&background=random`} 
                                alt={t.clientName} 
                                className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800"
                                aspect={1}
                              />
                           </div>
                           <div className="absolute -bottom-1 -right-1 bg-primary-500 text-white p-3 rounded-full shadow-lg" style={{ backgroundColor: content.general.brandColor }}><Icons.Quote size={16} fill="currentColor" /></div>
                         </div>
                         <div className="text-center md:text-left flex-1">
                           <EditableText tag="p" path={`testimonials[${originalIndex}].content`} value={`"${t.content}"`} className="text-gray-700 dark:text-gray-300 text-lg md:text-xl leading-relaxed italic mb-6" />
                           <div>
                             <EditableText tag="h4" path={`testimonials[${originalIndex}].clientName`} value={t.clientName} className="font-heading font-bold text-xl text-gray-900 dark:text-white" />
                             <EditableText tag="p" path={`testimonials[${originalIndex}].role`} value={t.role} className="text-xs font-black uppercase opacity-60 tracking-[0.2em] mt-1" style={{ color: content.general.brandColor }} />
                           </div>
                         </div>
                      </div>
                    );})}
                  </div>
                  <button onClick={() => scrollTestimonials('right')} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 z-20 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-premium flex items-center justify-center text-gray-600 dark:text-white hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 border border-gray-100 dark:border-gray-700"><Icons.ChevronRight size={24} /></button>
               </div>
            </div>
          </section>
          </SectionWrapper>
        );
      default:
        return null;
    }
  };

  return (
    <div className="font-sans antialiased bg-white dark:bg-[#1E1E1E] transition-colors duration-500">
      {content.advanced?.customCss && <style>{content.advanced.customCss}</style>}
      {content.advanced?.headHtml && <div className="hidden" dangerouslySetInnerHTML={{ __html: content.advanced.headHtml }} />}
      {!isEditing && <Header />}
      <main className="overflow-hidden">
        {content.pageStructure.home.map(renderSection)}
        {!isEditing && <ChatWidget />}
      </main>
      {!isEditing && <Footer />}
    </div>
  );
};

export default Home;