import jsQR from 'jsqr'
import type { ImageScanResult, BarcodeFormat, ImageScanOptions } from '../types/imageScanner'
import { DEFAULT_IMAGE_SCAN_OPTIONS, BARCODE_FORMAT_NAMES } from '../types/imageScanner'
import { parseScanContent } from './scanner'

type BarcodeDetectorFormat = 
  | 'aztec'
  | 'code_128'
  | 'code_39'
  | 'code_93'
  | 'codabar'
  | 'data_matrix'
  | 'ean_13'
  | 'ean_8'
  | 'itf'
  | 'pdf417'
  | 'qr_code'
  | 'upc_a'
  | 'upc_e'

interface BarcodeDetector {
  detect(image: ImageBitmap): Promise<DetectedBarcode[]>
  getSupportedFormats(): Promise<BarcodeDetectorFormat[]>
}

interface DetectedBarcode {
  boundingBox: DOMRectReadOnly
  rawValue: string
  format: BarcodeDetectorFormat
  cornerPoints: { x: number; y: number }[]
}

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats?: BarcodeDetectorFormat[] }): BarcodeDetector
      getSupportedFormats(): Promise<BarcodeDetectorFormat[]>
    }
  }
}

function mapFormat(format: BarcodeDetectorFormat): BarcodeFormat {
  const formatMap: Record<string, BarcodeFormat> = {
    'qr_code': 'qr_code',
    'ean_13': 'ean_13',
    'ean_8': 'ean_8',
    'upc_a': 'upc_a',
    'upc_e': 'upc_e',
    'code_128': 'code_128',
    'code_39': 'code_39',
    'code_93': 'code_93',
    'codabar': 'codabar',
    'itf': 'itf',
    'data_matrix': 'data_matrix',
    'pdf417': 'pdf417',
    'aztec': 'aztec'
  }
  return formatMap[format] || 'qr_code'
}

export async function isBarcodeDetectorSupported(): Promise<boolean> {
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      const formats = await window.BarcodeDetector!.getSupportedFormats()
      return formats.length > 0
    } catch {
      return false
    }
  }
  return false
}

export async function scanImageFromUrl(
  imageUrl: string,
  options: Partial<ImageScanOptions> = {}
): Promise<ImageScanResult | null> {
  const opts = { ...DEFAULT_IMAGE_SCAN_OPTIONS, ...options }
  
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    return scanImageFromBlob(blob, opts)
  } catch (error) {
    console.error('加载图片失败:', error)
    return null
  }
}

export async function scanImageFromBlob(
  blob: Blob,
  options: Partial<ImageScanOptions> = {}
): Promise<ImageScanResult | null> {
  const opts = { ...DEFAULT_IMAGE_SCAN_OPTIONS, ...options }
  
  try {
    const imageBitmap = await createImageBitmap(blob)
    return scanImageFromBitmap(imageBitmap, opts)
  } catch (error) {
    console.error('创建图像位图失败:', error)
    return null
  }
}

export async function scanImageFromBitmap(
  imageBitmap: ImageBitmap,
  options: Partial<ImageScanOptions> = {}
): Promise<ImageScanResult | null> {
  const opts = { ...DEFAULT_IMAGE_SCAN_OPTIONS, ...options }
  
  const supported = await isBarcodeDetectorSupported()
  
  if (supported) {
    const result = await scanWithBarcodeDetector(imageBitmap, opts)
    if (result) return result
  }
  
  const result = await scanWithJsQR(imageBitmap, opts)
  if (result) return result
  
  if (opts.tryHarder) {
    return await scanWithPreprocessing(imageBitmap, opts)
  }
  
  return null
}

