
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { SiteContent, HistoryEntry } from '../types';
import { INITIAL_CONTENT } from '../constants';

interface ContentContextType {
  content: SiteContent;
  updateContent: (newContent: SiteContent, isPublish?: boolean) => void;
  resetContent: () => void;
  history: HistoryEntry[];
  restoreHistory: (id: string) => void;
}

const SiteContext = createContext<ContentContextType | undefined>(undefined);

const MAX_HISTORY = 5;

/**
 * STRICT RULES ENFORCEMENT:
 * Recursively removes any base64 (data:) or Blob URLs from the content object.
 * This ensures browser storage never contains large media files.
 */
const sanitizeMediaForStorage = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeMediaForStorage(item));
  }

  const newObj: any = {};
  for (const key in obj) {
    let val = obj[key];
    if (typeof val === 'string' && (val.startsWith('data:') || val.startsWith('blob:'))) {
      // Discard local references to enforce Cloudinary migration
      val = ""; 
    } else if (typeof val === 'object') {
      val = sanitizeMediaForStorage(val);
    }
    newObj[key] = val;
  }
  return newObj;
};

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(INITIAL_CONTENT);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const location = useLocation();

  const loadData = useCallback(() => {
    const isAdmin = location.pathname.includes('/admin') || window.location.hash.includes('/admin');
    
    const savedLive = localStorage.getItem('siteContent_live');
    const savedDraft = localStorage.getItem('siteContent_draft');
    const savedHistory = localStorage.getItem('siteHistory');
    
    let baseContent = INITIAL_CONTENT;

    if (savedLive) {
      try {
        baseContent = sanitizeMediaForStorage(JSON.parse(savedLive));
      } catch (e) {
        console.error("Failed to parse live content", e);
      }
    }

    if (isAdmin && savedDraft) {
      try {
        baseContent = sanitizeMediaForStorage(JSON.parse(savedDraft));
      } catch (e) {
        console.error("Failed to parse draft content", e);
      }
    }
    
    setContent(baseContent);
    
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory).slice(0, MAX_HISTORY));
      } catch (e) {}
    }
    
    setIsLoaded(true);
  }, [location.pathname]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'siteContent_live' || e.key === 'siteContent_draft') {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadData]);

  const updateContent = (newContent: SiteContent, isPublish: boolean = false) => {
    // Sanitize content before any form of storage persistence
    const cleanContent = sanitizeMediaForStorage(newContent);
    
    setContent(cleanContent);
    
    const saveData = (key: string, data: any) => {
      try {
        // Double check: Never store base64 in local storage
        const sanitizedData = sanitizeMediaForStorage(data);
        localStorage.setItem(key, JSON.stringify(sanitizedData));
      } catch (error: any) {
        console.error("Storage Error:", error);
        localStorage.removeItem('siteHistory');
      }
    };
    
    saveData('siteContent_draft', cleanContent);
    
    if (isPublish) {
      saveData('siteContent_live', cleanContent);
      
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        label: `Published: ${new Date().toLocaleString()}`,
        content: JSON.stringify(cleanContent)
      };
      const newHistory = [entry, ...history].slice(0, MAX_HISTORY);
      setHistory(newHistory);
      saveData('siteHistory', newHistory);
    }
  };

  const restoreHistory = (id: string) => {
    const entry = history.find(h => h.id === id);
    if (entry) {
      try {
        const restored = sanitizeMediaForStorage(JSON.parse(entry.content));
        setContent(restored);
        localStorage.setItem('siteContent_draft', JSON.stringify(restored));
      } catch (e) {
        console.error("Failed to restore version", e);
      }
    }
  };

  const resetContent = () => {
    if (window.confirm("CRITICAL: Reset all site content to defaults? This will clear all Cloudinary links in your draft.")) {
      localStorage.removeItem('siteContent_draft');
      localStorage.removeItem('siteContent_live');
      localStorage.removeItem('siteHistory');
      window.location.reload();
    }
  };

  if (!isLoaded) return null;

  return (
    <SiteContext.Provider value={{ content, updateContent, resetContent, history, restoreHistory }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useContent must be used within a ContentProvider');
  return context;
};
