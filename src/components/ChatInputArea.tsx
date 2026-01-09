'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Plus, FileImage, Upload } from 'lucide-react';
import Image from 'next/image';

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  base64?: string;
}

interface ChatInputAreaProps {
  onImagesChange: (images: UploadedImage[]) => void;
  uploadedImages: UploadedImage[];
  children: React.ReactNode;
}

export function ChatInputArea({ onImagesChange, uploadedImages, children }: ChatInputAreaProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);

  const maxSizeMB = 10;
  const maxImages = 10;
  const acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);

    // Validate file count
    if (uploadedImages.length + fileArray.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const validFiles: File[] = [];

    for (const file of fileArray) {
      // Validate file type
      if (!acceptedFormats.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Accepted formats: ${acceptedFormats.join(', ')}`);
        continue;
      }

      // Validate file size
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        setError(`File ${file.name} is too large (${sizeMB.toFixed(2)}MB). Maximum size: ${maxSizeMB}MB`);
        continue;
      }

      validFiles.push(file);
    }

    // Process valid files
    const newImages: UploadedImage[] = await Promise.all(
      validFiles.map(async (file) => {
        const preview = URL.createObjectURL(file);
        const base64 = await fileToBase64(file);
        return {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          file,
          preview,
          base64,
        };
      })
    );

    const updatedImages = [...uploadedImages, ...newImages];
    onImagesChange(updatedImages);
    setShowMenu(false);
  }, [uploadedImages, onImagesChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  }, [processFiles]);

  const removeImage = useCallback((id: string) => {
    const updated = uploadedImages.filter((img) => img.id !== id);
    // Revoke object URL to free memory
    const removed = uploadedImages.find((img) => img.id === id);
    if (removed) {
      URL.revokeObjectURL(removed.preview);
    }
    onImagesChange(updated);
    setError(null);
  }, [uploadedImages, onImagesChange]);

  const clearAll = useCallback(() => {
    uploadedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    onImagesChange([]);
    setError(null);
  }, [uploadedImages, onImagesChange]);

  const handleAttachClick = () => {
    fileInputRef.current?.click();
    setShowMenu(false);
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;

    // Check if dragging files
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const hasImages = Array.from(e.dataTransfer.items).some(
        item => item.kind === 'file' && item.type.startsWith('image/')
      );
      if (hasImages || e.dataTransfer.types.includes('Files')) {
        setIsDragging(true);
      }
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Filter for image files
      const imageFiles = Array.from(files).filter(file =>
        file.type.startsWith('image/') || acceptedFormats.includes(file.type)
      );
      if (imageFiles.length > 0) {
        processFiles(imageFiles);
      } else {
        setError('Please drop image files only');
        setTimeout(() => setError(null), 3000);
      }
    }
  }, [processFiles, acceptedFormats]);

  return (
    <div
      className="relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image preview area - appears above input */}
      {uploadedImages.length > 0 && (
        <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} attached
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 px-2 py-1"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
            {uploadedImages.map((img) => (
              <div key={img.id} className="relative group flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <Image
                    src={img.preview}
                    alt="Upload preview"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-0.5 sm:p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Input area with plus button */}
      <div className="flex gap-2 items-center">
        {/* Plus button with dropdown menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="Add attachments"
          >
            <Plus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Dropdown menu that appears above */}
          {showMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <button
                type="button"
                onClick={handleAttachClick}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 flex items-center gap-3"
              >
                <FileImage className="h-4 w-4" />
                <span>Attach images</span>
              </button>
            </div>
          )}
        </div>

        {/* Children (input field and other buttons) */}
        {children}
      </div>

      {/* Drag overlay - horizontal bar at bottom */}
      {isDragging && (
        <div className="absolute left-11 right-12 bottom-0 z-40 pointer-events-none">
          <div className="h-12 px-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-2xl flex items-center">
            <div className="flex items-center gap-2 w-full">
              <Upload className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Drop images here</p>
              <span className="ml-auto text-xs text-blue-600 dark:text-blue-400">
                {uploadedImages.length > 0
                  ? `${uploadedImages.length} image${uploadedImages.length !== 1 ? 's' : ''} already attached`
                  : `Maximum ${maxImages} images, ${maxSizeMB}MB each`
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}