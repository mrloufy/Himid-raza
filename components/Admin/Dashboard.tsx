
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../context/SiteContext';
import { SiteContent, AdminRole, SectionStyle, TypographyStyle } from '../../types';
import Button from '../UI/Button';
import { 
  LogOut, Plus, Trash2, BookOpen, User, Briefcase, MessageSquare, 
  Settings, Menu, X, Type, RotateCcw, Layout, ShieldCheck, 
  History, ArrowLeft, GripVertical, Loader2, Megaphone, Layers, 
  Wand2, Eye, EyeOff, Mail, Phone, Share2
} from 'lucide-react';
import ImageUploader from './ImageUploader';

/**
 * REUSABLE EDITOR COMPONENTS
 */

const SectionHeaderEditor: React.FC<{ 
  sectionKey: string, 
  localContent: SiteContent, 
  isReadOnly: boolean,
  onHeaderChange: (section: string, field: 'title' | 'subtitle', value: string) => void
}> = ({ sectionKey, localContent, isReadOnly, onHeaderChange }) => {
  const header = localContent.sectionHeaders[sectionKey];
  if (!header) return null;
  return (
    <div className="space-y-6 pb-10 border-b dark:border-gray-800">
      <h3 className="text-xs font-black uppercase tracking-widest text-primary-500 mb-4">Heading Content</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Title</label>
          <input 
            value={header.title} 
            onChange={(e) => onHeaderChange(sectionKey, 'title', e.target.value)} 
            className="input-field" 
            disabled={isReadOnly} 
          />
        </div>
        <div>
          <label className="label">Subtitle</label>
          <input 
            value={header.subtitle} 
            onChange={(e) => onHeaderChange(sectionKey, 'subtitle', e.target.value)} 
            className="input-field" 
            disabled={isReadOnly} 
          />
        </div>
      </div>
    </div>
  );
};

