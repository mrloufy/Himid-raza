
import React, { useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import Button from '../components/UI/Button';
import { useNavigate } from 'react-router-dom';

const AllCategories: React.FC = () => {
  const { content } = useContent();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const visibleCategories = content.kdpCategories.filter(cat => !cat.isHidden);

  return (
    <div className="font-sans antialiased bg-white dark:bg-[#1E1E1E] min-h-screen flex flex-col transition-colors duration-500">
      <Header />
      <main className="flex-1 py-20 lg:py-32">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full">
            <div className="text-center mb-16">
                <h1 className="text-4xl lg:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6">All Book Categories</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Explore our extensive range of book genres and formatting styles.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {visibleCategories.map((cat) => (
                    <div key={cat.id} className="group relative rounded-[2rem] overflow-hidden shadow-soft hover:shadow-premium hover:-translate-y-2 transition-all duration-700 border border-gray-100 dark:border-gray-800">
                        <div className="aspect-[2/3] w-full overflow-hidden img-zoom-parent bg-gray-100 dark:bg-gray-800 relative">
                            <img src={cat.imageUrl} alt={cat.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-500"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                            <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                            <p className="text-xs md:text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 leading-relaxed">{cat.description}</p>
                        </div>
                    </div>
                ))}
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

export default AllCategories;
