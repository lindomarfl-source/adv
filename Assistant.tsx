import React, { useState, useEffect, useRef } from 'react';
import { generateLegalAssistance } from '../services/geminiService';
import { AIResponse } from '../types';
import { Send, Bot, Sparkles, FileText, Scale } from './Icons';

export const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<AIResponse[]>([
    {
      text: "Olá, Dr(a). Sou sua IA jurídica. Posso ajudar a resumir processos, redigir minutas ou analisar jurisprudência. Como posso ajudar hoje?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: AIResponse = {
      text: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const responseText = await generateLegalAssistance(input);

    const aiMessage: AIResponse = {
      text: responseText,
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setLoading(false);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-navy-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-navy-800 rounded-lg">
                <Sparkles className="w-5 h-5 text-gold-500" />
            </div>
            <div>
                <h3 className="font-bold text-lg">Assistente Jurídico Gemini</h3>
                <p className="text-xs text-navy-300">Desenvolvido com Google Gemini 2.5 Flash</p>
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
                ${msg.isUser ? 'bg-navy-700' : 'bg-gold-500'}`}>
                {msg.isUser ? <div className="text-xs text-white font-bold">EU</div> : <Bot className="text-white w-5 h-5" />}
              </div>
              
              <div className={`p-4 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed
                ${msg.isUser 
                  ? 'bg-navy-700 text-white rounded-tr-none' 
                  : 'bg-white text-navy-800 border border-navy-100 rounded-tl-none'
                }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="text-white w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-navy-100 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-navy-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-navy-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-navy-400 rounded-full animate-bounce delay-200"></span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-navy-100">
        {messages.length === 1 && (
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                <button 
                    onClick={() => handleQuickAction("Gere um modelo de procuração ad judicia.")}
                    className="flex items-center gap-2 px-3 py-2 bg-navy-50 text-navy-700 text-xs font-medium rounded-lg hover:bg-navy-100 transition whitespace-nowrap">
                    <FileText className="w-3 h-3" /> Modelo de Procuração
                </button>
                <button 
                    onClick={() => handleQuickAction("Explique o conceito de Usucapião Extraordinário.")}
                    className="flex items-center gap-2 px-3 py-2 bg-navy-50 text-navy-700 text-xs font-medium rounded-lg hover:bg-navy-100 transition whitespace-nowrap">
                    <Bot className="w-3 h-3" /> Explicar Conceito
                </button>
                <button 
                    onClick={() => handleQuickAction("Resuma os requisitos para Habeas Corpus.")}
                    className="flex items-center gap-2 px-3 py-2 bg-navy-50 text-navy-700 text-xs font-medium rounded-lg hover:bg-navy-100 transition whitespace-nowrap">
                    <Scale className="w-3 h-3" /> Requisitos HC
                </button>
            </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua solicitação jurídica ou cole um texto para análise..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:bg-white transition text-navy-900 placeholder:text-navy-400"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center w-12"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};