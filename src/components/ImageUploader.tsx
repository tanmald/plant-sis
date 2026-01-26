import { useState, useRef, ChangeEvent } from 'react'
import imageCompression from 'browser-image-compression'

interface ImageUploaderProps {
  onImageSelect: (file: File) => void
  currentImage?: string | null
  onRemove?: () => void
}

export default function ImageUploader({ onImageSelect, currentImage, onRemove }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [isCompressing, setIsCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsCompressing(true)

      // Compress image before upload
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      }

      const compressedFile = await imageCompression(file, options)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(compressedFile)

      // Pass compressed file to parent
      onImageSelect(compressedFile)
    } catch (error) {
      console.error('Error compressing image:', error)
      alert('Error processing image. Please try again.')
    } finally {
      setIsCompressing(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onRemove?.()
  }

  return (
    <div className="space-y-3">
      {preview ? (
        // Image Preview
        <div className="relative">
          <img
            src={preview}
            alt="Plant preview"
            className="w-full aspect-square object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      ) : (
        // Upload Button
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        >
          {isCompressing ? (
            <div>
              <div className="text-4xl mb-2">⏳</div>
              <p className="text-gray-600">Compressing image...</p>
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-3">📸</div>
              <p className="font-medium text-text mb-1">Add Photo</p>
              <p className="text-sm text-gray-500">Tap to take a photo or choose from library</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-primary text-sm font-medium"
        >
          Change photo
        </button>
      )}
    </div>
  )
}
