'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useChatStore } from '@/store/chat-store';
import { chatAPI } from '@/lib/api-client';
import ConversationCard from './ConversationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ConversationList() {
    const { conversations, setConversations } = useChatStore();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const pathname = usePathname();

    const fetchConversations = async () => {
        try {
            const response = await chatAPI.getConversations();
            setConversations(response.data.data || []);
        } catch (error) {
            console.error(error);
            // toast.error('Failed to update conversations'); // don't toast on polling
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const filteredConversations = conversations.filter(c => {
        const other = c.participants?.find(p => p.name); // simplistic
        return other?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="flex flex-col h-full bg-background border-r w-full md:w-80 lg:w-96 flex-shrink-0">
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Messages
                    </h2>
                    <Button variant="ghost" size="icon">
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search messages..."
                        className="pl-9 bg-muted/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading && conversations.length === 0 ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-3 p-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                    ))
                ) : filteredConversations.length > 0 ? (
                    filteredConversations.map(conv => (
                        <ConversationCard
                            key={conv._id}
                            conversation={conv}
                            isSelected={pathname === `/chat/${conv._id}`}
                        />
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No conversations found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
