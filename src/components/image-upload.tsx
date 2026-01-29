'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from './ui/button'
import { uploadFile } from '@/lib/supabase/storage'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  uploadPath: string
  userId: string
  className?: string
  maxSize?: number // in MB
  accept?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  uploadPath,
  userId,
  className = '',
  maxSize = 5,
  accept = 'image/*',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | undefined>(value)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }

    setUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Supabase Storage
      const { url } = await uploadFile(file, uploadPath, userId)
      onChange(url)
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
      // Reset preview on error
      setPreview(value)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onRemove?.()
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />

      {preview ? (
        <div className="relative group">
          <div
            className="w-full h-48 md:h-64 rounded-lg bg-cover bg-center border-2 border-dashed border-border"
            style={{ backgroundImage: `url(${preview})` }}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClick}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Change
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="w-full h-48 md:h-64 rounded-lg border-2 border-dashed border-border hover:border-brand hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-3 group"
        >
          {uploading ? (
            <>
              <div className="animate-spin w-12 h-12 border-2 border-brand border-t-transparent rounded-full" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:text-brand transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-foreground font-medium">Upload Image</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Max size: {maxSize}MB
                </p>
              </div>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
