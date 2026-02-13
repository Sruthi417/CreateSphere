'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, AlertTriangle, ListOrdered, Save } from 'lucide-react';

export default function IdeaDetailModal({ idea, onClose, open }) {
    if (!idea) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant={idea.difficulty === 'easy' ? 'default' : idea.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                            {idea.difficulty?.toUpperCase() || 'UNKNOWN'}
                        </Badge>
                    </div>
                    <DialogTitle className="text-2xl">{idea.title}</DialogTitle>
                    <DialogDescription>
                        {idea.narration || idea.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Image */}
                    {(idea.generatedImage || idea.image) && (
                        <div className="rounded-lg overflow-hidden border bg-muted">
                            <img
                                src={idea.generatedImage || idea.image}
                                alt={idea.title}
                                className="w-full h-64 object-cover"
                            />
                        </div>
                    )}

                    {/* Tools */}
                    {idea.tools_required?.length > 0 && (
                        <div>
                            <h4 className="font-semibold flex items-center gap-2 mb-2">
                                <Wrench className="h-4 w-4 text-primary" />
                                Tools Required
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {idea.tools_required.map((tool, i) => (
                                    <Badge key={i} variant="outline" className="bg-muted/50">
                                        {tool}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Steps */}
                    {idea.steps?.length > 0 && (
                        <div>
                            <h4 className="font-semibold flex items-center gap-2 mb-2">
                                <ListOrdered className="h-4 w-4 text-primary" />
                                Instructions
                            </h4>
                            <ol className="space-y-4 list-decimal list-outside ml-5">
                                {idea.steps.map((step, i) => (
                                    <li key={i} className="text-muted-foreground pl-1">
                                        <span className="text-foreground">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* Safety Notes */}
                    {idea.safety_notes?.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                            <h4 className="font-semibold flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-500">
                                <AlertTriangle className="h-4 w-4" />
                                Safety Notes
                            </h4>
                            <ul className="list-disc list-inside space-y-1">
                                {idea.safety_notes.map((note, i) => (
                                    <li key={i} className="text-sm text-muted-foreground">
                                        {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* YouTube Tutorials */}
                    {idea.youtubeLinks?.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h4 className="font-semibold flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-500">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                                Video Tutorials
                            </h4>
                            <div className="space-y-2">
                                {idea.youtubeLinks.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        <span>{link.title}</span>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        {/* Future: Save Idea functionality */}
                        <Button disabled onClick={() => { }}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Project
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
