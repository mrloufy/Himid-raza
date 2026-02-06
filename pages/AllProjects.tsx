
import React, { useState, useEffect } from 'react';
import { useContent } from '../context/SiteContext';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import Button from '../components/UI/Button';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';

const AllProjects: React.FC = () => {
  const { content } = useContent();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = ['All', ...content.kdpCategories.filter(cat => !cat.isHidden).map(cat => cat.title)];
  
  const allProjects = content.portfolio.filter(p => !p.isHidden);
  const filteredProjects = activeCategory === 'All' 
    ? allProjects 
    : allProjects.filter(p => p.category === activeCategory);

  return (
    <div className="font-sans antialiased bg-white dark:bg-[#1E1E1E] min-h-screen flex flex-col transition-colors duration-500">
      <Header />
      <main className="flex-1 py-20 lg:py-32">
         <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 w-full">
            {/* Header Section */}
            <div className="text-center mb-12">
                <h1 className="text-4xl lg:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6">
                    {content.sectionHeaders.portfolio.title || "My Projects"}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    {content.sectionHeaders.portfolio.subtitle || "Browse my complete collection of works."}
                </p>
            </div>

            {/* Filters */}
             <div className="flex justify-center mb-16">
                <div className="flex flex-wrap justify-center gap-3">
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 sm:px-6 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeCategory === cat ? 'text-white shadow-lg transform scale-105' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            style={activeCategory === cat ? { backgroundColor: content.general.brandColor } : {}}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
             </div>

            {/* Grid - Strictly 3 Columns on ALL Screens */}
            <div className="grid grid-cols-3 gap-3 md:gap-8 lg:gap-12">
                {filteredProjects.map((project) => (
                     <div key={project.id} className="group animate-fade-in">
                         <div className="project-perspective w-full aspect-[2/3] cursor-pointer">
                            <div className="project-card w-full h-full relative">
                                {/* Book Cover Container */}
                                <div className="book-cover relative w-full h-full rounded-[4px] overflow-hidden bg-white dark:bg-gray-800 shadow-sm z-10">
                                     <img 
                                        src={project.imageUrl} 
                                        alt={project.title} 
                                        className="w-full h-full object-cover" 
                                     />
                                     {/* Overlay: Visible on mobile (text small), Hover on desktop */}
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 sm:p-6 flex flex-col justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                          <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-primary-500 mb-0.5 sm:mb-2" style={{ color: content.general.brandColor }}>{project.bookType}</p>
                                          <h3 className="text-xs sm:text-xl font-bold text-white mb-0 sm:mb-2 leading-tight line-clamp-2 md:line-clamp-none">{project.title}</h3>
                                          <p className="hidden sm:block text-sm text-gray-300 line-clamp-3 leading-relaxed">{project.description}</p>
                                     </div>
                                </div>
                            </div>
                         </div>
                     </div>
                ))}
            </div>

            {filteredProjects.length === 0 && (
                 <div className="text-center py-20 bg-gray-50 dark:bg-[#272727] rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                     <Icons.Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                     <p className="text-gray-500 font-medium">No projects found in this category.</p>
                     <button onClick={() => setActiveCategory('All')} className="mt-4 font-bold hover:underline" style={{ color: content.general.brandColor }}>Clear Filters</button>
                 </div>
            )}
            
            <div className="mt-20 text-center">
                <Button variant="secondary" onClick={() => navigate('/')} className="rounded-xl px-10 py-4 font-bold">Back to Home</Button>
            </div>
         </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllProjects;
