'use client';

import { useChatbot } from '@/context/ChatbotContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, User } from 'lucide-react';
import IdeaCard from './IdeaCard';
import { motion } from 'framer-motion';

export default function ChatMessage({ message }) {
    const isUser = message.sender === 'user';
    const hasIdeas = message.ideas && message.ideas.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {!isUser && (
                <Avatar className="h-8 w-8 mt-1 border">
                    <AvatarImage src="/bot-avatar.png" />
                    <AvatarFallback className="bg-primary/10 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
                </Avatar>
            )}

            <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Helper to conditionally render card or just text bubble */}
                <div className={`
            px-4 py-3 rounded-2xl text-sm 
            ${isUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted/80 text-secondary-foreground rounded-bl-none'}
        `}>
                    {message.image && (
                        <img src={message.image} alt="uploaded" className="mb-2 max-h-48 rounded-lg object-cover bg-black/10" />
                    )}

                    {/* Render text/narration. Handles both raw text and output.narration */}
                    <div className="whitespace-pre-wrap">
                        {message.text || message.narration || message.output?.narration}
                    </div>
                </div>

                {/* Ideas Grid for AI */}
                {!isUser && hasIdeas && (
                    <div className="flex flex-row flex-wrap gap-4 mt-2 justify-start">
                        {message.ideas.map((idea, idx) => (
                            <IdeaCard key={idea.ideaId || idx} idea={idea} />
                        ))}
                    </div>
                )}
            </div>

            {isUser && (
                <Avatar className="h-8 w-8 mt-1 border">
                    <AvatarImage src="/user-avatar.png" />
                    <AvatarFallback className="bg-muted"><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
            )}
        </motion.div>
    );
}
