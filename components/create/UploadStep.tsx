'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface UploadStepProps {
  onImageSelected: (file: File) => void
}

export function UploadStep({ onImageSelected }: UploadStepProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onImageSelected(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function clearPreview() {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#1E293B]">Upload your receipt</h2>
        <p className="mt-2 text-[#64748B]">Take a photo or upload an image — we&apos;ll read it for you</p>
      </div>

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden border-2 border-[#5ECEB8]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Receipt preview" className="w-full max-h-80 object-contain bg-[#F8FAFC]" />
            <button
              onClick={clearPreview}
              className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-md hover:bg-[#FEE2E2] transition-colors"
            >
              <X size={16} className="text-[#FF6B6B]" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-all duration-200
              ${dragOver ? 'border-[#5ECEB8] bg-[#E6FAF7]' : 'border-[#CBD5E1] hover:border-[#5ECEB8] hover:bg-[#F8FAFC]'}
            `}
          >
            <div className="w-16 h-16 rounded-2xl bg-[#E6FAF7] flex items-center justify-center">
              <ImageIcon size={28} className="text-[#5ECEB8]" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-[#1E293B]">Drop your receipt here</p>
              <p className="text-sm text-[#94A3B8] mt-1">or click to browse files</p>
            </div>
            <p className="text-xs text-[#CBD5E1]">JPG, PNG, HEIC up to 10MB</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={18} />
          Browse files
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => cameraInputRef.current?.click()}
        >
          <Camera size={18} />
          Take photo
        </Button>
      </div>
    </div>
  )
}
