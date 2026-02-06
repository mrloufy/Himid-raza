
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useContent } from '../../context/SiteContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { content } = useContent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { header, general } = content;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
          navigate('/');
          setTimeout(() => {
               const element = document.querySelector(href);
               element?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
      } else {
          const element = document.querySelector(href);
          element?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = href;
    }
  };

  const isHome = location.pathname === '/';

  return (
    <header 
      className={`${header.sticky ? 'fixed' : 'relative'} top-0 left-0 right-0 z-50 transition-all duration-300 
      ${isScrolled 
        ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm dark:border-b dark:border-gray-800 py-3' 
        : 'bg-transparent py-5'}`}
    >
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className={`flex justify-between items-center h-16 ${header.layout === 'centered' ? 'flex-col lg:flex-row gap-4 h-auto lg:h-16' : ''}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            {general.logoUrl ? (
                <img src={general.logoUrl} alt={general.name} className="h-10 w-auto object-contain" />
            ) : (
                <span className="text-2xl font-heading font-bold text-gray-900 dark:text-white tracking-tight">
                    {general.name}
                    <span className="text-primary-600" style={{ color: general.brandColor }}>.</span>
                </span>
            )}
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center space-x-8 xl:space-x-12 mx-4">
            {header.menuItems.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-bold text-gray-700 hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-400 transition-colors whitespace-nowrap"
                style={{ color: location.hash === link.href ? general.brandColor : undefined }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4 flex-shrink-0">
             <div className="hidden sm:block"><ThemeToggle /></div>
             {header.customHtml && <div dangerouslySetInnerHTML={{ __html: header.customHtml }} />}
             
             {/* Mobile Menu Toggle */}
             <button 
               className="lg:hidden p-2 text-gray-700 dark:text-white"
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             >
               {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div className={`
        fixed inset-0 bg-white dark:bg-gray-900 z-40 transition-transform duration-500 pt-24 px-8 lg:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col gap-8">
           {header.menuItems.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.href)}
                className="text-2xl font-bold text-left text-gray-900 dark:text-white hover:text-primary-500 transition-colors"
              >
                {link.label}
              </button>
           ))}
           <div className="pt-8 mt-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-400">Settings</span>
              <div className="flex items-center gap-4">
                 <ThemeToggle />
              </div>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;