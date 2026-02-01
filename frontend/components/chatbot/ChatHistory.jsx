'use client';

import { useEffect, useRef } from 'react';
import { useChatbot } from '@/context/ChatbotContext';
import ChatMessage from './ChatMessage';

export default function ChatHistory() {
    const { messages } = useChatbot();
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground opacity-50">
                <p>Start a conversation by describing your craft materials!</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.map((msg, index) => (
                <ChatMessage key={msg.id || index} message={msg} />
            ))}
            <div ref={bottomRef} className="h-1" />
        </div>
    );
}
