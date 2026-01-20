'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  description?: string;
  value: string | null;
  onChange: (file: File | null, preview: string | null) => void;
  aspectRatio?: 'square' | 'banner';
}

export function ImageUpload({
  label,
  description,
  value,
  onChange,
  aspectRatio = 'square',
}: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError('File is too large. Maximum size is 5MB.');
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('Invalid file type. Please upload a PNG, JPG, or GIF.');
        } else {
          setError('File upload failed. Please try again.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const preview = URL.createObjectURL(file);
        onChange(file, preview);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value) {
      URL.revokeObjectURL(value);
    }
    onChange(null, null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm text-secondary">{label}</label>
      {description && (
        <p className="text-xs text-muted">{description}</p>
      )}

      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer rounded-lg border border-dashed transition-all
          ${isDragActive ? 'border-primary bg-surface-light' : 'border-border hover:border-border-light'}
          ${aspectRatio === 'square' ? 'aspect-square max-w-[180px]' : 'aspect-[3/1] max-w-[360px]'}
          ${value ? 'p-0' : 'p-4'}
        `}
      >
        <input {...getInputProps()} />

        {value ? (
          <div className="relative w-full h-full">
            <Image
              src={value}
              alt={label}
              fill
              className="object-cover rounded-lg"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-dark/80 rounded-full hover:bg-dark transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {isDragActive ? (
              <>
                <Upload className="w-6 h-6 text-primary mb-2" />
                <p className="text-xs text-primary">Drop here</p>
              </>
            ) : (
              <>
                <ImageIcon className="w-6 h-6 text-muted mb-2" />
                <p className="text-xs text-muted">
                  Drag & drop or click
                </p>
                <p className="text-xs text-muted mt-1">
                  PNG, JPG up to 5MB
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-secondary">{error}</p>}
    </div>
  );
}

export default ImageUpload;
