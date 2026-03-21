'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, Flag } from 'lucide-react';
import { cn, getImageUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';

export default function MessageBubble({ message, isOwn, sender, onReport }) {
    const { userRole } = useAuthStore();

    return (
        <div className={cn("flex gap-3 mb-4 w-full group", isOwn ? "justify-end" : "justify-start")}>
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
                <div className="flex items-start gap-2 max-w-full">
                    <div className={cn(
                        "rounded-2xl text-sm break-words overflow-hidden",
                        isOwn ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-foreground rounded-bl-none",
                        message.attachmentUrl ? "p-1" : "px-4 py-2"
                    )}>
                        {message.attachmentUrl && (
                            <div className="mb-1 rounded-xl overflow-hidden max-w-sm">
                                <img 
                                    src={getImageUrl(message.attachmentUrl)} 
                                    alt="Message attachment" 
                                    className="w-full h-auto object-contain cursor-pointer transition-transform hover:scale-[1.02]"
                                    onClick={() => window.open(getImageUrl(message.attachmentUrl), '_blank')}
                                />
                            </div>
                        )}
                        {message.text && (
                            <div className={message.attachmentUrl ? "px-3 py-1.5" : ""}>
                                {message.text}
                            </div>
                        )}
                    </div>

                    {!isOwn && userRole === 'creator' && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-transparent"
                            onClick={onReport}
                            title="Report Message"
                        >
                            <Flag className="h-3 w-3" />
                        </Button>
                    )}
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
