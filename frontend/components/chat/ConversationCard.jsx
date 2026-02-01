'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

export default function ConversationCard({ conversation, isSelected }) {
    const { user } = useAuthStore();

    const otherParticipant = conversation.participants?.find(
        (p) => (p._id || p) !== user?._id
    );

    const unreadCount = conversation.unreadCounts?.[user?._id] || 0;

    // Handle case where otherParticipant might be an ID or object
    const name = otherParticipant?.name || 'Unknown User';
    const avatarUrl = otherParticipant?.avatarUrl;
    const initial = name.charAt(0).toUpperCase();

    return (
        <Link href={`/chat/${conversation._id}`} className="block">
            <div className={cn(
                "p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer",
                isSelected && "bg-muted"
            )}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage src={avatarUrl} />
                            <AvatarFallback>{initial}</AvatarFallback>
                        </Avatar>
                        {/* Online status indicator could go here */}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                            <h4 className="font-semibold text-sm truncate">{name}</h4>
                            {conversation.lastMessageAt && (
                                <span className="text-xs text-muted-foreground shrink-0">
                                    {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                                </span>
                            )}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <p className={cn(
                                "text-xs truncate max-w-[140px]",
                                unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"
                            )}>
                                {conversation.lastMessage || 'No messages'}
                            </p>
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                    {unreadCount}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
