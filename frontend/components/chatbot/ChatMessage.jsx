'use client';

import { useChatbot } from '@/context/ChatbotContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, User } from 'lucide-react';
import IdeaCard from './IdeaCard';
import { motion } from 'framer-motion';
import SmartImage from '@/components/ui/smart-image';

export default function ChatMessage({ message }) {
    const isUser = message.sender === 'user';
    const messageIdeas = message.ideas || message.output?.ideas || [];
    const hasIdeas = messageIdeas && messageIdeas.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {!isUser && (
                <Avatar className="h-8 w-8 mt-1 border">
                    <AvatarFallback className="bg-primary/10 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
                </Avatar>
            )}

            <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Helper to conditionally render card or just text bubble */}
                <div className={`
            px-4 py-3 rounded-2xl text-sm 
            ${isUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted/80 text-secondary-foreground rounded-bl-none'}
        `}>
                    {(() => {
                        const imgUrl = message.image || message.input?.imageUrl || message.output?.generatedImageUrl;
                        if (!imgUrl) return null;
                        return (
                            <SmartImage
                                src={imgUrl}
                                alt="Message visual"
                                className="mb-2 max-h-48 rounded-lg object-cover bg-black/10 w-full"
                            />
                        );
                    })()}

                    {/* Render text/narration. Handles both raw text and output.narration */}
                    <div className="whitespace-pre-wrap leading-relaxed">
                        {(() => {
                            // Extract text with multiple fallbacks
                            let text = message.text || message.narration || message.output?.narration || message.input?.text;

                            // Ensure we never display objects or arrays
                            if (typeof text !== 'string') {
                                // If text is an object or array, don't display it
                                if (!isUser && hasIdeas) {
                                    return `I've generated ${messageIdeas.length} creative ${messageIdeas.length === 1 ? 'idea' : 'ideas'} for you! Check out the cards below for detailed instructions.`;
                                }
                                return isUser ? '' : 'Here are your craft ideas:';
                            }

                            // Clean up the text - remove any JSON-like content
                            text = text.trim();

                            // If the text looks like JSON (starts with { or [), ignore it
                            if (text.startsWith('{') || text.startsWith('[')) {
                                if (!isUser && hasIdeas) {
                                    return `I've generated ${messageIdeas.length} creative ${messageIdeas.length === 1 ? 'idea' : 'ideas'} for you! Check out the cards below for detailed instructions.`;
                                }
                                return '';
                            }

                            // If text is empty but we have ideas, provide a default message
                            if (!text && !isUser && hasIdeas) {
                                return `Great! I've created ${messageIdeas.length} unique craft ${messageIdeas.length === 1 ? 'idea' : 'ideas'} using your materials. Explore each one below!`;
                            }

                            return text;
                        })()}
                    </div>
                </div>

                {/* Ideas Grid for AI */}
                {!isUser && hasIdeas && (
                    <div className="flex flex-row flex-wrap gap-4 mt-2 justify-start">
                        {messageIdeas.map((idea, idx) => (
                            <IdeaCard key={idea.ideaId || idx} idea={idea} />
                        ))}
                    </div>
                )}
            </div>

            {isUser && (
                <Avatar className="h-8 w-8 mt-1 border">
                    <AvatarFallback className="bg-muted"><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
            )}
        </motion.div>
    );
}
