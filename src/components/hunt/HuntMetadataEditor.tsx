// src/components/hunt/HuntMetadataEditor.tsx
import React from 'react';
import { TreasureHunt } from '../../types';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Label from '../ui/Label';
import Select from '../ui/Select';

// Adjust Metadata type to use 'story_context'
type Metadata = Partial<Pick<TreasureHunt,
    'title' |
    'description' |
    'story_context' | // <<< CHANGED from story_prologue
    'is_public' |
    'difficulty' |
    'tags' |
    'cover_image_url' |
    'estimated_time_minutes'
>>;

interface HuntMetadataEditorProps {
    metadata: Metadata;
    onMetadataChange: (field: keyof Metadata, value: any) => void;
}

export const HuntMetadataEditor: React.FC<HuntMetadataEditorProps> = ({ metadata, onMetadataChange }) => {
    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        onMetadataChange('tags', tagsArray);
    };

    return (
        <Card className="bg-white shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-700">
                    Hunt Overview
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="hunt-title">Title <span className="text-red-500">*</span></Label>
                    <Input
                        id="hunt-title"
                        value={metadata.title || ''}
                        onChange={(e) => onMetadataChange('title', e.target.value)}
                        placeholder="e.g., The Serpent's Cipher"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="hunt-description">Short Description (Teaser)</Label>
                    <Textarea
                        id="hunt-description"
                        value={metadata.description || ''}
                        onChange={(e) => onMetadataChange('description', e.target.value)}
                        placeholder="A brief summary for the hunt listing."
                        rows={3}
                    />
                </div>
                <div>
                    {/* Changed label and field to story_context */}
                    <Label htmlFor="hunt-story-context">Story Context / Introduction</Label>
                    <Textarea
                        id="hunt-story-context"
                        value={metadata.story_context || ''}  // <<< USE story_context
                        onChange={(e) => onMetadataChange('story_context', e.target.value)} // <<< USE story_context
                        placeholder="Set the scene for your adventure..."
                        rows={5}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="hunt-difficulty">Difficulty</Label>
                        <Select
                            id="hunt-difficulty"
                            value={metadata.difficulty || 'medium'}
                            onChange={(e) => onMetadataChange('difficulty', e.target.value as TreasureHunt['difficulty'])}
                            options={[
                                { value: 'easy', label: 'Easy' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'hard', label: 'Hard' },
                                { value: 'expert', label: 'Expert' },
                            ]}
                        />
                    </div>
                    <div>
                        <Label htmlFor="hunt-estimated-time">Estimated Playtime (minutes)</Label>
                        <Input
                            id="hunt-estimated-time"
                            type="number"
                            value={metadata.estimated_time_minutes === null || metadata.estimated_time_minutes === undefined ? '' : metadata.estimated_time_minutes}
                            onChange={(e) => onMetadataChange('estimated_time_minutes', e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="e.g., 60"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="hunt-tags">Tags (comma-separated)</Label>
                    <Input
                        id="hunt-tags"
                        value={(metadata.tags || []).join(', ')}
                        onChange={handleTagsChange}
                        placeholder="e.g., mystery, historical, outdoor"
                    />
                </div>

                <div>
                    <Label htmlFor="hunt-cover-image">Cover Image URL (Optional)</Label>
                    <Input
                        id="hunt-cover-image"
                        type="url"
                        value={metadata.cover_image_url || ''}
                        onChange={(e) => onMetadataChange('cover_image_url', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        id="hunt-is-public"
                        type="checkbox"
                        checked={metadata.is_public === undefined ? true : metadata.is_public}
                        onChange={(e) => onMetadataChange('is_public', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="hunt-is-public" className="mb-0">Make this hunt publicly available</Label>
                </div>
            </CardContent>
        </Card>
    );
};
