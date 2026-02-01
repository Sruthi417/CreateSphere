'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import ChatbotContainer from './ChatbotContainer';
import { ChatbotProvider } from '@/context/ChatbotContext';

export default function ChatbotLauncher() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    // Hide launcher if already on the chatbot page
    useEffect(() => {
        if (pathname === '/chatbot') {
            setIsVisible(false);
            setIsOpen(false); // Close popup if we navigate to the actual page
        } else {
            setIsVisible(true);
        }
    }, [pathname]);

    if (!isVisible && !isOpen) return null;

    return (
        <ChatbotProvider>
            <AnimatePresence mode="wait">
                {/* Launcher Button */}
                {!isOpen && isVisible && (
                    <motion.div
                        key="launcher"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-6 right-6 z-50 group pointer-events-auto"
                    >
                        <Button
                            size="icon"
                            onClick={() => setIsOpen(true)}
                            className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 hover:scale-110 transition-all duration-300 relative overflow-visible"
                        >
                            <div className="absolute -top-1 -right-1">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                                </span>
                            </div>
                            <Bot className="h-7 w-7 text-primary-foreground" />

                            {/* Tooltip */}
                            <span className="absolute right-full mr-4 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Ask AI Assistant
                            </span>
                        </Button>
                    </motion.div>
                )}

                {/* Popup Window */}
                {isOpen && (
                    <motion.div
                        key="popup"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            width: isMaximized ? "100%" : undefined,
                            height: isMaximized ? "100%" : undefined,
                            borderRadius: isMaximized ? 0 : undefined,
                            bottom: isMaximized ? 0 : undefined,
                            right: isMaximized ? 0 : undefined
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`fixed z-50 overflow-hidden shadow-2xl bg-background flex flex-col transition-all duration-300
                        ${isMaximized
                                ? 'w-full h-full inset-0 rounded-none'
                                : 'w-full h-full inset-0 rounded-none md:w-[400px] md:h-[600px] md:inset-auto md:bottom-24 md:right-6 md:rounded-xl md:border'
                            }`}
                    >
                        <ChatbotContainer
                            onClose={() => setIsOpen(false)}
                            isMaximized={isMaximized}
                            onToggleMaximize={() => setIsMaximized(!isMaximized)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </ChatbotProvider>
    );
}
