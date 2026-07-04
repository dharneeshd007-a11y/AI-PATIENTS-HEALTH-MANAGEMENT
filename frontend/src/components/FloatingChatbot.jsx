import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Loader2, X, MessageCircle } from 'lucide-react';
import axios from 'axios';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your AI Health Assistant. I can help explain ECG reports, heart rate trends, medications, and provide general health guidance. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickSuggestions = [
    "Explain my ECG",
    "Check Heart Rate",
    "Medication Help",
    "Emergency Guide",
    "Contact Doctor"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      setTimeout(() => {
        const aiResponse = { 
          role: 'ai', 
          text: `Based on my analysis, your query regarding "${userMessage.text}" indicates a need for general health guidance. Please remember that while I provide AI-driven insights, always consult your doctor for critical medical decisions.`
        };
        setMessages(prev => [...prev, aiResponse]);
        setLoading(false);
      }, 1500);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting to my neural network right now.' }]);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="btn btn-primary"
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        whileHover={{ scale: 1.1 }}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
          zIndex: 999,
          padding: 0
        }}
      >
        <motion.div
          animate={{
            boxShadow: ['0px 0px 0px rgba(0,212,255,0)', '0px 0px 20px rgba(0,212,255,0.6)', '0px 0px 0px rgba(0,212,255,0)']
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Bot size={28} />
        </motion.div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } }}
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '30px',
              width: '350px',
              height: '500px',
              background: 'var(--bg-secondary)',
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 1000,
              border: '1px solid var(--glass-border)'
            }}
          >
            {/* Header */}
            <div style={{ padding: '1rem', background: 'rgba(0, 212, 255, 0.1)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bot color="var(--accent-cyan)" size={24} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>AI Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'flex-start'
                  }}
                >
                  {msg.role === 'ai' && (
                    <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '6px', borderRadius: '50%', flexShrink: 0 }}>
                      <Bot size={16} color="#3b82f6" />
                    </div>
                  )}
                  
                  <div style={{
                    background: msg.role === 'user' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                    color: 'white',
                    padding: '0.8rem',
                    borderRadius: '12px',
                    borderBottomRightRadius: msg.role === 'user' ? '0' : '12px',
                    borderBottomLeftRadius: msg.role === 'ai' ? '0' : '12px',
                    border: msg.role === 'ai' ? '1px solid var(--glass-border)' : 'none',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '6px', borderRadius: '50%' }}>
                    <Bot size={16} color="#3b82f6" />
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} style={{ width: 6, height: 6, background: 'var(--accent-cyan)', borderRadius: '50%' }} />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: 6, height: 6, background: 'var(--accent-cyan)', borderRadius: '50%' }} />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: 6, height: 6, background: 'var(--accent-cyan)', borderRadius: '50%' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length === 1 && !loading && (
              <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap', '&::-webkit-scrollbar': { display: 'none' } }}>
                {quickSuggestions.map((sug, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(sug)}
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} style={{ display: 'flex', gap: '8px', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--glass-border)' }}>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message AI..." 
                style={{ 
                  flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', 
                  background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', fontSize: '0.9rem'
                }} 
              />
              <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()} style={{ padding: '0 1rem' }}>
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatbot;
