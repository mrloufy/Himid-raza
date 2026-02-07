import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { SiteContent, HistoryEntry } from '../types';
import { INITIAL_CONTENT } from '../constants';

// Strict configuration constants
const supabaseUrl = "https://tdmivcbzekatmboyvtce.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkbWl2Y2J6ZWthdG1ib3l2dGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjYzNzgsImV4cCI6MjA4NTkwMjM3OH0.lzqIaW6Dy3vru2b8uktVkCiKP7EOawrIvou9jmxA8KM";

// Use global supabase from window if available, fallback to nothing (expect it to be there)
let supabase: any;

interface ContentContextType {
  content: SiteContent;
  updateContent: (newContent: SiteContent, isPublish?: boolean) => void;
  resetContent: () => void;
  history: HistoryEntry[];
  restoreHistory: (id: string) => void;
}

const SiteContext = createContext<ContentContextType | undefined>(undefined);

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

  // Initialize Supabase once
  useEffect(() => {
    const initSupabase = () => {
      if ((window as any).supabase) {
        supabase = (window as any).supabase.createClient(supabaseUrl, supabaseKey);
        console.log("SUPABASE CONNECTED AND RUNNING");
      } else {
        // Retry a few times if the script is still loading
        setTimeout(initSupabase, 500);
      }
    };
    initSupabase();
  }, []);

  const loadData = useCallback(async () => {
    if (!supabase) return;

    try {
      // 1. Fetch main site configuration from site_config if it exists
      const { data: configData } = await supabase
        .from('site_config')
        .select('content')
        .eq('id', 'main')
        .single();

      let baseContent = INITIAL_CONTENT;
      if (configData?.content) {
        baseContent = configData.content;
      }

      // 2. Fetch projects from 'projects' table (Mandatory persistence source)
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase projects fetch error:", error);
      }

      if (projectsData && projectsData.length > 0) {
        console.log(`Fetched ${projectsData.length} projects from Supabase`);
        // Map database projects to the portfolio state
        baseContent.portfolio = projectsData.map((p: any) => ({
          id: p.id.toString(),
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
    } catch (err) {
      console.error("Site data load error:", err);
      setIsLoaded(true); // Don't block UI forever
    }
  }, []);

  useEffect(() => {
    // Wait for supabase to be initialized then load
    const interval = setInterval(() => {
      if (supabase) {
        loadData();
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [loadData]);

  const updateContent = async (newContent: SiteContent, isPublish: boolean = false) => {
    const cleanContent = sanitizeMediaForStorage(newContent);
    setContent(cleanContent);
    
    if (isPublish && supabase) {
      console.log("Publishing content to Supabase...");
      await supabase
        .from('site_config')
        .upsert({ id: 'main', content: cleanContent, updated_at: new Date().toISOString() });
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