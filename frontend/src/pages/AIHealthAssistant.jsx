import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, Send, User, Loader2 } from 'lucide-react';

const AIHealthAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your AI Health Assistant. I can help explain ECG reports, heart rate trends, medications, and provide general health guidance. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // In a real application, this connects to the backend which calls OpenAI/Gemini
      // Mocking AI response for demonstration
      setTimeout(() => {
        const aiResponse = { 
          role: 'ai', 
          text: `Based on my analysis, your query regarding "${userMessage.text}" indicates a need for general health guidance. Please remember that while I provide AI-driven insights, always consult your doctor for critical medical decisions.`
        };
        setMessages(prev => [...prev, aiResponse]);
        setLoading(false);
      }, 1500);

      // Real API Call:
      // const res = await axios.post('/api/ai/chat', { message: userMessage.text });
      // setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting to my neural network right now. Please try again later.' }]);
      setLoading(false);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <Bot color="var(--accent-cyan)" size={32} style={{ marginRight: '10px' }} />
        <h2>AI Health Assistant</h2>
      </div>

      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        
        {/* Chat Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg, index) => (
            <div key={index} style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '75%',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              {msg.role === 'ai' && (
                <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: '50%' }}>
                  <Bot size={20} color="#3b82f6" />
                </div>
              )}
              
              <div style={{
                background: msg.role === 'user' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                color: 'white',
                padding: '1rem',
                borderRadius: '12px',
                borderBottomRightRadius: msg.role === 'user' ? '0' : '12px',
                borderBottomLeftRadius: msg.role === 'ai' ? '0' : '12px',
                border: msg.role === 'ai' ? '1px solid var(--glass-border)' : 'none',
                lineHeight: '1.5'
              }}>
                {msg.text}
              </div>

              {msg.role === 'user' && (
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '8px', borderRadius: '50%' }}>
                  <User size={20} color="white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', alignSelf: 'flex-start' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: '50%' }}>
                <Bot size={20} color="#3b82f6" />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Loader2 className="spinner" size={18} /> AI is thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--glass-border)' }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about your ECG, heart rate, or medications..." 
            style={{ 
              flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', 
              background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' 
            }} 
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 1.5rem' }}>
            <Send size={18} /> Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIHealthAssistant;
