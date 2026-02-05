
import React from 'react';
import { useContent } from '../../context/SiteContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const { content } = useContent();
  const year = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();

  const { footer, general } = content;

  const handleNavClick = (href: string) => {
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

  return (
    <footer className="bg-[#fcfcfc] dark:bg-[#0f0f0f] pt-32 pb-16 relative z-50 border-t border-gray-100 dark:border-gray-900">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Footer Main */}
        <div className="flex flex-col lg:flex-row justify-between items-start mb-24 reveal gap-16 lg:gap-0">
          <div className="max-w-md">
            <Link to="/" className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-8 block transition-transform hover:scale-[1.02]">
              <span className="text-gray-900 dark:text-white">{general.name.split(' ')[0]}</span>
              <span className="text-primary-500" style={{ color: general.brandColor }}>{general.name.split(' ')[1] || ''}</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-lg lg:text-xl leading-relaxed">
              {general.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-32">
            {footer.columns.map(col => (
               <div key={col.id}>
                  <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-8">{col.title}</h4>
                  <ul className="space-y-4">
                     {col.links.map(link => (
                        <li key={link.id}>
                           <button onClick={() => handleNavClick(link.href)} className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors font-medium hover:translate-x-1 inline-block">
                              {link.label}
                           </button>
                        </li>
                     ))}
                  </ul>
               </div>
            ))}
            
            {footer.showSocials && (
               <div>
                 <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-8">Connect</h4>
                 <div className="flex flex-col gap-6">
                    {general.linkedin && (
                       <a href={general.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-[#0077b5] transition-all group">
                           <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-[#0077b5] group-hover:text-white transition-all shadow-sm">
                               <Linkedin size={20} />
                           </div>
                           <span className="font-bold">LinkedIn</span>
                       </a>
                    )}
                    {general.fiverr && (
                       <a href={general.fiverr} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-[#1dbf73] transition-all group">
                           <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-[#1dbf73] group-hover:text-white transition-all shadow-sm">
                               <span className="font-bold text-sm">fi</span>
                           </div>
                           <span className="font-bold">Fiverr</span>
                       </a>
                    )}
                 </div>
               </div>
            )}
          </div>
        </div>

        {footer.customHtml && <div className="mb-12" dangerouslySetInnerHTML={{ __html: footer.customHtml }} />}
        
        {/* Footer Bottom Line */}
        <div className="h-px w-full bg-gray-200 dark:bg-gray-800 mb-12"></div>
        
        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400 gap-8">
           <div className="flex items-center gap-8 relative z-[500]">
             <Link 
               to="/admin" 
               className="px-8 py-4 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-500 hover:text-white transition-all shadow-md border border-gray-200 dark:border-gray-700 active:scale-95 whitespace-nowrap block"
               style={{ pointerEvents: 'auto' }}
             >
               Admin Panel Access
             </Link>
           </div>
           
           <p className="font-medium text-center md:text-left">&copy; {year} {general.name} &bull; {footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
