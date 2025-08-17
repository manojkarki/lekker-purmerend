'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface ProductGalleryProps {
  images: string[]
  title: string
  className?: string
}

// Check if a string is an emoji/single character (for demo purposes)
const isEmoji = (str: string) => {
  return str.length <= 4 && /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu.test(str)
}

export function ProductGallery({ images, title, className = '' }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className={`aspect-square bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center text-4xl">
            📷
          </div>
          <p>Geen afbeelding beschikbaar</p>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const currentImage = images[selectedIndex]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main image */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
        <div className="relative w-full h-full flex items-center justify-center">
          {isEmoji(currentImage) ? (
            <div className="text-8xl md:text-9xl">
              {currentImage}
            </div>
          ) : (
            <img
              src={currentImage}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to emoji display if image fails to load
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = `<div class="text-8xl md:text-9xl">🍰</div>`
                }
              }}
            />
          )}
        </div>

        {/* Navigation arrows - only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
              aria-label="Vorige afbeelding"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
              aria-label="Volgende afbeelding"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>
      
      {/* Thumbnail grid - only show if multiple images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-4">
          {images.map((image, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`aspect-square relative rounded-md overflow-hidden border-2 transition-all duration-200 bg-gray-100 flex items-center justify-center ${
                idx === selectedIndex 
                  ? 'border-primary-500 ring-2 ring-primary-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {isEmoji(image) ? (
                <div className="text-2xl">
                  {image}
                </div>
              ) : (
                <img 
                  src={image} 
                  alt={`${title} ${idx + 1}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = `<div class="text-2xl">🍰</div>`
                    }
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface ProductImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
}

export function ProductImage({ 
  src, 
  alt, 
  className = '', 
  priority = false 
}: ProductImageProps) {
  return (
    <div className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-all duration-300 hover:scale-105"
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}