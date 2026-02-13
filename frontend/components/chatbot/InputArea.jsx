'use client';

import { useState, useRef } from 'react';
import { useChatbot } from '@/context/ChatbotContext';
import { chatbotAPI } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, X, Send, Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InputArea() {
    const { sessionId, isLoading, setIsLoading, messages, setMessages, setIdeas, setMaterials, error, setError } = useChatbot();
    const [input, setInput] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            const preview = URL.createObjectURL(file);
            setImagePreview(preview);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e, options = {}) => {
        if (e) e.preventDefault();
        if (!input.trim() && !imagePreview) return;

        setIsLoading(true);

        const forceImage = options.forceImage || false;

        // Add user message immediately
        const userMsg = {
            id: Date.now(),
            sender: 'user', // Adjusted to match user's example messages structure, though earlier code used 'type':'user'
            type: 'user', // Compatibility
            input: { type: imagePreview ? 'image' : 'text', text: input, imageUrl: imagePreview }, // keeping extra data just in case
            text: input,
            image: imagePreview,
            timestamp: new Date()
        };

        setMessages([...messages, userMsg]);

        try {
            const lower = input.toLowerCase();
            const wantsImageFromText =
                forceImage || (!imagePreview && // only route through generate-image when user is asking in text
                    (
                        lower.includes('generate image') ||
                        lower.includes('visualize') ||
                        lower.includes('show image') ||
                        lower.includes('image for') ||
                        // More natural phrases like "image of the first idea"
                        (lower.includes('image') && (
                            lower.includes('idea') ||
                            lower.includes('project') ||
                            lower.includes('craft')
                        ))
                    ));

            // If user explicitly asks to generate an image, call Pollinations-backed endpoint
            if (wantsImageFromText && sessionId) {
                const response = await chatbotAPI.generateImage({
                    sessionId,
                    text: input,
                });

                const { imageUrl, title } = response.data || {};

                if (!imageUrl) {
                    throw new Error('No image URL received from image generator');
                }

                const narration = title
                    ? `Here is the image for: ${title}`
                    : 'Here is your generated craft image.';

                // Add AI image message to chat; ChatMessage will render message.image visually
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'ai',
                    type: 'ai',
                    image: imageUrl,
                    narration,
                    output: {
                        narration,
                        generatedImageUrl: imageUrl,
                    },
                    timestamp: new Date(),
                }]);

                setInput('');
                removeImage();
            } else {
                // Default flow: analyze text/image and generate ideas
                const formData = new FormData();
                formData.append('text', input);
                if (fileInputRef.current?.files[0]) {
                    formData.append('image', fileInputRef.current.files[0]);
                }
                if (sessionId) {
                    formData.append('sessionId', sessionId);
                }

                const response = await chatbotAPI.analyze(formData, sessionId);
                const data = response.data; // Backend returns data directly

                // Validate and extract data
                const narration = data.narration || '';
                const ideas = Array.isArray(data.ideas) ? data.ideas : [];
                const materials = Array.isArray(data.materials) ? data.materials : [];

                // Create a user-friendly narration if we have ideas but no narration
                const displayNarration = narration || (ideas.length > 0
                    ? `Great! I've generated ${ideas.length} creative ${ideas.length === 1 ? 'idea' : 'ideas'} for you using your materials.`
                    : 'I received your message.');

                // Add AI response
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'ai',
                    type: 'ai',
                    output: {
                        narration: displayNarration,
                        ideas: ideas,
                    },
                    narration: displayNarration,
                    ideas: ideas,
                    timestamp: new Date(),
                }]);

                setIdeas(ideas);
                setMaterials(materials);
                setInput('');
                removeImage();
            }
        } catch (err) {
            console.error('Chatbot error:', err);
            const errorMsg = err.response?.data?.message || 'Failed to get response';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative bg-background p-4 border-t">
            {imagePreview && (
                <div className="absolute bottom-full left-4 mb-2">
                    <div className="relative inline-block">
                        <img
                            src={imagePreview}
                            alt="preview"
                            className="h-24 w-auto rounded-lg border shadow-sm object-cover"
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex gap-2 items-end">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                />

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload image"
                    className="shrink-0"
                >
                    <ImageIcon className="h-5 w-5" />
                </Button>

                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your materials or upload an image..."
                    disabled={isLoading}
                    className="min-h-[44px] max-h-[150px] resize-none py-3"
                    rows={1}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                />

                <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, { forceImage: true })}
                    disabled={isLoading || !input.trim()}
                    variant="secondary"
                    className="shrink-0"
                    title="Generate Image from text"
                >
                    <Wand2 className="h-5 w-5" />
                </Button>

                <Button
                    type="submit"
                    disabled={isLoading || (!input.trim() && !imagePreview)}
                    className="shrink-0"
                >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
            </div>

            {error && <div className="text-destructive text-sm mt-2">{error}</div>}
        </form>
    );
}
