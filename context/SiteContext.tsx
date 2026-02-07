import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { SiteContent, HistoryEntry } from '../types';
import { INITIAL_CONTENT } from '../constants';

const SUPABASE_URL = 'https://tdmivcbzekatmboyvtce.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkbWl2Y2J6ZWthdG1ib3l2dGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjYzNzgsImV4cCI6MjA4NTkwMjM3OH0.lzqIaW6Dy3vru2b8uktVkCiKP7EOawrIvou9jmxA8KM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface ContentContextType {
  content: SiteContent;
  updateContent: (newContent: SiteContent, isPublish?: boolean) => void;
  resetContent: () => void;
  history: HistoryEntry[];
  restoreHistory: (id: string) => void;
}

const SiteContext = createContext<ContentContextType | undefined>(undefined);

const MAX_HISTORY = 5;

const sanitizeMediaForStorage = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(item => sanitizeMediaForStorage(item));
  const newObj: any = {};
  for (const key in obj) {
    let val = obj[key];
    if (typeof val === 'string' && (val.startsWith('data:') || val.startsWith('blob:'))) {
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

  const loadData = useCallback(async () => {
    // 1. Fetch main site configuration
    const { data: configData, error: configError } = await supabase
      .from('site_config')
      .select('content')
      .eq('id', 'main')
      .single();

    let baseContent = INITIAL_CONTENT;
    if (configData?.content) {
      baseContent = configData.content;
    }

    // 2. Fetch portfolio from 'projects' table as per strict requirement
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectsData && projectsData.length > 0) {
      // Map Supabase 'projects' to our 'SiteContent.portfolio'
      // We prioritize database projects to ensure "Images must appear on all devices"
      baseContent.portfolio = projectsData.map(p => ({
        id: p.id.toString(),
        image_url: p.image_url, // Backward compatibility for some components
        imageUrl: p.image_url,
        title: p.title || 'Portfolio Project',
        bookType: p.book_type || 'Paperback',
        description: p.description || '',
        category: p.category || 'All',
        isHidden: false
      }));
    }

    setContent(baseContent);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateContent = async (newContent: SiteContent, isPublish: boolean = false) => {
    const cleanContent = sanitizeMediaForStorage(newContent);
    setContent(cleanContent);
    
    // Save draft locally for speed, but sync to Supabase for persistence
    localStorage.setItem('siteContent_draft', JSON.stringify(cleanContent));
    
    if (isPublish) {
      // Sync the entire configuration state to 'site_config' table
      const { error } = await supabase
        .from('site_config')
        .upsert({ id: 'main', content: cleanContent, updated_at: new Date().toISOString() });

      if (error && error.code === 'PGRST116') {
        // Table might not exist yet in fresh project, handle gracefully if necessary
        console.error("Supabase Save Error: Ensure 'site_config' table exists with columns 'id' and 'content'.", error);
      }
    }
  };

  const restoreHistory = (id: string) => {
    const entry = history.find(h => h.id === id);
    if (entry) {
      try {
        const restored = sanitizeMediaForStorage(JSON.parse(entry.content));
        setContent(restored);
        updateContent(restored, false);
      } catch (e) {
        console.error("Failed to restore version", e);
      }
    }
  };

  const resetContent = () => {
    if (window.confirm("CRITICAL: Reset all site content to defaults? This will clear all data in Supabase.")) {
      setContent(INITIAL_CONTENT);
      updateContent(INITIAL_CONTENT, true);
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