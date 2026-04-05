export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export interface QRCodeOptions {
  errorCorrectionLevel: ErrorCorrectionLevel
  width: number
  margin: number
  color: {
    dark: string
    light: string
  }
}

export interface QRCodeData {
  type: 'text' | 'url' | 'vcard' | 'wifi' | 'email' | 'phone' | 'sms'
  content: string
  options: QRCodeOptions
  logo?: {
    src: string
    size: number
  }
}

export interface VCardData {
  name: string
  phone?: string
  email?: string
  organization?: string
  title?: string
  address?: string
  website?: string
}

export interface WifiData {
  ssid: string
  password: string
  encryption: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}

export interface EmailData {
  to: string
  subject?: string
  body?: string
}

export interface PhoneData {
  number: string
}

export interface HistoryItem {
  id: string
  type: QRCodeData['type']
  content: string
  options: QRCodeOptions
  dataUrl: string
  createdAt: number
}

export interface BatchItem {
  id: string
  content: string
  type: QRCodeData['type']
  status: 'pending' | 'success' | 'error'
  error?: string
}

export const DEFAULT_OPTIONS: QRCodeOptions = {
  errorCorrectionLevel: 'M',
  width: 300,
  margin: 4,
  color: {
    dark: '#000000',
    light: '#ffffff'
  }
}

export const ERROR_CORRECTION_OPTIONS = [
  { value: 'L', label: 'L - 低 (7%)' },
  { value: 'M', label: 'M - 中 (15%)' },
  { value: 'Q', label: 'Q - 较高 (25%)' },
  { value: 'H', label: 'H - 高 (30%)' }
]
