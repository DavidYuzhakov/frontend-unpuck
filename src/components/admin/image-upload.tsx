'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { uploadAPI } from '@/lib/api'
import { CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useRef, useState } from 'react'

interface ImageUploadProps {
  onImageUploaded: (imagePath: string) => void
  category: 'product' | 'avatar' | 'placeholder'
}

export function ImageUpload({ onImageUploaded, category }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return
    setIsUploading(true)

    try {
      for (const file of Array.from(files)) {
        // Проверяем тип файла
        if (!file.type.startsWith('image/')) {
          alert(`Файл ${file.name} не является изображением`)
          continue
        }

        // Проверяем размер файла (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`Файл ${file.name} слишком большой (максимум 5MB)`)
          continue
        }

        const localUrl = URL.createObjectURL(file)
        setPreview(localUrl)

        const { data } = await uploadAPI.uploadFile(file)
        onImageUploaded(data.url)
      }
    } catch (error) {
      console.error('Ошибка загрузки файла:', error)
      alert('Ошибка при загрузке файла')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CloudArrowUpIcon className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold">Загрузить новое изображение</h3>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Перетащите изображения сюда
          </p>
          <p className="text-sm text-gray-500 mb-4">
            или нажмите кнопку для выбора файлов
          </p>

          <Button
            onClick={openFileDialog}
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? 'Загрузка...' : 'Выбрать файлы'}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Поддерживаемые форматы: JPG, PNG, WebP</p>
          <p>• Максимальный размер файла: 5MB</p>
          <p>• Категория: {category}</p>
        </div>
      </div>
    </Card>
  )
}
