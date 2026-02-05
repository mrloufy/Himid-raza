
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

// Reduced history limit to save storage space
const MAX_HISTORY = 5;

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(INITIAL_CONTENT);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const location = useLocation();

  const loadData = useCallback(() => {
    // Detect if we are in admin mode based on current route
    const isAdmin = location.pathname.includes('/admin') || window.location.hash.includes('/admin');
    
    const savedLive = localStorage.getItem('siteContent_live');
    const savedDraft = localStorage.getItem('siteContent_draft');
    const savedHistory = localStorage.getItem('siteHistory');
    
    let baseContent = INITIAL_CONTENT;

    // Default to Live content for the site
    if (savedLive) {
      try {
        baseContent = JSON.parse(savedLive);
      } catch (e) {
        console.error("Failed to parse live content", e);
      }
    }

    // Admin view should prioritize the Draft content for editing
    if (isAdmin && savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        baseContent = draft;
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

  // Load data on mount and whenever the path changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle storage events for multi-tab sync
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
    // 1. Immediate UI Update
    setContent(newContent);
    
    const saveData = (key: string, data: any) => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error: any) {
        if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          console.warn("Storage quota reached. Purging older history to make space...");
          // Try to clear history to free space
          localStorage.removeItem('siteHistory');
          setHistory([]);
          // Try saving the data again after clearing history
          try {
             localStorage.setItem(key, JSON.stringify(data));
          } catch (retryError) {
             console.error("Critical Storage Error: Space still insufficient even after history purge.");
             alert("Storage Error: Your browser storage is full. Please delete some projects or optimize your images further.");
          }
        } else {
          console.error("Storage Error:", error);
        }
      }
    };
    
    // 2. Persist to Draft (always)
    saveData('siteContent_draft', newContent);
    
    // 3. If Publishing, Persist to Live site storage
    if (isPublish) {
      saveData('siteContent_live', newContent);
      
      // Add to history
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        label: `Published: ${new Date().toLocaleString()}`,
        content: JSON.stringify(newContent)
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
        const restored = JSON.parse(entry.content);
        setContent(restored);
        localStorage.setItem('siteContent_draft', entry.content);
      } catch (e) {
        console.error("Failed to restore version", e);
      }
    }
  };

  const resetContent = () => {
    if (window.confirm("CRITICAL: Reset all site content to defaults? This cannot be undone.")) {
      setContent(INITIAL_CONTENT);
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