const SectionSettingsEditor: React.FC<{
  sectionKey: string,
  localContent: SiteContent, 
  isReadOnly: boolean,
  onSectionStyleChange: (sectionKey: string, field: keyof SectionStyle, value: any) => void
}> = ({ sectionKey, localContent, isReadOnly, onSectionStyleChange }) => {
  const style = localContent.sectionStyles?.[sectionKey] || { paddingTop: 80, paddingBottom: 80, backgroundColor: '' };
  return (
    <div className="bg-gray-50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 mb-8">
      <h3 className="font-bold text-gray-700 dark:text-gray-300 text-[10px] uppercase tracking-widest mb-4">Display Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div><label className="label">Top Padding</label><input type="number" value={style.paddingTop} onChange={(e) => onSectionStyleChange(sectionKey, 'paddingTop', parseInt(e.target.value))} className="input-field" disabled={isReadOnly} /></div>
        <div><label className="label">Bottom Padding</label><input type="number" value={style.paddingBottom} onChange={(e) => onSectionStyleChange(sectionKey, 'paddingBottom', parseInt(e.target.value))} className="input-field" disabled={isReadOnly} /></div>
        <div><label className="label">Background Color</label><input type="color" value={style.backgroundColor || '#ffffff'} onChange={(e) => onSectionStyleChange(sectionKey, 'backgroundColor', e.target.value)} className="w-full h-10 p-1 bg-transparent border dark:border-gray-700 rounded-lg" disabled={isReadOnly} /></div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const { content, updateContent, resetContent, history, restoreHistory } = useContent();
  const [localContent, setLocalContent] = useState<SiteContent>(JSON.parse(JSON.stringify(content)));
  const [activeTab, setActiveTab] = useState<string>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setLocalContent(JSON.parse(JSON.stringify(content)));
  }, [content]);

  const role = localContent.adminSettings?.role || 'super_admin';
  const isReadOnly = role === 'viewer';
  const canDelete = role === 'super_admin';

  const handleSave = async () => {
    if (isReadOnly) {
      alert("Permission Denied: Viewer role cannot modify site content.");
      return;
    }
    
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const updatedContent: SiteContent = {
        ...localContent,
        adminSettings: {
          ...localContent.adminSettings,
          isDraft: false, 
          lastPublishedAt: Date.now()
        }
      };
      
      updateContent(updatedContent, true);
      setSaveMessage("CHANGES SAVED SUCCESSFULLY!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error("Save failed:", err);
      setSaveMessage("ERROR: Could not save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (isReadOnly) return;
    setLocalContent(prev => ({
      ...prev,
      general: { ...prev.general, [e.target.name]: e.target.value }
    }));
  };

  const handleTypographyChange = (key: keyof SiteContent['typography'], field: keyof TypographyStyle, value: any) => {
    if (isReadOnly) return;
    setLocalContent(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [key]: { ...(prev.typography[key] as TypographyStyle), [field]: value }
      }
    }));
  };

  const handleHeaderChange = useCallback((section: string, field: 'title' | 'subtitle', value: string) => {
    if (isReadOnly) return;
    setLocalContent(prev => ({
      ...prev,
      sectionHeaders: {
        ...prev.sectionHeaders,
        [section]: { ...prev.sectionHeaders[section], [field]: value }
      }
    }));
  }, [isReadOnly]);

  const handleSectionStyleChange = useCallback((sectionKey: string, field: keyof SectionStyle, value: any) => {
    if (isReadOnly) return;
    setLocalContent(prev => ({
      ...prev,
      sectionStyles: {
        ...prev.sectionStyles,
        [sectionKey]: { ...(prev.sectionStyles?.[sectionKey] || { paddingTop: 80, paddingBottom: 80 }), [field]: value }
      }
    }));
  }, [isReadOnly]);

  const addItem = (section: string) => {
    if (isReadOnly) return;
    const id = Date.now().toString();
    setLocalContent(prev => {
      const current = JSON.parse(JSON.stringify(prev)) as any;
      if (section === 'services') {
        current.services.push({ id, title: 'New Service', description: 'Description', iconName: 'Settings', isHidden: false });
      } else if (section === 'portfolio') {
        current.portfolio.push({ id, title: 'New Project', bookType: 'Paperback', description: 'Description', imageUrl: '', category: 'General', isHidden: false });
      } else if (section === 'testimonials') {
        current.testimonials.push({ id, clientName: 'New Client', content: 'Feedback', role: 'Author', avatarUrl: '', isHidden: false });
      } else if (section === 'kdpCategories') {
        current.kdpCategories.push({ id, title: 'New Category', description: 'Description', imageUrl: '', isHidden: false });
      } else if (section === 'promotions') {
        current.promotions.push({ id, title: 'New Promotion', description: 'Description', imageUrl: '', isHidden: false });
      } else if (section === 'header_menu') {
        current.header.menuItems.push({ id, label: 'New Link', href: '#' });
      } else if (section === 'about_expertises') {
        current.about.expertises.push('New Skill');
      }
      return current;
    });
  };

  const toggleHideItem = (section: string, id: string) => {
    if (isReadOnly) return;
    setLocalContent(prev => {
      const current = JSON.parse(JSON.stringify(prev)) as any;
      const list = current[section] as any[];
      const index = list.findIndex(item => String(item.id) === String(id));
      if (index !== -1) {
        list[index].isHidden = !list[index].isHidden;
      }
      return current;
    });
  };

  const removeItem = (section: string, id: string) => {
    if (!canDelete) {
      alert("Permission Denied: Only Super Admins can delete content.");
      return;
    }
    
    if (!window.confirm("Are you sure you want to remove this entry permanently?")) return;
    
    setLocalContent(prev => {
      const current = JSON.parse(JSON.stringify(prev)) as SiteContent;
      
      switch (section) {
        case 'services':
          current.services = current.services.filter(item => String(item.id) !== String(id));
          break;
        case 'portfolio':
          current.portfolio = current.portfolio.filter(item => String(item.id) !== String(id));
          break;
        case 'testimonials':
          current.testimonials = current.testimonials.filter(item => String(item.id) !== String(id));
          break;
        case 'kdpCategories':
          current.kdpCategories = current.kdpCategories.filter(item => String(item.id) !== String(id));
          break;
        case 'promotions':
          current.promotions = current.promotions.filter(item => String(item.id) !== String(id));
          break;
        case 'header_menu':
          current.header.menuItems = current.header.menuItems.filter(item => String(item.id) !== String(id));
          break;
        case 'about_expertises':
          current.about.expertises = current.about.expertises.filter((_, idx) => String(idx) !== String(id));
          break;
        default:
          console.warn(`Unknown section for deletion: ${section}`);
      }
      return current;
    });
  };

  const updateItemField = (section: string, id: string, field: string, value: any) => {
    if (isReadOnly) return;
    setLocalContent(prev => {
      const current = JSON.parse(JSON.stringify(prev)) as any;
      const list = current[section] as any[];
      const index = list.findIndex(item => String(item.id) === String(id));
      if (index !== -1) {
        list[index][field] = value;
      }
      return current;
    });
  };

  const tabs = [
    { id: 'general', label: 'Brand & Identity', icon: Settings, group: 'Core' },
    { id: 'typography', label: 'Typography', icon: Type, group: 'Core' },
    { id: 'header', label: 'Navigation', icon: Layout, group: 'Core' },
    { id: 'about', label: 'Biography', icon: User, group: 'Content' },
    { id: 'services', label: 'Service Catalog', icon: Briefcase, group: 'Content' },
    { id: 'portfolio', label: 'Work Portfolio', icon: BookOpen, group: 'Content' },
    { id: 'kdpCategories', label: 'Shelf Labels', icon: Layers, group: 'Content' },
    { id: 'promotions', label: 'Campaigns', icon: Megaphone, group: 'Content' },
    { id: 'testimonials', label: 'Client Praise', icon: MessageSquare, group: 'Content' },
    { id: 'security', label: 'Access Control', icon: ShieldCheck, group: 'System' },
    { id: 'history', label: 'Change Log', icon: History, group: 'System' },
  ];

  const TypographyBlock = ({ title, typoKey }: { title: string, typoKey: keyof SiteContent['typography'] }) => {
    const typo = localContent.typography[typoKey] as TypographyStyle;
    return (
      <div className="p-6 border rounded-2xl bg-gray-50/30 dark:bg-gray-800/20 mb-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div><label className="label">Font Size (px)</label><input type="number" value={typo.fontSize} onChange={(e) => handleTypographyChange(typoKey, 'fontSize', parseInt(e.target.value))} className="input-field" disabled={isReadOnly} /></div>
           <div><label className="label">Weight</label><input type="text" value={typo.fontWeight} onChange={(e) => handleTypographyChange(typoKey, 'fontWeight', e.target.value)} className="input-field" disabled={isReadOnly} /></div>
           <div><label className="label">Color</label><input type="color" value={typo.color || '#111827'} onChange={(e) => handleTypographyChange(typoKey, 'color', e.target.value)} className="w-full h-10 p-1 bg-transparent border rounded-lg" disabled={isReadOnly} /></div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex bg-gray-50 dark:bg-[#121212] overflow-hidden text-sm">
      <aside className={`fixed inset-y-0 left-0 z-[110] w-72 bg-white dark:bg-[#1E1E1E] border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 md:translate-x-0 md:static ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: localContent.general.brandColor }}>HR</div>
                <span className="font-bold text-lg dark:text-white">Portfolio Admin</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400"><X size={20}/></button>
        </div>
        <nav className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-120px)] no-scrollbar">
           <button onClick={() => navigate('/admin/editor')} className="w-full flex items-center gap-3 px-4 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all group mb-4">
              <Wand2 size={20} className="animate-pulse" />
              <span>Edit Website</span>
           </button>
           {['Core', 'Content', 'System'].map(group => (
              <div key={group} className="pt-2">
                 <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{group}</p>
                 <div className="space-y-1">
                   {tabs.filter(t => t.group === group).map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/10 font-bold shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                        style={activeTab === tab.id ? { color: localContent.general.brandColor } : {}}
                      >
                        <tab.icon size={18} />
                        <span>{tab.label}</span>
                      </button>
                   ))}
                 </div>
              </div>
           ))}
           <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 mt-8 font-bold border border-transparent hover:border-red-200">
              <LogOut size={18} />
              <span>Logout Session</span>
           </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col relative bg-[#f8f9fa] dark:bg-[#121212] min-w-0">
         <div className={`px-8 py-2 flex justify-between items-center text-[10px] font-black uppercase tracking-widest transition-colors z-40 bg-gray-800 text-white`}>
            <div className="flex items-center gap-2"><Settings size={12}/><span>Admin Editing Mode</span></div>
            <span>Access: {role.toUpperCase()}</span>
         </div>

         <header className="bg-white dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-gray-800 px-8 py-5 flex items-center justify-between shadow-sm z-50">
            <div className="flex items-center gap-4">
               <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Menu size={24}/></button>
               <div className="flex flex-col">
                  <h1 className="text-xl font-bold dark:text-white capitalize leading-none">{activeTab.replace(/([A-Z])/g, ' $1')}</h1>
                  <button onClick={() => navigate('/')} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-primary-500 hover:underline mt-2 tracking-wider hover:scale-105 transition-transform bg-transparent border-none cursor-pointer p-0">
                    <ArrowLeft size={10} /> Exit to Website
                  </button>
               </div>
            </div>
            <div className="flex items-center gap-4">
              {saveMessage && <span className="text-xs font-black text-green-600 animate-bounce mr-4 bg-green-50 px-4 py-2 rounded-full border border-green-100">{saveMessage}</span>}
              <button onClick={() => { if(window.confirm("Discard local changes?")) setLocalContent(JSON.parse(JSON.stringify(content))); }} className="p-3 text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-gray-800 rounded-xl transition-all border dark:border-gray-700" title="Discard Changes">
                <RotateCcw size={18}/>
              </button>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-2" />
              <Button type="button" onClick={handleSave} className="px-8 rounded-xl font-bold h-12 shadow-md hover:shadow-lg transition-all" style={{ backgroundColor: localContent.general.brandColor }} disabled={isReadOnly || isSaving}>
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
              </Button>
            </div>
         </header>

         <div className="flex-1 overflow-y-auto p-8 no-scrollbar relative z-20">
            <div className={`bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-200 dark:border-gray-800 p-8 md:p-12 shadow-soft max-w-5xl mx-auto w-full transition-opacity duration-300 ${isSaving ? 'opacity-40 grayscale' : 'opacity-100'}`}>
               
               {activeTab === 'general' && (
                  <div className="space-y-12">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <ImageUploader currentImage={localContent.general.logoUrl} onImageChange={(url) => setLocalContent(prev => ({...prev, general: {...prev.general, logoUrl: url}}))} label="Logo" aspect={3} />
                        <ImageUploader currentImage={localContent.general.heroImage} onImageChange={(url) => setLocalContent(prev => ({...prev, general: {...prev.general, heroImage: url}}))} label="Main Hero Image" aspect={16/9} />
                        <ImageUploader currentImage={localContent.general.aboutImage} onImageChange={(url) => setLocalContent(prev => ({...prev, general: {...prev.general, aboutImage: url}}))} label="About Me Portrait" aspect={2/3} />
                     </div>
                     <div className="pt-10 border-t dark:border-gray-800 space-y-10">
                        {/* Branding */}
                        <section>
                           <h3 className="font-bold text-lg dark:text-white mb-6 flex items-center gap-2"><Layout size={18} className="text-gray-400"/> General Branding</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div><label className="label">Display Name</label><input name="name" value={localContent.general.name || ''} onChange={handleGeneralChange} className="input-field" disabled={isReadOnly} /></div>
                              <div><label className="label">Professional Title</label><input name="title" value={localContent.general.title || ''} onChange={handleGeneralChange} className="input-field" disabled={isReadOnly} /></div>
                              <div><label className="label">Primary Color</label><input type="color" name="brandColor" value={localContent.general.brandColor || '#FD6F00'} onChange={handleGeneralChange} className="w-full h-11 p-1 bg-transparent border dark:border-gray-700 rounded-lg" disabled={isReadOnly} /></div>
                              <div><label className="label">Button Roundness</label><select name="buttonStyle" value={localContent.general.buttonStyle} onChange={handleGeneralChange} className="input-field" disabled={isReadOnly}><option value="rounded">Rounded Corners</option><option value="pill">Full Pill Shape</option><option value="square">Sharp Square</option></select></div>
                              <div className="md:col-span-2"><label className="label">Short Intro Bio</label><textarea name="description" value={localContent.general.description || ''} onChange={handleGeneralChange} className="input-field h-32 leading-relaxed" disabled={isReadOnly} /></div>
                           </div>
                        </section>

                        {/* Contact Info */}
                        <section className="pt-10 border-t dark:border-gray-800">
                           <h3 className="font-bold text-lg dark:text-white mb-6 flex items-center gap-2"><Mail size={18} className="text-gray-400"/> Contact Information</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div><label className="label">Public Email Address</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/><input name="email" value={localContent.general.email || ''} onChange={handleGeneralChange} className="input-field pl-12" placeholder="your@email.com" disabled={isReadOnly} /></div></div>
                              <div><label className="label">Phone Number</label><div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/><input name="phone" value={localContent.general.phone || ''} onChange={handleGeneralChange} className="input-field pl-12" placeholder="+1 (234) 567-890" disabled={isReadOnly} /></div></div>
                           </div>
                        </section>

                        {/* Social Links */}
                        <section className="pt-10 border-t dark:border-gray-800">
                           <h3 className="font-bold text-lg dark:text-white mb-6 flex items-center gap-2"><Share2 size={18} className="text-gray-400"/> Social Profiles</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div><label className="label">LinkedIn Profile URL</label><input name="linkedin" value={localContent.general.linkedin || ''} onChange={handleGeneralChange} className="input-field" placeholder="https://linkedin.com/in/username" disabled={isReadOnly} /></div>
                              <div><label className="label">Fiverr Profile URL</label><input name="fiverr" value={localContent.general.fiverr || ''} onChange={handleGeneralChange} className="input-field" placeholder="https://fiverr.com/username" disabled={isReadOnly} /></div>
                           </div>
                        </section>
                     </div>
                  </div>
               )}

               {/* ... (rest of the component remains unchanged) ... */}
               {activeTab === 'typography' && (
                  <div className="space-y-4">
                     <TypographyBlock title="Hero Title (Main)" typoKey="heroTitle" />
                     <TypographyBlock title="Hero Subtitle" typoKey="heroSubtitle" />
                     <TypographyBlock title="Section Headlines" typoKey="sectionTitle" />
                     <TypographyBlock title="Standard Body Copy" typoKey="bodyText" />
                  </div>
               )}

               {activeTab === 'header' && (
                  <div className="space-y-10">
                     <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg dark:text-white tracking-tight">Header Navigation Items</h3><Button type="button" onClick={() => addItem('header_menu')} variant="secondary" size="sm" disabled={isReadOnly} className="rounded-xl"><Plus size={16} className="mr-2"/> Add Link</Button></div>
                     <div className="space-y-3">
                        {localContent.header.menuItems.map((item, idx) => (
                           <div key={item.id} className="p-5 border dark:border-gray-800 rounded-2xl flex items-center gap-4 bg-gray-50/50 dark:bg-gray-800/30 group hover:border-primary-300 transition-colors relative">
                              <GripVertical size={16} className="text-gray-300 cursor-move" />
                              <div className="grid grid-cols-2 gap-4 flex-1">
                                <input value={item.label} onChange={(e) => { const list = [...localContent.header.menuItems]; list[idx].label = e.target.value; setLocalContent(prev => ({...prev, header: {...prev.header, menuItems: list}})); }} className="input-field" placeholder="Link Text" disabled={isReadOnly} />
                                <input value={item.href} onChange={(e) => { const list = [...localContent.header.menuItems]; list[idx].href = e.target.value; setLocalContent(prev => ({...prev, header: {...prev.header, menuItems: list}})); }} className="input-field" placeholder="URL Target (#anchor)" disabled={isReadOnly} />
                              </div>
                              <button type="button" onClick={(e) => { e.stopPropagation(); removeItem('header_menu', item.id); }} className="p-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all z-[60]" disabled={!canDelete}><Trash2 size={18}/></button>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {activeTab === 'services' && (
                  <div className="space-y-10">
                     <SectionSettingsEditor sectionKey="services" localContent={localContent} isReadOnly={isReadOnly} onSectionStyleChange={handleSectionStyleChange} />
                     <SectionHeaderEditor sectionKey="services" localContent={localContent} isReadOnly={isReadOnly} onHeaderChange={handleHeaderChange} />
                     <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg dark:text-white">Active Service Offerings</h3><Button type="button" onClick={() => addItem('services')} variant="secondary" size="sm" disabled={isReadOnly} className="rounded-xl"><Plus size={16} className="mr-2"/> Add Service</Button></div>
                     <div className="grid gap-6">
                        {localContent.services.map((item) => (
                           <div key={item.id} className={`p-8 border dark:border-gray-800 rounded-[2rem] bg-gray-50/30 dark:bg-gray-800/20 relative group ${item.isHidden ? 'opacity-50' : ''}`}>
                              <div className="absolute top-6 right-6 flex gap-2 z-[60]">
                                 <button type="button" onClick={(e) => { e.stopPropagation(); toggleHideItem('services', item.id); }} className="p-3 text-gray-500 hover:text-primary-500 transition-all bg-white dark:bg-gray-800 rounded-xl cursor-pointer pointer-events-auto border dark:border-gray-700 shadow-md" disabled={isReadOnly} title={item.isHidden ? "Show Service" : "Hide Service"}>{item.isHidden ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                                 <button type="button" onClick={(e) => { e.stopPropagation(); removeItem('services', item.id); }} className="p-3 text-red-500 hover:text-red-700 transition-all bg-white dark:bg-gray-800 rounded-xl cursor-pointer pointer-events-auto border dark:border-gray-700 shadow-md" disabled={!canDelete} title="Delete Service"><Trash2 size={20}/></button>
                              </div>
                              {item.isHidden && <span className="absolute top-6 left-6 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">Hidden</span>}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div><label className="label">Service Name</label><input value={item.title} onChange={(e) => updateItemField('services', item.id, 'title', e.target.value)} className="input-field" disabled={isReadOnly} /></div>
                                 <div><label className="label">Icon Name (Lucide)</label><input value={item.iconName} onChange={(e) => updateItemField('services', item.id, 'iconName', e.target.value)} className="input-field" placeholder="Briefcase, Settings, etc." disabled={isReadOnly} /></div>
                                 <div className="md:col-span-2"><label className="label">Service Detailed Description</label><textarea value={item.description} onChange={(e) => updateItemField('services', item.id, 'description', e.target.value)} className="input-field h-24" disabled={isReadOnly} /></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {activeTab === 'portfolio' && (
                  <div className="space-y-10">
                     <SectionSettingsEditor sectionKey="portfolio" localContent={localContent} isReadOnly={isReadOnly} onSectionStyleChange={handleSectionStyleChange} />
                     <SectionHeaderEditor sectionKey="portfolio" localContent={localContent} isReadOnly={isReadOnly} onHeaderChange={handleHeaderChange} />
                     <div className="flex justify-between items-center mb-6">
                        <div><h3 className="font-bold text-lg dark:text-white">Project Case Studies</h3><p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Vertical image (2:3 ratio required)</p></div>
                        <Button type="button" onClick={() => addItem('portfolio')} variant="secondary" size="sm" disabled={isReadOnly} className="rounded-xl"><Plus size={16} className="mr-2"/> Add Project</Button>
                     </div>
                     <div className="grid gap-8">
                        {localContent.portfolio.map((item) => (
                           <div key={item.id} className={`p-8 border dark:border-gray-800 rounded-[2.5rem] bg-gray-50/30 dark:bg-gray-800/20 relative group ${item.isHidden ? 'opacity-50' : ''}`}>
                              <div className="absolute top-6 right-6 flex gap-2 z-[60]">
                                 <button type="button" onClick={(e) => { e.stopPropagation(); toggleHideItem('portfolio', item.id); }} className="p-3 text-gray-500 hover:text-primary-500 transition-all bg-white dark:bg-gray-800 rounded-xl cursor-pointer pointer-events-auto shadow-md border dark:border-gray-700" disabled={isReadOnly} title={item.isHidden ? "Show Project" : "Hide Project"}>{item.isHidden ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                                 <button type="button" onClick={(e) => { e.stopPropagation(); removeItem('portfolio', item.id); }} className="p-3 text-red-500 hover:text-red-700 transition-all bg-white dark:bg-gray-800 rounded-xl cursor-pointer pointer-events-auto shadow-md border dark:border-gray-700" disabled={!canDelete} title="Delete Project"><Trash2 size={20}/></button>
                              </div>
                              {item.isHidden && <span className="absolute top-6 left-6 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">Hidden</span>}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                 <ImageUploader currentImage={item.imageUrl} onImageChange={(url) => updateItemField('portfolio', item.id, 'imageUrl', url)} label="Vertical image (2:3 ratio required)" aspect={2/3} />
                                 <div className="md:col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                       <div><label className="label">Book Title</label><input value={item.title} onChange={(e) => updateItemField('portfolio', item.id, 'title', e.target.value)} className="input-field" disabled={isReadOnly} /></div>
                                       <div><label className="label">Book Format</label><input value={item.bookType} onChange={(e) => updateItemField('portfolio', item.id, 'bookType', e.target.value)} className="input-field" placeholder="Paperback & eBook" disabled={isReadOnly} /></div>
                                       <div><label className="label">Category Tag</label><input value={item.category} onChange={(e) => updateItemField('portfolio', item.id, 'category', e.target.value)} className="input-field" disabled={isReadOnly} /></div>
                                    </div>
                                    <div><label className="label">Project Summary</label><textarea value={item.description} onChange={(e) => updateItemField('portfolio', item.id, 'description', e.target.value)} className="input-field h-24" disabled={isReadOnly} /></div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {activeTab === 'kdpCategories' && (
                  <div className="space-y-10">
                     <SectionSettingsEditor sectionKey="kdpCategories" localContent={localContent} isReadOnly={isReadOnly} onSectionStyleChange={handleSectionStyleChange} />
                     <SectionHeaderEditor sectionKey="kdpCategories" localContent={localContent} isReadOnly={isReadOnly} onHeaderChange={handleHeaderChange} />
                     <div className="flex justify-between items-center mb-6">
                        <div><h3 className="font-bold text-lg dark:text-white">Genre Specialties</h3><p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Vertical image (2:3 ratio required)</p></div>
                        <Button type="button" onClick={() => addItem('kdpCategories')} variant="secondary" size="sm" disabled={isReadOnly} className="rounded-xl"><Plus size={16} className="mr-2"/> Add Category</Button>
                     </div>
                     <div className="grid gap-6">
                        {localContent.kdpCategories.map((item) => (
                           <div key={item.id} className={`p-8 border dark:border-gray-800 rounded-[2rem] bg-gray-50/30 dark:bg-gray-800/20 relative group ${item.isHidden ? 'opacity-50' : ''}`}>
                              <div className="absolute top-6 right-6 flex gap-2 z-[60]">
                                 <button type="button" onClick={(e) => { e.stopPropagation(); toggleHideItem('kdpCategories', item.id); }} className="p-3 text-gray-500 hover:text-primary-500 transition-all bg-white dark:bg-gray-800 rounded-xl cursor-pointer pointer-events-auto border dark:border-gray-700 shadow-md" disabled={isReadOnly} title={item.isHidden ? "Show Category" : "Hide Category"}>{item.isHidden ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                                 <button type="button" onClick={(e) => { e.stopPropagation(); removeItem('kdpCategories', item.id); }} className="p-3 text-red-500 hover:text-red-700 transition-all bg-white dark:bg-gray-800 rounded-xl cursor-pointer pointer-events-auto border dark:border-gray-700 shadow-md" disabled={!canDelete} title="Delete Category"><Trash2 size={20}/></button>
                              </div>
                              {item.isHidden && <span className="absolute top-6 left-6 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">Hidden</span>}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                 <div className="md:col-span-1"><ImageUploader currentImage={item.imageUrl} onImageChange={(url) => updateItemField('kdpCategories', item.id, 'imageUrl', url)} label="Vertical image (2:3 ratio required)" aspect={2/3} /></div>
                                 <div className="md:col-span-3 space-y-6">
                                    <div><label className="label">Category Title</label><input value={item.title} onChange={(e) => updateItemField('kdpCategories', item.id, 'title', e.target.value)} className="input-field" disabled={isReadOnly} /></div>
                                    <div><label className="label">Description Text</label><textarea value={item.description} onChange={(e) => updateItemField('kdpCategories', item.id, 'description', e.target.value)} className="input-field h-20" disabled={isReadOnly} /></div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {activeTab === 'promotions' && (
                  <div className="space-y-10">
                     <SectionSettingsEditor sectionKey="promotions" localContent={localContent} isReadOnly={isReadOnly} onSectionStyleChange={handleSectionStyleChange} />
                     <SectionHeaderEditor sectionKey="promotions" localContent={localContent} isReadOnly={isReadOnly} onHeaderChange={handleHeaderChange} />
                     <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg dark:text-white">Active Promotional Deals</h3><Button type="button" onClick={() => addItem('promotions')} variant="secondary" size="sm" disabled={isReadOnly} className="rounded-xl"><Plus size={16} className="mr-2"/> Add Promotion</Button></div>
                     <div className="grid gap-8">
                        {localContent.promotions.map((item) => (
                           <div key={item.id} className={`p-8 border dark:border-gray-800 rounded-[2rem] bg-gray-50/30 dark:bg-gray-800/20 relative group ${item.isHidden ? 'opacity-50' : ''}`}>
                              <div className="absolute top-6 right-6 flex gap-2 z-[60]">
                                 <button type="button" onClick={(e) => { e.stopPropagation(); toggleHideItem('promotions', item.id); }} className="p-3 text-gray-500 hover:text-primary-500 transition-all bg-white dark:bg-gray-800 rounded-xl cursor-pointer pointer-events-auto border dark:border-gray-700 shadow-md" disabled={isReadOnly} title={item.isHidden ? "Show Promotion" : "Hide Promotion"}>{item.isHidden ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                                 <button type="button" onClick={(e) => { e.stopPropagation(); removeItem('promotions', item.id); }} className="p-3 text-red-500 hover:text-red-700 transition-all bg-white dark:bg-gray-800 rounded-xl cursor-pointer pointer-events-auto border dark:border-gray-700 shadow-md" disabled={!canDelete} title="Delete Promotion"><Trash2 size={20}/></button>
                              </div>
                              {item.isHidden && <span className="absolute top-6 left-6 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">Hidden</span>}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                 <div className="md:col-span-1"><ImageUploader currentImage={item.imageUrl} onImageChange={(url) => updateItemField('promotions', item.id, 'imageUrl', url)} label="Vertical image (2:3 ratio required)" aspect={2/3} /></div>
                                 <div className="md:col-span-3 space-y-6">
                                    <div><label className="label">Promotion Title</label><input value={item.title} onChange={(e) => updateItemField('promotions', item.id, 'title', e.target.value)} className="input-field" disabled={isReadOnly} /></div>
                                    <div><label className="label">Deal Mechanics / Details</label><textarea value={item.description} onChange={(e) => updateItemField('promotions', item.id, 'description', e.target.value)} className="input-field h-24" disabled={isReadOnly} /></div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {activeTab === 'testimonials' && (
                  <div className="space-y-10">
                     <SectionSettingsEditor sectionKey="testimonials" localContent={localContent} isReadOnly={isReadOnly} onSectionStyleChange={handleSectionStyleChange} />
                     <SectionHeaderEditor sectionKey="testimonials" localContent={localContent} isReadOnly={isReadOnly} onHeaderChange={handleHeaderChange} />
                     <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg dark:text-white">Client Feedback & Praise</h3><Button type="button" onClick={() => addItem('testimonials')} variant="secondary" size="sm" disabled={isReadOnly} className="rounded-xl"><Plus size={16} className="mr-2"/> Add Feedback</Button></div>
                     <div className="grid gap-8">
                        {localContent.testimonials.map((item) => (
                           <div key={item.id} className={`p-8 border dark:border-gray-800 rounded-[2.5rem] bg-gray-50/30 dark:bg-gray-800/20 relative group ${item.isHidden ? 'opacity-50' : ''}`}>
                              <div className="absolute top-6 right-6 flex gap-2 z-[60]">
                                 <button type="button" onClick={(e) => { e.stopPropagation(); toggleHideItem('testimonials', item.id); }} className="p-3 text-gray-500 hover:text-primary-500 transition-all bg-white dark:bg-gray-800 rounded-xl cursor-pointer pointer-events-auto border dark:border-gray-700 shadow-md" disabled={isReadOnly} title={item.isHidden ? "Show Testimonial" : "Hide Testimonial"}>{item.isHidden ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                                 <button type="button" onClick={(e) => { e.stopPropagation(); removeItem('testimonials', item.id); }} className="p-3 text-red-500 hover:text-red-700 transition-all bg-white dark:bg-gray-800 rounded-xl cursor-pointer pointer-events-auto border dark:border-gray-700 shadow-md" disabled={!canDelete} title="Delete Feedback"><Trash2 size={20}/></button>
                              </div>
                              {item.isHidden && <span className="absolute top-6 left-6 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">Hidden</span>}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                                 <div className="md:col-span-1"><ImageUploader currentImage={item.avatarUrl} onImageChange={(url) => updateItemField('testimonials', item.id, 'avatarUrl', url)} label="Client Photo" aspect={1} /></div>
                                 <div className="md:col-span-3 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                       <div><label className="label">Client Name</label><input value={item.clientName} onChange={(e) => updateItemField('testimonials', item.id, 'clientName', e.target.value)} className="input-field" disabled={isReadOnly} /></div>
                                       <div><label className="label">Role / Book Genre</label><input value={item.role} onChange={(e) => updateItemField('testimonials', item.id, 'role', e.target.value)} className="input-field" placeholder="Novel Author" disabled={isReadOnly} /></div>
                                    </div>
                                    <div><label className="label">Client Testimony</label><textarea value={item.content} onChange={(e) => updateItemField('testimonials', item.id, 'content', e.target.value)} className="input-field h-24 italic" disabled={isReadOnly} /></div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {activeTab === 'about' && (
                  <div className="space-y-10">
                     <SectionSettingsEditor sectionKey="about" localContent={localContent} isReadOnly={isReadOnly} onSectionStyleChange={handleSectionStyleChange} />
                     <SectionHeaderEditor sectionKey="about" localContent={localContent} isReadOnly={isReadOnly} onHeaderChange={handleHeaderChange} />
                     <div><label className="label">Detailed Biography</label><textarea rows={10} value={localContent.about.content} onChange={(e) => setLocalContent(prev => ({...prev, about: {...prev.about, content: e.target.value}}))} className="input-field leading-relaxed" disabled={isReadOnly} /></div>
                     <div className="pt-10 border-t dark:border-gray-800">
                        <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-xs uppercase tracking-widest text-gray-500">Expertise Levels</h3><Button type="button" onClick={() => addItem('about_expertises')} variant="secondary" size="sm" disabled={isReadOnly} className="rounded-xl"><Plus size={16}/></Button></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {localContent.about.expertises.map((skill, idx) => (
                              <div key={idx} className="flex gap-3 items-center group"><input value={skill} onChange={(e) => { const exp = [...localContent.about.expertises]; exp[idx] = e.target.value; setLocalContent(prev => ({...prev, about: {...prev.about, expertises: exp}})); }} className="input-field font-bold" disabled={isReadOnly} /><button type="button" onClick={(e) => { e.stopPropagation(); removeItem('about_expertises', idx.toString()); }} className="p-2 text-red-400 opacity-100 hover:text-red-500 transition-all z-[60]" disabled={!canDelete}><Trash2 size={18}/></button></div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'security' && (
                  <div className="space-y-8">
                     <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 max-w-2xl">
                        <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2"><ShieldCheck size={18}/> Permission Rules</h3>
                        <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">Changes to your role status require a "Save Draft" or "Publish" to persist across browser reloads. Note: Switching to 'Viewer' will lock all editing controls immediately.</p>
                     </div>
                     <div className="max-w-md">
                        <label className="label">Active Session Role</label>
                        <select value={role} onChange={(e) => {
                             const newRole = e.target.value as AdminRole;
                             setLocalContent(prev => ({...prev, adminSettings: {...prev.adminSettings, role: newRole}}));
                             alert(`Admin role switched to: ${newRole.toUpperCase()}. Note: Permissions updated for this session.`);
                           }} className="input-field">
                           <option value="super_admin">Super Admin (Full Access)</option>
                           <option value="editor">Editor (Content Only)</option>
                           <option value="viewer">Viewer (Read Only)</option>
                        </select>
                     </div>
                     <div className="pt-8 border-t dark:border-gray-800">
                        <label className="label text-red-500">Danger Zone</label>
                        <Button type="button" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold rounded-xl" onClick={resetContent}>Hard Reset to Factory Defaults</Button>
                     </div>
                  </div>
               )}

               {activeTab === 'history' && (
                  <div className="space-y-6">
                     <p className="text-xs text-gray-500 mb-6 font-medium">Below are the last 15 published versions of your site. You can restore any version back to your draft area.</p>
                     {history.length > 0 ? history.map(entry => (
                        <div key={entry.id} className="p-6 border dark:border-gray-800 rounded-3xl flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-all border-dashed">
                           <div><p className="font-bold text-gray-900 dark:text-white">{entry.label}</p><p className="text-xs text-gray-400 font-mono mt-1">{new Date(entry.timestamp).toLocaleString()}</p></div>
                           <Button type="button" variant="outline" size="sm" className="rounded-xl font-bold" onClick={() => { if(window.confirm("Restore this version to editor? Current draft data will be replaced.")) restoreHistory(entry.id); }}>Restore Version</Button>
                        </div>
                     )) : <div className="py-20 text-center text-gray-400 italic">No published history available for this browser session.</div>}
                  </div>
               )}

            </div>
         </div>
      </main>

      <style>{`
        .label { font-size: 10px; font-weight: 800; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
        .input-field { width: 100%; padding: 14px 18px; border-radius: 14px; border: 1.5px solid #F3F4F6; background: #FAFAFA; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); outline: none; color: #111827; }
        .dark .input-field { background: #121212; border-color: #2D2D2D; color: white; }
        .input-field:focus:not(:disabled) { border-color: ${localContent.general.brandColor}; background: white; box-shadow: 0 4px 20px -5px ${localContent.general.brandColor}33; }
        .input-field:disabled { opacity: 0.6; cursor: not-allowed; border-color: #E5E7EB; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes bounceSmall { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-bounce { animation: bounceSmall 1s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default Dashboard;
