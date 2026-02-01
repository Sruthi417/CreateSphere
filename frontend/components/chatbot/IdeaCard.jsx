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
    const { sessionId, setIdeas, setMessages } = useChatbot();
    const [showDetails, setShowDetails] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    // Initial image from idea (might be there if previously generated)
    const [generatedImageUrl, setGeneratedImageUrl] = useState(idea.generatedImage || idea.generatedImageUrl);

    const handleGenerateImage = async (e) => {
        e.stopPropagation();
        if (!sessionId) return;

        setIsGeneratingImage(true);
        try {
            const response = await chatbotAPI.generateImage({
                ideaId: idea.ideaId,
                imagePrompt: idea.imagePrompt,
                sessionId
            });

            const newImageUrl = response.data.data?.imageUrl || response.data.imageUrl;
            setGeneratedImageUrl(newImageUrl);

            // Update the idea in the context state if possible to persist
            // This is a bit tricky since ideas are nested in messages or a separate ideas array
            // We'll just rely on local state for this card for now, or maybe update global ideas
            setIdeas(prev => prev.map(i => i.ideaId === idea.ideaId ? { ...i, generatedImage: newImageUrl } : i));

            toast.success('Image generated!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to generate image');
        } finally {
            setIsGeneratingImage(false);
        }
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
                idea={{ ...idea, generatedImage: generatedImageUrl }}
                open={showDetails}
                onClose={() => setShowDetails(false)}
            />
        </>
    );
}
