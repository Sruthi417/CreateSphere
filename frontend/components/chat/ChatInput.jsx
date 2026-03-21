'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { productAPI } from '@/lib/api-client';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';

export default function ChatInput({ onSend, disabled }) {
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const fileInputRef = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() && !attachmentUrl) return;
        onSend(message, attachmentUrl);
        setMessage('');
        setAttachmentUrl('');
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (e.g., 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File is too large. Max 5MB.");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await productAPI.uploadImage(formData);
            if (response.data?.url) {
                setAttachmentUrl(response.data.url);
                toast.success("Image attached");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t bg-background flex flex-col gap-2">
            {attachmentUrl && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border mb-2 group shadow-sm ring-1 ring-border/50">
                    <img 
                        src={getImageUrl(attachmentUrl)} 
                        alt="Attachment preview" 
                        className="w-full h-full object-cover"
                    />
                    <button 
                        type="button"
                        onClick={() => setAttachmentUrl('')}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold"
                    >
                        Remove
                    </button>
                </div>
            )}
            <div className="flex gap-2 items-center w-full">
                <Input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="chat-file-upload"
                />
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    disabled={disabled || isUploading}
                    onClick={() => document.getElementById('chat-file-upload').click()}
                >
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5 text-muted-foreground" />}
                </Button>

                <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={attachmentUrl ? "Add a caption..." : "Type a message..."}
                    disabled={disabled}
                    className="flex-1"
                />

                <Button type="submit" disabled={disabled || (!message.trim() && !attachmentUrl) || isUploading} size="icon">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </form>
    );
}
