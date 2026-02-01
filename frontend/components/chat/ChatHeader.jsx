'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical, Phone, Video } from 'lucide-react';

export default function ChatHeader({ participant, onlineStatus }) {
    if (!participant) return <div className="h-16 border-b" />;

    return (
        <div className="h-16 px-4 border-b flex items-center justify-between bg-background sticky top-0 z-10 w-full">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={participant.avatarUrl} />
                    <AvatarFallback>{participant.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold text-sm">{participant.name}</h3>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        {onlineStatus === 'online' ? (
                            <>
                                <span className="block h-2 w-2 rounded-full bg-green-500"></span>
                                Online
                            </>
                        ) : 'Offline'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
            </div>
        </div>
    );
}
