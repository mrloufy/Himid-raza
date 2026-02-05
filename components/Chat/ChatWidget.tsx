import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { useContent } from '../../context/SiteContext';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatWidget: React.FC = () => {
  const { content } = useContent();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hi! I'm ${content.general.name}'s AI assistant. Ask me anything about his KDP services or portfolio!` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isStreaming]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || isStreaming) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
          throw new Error("API_KEY_MISSING");
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const systemInstruction = `
            You are the professional AI assistant for ${content.general.name}, a leading ${content.general.title}.
            Your objective is to represent Hamid Raza with excellence and assist authors in understanding his publishing workflow.

            --- EXPERT DATA ---
            Name: ${content.general.name}
            Title: ${content.general.title}
            Bio: ${content.general.description}
            Contact: ${content.general.email}
            
            --- SERVICES OFFERED ---
            ${content.services.map(s => `- ${s.title}: ${s.description}`).join('\n')}
            
            --- AREAS OF MASTERY ---
            ${content.about.expertises.join(', ')}
            
            --- RECENT PORTFOLIO SUCCESSES ---
            ${content.portfolio.map(p => `- ${p.title} [${p.bookType}]: ${p.description}`).join('\n')}
            
            --- SUPPORTED KDP GENRES ---
            ${content.kdpCategories.map(c => c.title).join(', ')}

            --- OPERATIONAL GUIDELINES ---
            1. Response Tone: Polished, encouraging, and authoritative yet approachable.
            2. Conciseness: Keep responses under 3-4 sentences unless explaining a complex service.
            3. Call to Action: For pricing, quotes, or booking, direct them to the "Hire Me" button or the Contact form.
            4. Accuracy: Only speak about services and projects listed in the expert data above.
        `;

        const apiHistory = messages.slice(1).map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const chat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            },
            history: apiHistory
        });

        const result = await chat.sendMessageStream({ message: userMessage });
        
        setIsLoading(false);
        setIsStreaming(true);
        
        // Prepare a new message entry for the stream
        setMessages(prev => [...prev, { role: 'model', text: '' }]);

        let fullText = '';
        for await (const chunk of result) {
            const chunkText = (chunk as GenerateContentResponse).text || '';
            fullText += chunkText;
            
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg && lastMsg.role === 'model') {
                    lastMsg.text = fullText;
                }
                return newMessages;
            });
        }

    } catch (error: any) {
        console.error("Assistant Connection Error:", error);
        setIsLoading(false);
        
        let errorMessage = "I'm having a momentary connection issue. Please try again in a few seconds.";
        
        if (error.message === "API_KEY_MISSING") {
            errorMessage = "My AI brain is missing its API Key. Please configure the API_KEY environment variable in Vercel.";
        } else if (error.message?.includes("429")) {
            errorMessage = "I'm receiving too many requests right now. Please wait a moment.";
        } else if (error.message?.includes("API key not valid")) {
            errorMessage = "The provided API Key is invalid. Please check your Google AI Studio settings.";
        }

        setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
        setIsStreaming(false);
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
      }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <div 
        className={`
          mb-4 w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-500 origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100 translate-y-0 translate-x-0' : 'opacity-0 scale-90 translate-y-10 translate-x-10 pointer-events-none h-0 mb-0'}
        `}
      >
        {/* Header */}
        <div className="bg-primary-500 p-5 flex justify-between items-center" style={{ backgroundColor: content.general.brandColor }}>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md border border-white/20">
                <Bot size={22} />
             </div>
             <div>
                <h3 className="text-white font-bold text-sm leading-tight">Hamid's Assistant</h3>
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                   <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_#4ade80]"></span>
                   Active Now
                </p>
             </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="h-[450px] overflow-y-auto p-6 bg-gray-50/50 dark:bg-[#121212] space-y-6 no-scrollbar scroll-smooth">
           {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                 <div 
                   className={`
                     max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-soft
                     ${msg.role === 'user' 
                       ? 'bg-primary-500 text-white rounded-br-none' 
                       : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none'}
                   `}
                   style={msg.role === 'user' ? { backgroundColor: content.general.brandColor } : {}}
                 >
                   {msg.text || (isStreaming && idx === messages.length - 1 ? "..." : "")}
                 </div>
              </div>
           ))}
           {isLoading && (
              <div className="flex justify-start animate-fade-in">
                 <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700 shadow-soft flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Consulting Hamid...</span>
                 </div>
              </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-800">
           <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 border border-transparent focus-within:border-primary-500 focus-within:bg-white dark:focus-within:bg-gray-900 transition-all shadow-inner">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about my KDP services..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                disabled={isStreaming || isLoading}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || isStreaming}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-500 text-white disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95 shadow-md"
                style={{ backgroundColor: content.general.brandColor }}
              >
                 {isLoading || isStreaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
           </div>
           <div className="flex items-center justify-between mt-3 px-2">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                 <Sparkles size={10} className="text-primary-500"/> AI Assisted Agent
              </p>
              <div className="flex gap-2">
                 <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                 <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                 <div className="w-1 h-1 rounded-full bg-gray-200"></div>
              </div>
           </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-16 h-16 rounded-3xl shadow-premium flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 relative group
          ${isOpen ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 rotate-90 rounded-[2rem]' : 'bg-primary-500 text-white'}
        `}
        style={!isOpen ? { backgroundColor: content.general.brandColor } : {}}
      >
        <div className="absolute inset-0 rounded-3xl bg-primary-500 blur-xl opacity-0 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: content.general.brandColor }}></div>
        {isOpen ? <X size={28} /> : <MessageCircle size={32} />}
        {!isOpen && (
           <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-4 border-white dark:border-[#1E1E1E] rounded-full animate-bounce"></div>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;