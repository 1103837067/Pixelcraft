export interface ImageConfig {
  sizes: number[]
  formats: string[]
  quality: number
  preserveExif: boolean
}

export interface ProcessedImage {
  url: string
  size: number
  type: string
  format: string
  width: number
  height: number
  originalIndex: number
  processing?: boolean
  error?: string
}

export interface SkippedExport {
  fileName: string
  originalSize: string
  skippedSizes: number[]
}

export interface ExportResult {
  success: boolean
  totalFiles: number
  totalExports: number
  skippedExports: SkippedExport[]
}

export interface SizePreset {
  label: string
  value: number
}

export interface FormatPreset {
  label: string
  value: string
  recommended?: boolean
  experimental?: boolean
}

export interface QualityPreset {
  label: string
  value: number
  description: string
}

export interface UserConfig extends ImageConfig {
  name: string
  timestamp: number
  customSizes: number[]
} 