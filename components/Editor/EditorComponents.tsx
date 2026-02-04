
import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import { Camera, Eye, EyeOff, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import ImageUploader from '../Admin/ImageUploader';

// --- EDITABLE TEXT ---
interface EditableTextProps extends React.HTMLAttributes<HTMLElement> {
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  path: string;
  value: string;
  multiline?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({ 
  tag: Tag = 'div', 
  path, 
  value, 
  className = '', 
  multiline = false,
  ...props 
}) => {
  const { isEditing, updateField } = useEditor();
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  if (!isEditing) {
    return <Tag className={className} {...props}>{value}</Tag>;
  }

  return (
    <Tag
      className={`${className} outline-none transition-all duration-200 border border-transparent hover:border-primary-500 hover:bg-primary-50/10 rounded px-1 -mx-1 relative cursor-text focus:border-primary-500 focus:bg-white focus:text-black focus:ring-2 focus:ring-primary-200 focus:shadow-lg focus:z-50`}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const newValue = e.target.innerText;
        if (newValue !== value) {
          updateField?.(path, newValue);
        }
      }}
      dangerouslySetInnerHTML={{ __html: localValue }}
      {...props}
    />
  );
};

// --- EDITABLE IMAGE ---
interface EditableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  path: string;
  label?: string;
  aspect?: number;
}

export const EditableImage: React.FC<EditableImageProps> = ({ path, src, className, label, aspect, ...props }) => {
  const { isEditing, updateField } = useEditor();
  const [isUploading, setIsUploading] = useState(false);

  if (!isEditing) {
    return <img src={src} className={className} {...props} />;
  }

  return (
    <div className={`relative group ${className} overflow-hidden`}>
      <img src={src} className="w-full h-full object-cover" {...props} />
      
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsUploading(true); }}
        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer z-10"
      >
        <Camera size={32} />
        <span className="text-xs font-bold uppercase mt-2">Change Image</span>
      </button>

      {isUploading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={(e) => e.stopPropagation()}>
           <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-lg dark:text-white">Edit Image</h3>
                 <button onClick={() => setIsUploading(false)} className="text-gray-500"><EyeOff size={20}/></button>
              </div>
              <ImageUploader 
                currentImage={src} 
                aspect={aspect}
                label={label}
                onImageChange={(newUrl) => {
                  updateField?.(path, newUrl);
                  setIsUploading(false);
                }} 
              />
           </div>
        </div>
      )}
    </div>
  );
};

// --- SECTION WRAPPER ---
interface SectionWrapperProps {
  sectionKey: string;
  children: React.ReactNode;
  title: string;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({ sectionKey, children, title }) => {
  const { isEditing, toggleSectionVisibility, moveSection, updateField } = useEditor();
  // We need to access content to check if enabled, but useEditor doesn't provide it directly to avoid cycles.
  // We assume the parent passes visibility state or we rely on the component rendering logic.
  // In this implementation, the SectionWrapper adds the CONTROLS overlaid on the section.

  if (!isEditing) return <>{children}</>;

  return (
    <div className="relative group/section border-2 border-transparent hover:border-primary-500/30 transition-all duration-300">
       <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[50] flex items-center gap-1 bg-gray-900 text-white rounded-full px-4 py-1.5 opacity-0 group-hover/section:opacity-100 transition-opacity shadow-xl scale-90 group-hover/section:scale-100 pointer-events-none group-hover/section:pointer-events-auto">
          <span className="text-[10px] font-black uppercase tracking-widest mr-2">{title}</span>
          <button onClick={() => moveSection?.(sectionKey, 'up')} className="p-1 hover:text-primary-400" title="Move Up"><ArrowUp size={14}/></button>
          <button onClick={() => moveSection?.(sectionKey, 'down')} className="p-1 hover:text-primary-400" title="Move Down"><ArrowDown size={14}/></button>
          <div className="w-px h-3 bg-gray-700 mx-1"></div>
          <button onClick={() => toggleSectionVisibility?.(sectionKey)} className="p-1 hover:text-red-400" title="Hide Section"><EyeOff size={14}/></button>
       </div>
       {children}
    </div>
  );
};
