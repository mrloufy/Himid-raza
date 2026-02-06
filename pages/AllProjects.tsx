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
  
  const categories = ['All', ...content.kdpCategories.filter(cat => !cat.isHidden).map(cat => cat.title)];
  
  const filteredProjects = (activeCategory === 'All' 
    ? content.portfolio 
    : content.portfolio.filter(p => p.category === activeCategory))
    .filter(p => !p.isHidden);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="font-sans antialiased bg-white dark:bg-[#1E1E1E] min-h-screen flex flex-col transition-colors duration-500">
      <Header />
      <main className="flex-1 py-20 lg:py-32 bg-gray-50 dark:bg-[#1a1a1a]">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full">
           <div className="text-center mb-16">
             <h1 className="text-4xl lg:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6">Complete Portfolio</h1>
             <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">A comprehensive collection of my book designs and publishing projects.</p>
           </div>

           {/* Filter */}
           <div className="flex flex-wrap justify-center gap-2 md:gap-4 lg:gap-6 mb-16">
               {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 md:px-8 md:py-3 lg:px-10 lg:py-4 rounded-full text-[10px] md:text-sm font-bold transition-all duration-500 transform hover-lift ${activeCategory === cat ? 'bg-primary-500 text-white shadow-glow translate-y-[-4px]' : 'bg-white dark:bg-[#272727] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:shadow-lg'}`}
                    style={activeCategory === cat ? { backgroundColor: content.general.brandColor } : {}}
                  >
                    {cat}
                  </button>
               ))}
           </div>

           {/* UPDATED GRID: 3 columns on mobile + 3D Book Styles */}
           <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-12 lg:gap-16 min-h-[500px]">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <div key={project.id} className="reveal">
                     <div className="project-perspective w-full aspect-[2/3] group cursor-pointer">
                        <div className="project-card w-full h-full relative">
                            {/* Book Cover with 3D classes */}
                            <div className="book-cover relative w-full h-full rounded-[4px] overflow-hidden bg-white dark:bg-gray-800 shadow-sm z-10">
                                 <img 
                                    src={project.imageUrl} 
                                    alt={project.title} 
                                    className="w-full h-full object-cover" 
                                 />
                                 {/* Hover Overlay */}
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 md:p-8 flex flex-col justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                      <p 
                                        className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-primary-500 mb-0.5 md:mb-3 pointer-events-auto"
                                        style={{ color: content.general.brandColor }}
                                      >
                                        {project.bookType}
                                      </p>
                                      <h3 className="text-[10px] md:text-2xl font-bold text-white mb-0 md:mb-4 leading-tight truncate md:whitespace-normal pointer-events-auto">
                                        {project.title}
                                      </h3>
                                      <p className="hidden md:block text-sm lg:text-base text-gray-300 line-clamp-3 leading-relaxed pointer-events-auto">
                                        {project.description}
                                      </p>
                                 </div>
                            </div>
                        </div>
                     </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-white dark:bg-[#272727] rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-400"><Icons.Search size={40} /></div>
                  <p className="text-gray-500 dark:text-gray-400 text-2xl font-medium">No projects found in "{activeCategory}".</p>
                  <button onClick={() => setActiveCategory('All')} className="mt-6 text-primary-500 font-bold text-lg hover:underline" style={{ color: content.general.brandColor }}>Reset Filter</button>
                </div>
              )}
           </div>
           
           <div className="mt-16 text-center">
                <Button variant="secondary" onClick={() => navigate('/')} className="rounded-xl px-10 py-4">Back to Home</Button>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllProjects;