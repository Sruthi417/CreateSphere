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
