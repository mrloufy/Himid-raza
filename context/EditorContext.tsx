
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useContent } from './SiteContext';
import { SiteContent, BuilderElement, BuilderElementType, BuilderStyle } from '../types';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

interface EditorContextType {
  isEditing: boolean;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  
  // Legacy/Standard Fields
  updateField: (path: string, value: any) => void;
  toggleSectionVisibility: (sectionKey: string) => void;
  moveSection: (sectionKey: string, direction: 'up' | 'down') => void;
  
  // New Builder Logic
  selectedElementId: string | null;
  selectElement: (id: string | null) => void;
  addElement: (parentId: string, type: BuilderElementType, initialContent?: Partial<BuilderElement>) => void;
  removeElement: (id: string) => void;
  updateElementStyle: (id: string, style: Partial<BuilderStyle>) => void;
  updateElementContent: (id: string, content: string) => void;
  updateElementProps: (id: string, props: Record<string, any>) => void;
  moveElement: (id: string, direction: 'up' | 'down' | 'left' | 'right') => void;
  addCustomSection: () => void;
  removeSection: (id: string) => void;

  saveChanges: () => void;
  hasUnsavedChanges: boolean;
  
  // Helper to find element
  findElement: (id: string) => BuilderElement | null;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

// Helper to generate IDs
const generateId = () => `el_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { content, updateContent } = useContent();
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Helper to set nested value by path string
  const setDeep = (obj: any, path: string, value: any) => {
    const newObj = JSON.parse(JSON.stringify(obj));
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let current = newObj;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    return newObj;
  };

  const updateField = useCallback((path: string, value: any) => {
    const newContent = setDeep(content, path, value);
    updateContent(newContent, false);
    setHasUnsavedChanges(true);
  }, [content, updateContent]);

  const toggleSectionVisibility = useCallback((sectionKey: string) => {
    const isEnabled = content.enabledSections[sectionKey] !== false;
    updateField(`enabledSections.${sectionKey}`, !isEnabled);
  }, [content, updateField]);

  const moveSection = useCallback((sectionKey: string, direction: 'up' | 'down') => {
    const homeOrder = [...content.pageStructure.home];
    const index = homeOrder.indexOf(sectionKey);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      [homeOrder[index], homeOrder[index - 1]] = [homeOrder[index - 1], homeOrder[index]];
    } else if (direction === 'down' && index < homeOrder.length - 1) {
      [homeOrder[index], homeOrder[index + 1]] = [homeOrder[index + 1], homeOrder[index]];
    }
    
    updateField('pageStructure.home', homeOrder);
  }, [content, updateField]);

  // --- BUILDER LOGIC ---

  // Deep clone helper
  const cloneContent = () => JSON.parse(JSON.stringify(content)) as SiteContent;

  const findElementRecursive = (root: BuilderElement, id: string): BuilderElement | null => {
    if (root.id === id) return root;
    if (root.children) {
      for (const child of root.children) {
        const found = findElementRecursive(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const findElement = useCallback((id: string): BuilderElement | null => {
    if (!content.customSections) return null;
    for (const key in content.customSections) {
      const found = findElementRecursive(content.customSections[key], id);
      if (found) return found;
    }
    return null;
  }, [content]);

  const updateBuilderTree = (updater: (sections: Record<string, BuilderElement>) => void) => {
    const newContent = cloneContent();
    if (!newContent.customSections) newContent.customSections = {};
    updater(newContent.customSections);
    updateContent(newContent, false);
    setHasUnsavedChanges(true);
  };

  const addCustomSection = () => {
    const id = `custom-${Date.now()}`;
    const newSection: BuilderElement = {
      id,
      type: 'section',
      name: 'New Section',
      style: { padding: '4rem 2rem', backgroundColor: '#ffffff' },
      children: [
        {
          id: generateId(),
          type: 'container',
          style: { width: '100%', maxWidth: '1200px', margin: '0 auto' },
          children: [
             {
               id: generateId(),
               type: 'row',
               style: { display: 'flex', flexDirection: 'row', gap: '2rem', flexWrap: 'wrap' },
               children: [
                 { id: generateId(), type: 'column', style: { flex: '1', minWidth: '300px' }, children: [] }
               ]
             }
          ]
        }
      ]
    };

    updateBuilderTree((sections) => {
      sections[id] = newSection;
    });

    const newOrder = [...content.pageStructure.home, id];
    updateField('pageStructure.home', newOrder);
  };

  const removeSection = (id: string) => {
    if (window.confirm("Delete this section permanently?")) {
      const newOrder = content.pageStructure.home.filter(s => s !== id);
      updateField('pageStructure.home', newOrder);
      
      updateBuilderTree((sections) => {
        delete sections[id];
      });
      setSelectedElementId(null);
    }
  };

  const addElement = (parentId: string, type: BuilderElementType, initialContent: Partial<BuilderElement> = {}) => {
    const newElement: BuilderElement = {
      id: generateId(),
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      style: { ...initialContent.style },
      content: initialContent.content || '',
      props: initialContent.props || {},
      children: []
    };

    // Default styles based on type
    if (type === 'button') {
        newElement.style = { padding: '0.75rem 1.5rem', backgroundColor: content.general.brandColor || '#000', color: '#fff', borderRadius: '0.5rem', display: 'inline-block', ...newElement.style };
        newElement.content = newElement.content || 'Click Me';
    } else if (type === 'heading') {
        newElement.style = { fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', ...newElement.style };
        newElement.content = newElement.content || 'New Heading';
    } else if (type === 'text') {
        newElement.style = { fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem', ...newElement.style };
        newElement.content = newElement.content || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
    } else if (type === 'image') {
        newElement.style = { width: '100%', height: 'auto', borderRadius: '0.5rem', ...newElement.style };
        newElement.content = newElement.content || 'https://via.placeholder.com/400x300';
    } else if (type === 'card') {
        newElement.style = { padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', ...newElement.style };
    } else if (type === 'row') {
        newElement.style = { display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%', ...newElement.style };
    } else if (type === 'column') {
        newElement.style = { flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '1rem', ...newElement.style };
    }

    updateBuilderTree((sections) => {
      const addRecursive = (el: BuilderElement): boolean => {
        if (el.id === parentId) {
          if (!el.children) el.children = [];
          el.children.push(newElement);
          return true;
        }
        if (el.children) {
          for (const child of el.children) {
            if (addRecursive(child)) return true;
          }
        }
        return false;
      };

      for (const key in sections) {
        if (addRecursive(sections[key])) break;
      }
    });
  };

  const removeElement = (id: string) => {
    updateBuilderTree((sections) => {
      const removeRecursive = (el: BuilderElement) => {
        if (!el.children) return;
        const idx = el.children.findIndex(c => c.id === id);
        if (idx !== -1) {
          el.children.splice(idx, 1);
          return true;
        }
        for (const child of el.children) {
          if (removeRecursive(child)) return true;
        }
      };

      for (const key in sections) {
        if (removeRecursive(sections[key])) break;
      }
    });
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const updateElementStyle = (id: string, style: Partial<BuilderStyle>) => {
    updateBuilderTree((sections) => {
      const findAndUpdate = (el: BuilderElement) => {
        if (el.id === id) {
          el.style = { ...el.style, ...style };
          return true;
        }
        if (el.children) {
          for (const child of el.children) {
            if (findAndUpdate(child)) return true;
          }
        }
        return false;
      };
      for (const key in sections) {
        if (findAndUpdate(sections[key])) break;
      }
    });
  };

  const updateElementContent = (id: string, contentVal: string) => {
    updateBuilderTree((sections) => {
        const findAndUpdate = (el: BuilderElement) => {
            if (el.id === id) {
                el.content = contentVal;
                return true;
            }
            if (el.children) {
                for (const child of el.children) {
                    if (findAndUpdate(child)) return true;
                }
            }
            return false;
        };
        for (const key in sections) {
            if (findAndUpdate(sections[key])) break;
        }
    });
  };

  const updateElementProps = (id: string, props: Record<string, any>) => {
      updateBuilderTree((sections) => {
          const findAndUpdate = (el: BuilderElement) => {
              if (el.id === id) {
                  el.props = { ...el.props, ...props };
                  return true;
              }
              if (el.children) {
                  for (const child of el.children) {
                      if (findAndUpdate(child)) return true;
                  }
              }
              return false;
          };
          for (const key in sections) {
              if (findAndUpdate(sections[key])) break;
          }
      });
  };

  const moveElement = (id: string, direction: 'up' | 'down' | 'left' | 'right') => {
    updateBuilderTree((sections) => {
      const findAndMove = (parent: BuilderElement) => {
        if (!parent.children) return false;
        const idx = parent.children.findIndex(c => c.id === id);
        if (idx !== -1) {
          if (direction === 'up' || direction === 'left') {
            if (idx > 0) {
              [parent.children[idx], parent.children[idx - 1]] = [parent.children[idx - 1], parent.children[idx]];
            }
          } else {
            if (idx < parent.children.length - 1) {
              [parent.children[idx], parent.children[idx + 1]] = [parent.children[idx + 1], parent.children[idx]];
            }
          }
          return true;
        }
        for (const child of parent.children) {
          if (findAndMove(child)) return true;
        }
        return false;
      };

      for (const key in sections) {
        if (findAndMove(sections[key])) break;
      }
    });
  };

  const saveChanges = () => {
    updateContent(content, true);
    setHasUnsavedChanges(false);
  };

  return (
    <EditorContext.Provider value={{
      isEditing: true,
      deviceMode,
      setDeviceMode,
      updateField,
      toggleSectionVisibility,
      moveSection,
      selectedElementId,
      selectElement: setSelectedElementId,
      addElement,
      removeElement,
      updateElementStyle,
      updateElementContent,
      updateElementProps,
      moveElement,
      addCustomSection,
      removeSection,
      saveChanges,
      hasUnsavedChanges,
      findElement
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) return { isEditing: false, deviceMode: 'desktop' as DeviceMode } as Partial<EditorContextType>;
  return context;
};