async function scanWithBarcodeDetector(
  imageBitmap: ImageBitmap,
  options: ImageScanOptions
): Promise<ImageScanResult | null> {
  if (!window.BarcodeDetector) return null
  
  try {
    const formats = options.formats as BarcodeDetectorFormat[]
    const detector = new window.BarcodeDetector({ formats })
    const results = await detector.detect(imageBitmap)
    
    if (results && results.length > 0) {
      const barcode = results[0]
      const scanResult = parseScanContent(barcode.rawValue)
      
      return {
        rawContent: barcode.rawValue,
        format: mapFormat(barcode.format),
        type: scanResult.type,
        parsedData: scanResult.parsedData,
        timestamp: Date.now(),
        confidence: 1.0,
        position: {
          x: barcode.boundingBox.x,
          y: barcode.boundingBox.y,
          width: barcode.boundingBox.width,
          height: barcode.boundingBox.height
        }
      }
    }
  } catch (error) {
    console.error('BarcodeDetector 扫描失败:', error)
  }
  
  return null
}

async function scanWithJsQR(
  imageBitmap: ImageBitmap,
  options: ImageScanOptions
): Promise<ImageScanResult | null> {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    
    canvas.width = imageBitmap.width
    canvas.height = imageBitmap.height
    ctx.drawImage(imageBitmap, 0, 0)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    })
    
    if (code) {
      const scanResult = parseScanContent(code.data)
      
      return {
        rawContent: code.data,
        format: 'qr_code',
        type: scanResult.type,
        parsedData: scanResult.parsedData,
        timestamp: Date.now(),
        confidence: 0.9,
        position: {
          x: code.location.topLeftCorner.x,
          y: code.location.topLeftCorner.y,
          width: Math.abs(code.location.topRightCorner.x - code.location.topLeftCorner.x),
          height: Math.abs(code.location.bottomLeftCorner.y - code.location.topLeftCorner.y)
        }
      }
    }
  } catch (error) {
    console.error('jsQR 扫描失败:', error)
  }
  
  return null
}

async function scanWithPreprocessing(
  imageBitmap: ImageBitmap,
  options: ImageScanOptions
): Promise<ImageScanResult | null> {
  const preprocessingMethods = [
    (img: ImageBitmap) => enhanceContrast(img),
    (img: ImageBitmap) => convertToGrayscale(img),
    (img: ImageBitmap) => resizeImage(img, 2),
    (img: ImageBitmap) => binarize(img)
  ]
  
  for (const method of preprocessingMethods) {
    try {
      const processed = await method(imageBitmap)
      const result = await scanWithJsQR(processed, options)
      if (result) {
        result.confidence = 0.7
        return result
      }
    } catch (error) {
      continue
    }
  }
  
  return null
}

async function enhanceContrast(imageBitmap: ImageBitmap): Promise<ImageBitmap> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return imageBitmap
  
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height
  ctx.drawImage(imageBitmap, 0, 0)
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  const factor = 1.5
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128))
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128))
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128))
  }
  
  ctx.putImageData(imageData, 0, 0)
  return await createImageBitmap(canvas)
}

async function convertToGrayscale(imageBitmap: ImageBitmap): Promise<ImageBitmap> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return imageBitmap
  
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height
  ctx.drawImage(imageBitmap, 0, 0)
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    data[i] = gray
    data[i + 1] = gray
    data[i + 2] = gray
  }
  
  ctx.putImageData(imageData, 0, 0)
  return await createImageBitmap(canvas)
}

async function resizeImage(imageBitmap: ImageBitmap, scale: number): Promise<ImageBitmap> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return imageBitmap
  
  canvas.width = imageBitmap.width * scale
  canvas.height = imageBitmap.height * scale
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height)
  
  return await createImageBitmap(canvas)
}

async function binarize(imageBitmap: ImageBitmap): Promise<ImageBitmap> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return imageBitmap
  
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height
  ctx.drawImage(imageBitmap, 0, 0)
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    const binary = gray > 128 ? 255 : 0
    data[i] = binary
    data[i + 1] = binary
    data[i + 2] = binary
  }
  
  ctx.putImageData(imageData, 0, 0)
  return await createImageBitmap(canvas)
}

export function getBarcodeFormatName(format: BarcodeFormat): string {
  return BARCODE_FORMAT_NAMES[format] || '未知格式'
}

export function isBarcode(format: BarcodeFormat): boolean {
  const barcodeFormats: BarcodeFormat[] = [
    'ean_13', 'ean_8', 'upc_a', 'upc_e', 
    'code_128', 'code_39', 'code_93', 
    'codabar', 'itf'
  ]
  return barcodeFormats.includes(format)
}
