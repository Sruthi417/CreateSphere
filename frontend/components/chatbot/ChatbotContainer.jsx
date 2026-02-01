'use client';

import { useRouter } from 'next/navigation';
import { useChatbot } from '@/context/ChatbotContext';
import { chatbotAPI } from '@/lib/api-client';
import ChatHistory from './ChatHistory';
import InputArea from './InputArea';
import { Button } from '@/components/ui/button';
import {
    Bot,
    Trash2,
    RefreshCw,
    X,
    Maximize2,
    Minimize2,
    MoreVertical
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export default function ChatbotContainer({ onClose, isMaximized, onToggleMaximize }) {
    const router = useRouter();
    const { sessionId, setSessionId, setMessages } = useChatbot();

    const handleEndSession = async () => {
        if (!sessionId) return;
        try {
            await chatbotAPI.endSession(sessionId);
            setSessionId(null);
            setMessages([]);
            localStorage.removeItem('chatbot_sessionId');
            toast.success('Session ended');
        } catch (error) {
            console.error(error);
            toast.error('Failed to end session');
        }
    };

    const handleNewSession = () => {
        const newId = crypto.randomUUID();
        setSessionId(newId);
        localStorage.setItem('chatbot_sessionId', newId);
        setMessages([]);
        toast.success('Started new session');
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 shadow-sm">
                        <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-semibold text-sm leading-none">Craft Assistant</h1>
                        <p className="text-[10px] text-muted-foreground mt-1 font-medium text-emerald-600 flex items-center gap-1">
                            <span className="block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Session Controls - Collapsed in Menu for cleaner mobile/small view */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleNewSession}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                New Session
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleEndSession} className="text-destructive focus:text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                End Session
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Window Controls */}
                    {onToggleMaximize && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleMaximize}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hidden md:flex"
                            title={isMaximized ? "Restore" : "Maximize"}
                        >
                            {isMaximized ? (
                                <Minimize2 className="h-4 w-4" />
                            ) : (
                                <Maximize2 className="h-4 w-4" />
                            )}
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose || (() => router.back())}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Close"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <ChatHistory />

            <InputArea />
        </div>
    );
}
