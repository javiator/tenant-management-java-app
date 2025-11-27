import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [canvasHistory, setCanvasHistory] = useState([]);
    const sessionIdRef = useRef('');

    useEffect(() => {
        // Generate Session ID on mount if not already present
        if (!sessionIdRef.current) {
            sessionIdRef.current = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }
    }, []);

    const value = {
        messages,
        setMessages,
        canvasHistory,
        setCanvasHistory,
        sessionId: sessionIdRef.current
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
