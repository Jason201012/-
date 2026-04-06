export type BarcodeFormat =
  | 'qr_code'
  | 'ean_13'
  | 'ean_8'
  | 'upc_a'
  | 'upc_e'
  | 'code_128'
  | 'code_39'
  | 'code_93'
  | 'codabar'
  | 'itf'
  | 'data_matrix'
  | 'pdf417'
  | 'aztec'

export interface ImageScanResult {
  rawContent: string
  format: BarcodeFormat
  type: 'text' | 'url' | 'wifi' | 'vcard' | 'email' | 'phone' | 'sms' | 'barcode' | 'unknown'
  parsedData?: any
  timestamp: number
  confidence: number
  position?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface ImageScanOptions {
  formats?: BarcodeFormat[]
  tryHarder: boolean
  maxAttempts: number
}

export interface ImageScanState {
  isScanning: boolean
  progress: number
  error: string | null
  result: ImageScanResult | null
}

export const DEFAULT_IMAGE_SCAN_OPTIONS: ImageScanOptions = {
  formats: ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'],
  tryHarder: true,
  maxAttempts: 3
}

export const BARCODE_FORMAT_NAMES: Record<BarcodeFormat, string> = {
  qr_code: 'QR码',
  ean_13: 'EAN-13',
  ean_8: 'EAN-8',
  upc_a: 'UPC-A',
  upc_e: 'UPC-E',
  code_128: 'Code 128',
  code_39: 'Code 39',
  code_93: 'Code 93',
  codabar: 'Codabar',
  itf: 'ITF',
  data_matrix: 'Data Matrix',
  pdf417: 'PDF417',
  aztec: 'Aztec'
}
