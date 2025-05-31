// src/components/creator/ImageUploader.tsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Your Supabase client
import Button from '../ui/Button';
import Input from '../ui/Input'; // For file input
import { UploadCloud, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
    onUploadSuccess: (publicUrl: string) => void;
    bucketName: string; // e.g., 'hunt-covers', 'visual-cues'
    filePathPrefix?: string; // e.g., `user.id + '/'` to organize by user
    currentImageUrl?: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadSuccess, bucketName, filePathPrefix = '', currentImageUrl }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        setPreviewUrl(URL.createObjectURL(file)); // Show local preview

        const fileName = `${filePathPrefix}${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

        try {
            const { data, error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, file, {
                    cacheControl: '3600', // Cache for 1 hour
                    upsert: false, // Overwrite if file with same name exists (useful for re-uploads)
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName);

            onUploadSuccess(publicUrl);
            setPreviewUrl(publicUrl); // Update preview to stored URL

        } catch (err) {
            console.error("Upload error:", err);
            setError(err instanceof Error ? err.message : "Failed to upload image.");
            setPreviewUrl(currentImageUrl || null); // Revert preview if upload fails
        } finally {
            setUploading(false);
        }
    };

    // Update preview if currentImageUrl prop changes externally
    React.useEffect(() => {
        setPreviewUrl(currentImageUrl || null);
    }, [currentImageUrl]);

    return (
        <div className="space-y-3">
            {previewUrl && (
                <div className="mt-2">
                    <img src={previewUrl} alt="Preview" className="max-w-xs max-h-40 rounded-md object-contain border border-slate-300" />
                </div>
            )}
            <div className="flex items-center space-x-3">
                <Label htmlFor="image-upload-input" className="flex-shrink-0">
                    <Button type="button" variant="outline" icon={<UploadCloud size={16}/>} disabled={uploading} asChild>
                        <span>{uploading ? 'Uploading...' : (previewUrl ? 'Change Image' : 'Upload Image')}</span>
                    </Button>
                </Label>
                <Input
                    id="image-upload-input"
                    type="file"
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="sr-only" // Hide default input, style the label as a button
                />
                {/* This is to show default input if styling label as button is tricky */}
                {/* <Input
            type="file"
            accept="image/png, image/jpeg, image/gif, image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="text-sm"
        /> */}
            </div>
            {error && <p className="text-xs text-red-500 flex items-center"><AlertCircle size={14} className="mr-1"/>{error}</p>}
        </div>
    );
};
