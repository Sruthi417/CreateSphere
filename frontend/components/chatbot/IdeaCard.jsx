'use client';

import { useState } from 'react';
import { useChatbot } from '@/context/ChatbotContext';
import { chatbotAPI } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wand2, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import IdeaDetailModal from './IdeaDetailModal';

export default function IdeaCard({ idea }) {
    const { sessionId, setIdeas, setMessages, materials } = useChatbot();
    const [showDetails, setShowDetails] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    // Initial image from idea (might be there if previously generated)
    const [generatedImageUrl, setGeneratedImageUrl] = useState(idea.generatedImage || idea.generatedImageUrl);

    const handleGenerateImage = async (e) => {
        e.stopPropagation();
        if (!sessionId) {
            toast.error('Session not found. Please refresh the page.');
            return;
        }

        setIsGeneratingImage(true);
        try {
            const response = await chatbotAPI.generateImage({
                ideaId: idea.ideaId,
                imagePrompt: idea.imagePrompt,
                sessionId
            });

            // Backend returns imageUrl directly in response.data
            const newImageUrl = response.data.imageUrl;

            if (!newImageUrl) {
                throw new Error('No image URL received');
            }

            setGeneratedImageUrl(newImageUrl);

            // Update the idea in the context state
            setIdeas(prev => prev.map(i => i.ideaId === idea.ideaId ? { ...i, generatedImage: newImageUrl } : i));

            toast.success('Image generated successfully!');
        } catch (err) {
            console.error('Image generation error:', err);
            const errorMsg = err.response?.data?.message || 'Failed to generate image. Please try again.';
            toast.error(errorMsg);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    // Always guarantee at least one YouTube link per idea
    const primaryYoutubeLink = (() => {
        // If backend already provided links, use the first one
        if (idea.youtubeLinks && idea.youtubeLinks.length > 0) {
            return idea.youtubeLinks[0];
        }
        // Fallback: build a generic YouTube search URL from idea title + materials
        const title = idea.title || 'DIY craft idea';
        const mats = Array.isArray(materials) && materials.length > 0
            ? materials.join(' ')
            : 'recycled materials';
        const query = encodeURIComponent(`${title} DIY craft using ${mats}`);
        return {
            title: `YouTube tutorials for ${title}`,
            url: `https://www.youtube.com/results?search_query=${query}`,
        };
    })();

    const ideaWithYoutube = {
        ...idea,
        youtubeLinks: idea.youtubeLinks && idea.youtubeLinks.length > 0
            ? idea.youtubeLinks
            : [primaryYoutubeLink],
    };

    const difficultyColor = {
        easy: 'default', // default is usually primary/dark
        medium: 'secondary', // usually gray
        hard: 'destructive' // red
    };

    return (
        <>
            <Card className="w-full min-w-[280px] max-w-[320px] bg-card hover:shadow-lg transition-shadow border-muted">
                <div className="relative h-40 bg-muted overflow-hidden rounded-t-lg">
                    <img
                        src={generatedImageUrl || '/placeholder-craft.jpg'} // Make sure to have a placeholder or handle empty
                        alt={idea.title}
                        className={`w-full h-full object-cover transition-opacity ${generatedImageUrl ? 'opacity-100' : 'opacity-50 grayscale'}`}
                        onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Craft+Idea'; }}
                    />
                    <div className="absolute top-2 left-2">
                        <Badge variant={difficultyColor[idea.difficulty] || 'outline'}>
                            {idea.difficulty?.toUpperCase()}
                        </Badge>
                    </div>
                </div>

                <CardContent className="p-4 flex flex-col gap-3">
                    <div>
                        <h3 className="font-bold text-lg leading-tight truncate" title={idea.title}>{idea.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {idea.narration || idea.description}
                        </p>
                    </div>

                    <div className="flex gap-2 mt-auto pt-2">
                        {/* YouTube Links */}
                        {ideaWithYoutube.youtubeLinks && ideaWithYoutube.youtubeLinks.length > 0 ? (
                            <div className="flex flex-col gap-1 mt-1">
                                {ideaWithYoutube.youtubeLinks.slice(0, 3).map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 dark:text-blue-400 underline underline-offset-2 truncate flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                        title={link.title}
                                    >
                                        <span>🎥 {link.title}</span>
                                    </a>
                                ))}
                            </div>
                        ) : primaryYoutubeLink && (
                            <a
                                href={primaryYoutubeLink.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-xs text-blue-600 dark:text-blue-400 underline underline-offset-2 truncate"
                                onClick={(e) => e.stopPropagation()}
                                title={primaryYoutubeLink.title}
                            >
                                Watch tutorials on YouTube
                            </a>
                        )}
                    </div>

                    <div className="flex gap-2 mt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setShowDetails(true)}
                        >
                            <Info className="h-4 w-4 mr-2" />
                            Details
                        </Button>

                        <Button
                            variant={generatedImageUrl ? "secondary" : "default"}
                            size="sm"
                            className="flex-1"
                            onClick={handleGenerateImage}
                            disabled={isGeneratingImage || !!generatedImageUrl}
                        >
                            {isGeneratingImage ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Wand2 className="h-4 w-4 mr-2" />
                            )}
                            {generatedImageUrl ? 'Done' : 'Visualize'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <IdeaDetailModal
                idea={{ ...ideaWithYoutube, generatedImage: generatedImageUrl }}
                open={showDetails}
                onClose={() => setShowDetails(false)}
            />
        </>
    );
}
