export type ScanResultType = 'text' | 'url' | 'vcard' | 'wifi' | 'email' | 'phone' | 'sms' | 'unknown'

export interface ScanResult {
  rawContent: string
  type: ScanResultType
  parsedData?: ParsedScanData
  timestamp: number
}

export interface ParsedScanData {
  type: ScanResultType
  data: VCardParsedData | WifiParsedData | EmailParsedData | PhoneParsedData | string
}

export interface VCardParsedData {
  name?: string
  phone?: string
  email?: string
  organization?: string
  title?: string
  address?: string
  website?: string
}

export interface WifiParsedData {
  ssid: string
  password: string
  encryption: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}

export interface EmailParsedData {
  to: string
  subject?: string
  body?: string
}

export interface PhoneParsedData {
  number: string
}

export interface ScannerConfig {
  facingMode: 'user' | 'environment'
  scanInterval: number
  timeout: number
  autoFocus: boolean
}

export interface ScannerState {
  isScanning: boolean
  hasPermission: boolean | null
  error: string | null
  lastResult: ScanResult | null
}

export const DEFAULT_SCANNER_CONFIG: ScannerConfig = {
  facingMode: 'environment',
  scanInterval: 100,
  timeout: 30000,
  autoFocus: true
}
