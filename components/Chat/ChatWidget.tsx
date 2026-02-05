
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Construct system instruction from dynamic content
        const systemInstruction = `
            You are an AI assistant for ${content.general.name}, a ${content.general.title}.
            Your goal is to represent him professionally and answer visitor questions about his Amazon KDP services.

            --- PROFILE ---
            Name: ${content.general.name}
            Title: ${content.general.title}
            Description: ${content.general.description}
            Email: ${content.general.email}
            
            --- SERVICES ---
            ${content.services.map(s => `- ${s.title}: ${s.description}`).join('\n')}
            
            --- EXPERTISE ---
            ${content.about.expertises.join(', ')}
            
            --- PORTFOLIO ---
            ${content.portfolio.map(p => `- ${p.title} (${p.bookType}): ${p.description}`).join('\n')}
            
            --- KDP CATEGORIES ---
            ${content.kdpCategories.map(c => c.title).join(', ')}

            --- INSTRUCTIONS ---
            1. Be professional, friendly, and concise.
            2. If asked about pricing or specific quotes, kindly ask them to use the "Contact" form or "Lets Design Together" section on the website.
            3. You can explain his services (Formatting, Cover Design, KDP Setup, etc.) in detail based on the data provided.
            4. Do not hallucinate personal details not provided here.
        `;

        // Create chat session with history (excluding the initial greeting which is local only)
        // We filter out the first local greeting for the API history to keep it clean
        const apiHistory = messages.slice(1).map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const chat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: systemInstruction,
            },
            history: apiHistory
        });

        const result = await chat.sendMessage({ message: userMessage });
        const responseText = result.text;

        setMessages(prev => [...prev, { role: 'model', text: responseText }]);

    } catch (error) {
        console.error("Chat Error:", error);
        setMessages(prev => [...prev, { role: 'model', text: "I apologize, but I'm having trouble connecting to the server right now. Please try again in a moment." }]);
    } finally {
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
          mb-4 w-[350px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none h-0 mb-0'}
        `}
      >
        {/* Header */}
        <div className="bg-primary-500 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                <Bot size={18} />
             </div>
             <div>
                <h3 className="text-white font-bold text-sm">Assistant</h3>
                <p className="text-primary-100 text-xs flex items-center gap-1">
                   <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                   Online
                </p>
             </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="h-[400px] overflow-y-auto p-4 bg-gray-50 dark:bg-[#121212] space-y-4">
           {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div 
                   className={`
                     max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed
                     ${msg.role === 'user' 
                       ? 'bg-primary-500 text-white rounded-br-none' 
                       : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-sm'}
                   `}
                 >
                   {msg.text}
                 </div>
              </div>
           ))}
           {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-primary-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Thinking...</span>
                 </div>
              </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
           <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 border border-transparent focus-within:border-primary-500 focus-within:bg-white dark:focus-within:bg-gray-900 transition-all">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about services..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="text-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                 <Send size={18} />
              </button>
           </div>
           <div className="text-center mt-2">
              <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                 Powered by <Sparkles size={8}/> Gemini
              </p>
           </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95
          ${isOpen ? 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-white rotate-90' : 'bg-primary-500 text-white animate-bounce-slow'}
        `}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default ChatWidget;
