
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { SiteContent, HistoryEntry } from '../types';
import { INITIAL_CONTENT } from '../constants';

// Strict configuration constants
const supabaseUrl = "https://tdmivcbzekatmboyvtce.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkbWl2Y2J6ZWthdG1ib3l2dGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjYzNzgsImV4cCI6MjA4NTkwMjM3OH0.lzqIaW6Dy3vru2b8uktVkCiKP7EOawrIvou9jmxA8KM";

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

  useEffect(() => {
    const initSupabase = () => {
      if ((window as any).supabase) {
        supabase = (window as any).supabase.createClient(supabaseUrl, supabaseKey);
        console.log("SUPABASE CONNECTED AND RUNNING");
      } else {
        setTimeout(initSupabase, 500);
      }
    };
    initSupabase();
  }, []);

  const loadData = useCallback(async () => {
    if (!supabase) return;

    try {
      let baseContent = INITIAL_CONTENT;

      // STRICT REQUIREMENT: Fetch data from projects table
      // Columns: id, image_url, title, created_at
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectsError) {
        console.error("Supabase fetch error:", projectsError.message);
      }

      if (projectsData && projectsData.length > 0) {
        console.log("Supabase data array returned:", projectsData);
        // Map database records to the frontend portfolio state
        // Only use existing columns: id, image_url, title
        baseContent.portfolio = projectsData.map((p: any) => ({
          id: p.id.toString(),
          imageUrl: p.image_url,
          title: p.title || 'Portfolio Project',
          bookType: 'Paperback', // Defaulting non-db fields
          description: '', // Defaulting non-db fields
          category: 'All', // Defaulting non-db fields
          isHidden: false
        }));
      }

      setContent(baseContent);
      setIsLoaded(true);
    } catch (err) {
      console.error("Data load failure:", err);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
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
    
    // We maintain local updates for UI responsiveness
    if (isPublish && supabase) {
      // Logic for saving full site state if site_config exists
      try {
        await supabase
          .from('site_config')
          .upsert({ id: 'main', content: cleanContent, updated_at: new Date().toISOString() });
      } catch (e) {
        console.warn("site_config table not found, skipping full state sync.");
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
