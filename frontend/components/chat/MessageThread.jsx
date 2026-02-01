'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/chat-store';
import { useAuthStore } from '@/store/auth-store';
import { chatAPI } from '@/lib/api-client';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { toast } from 'sonner';

export default function MessageThread({ conversationId }) {
    const { user } = useAuthStore();
    const { messages, setMessages, addMessage, currentConversation, setCurrentConversation } = useChatStore();
    const bottomRef = useRef(null);
    const [loading, setLoading] = useState(true);

    // Poll for messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await chatAPI.getMessages(conversationId);
                setMessages(response.data.data || []);
                if (response.data.conversation) {
                    setCurrentConversation(response.data.conversation);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // 3s polling
        return () => clearInterval(interval);
    }, [conversationId, setMessages, setCurrentConversation]);

    // Scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (text) => {
        // Optimistic update
        const tempId = Date.now().toString();
        addMessage({
            _id: tempId,
            senderId: user?._id,
            text,
            createdAt: new Date().toISOString(),
            isRead: false
        });

        try {
            await chatAPI.sendMessage(conversationId, text);
            // The polling will pick up the real message eventually, or we could replace it
            // Ideally we replace the temp one, but for polling approach, it might duplicate briefly if we are not careful
            // But since polling replaces the whole list (in this implementation), it should be fine.
        } catch (err) {
            toast.error('Failed to send message');
        }
    };

    const otherParticipant = currentConversation?.participants?.find(
        p => (p._id || p) !== user?._id
    );

    if (loading && messages.length === 0) {
        return <div className="flex-1 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-background w-full">
            <ChatHeader participant={otherParticipant} onlineStatus="offline" />

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                {messages.map((msg, idx) => (
                    <MessageBubble
                        key={msg._id || idx}
                        message={msg}
                        isOwn={msg.senderId === user?._id}
                        sender={msg.senderId === user?._id ? user : otherParticipant}
                    />
                ))}
                <div ref={bottomRef} className="h-1" />
            </div>

            <ChatInput onSend={handleSend} />
        </div>
    );
}
