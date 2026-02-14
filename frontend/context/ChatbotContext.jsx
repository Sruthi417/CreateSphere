'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { chatbotAPI } from '@/lib/api-client';

const ChatbotContext = createContext();

export const ChatbotProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('active'); // active, expired, ended
  const [error, setError] = useState(null);

  const restoreSession = useCallback((sessionData) => {
    setMessages(sessionData.messages || []);
    setIdeas(sessionData.lastIdeas || []);
    setMaterials(sessionData.materials || []);
    setSessionStatus(sessionData.status);
    if (sessionData.sessionId) {
      setSessionId(sessionData.sessionId);
      localStorage.setItem('chatbot_sessionId', sessionData.sessionId);
    }
  }, []);

  // Initialize session from localStorage and restore data if it exists
  useEffect(() => {
    const initSession = async () => {
      const storedSessionId = localStorage.getItem('chatbot_sessionId');
      if (storedSessionId) {
        setSessionId(storedSessionId);
        try {
          setIsLoading(true);
          const response = await chatbotAPI.getSession(storedSessionId);
          if (response.data && response.data.success) {
            restoreSession(response.data.data);
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        const newSessionId = crypto.randomUUID();
        setSessionId(newSessionId);
        localStorage.setItem('chatbot_sessionId', newSessionId);
      }
    };

    initSession();
  }, [restoreSession]);

  const startNewSession = useCallback(() => {
    const newSessionId = crypto.randomUUID();
    localStorage.setItem('chatbot_sessionId', newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
    setIdeas([]);
    setMaterials([]);
    setError(null);
    setSessionStatus('active');
  }, []);

  return (
    <ChatbotContext.Provider value={{
      sessionId,
      setSessionId,
      messages,
      setMessages,
      ideas,
      setIdeas,
      materials,
      setMaterials,
      isLoading,
      setIsLoading,
      sessionStatus,
      setSessionStatus,
      error,
      setError,
      startNewSession,
      restoreSession
    }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const ctx = useContext(ChatbotContext);
  if (!ctx) throw new Error('useChatbot must be used within ChatbotProvider');
  return ctx;
};
