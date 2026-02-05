import React from 'react';
import { BuilderElement, BuilderStyle } from '../../types';
import { useEditor } from '../../context/EditorContext';
import { Trash2, Move, Plus, Copy, Palette } from 'lucide-react';

interface BuilderRendererProps {
  element: BuilderElement;
  isRoot?: boolean;
}

const BuilderRenderer: React.FC<BuilderRendererProps> = ({ element, isRoot = false }) => {
  const { selectedElementId, selectElement, moveElement, removeElement, addElement, isEditing } = useEditor();
  const isSelected = selectedElementId === element.id;

  // Stop propagation to select nested elements correctly
  const handleSelect = (e: React.MouseEvent) => {
    if (!isEditing) return;
    e.stopPropagation();
    selectElement?.(element.id);
  };

  const commonStyle: React.CSSProperties = {
    ...element.style as React.CSSProperties,
    position: 'relative', // Ensure controls position correctly
  };
  
  // Highlight styles for editor
  const editorClass = isEditing 
    ? `relative group/builder transition-all duration-200 cursor-pointer ${isSelected ? 'ring-2 ring-primary-500 z-50' : 'hover:ring-1 hover:ring-primary-300 hover:bg-primary-50/10'}`
    : '';

  const Controls = () => {
    if (!isEditing || !isSelected) return null;
    return (
      <div className="absolute -top-8 left-0 flex items-center gap-1 bg-primary-500 text-white rounded-t-lg px-2 py-1 text-xs font-bold z-[100] shadow-lg">
         <span className="uppercase mr-2">{element.type}</span>
         <button onClick={(e) => { e.stopPropagation(); moveElement?.(element.id, 'up'); }} className="p-1 hover:bg-white/20 rounded" title="Move Up/Left">←</button>
         <button onClick={(e) => { e.stopPropagation(); moveElement?.(element.id, 'down'); }} className="p-1 hover:bg-white/20 rounded" title="Move Down/Right">→</button>
         <div className="w-px h-3 bg-white/30 mx-1"></div>
         <button onClick={(e) => { e.stopPropagation(); removeElement?.(element.id); }} className="p-1 hover:bg-red-500 rounded" title="Delete"><Trash2 size={12}/></button>
      </div>
    );
  };

  // Render content based on type
  const renderContent = () => {
    switch (element.type) {
      case 'container':
      case 'section':
      case 'card':
        return (
          <div 
             id={element.id}
             style={commonStyle} 
             onClick={handleSelect}
             className={editorClass}
          >
             <Controls />
             {element.children?.map(child => <BuilderRenderer key={child.id} element={child} />)}
             {isEditing && (element.children?.length === 0) && (
                <div className="p-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg m-2">
                   <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Empty {element.type}</p>
                   <button 
                     onClick={(e) => { e.stopPropagation(); selectElement?.(element.id); }} 
                     className="text-xs text-primary-500 hover:underline"
                   >
                     Select to Add Elements
                   </button>
                </div>
             )}
          </div>
        );
      
      case 'row':
        return (
          <div 
             id={element.id}
             style={commonStyle} 
             onClick={handleSelect}
             className={`${editorClass} flex flex-wrap`}
          >
             <Controls />
             {element.children?.map(child => <BuilderRenderer key={child.id} element={child} />)}
          </div>
        );

      case 'column':
        return (
          <div 
             id={element.id}
             style={commonStyle} 
             onClick={handleSelect}
             className={editorClass}
          >
             <Controls />
             {element.children?.map(child => <BuilderRenderer key={child.id} element={child} />)}
             {isEditing && (!element.children || element.children.length === 0) && (
                <div className="h-20 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded bg-gray-50/50 m-1">
                   <span className="text-xs text-gray-400">Column</span>
                </div>
             )}
          </div>
        );

      case 'text':
        return (
          <p 
            id={element.id}
            style={commonStyle}
            onClick={handleSelect}
            className={editorClass}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => {
                if (isEditing) {
                    // We need a way to update content without full re-render on every keystroke
                    // EditorContext should handle this via `updateElementContent`
                    // For now, we assume onBlur is enough
                    // e.target.innerText
                }
            }}
          >
            <Controls />
            {element.content}
          </p>
        );

      case 'heading':
        const Tag = (element.props?.level || 'h2') as any;
        return (
          <Tag 
            id={element.id}
            style={commonStyle}
            onClick={handleSelect}
            className={editorClass}
            contentEditable={isEditing}
            suppressContentEditableWarning
          >
            <Controls />
            {element.content}
          </Tag>
        );

      case 'button':
         return (
           <div className={`inline-block ${editorClass}`} onClick={handleSelect}>
             <Controls />
             <button style={commonStyle} className="transition-transform active:scale-95">
                {element.content}
             </button>
           </div>
         );

      case 'image':
         return (
           <div className={`${editorClass} inline-block`} onClick={handleSelect} style={{ width: element.style.width, height: element.style.height }}>
              <Controls />
              <img src={element.content} style={{...commonStyle, width: '100%', height: '100%'}} alt="Builder Content" />
           </div>
         );

      case 'icon':
         return (
            <div className={`${editorClass} inline-block`} onClick={handleSelect}>
               <Controls />
               <div style={commonStyle}>★</div> {/* Placeholder for dynamic icon */}
            </div>
         );
         
      case 'divider':
         return (
            <div className={editorClass} onClick={handleSelect}>
               <Controls />
               <hr style={commonStyle} />
            </div>
         );
         
      case 'spacer':
         return (
            <div className={editorClass} onClick={handleSelect} style={{ ...commonStyle, minHeight: element.style.height || '50px' }}>
               <Controls />
               {isEditing && <div className="absolute inset-0 bg-gray-100/20 border-y border-dashed border-gray-300 opacity-50 flex items-center justify-center text-[10px] text-gray-400">Spacer</div>}
            </div>
         );

      default:
        return null;
    }
  };

  return renderContent();
};

export default BuilderRenderer;