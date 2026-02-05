
import React, { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext';
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
           <div className="flex flex-wrap justify-center gap-4 lg:gap-6 mb-16">
               {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`px-8 lg:px-10 py-3 lg:py-4 rounded-full text-sm font-bold transition-all duration-500 transform hover-lift ${activeCategory === cat ? 'bg-primary-500 text-white shadow-glow translate-y-[-4px]' : 'bg-white dark:bg-[#272727] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:shadow-lg'}`}
                    style={activeCategory === cat ? { backgroundColor: content.general.brandColor } : {}}
                  >
                    {cat}
                  </button>
               ))}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-20 min-h-[500px]">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <div key={project.id} className="group relative">
                    {/* Fixed container with 2:3 aspect locking */}
                    <div className="bg-white dark:bg-[#272727] p-8 lg:p-12 rounded-[3rem] relative overflow-hidden h-[500px] lg:h-[700px] flex items-center justify-center shadow-soft group-hover:shadow-premium group-hover:bg-gray-50 dark:group-hover:bg-[#333] transition-all duration-500 border border-gray-100 dark:border-gray-800">
                      <div className="relative w-full max-w-[280px] aspect-[2/3] transform transition-all duration-700 group-hover:-translate-y-20 group-hover:rotate-6 shadow-2xl z-10 overflow-hidden rounded-md">
                          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover shadow-2xl border dark:border-gray-800" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-xl translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out border-t border-gray-100 dark:border-gray-800 z-20">
                          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: content.general.brandColor }}>{project.bookType}</p>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{project.title}</h3>
                          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">{project.description}</p>
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
