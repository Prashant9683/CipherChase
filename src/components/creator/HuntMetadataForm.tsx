// src/components/creator/HuntMetadataForm.tsx
import React from 'react';
import { TreasureHunt } from '../../types';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Label from '../ui/Label';
import Select from '../ui/Select'; // Assume you create this
import { ImageUploader } from './ImageUploader'; // Assume you create this

type Metadata = Partial<
  Omit<TreasureHunt, 'id' | 'creator' | 'puzzles' | 'nodes'>
>;

interface HuntMetadataFormProps {
  metadata: Metadata;
  onMetadataChange: (field: keyof Metadata, value: any) => void;
}

const HuntMetadataForm: React.FC<HuntMetadataFormProps> = ({
  metadata,
  onMetadataChange,
}) => {
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    onMetadataChange('tags', tagsArray);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-serif text-slate-700">
          Hunt Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="hunt-title">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="hunt-title"
            value={metadata.title || ''}
            onChange={(e) => onMetadataChange('title', e.target.value)}
            placeholder="The Lost Scribe's Secret"
            maxLength={150}
            required
          />
        </div>
        <div>
          <Label htmlFor="hunt-description">Short Description (Teaser)</Label>
          <Textarea
            id="hunt-description"
            value={metadata.description || ''}
            onChange={(e) => onMetadataChange('description', e.target.value)}
            placeholder="A brief, enticing summary for the hunt listing."
            rows={3}
            maxLength={300}
          />
        </div>
        <div>
          <Label htmlFor="hunt-story-introduction">
            Story Prologue / Introduction
          </Label>
          <Textarea
            id="hunt-story-introduction"
            value={metadata.story_introduction || ''}
            onChange={(e) =>
              onMetadataChange('story_introduction', e.target.value)
            }
            placeholder="Set the scene for your adventure. This is the first thing players will read."
            rows={5}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="hunt-difficulty">Difficulty</Label>
            <Select
              id="hunt-difficulty"
              value={metadata.difficulty || 'medium'}
              onChange={(e) =>
                onMetadataChange(
                  'difficulty',
                  e.target.value as TreasureHunt['difficulty']
                )
              }
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
                { value: 'expert', label: 'Expert' },
              ]}
            />
          </div>
          <div>
            <Label htmlFor="hunt-estimated-time">
              Estimated Playtime (minutes)
            </Label>
            <Input
              id="hunt-estimated-time"
              type="number"
              value={metadata.estimated_time_minutes || ''}
              onChange={(e) =>
                onMetadataChange(
                  'estimated_time_minutes',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              placeholder="e.g., 60"
              min="0"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="hunt-tags">Tags (comma-separated)</Label>
          <Input
            id="hunt-tags"
            value={(metadata.tags || []).join(', ')}
            onChange={handleTagsChange}
            placeholder="e.g., mystery, historical, outdoor, cipher"
          />
        </div>

        <div>
          <Label htmlFor="hunt-cover-image">Cover Image URL</Label>
          {/* Basic URL input. Replace with ImageUploader for direct uploads */}
          <Input
            id="hunt-cover-image"
            type="url"
            value={metadata.cover_image_url || ''}
            onChange={(e) =>
              onMetadataChange('cover_image_url', e.target.value)
            }
            placeholder="https://example.com/image.jpg"
          />
          {/* <ImageUploader
                onUploadSuccess={(url) => onMetadataChange('cover_image_url', url)}
                bucketName="hunt-covers" // Example Supabase Storage bucket
            /> */}
        </div>

        <div>
          <Label
            htmlFor="hunt-is-public"
            className="flex items-center space-x-2"
          >
            <input
              id="hunt-is-public"
              type="checkbox"
              checked={
                metadata.is_public === undefined ? true : metadata.is_public
              }
              onChange={(e) => onMetadataChange('is_public', e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span>Make this hunt publicly available</span>
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default HuntMetadataForm;
