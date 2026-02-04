
import React, { useState } from 'react';
import { EditorProvider, useEditor } from '../context/EditorContext';
import Home from './Home';
import { 
  Laptop, Tablet, Smartphone, Save, ArrowLeft, Undo, Palette, 
  Type, Layout, Moon, Sun, CheckCircle2, AlertCircle, Plus, Trash2,
  BoxSelect, Image as ImageIcon, Type as TypeIcon, Square, MoreHorizontal,
  Columns, AlignLeft, AlignCenter, AlignRight, Bold, Move
} from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/Layout/ThemeToggle';
import { BuilderElementType } from '../types';

const EditorToolbar = () => {
  const { deviceMode, setDeviceMode, saveChanges, hasUnsavedChanges, addCustomSection } = useEditor();
  const { content, updateContent } = useContent();
  const navigate = useNavigate();

  return (
    <div className="h-16 bg-white dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shadow-sm z-[100] fixed top-0 left-0 right-0">
       <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500" title="Exit Editor">
             <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
          <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layout size={18} className="text-primary-500"/> Website Builder
          </span>
       </div>

       <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button 
             onClick={() => setDeviceMode?.('desktop')}
             className={`p-2 rounded-md transition-all ${deviceMode === 'desktop' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
             <Laptop size={18} />
          </button>
          <button 
             onClick={() => setDeviceMode?.('tablet')}
             className={`p-2 rounded-md transition-all ${deviceMode === 'tablet' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
             <Tablet size={18} />
          </button>
          <button 
             onClick={() => setDeviceMode?.('mobile')}
             className={`p-2 rounded-md transition-all ${deviceMode === 'mobile' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
             <Smartphone size={18} />
          </button>
       </div>

       <div className="flex items-center gap-4">
          <button 
             onClick={() => addCustomSection?.()} 
             className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold hover:opacity-90"
          >
             <Plus size={16}/> Add New Section
          </button>
          <ThemeToggle />
          <button 
             onClick={saveChanges}
             disabled={!hasUnsavedChanges}
             className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${hasUnsavedChanges ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
             {hasUnsavedChanges ? <Save size={18} /> : <CheckCircle2 size={18} />}
             <span>{hasUnsavedChanges ? 'Save' : 'Saved'}</span>
          </button>
       </div>
    </div>
  );
};

const ElementButton = ({ type, icon: Icon, label, onClick }: { type: string, icon: any, label: string, onClick: () => void }) => (
    <button 
       onClick={onClick}
       className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-gray-800 transition-all gap-2 text-gray-600 dark:text-gray-300 group"
    >
       <Icon size={20} className="group-hover:text-primary-500" />
       <span className="text-[10px] font-bold uppercase">{label}</span>
    </button>
);

const EditorSidebar = () => {
  const { selectedElementId, findElement, addElement, updateElementStyle, removeElement, updateElementContent, selectElement } = useEditor();
  const selectedElement = selectedElementId ? findElement?.(selectedElementId) : null;
  const [activeTab, setActiveTab] = useState<'add' | 'style'>('add');

  // If selection changes, default to style tab if element selected
  React.useEffect(() => {
    if (selectedElementId) setActiveTab('style');
    else setActiveTab('add');
  }, [selectedElementId]);

  return (
    <div className="w-80 bg-white dark:bg-[#1E1E1E] border-l border-gray-200 dark:border-gray-800 fixed top-16 right-0 bottom-0 flex flex-col z-[90] shadow-xl">
       
       {/* Sidebar Tabs */}
       <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button onClick={() => setActiveTab('add')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'add' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500'}`}>Add Elements</button>
          <button onClick={() => setActiveTab('style')} disabled={!selectedElement} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'style' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-400'}`}>Edit Style</button>
       </div>

       <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          
          {/* ADD ELEMENTS PANEL */}
          {activeTab === 'add' && (
             <div className="space-y-6">
                {!selectedElement ? (
                   <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg text-xs leading-relaxed border border-yellow-200 dark:border-yellow-800">
                      <strong>Tip:</strong> Select a container, row, or column on the canvas to add elements inside it.
                   </div>
                ) : (
                   <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Adding to:</span>
                      <span className="font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{selectedElement.type}</span>
                   </div>
                )}
                
                <div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Layout</h3>
                   <div className="grid grid-cols-3 gap-2">
                      <ElementButton type="container" icon={BoxSelect} label="Box" onClick={() => addElement?.(selectedElementId!, 'container', { style: { padding: '2rem' } })} />
                      <ElementButton type="row" icon={Columns} label="Row" onClick={() => addElement?.(selectedElementId!, 'row')} />
                      <ElementButton type="column" icon={Layout} label="Col" onClick={() => addElement?.(selectedElementId!, 'column')} />
                   </div>
                </div>

                <div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Content</h3>
                   <div className="grid grid-cols-3 gap-2">
                      <ElementButton type="heading" icon={Type} label="Heading" onClick={() => addElement?.(selectedElementId!, 'heading')} />
                      <ElementButton type="text" icon={TypeIcon} label="Text" onClick={() => addElement?.(selectedElementId!, 'text')} />
                      <ElementButton type="image" icon={ImageIcon} label="Image" onClick={() => addElement?.(selectedElementId!, 'image')} />
                      <ElementButton type="button" icon={Square} label="Button" onClick={() => addElement?.(selectedElementId!, 'button')} />
                      <ElementButton type="divider" icon={MoreHorizontal} label="Divider" onClick={() => addElement?.(selectedElementId!, 'divider', { style: { width: '100%', borderTop: '1px solid #ddd', margin: '1rem 0', height: '1px' } })} />
                      <ElementButton type="spacer" icon={Move} label="Spacer" onClick={() => addElement?.(selectedElementId!, 'spacer', { style: { height: '50px', width: '100%' } })} />
                   </div>
                </div>
             </div>
          )}

          {/* STYLE EDITOR PANEL */}
          {activeTab === 'style' && selectedElement && (
             <div className="space-y-8 animate-fade-in">
                <div className="flex justify-between items-center pb-4 border-b dark:border-gray-800">
                   <div>
                      <h3 className="font-bold text-gray-900 dark:text-white capitalize">{selectedElement.type} Settings</h3>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">{selectedElement.id}</p>
                   </div>
                   <button onClick={() => removeElement?.(selectedElement.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete Element"><Trash2 size={18}/></button>
                </div>

                {/* Content Editor */}
                {['text', 'heading', 'button'].includes(selectedElement.type) && (
                   <div>
                      <label className="label">Text Content</label>
                      <textarea 
                         value={selectedElement.content} 
                         onChange={(e) => updateElementContent?.(selectedElement.id, e.target.value)}
                         className="input-field h-24"
                      />
                   </div>
                )}
                
                {selectedElement.type === 'image' && (
                   <div>
                      <label className="label">Image URL</label>
                      <input 
                         type="text"
                         value={selectedElement.content} 
                         onChange={(e) => updateElementContent?.(selectedElement.id, e.target.value)}
                         className="input-field"
                      />
                   </div>
                )}

                {/* Spacing */}
                <div>
                   <label className="label">Spacing (Padding / Margin)</label>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <span className="text-[10px] text-gray-400 mb-1 block">Padding</span>
                         <input type="text" value={selectedElement.style.padding || ''} onChange={(e) => updateElementStyle?.(selectedElement.id, { padding: e.target.value })} className="input-field" placeholder="10px" />
                      </div>
                      <div>
                         <span className="text-[10px] text-gray-400 mb-1 block">Margin</span>
                         <input type="text" value={selectedElement.style.margin || ''} onChange={(e) => updateElementStyle?.(selectedElement.id, { margin: e.target.value })} className="input-field" placeholder="0px" />
                      </div>
                   </div>
                </div>

                {/* Dimensions */}
                <div>
                   <label className="label">Size (Width / Height)</label>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <span className="text-[10px] text-gray-400 mb-1 block">Width</span>
                         <input type="text" value={selectedElement.style.width || ''} onChange={(e) => updateElementStyle?.(selectedElement.id, { width: e.target.value })} className="input-field" placeholder="100%" />
                      </div>
                      <div>
                         <span className="text-[10px] text-gray-400 mb-1 block">Height</span>
                         <input type="text" value={selectedElement.style.height || ''} onChange={(e) => updateElementStyle?.(selectedElement.id, { height: e.target.value })} className="input-field" placeholder="auto" />
                      </div>
                   </div>
                </div>

                {/* Typography */}
                {['text', 'heading', 'button', 'container', 'column'].includes(selectedElement.type) && (
                   <div>
                      <label className="label">Typography</label>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                         <input type="number" placeholder="Size (px)" value={parseInt(selectedElement.style.fontSize || '16')} onChange={(e) => updateElementStyle?.(selectedElement.id, { fontSize: e.target.value + 'px' })} className="input-field" />
                         <input type="color" value={selectedElement.style.color || '#000000'} onChange={(e) => updateElementStyle?.(selectedElement.id, { color: e.target.value })} className="h-10 w-full p-1 rounded bg-transparent border dark:border-gray-700" />
                      </div>
                      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                         {['left', 'center', 'right'].map((align) => (
                            <button 
                               key={align} 
                               onClick={() => updateElementStyle?.(selectedElement.id, { textAlign: align as any })}
                               className={`flex-1 p-2 rounded flex justify-center ${selectedElement.style.textAlign === align ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-400'}`}
                            >
                               {align === 'left' && <AlignLeft size={16}/>}
                               {align === 'center' && <AlignCenter size={16}/>}
                               {align === 'right' && <AlignRight size={16}/>}
                            </button>
                         ))}
                      </div>
                   </div>
                )}

                {/* Appearance */}
                <div>
                   <label className="label">Appearance</label>
                   <div className="space-y-3">
                      <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-600 dark:text-gray-400">Background</span>
                         <div className="flex items-center gap-2">
                            <input type="text" value={selectedElement.style.backgroundColor || ''} onChange={(e) => updateElementStyle?.(selectedElement.id, { backgroundColor: e.target.value })} className="input-field w-24 text-xs py-1" placeholder="#fff" />
                            <input type="color" value={selectedElement.style.backgroundColor || '#ffffff'} onChange={(e) => updateElementStyle?.(selectedElement.id, { backgroundColor: e.target.value })} className="h-8 w-8 p-0 border-0 rounded" />
                         </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-600 dark:text-gray-400">Radius</span>
                         <input type="text" value={selectedElement.style.borderRadius || ''} onChange={(e) => updateElementStyle?.(selectedElement.id, { borderRadius: e.target.value })} className="input-field w-24 text-xs py-1" placeholder="4px" />
                      </div>
                   </div>
                </div>

                {/* Flex/Grid Props for Containers */}
                {['row', 'column', 'container'].includes(selectedElement.type) && (
                   <div>
                      <label className="label">Layout Flex</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                          <button onClick={() => updateElementStyle?.(selectedElement.id, { alignItems: 'flex-start' })} className="p-2 border rounded">Align Start</button>
                          <button onClick={() => updateElementStyle?.(selectedElement.id, { alignItems: 'center' })} className="p-2 border rounded">Align Center</button>
                          <button onClick={() => updateElementStyle?.(selectedElement.id, { justifyContent: 'space-between' })} className="p-2 border rounded">Space Between</button>
                          <button onClick={() => updateElementStyle?.(selectedElement.id, { gap: '2rem' })} className="p-2 border rounded">Gap 2rem</button>
                      </div>
                   </div>
                )}

             </div>
          )}
       </div>

       <style>{`
          .label { font-size: 10px; font-weight: 800; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
          .input-field { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; font-size: 13px; }
          .dark .input-field { background: #2d2d2d; border-color: #404040; color: white; }
       `}</style>
    </div>
  );
};

const EditorCanvas = () => {
  const { deviceMode, selectElement } = useEditor();
  
  const getWidth = () => {
     switch(deviceMode) {
        case 'mobile': return '375px';
        case 'tablet': return '768px';
        default: return '100%';
     }
  };

  return (
     <div 
        className={`mt-16 xl:mr-80 min-h-screen bg-gray-100 dark:bg-[#0a0a0a] overflow-x-hidden flex justify-center p-8 transition-all duration-300`}
        onClick={() => selectElement?.(null)} // Deselect on click outside
     >
        <div 
           className="bg-white dark:bg-[#1E1E1E] shadow-2xl transition-all duration-500 ease-in-out origin-top relative"
           onClick={(e) => e.stopPropagation()}
           style={{ 
              width: getWidth(),
              minHeight: 'calc(100vh - 8rem)',
              transform: deviceMode === 'desktop' ? 'none' : 'scale(0.95)',
              borderRadius: deviceMode === 'desktop' ? '0' : '40px',
              border: deviceMode === 'desktop' ? 'none' : '12px solid #2d2d2d',
              overflow: deviceMode === 'desktop' ? 'visible' : 'hidden'
           }}
        >
           <Home />
        </div>
     </div>
  );
};

const VisualEditor: React.FC = () => {
  return (
    <EditorProvider>
       <div className="min-h-screen bg-white dark:bg-[#1E1E1E]">
          <EditorToolbar />
          <EditorSidebar />
          <EditorCanvas />
       </div>
    </EditorProvider>
  );
};

export default VisualEditor;
