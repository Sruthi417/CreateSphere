'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile } from 'lucide-react';

export default function ChatInput({ onSend, disabled }) {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        onSend(message);
        setMessage('');
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t bg-background flex gap-2 items-center">
            <Button type="button" variant="ghost" size="icon" disabled={disabled}>
                <Paperclip className="h-5 w-5 text-muted-foreground" />
            </Button>

            <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={disabled}
                className="flex-1"
            />

            <Button type="button" variant="ghost" size="icon" disabled={disabled}>
                <Smile className="h-5 w-5 text-muted-foreground" />
            </Button>

            <Button type="submit" disabled={disabled || !message.trim()} size="icon">
                <Send className="h-4 w-4" />
            </Button>
        </form>
    );
}
