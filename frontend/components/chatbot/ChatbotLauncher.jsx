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

    // Hide launcher if on restricted pages (chat, chatbot, auth, admin)
    useEffect(() => {
        const isRestrictedPath =
            pathname?.includes('/chat') ||
            pathname?.includes('/chatbot') ||
            pathname?.includes('/auth') ||
            pathname?.includes('/admin');

        if (isRestrictedPath) {
            setIsVisible(false);
            setIsOpen(false);
        } else {
            setIsVisible(true);
        }
    }, [pathname]);

    if (!isVisible && !isOpen) return null;

    return (
        <ChatbotProvider>
            <AnimatePresence mode="wait">
                {/* Launcher Button - Pill style matching reference "Meet Crafty" button */}
                {!isOpen && isVisible && (
                    <motion.div
                        key="launcher"
                        initial={{ scale: 0, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0, y: 20 }}
                        className="fixed bottom-6 right-6 z-50 pointer-events-auto"
                    >
                        <Button
                            onClick={() => setIsOpen(true)}
                            className="h-12 px-5 rounded-full shadow-xl bg-primary hover:bg-primary/90 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group"
                        >
                            {/* Robo icon */}
                            <Bot className="h-5 w-5 text-primary-foreground" />

                            {/* Live dot */}
                            <span className="relative flex h-2 w-2 ml-0.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
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
                                : 'w-full h-full inset-0 rounded-none md:w-[450px] md:h-[600px] md:inset-auto md:bottom-24 md:right-6 md:rounded-2xl md:border border-primary/20'
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
