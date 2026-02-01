'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MessageBubble({ message, isOwn, sender }) {
    return (
        <div className={cn("flex gap-3 mb-4 w-full", isOwn ? "justify-end" : "justify-start")}>
            {!isOwn && (
                <Avatar className="h-8 w-8 mt-1 border">
                    <AvatarImage src={sender?.avatarUrl} />
                    <AvatarFallback>{sender?.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
            )}

            <div className={cn(
                "flex flex-col max-w-[75%]",
                isOwn ? "items-end" : "items-start"
            )}>
                <div className={cn(
                    "px-4 py-2 rounded-2xl text-sm break-words",
                    isOwn ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-foreground rounded-bl-none"
                )}>
                    {message.text}
                </div>

                <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                    {isOwn && (
                        <span className="text-muted-foreground">
                            {message.isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
