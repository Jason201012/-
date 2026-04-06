import jsQR from 'jsqr'
import type {
  ScanResult,
  ScanResultType,
  VCardParsedData,
  WifiParsedData,
  EmailParsedData,
  PhoneParsedData,
  ParsedScanData
} from '../types/scanner'

export function detectScanResultType(content: string): ScanResultType {
  if (content.startsWith('http://') || content.startsWith('https://')) {
    return 'url'
  }
  if (content.startsWith('WIFI:')) {
    return 'wifi'
  }
  if (content.startsWith('BEGIN:VCARD')) {
    return 'vcard'
  }
  if (content.startsWith('mailto:')) {
    return 'email'
  }
  if (content.startsWith('tel:')) {
    return 'phone'
  }
  if (content.startsWith('sms:') || content.startsWith('smsto:')) {
    return 'sms'
  }
  return 'text'
}

export function parseScanContent(content: string): ScanResult {
  const type = detectScanResultType(content)
  let parsedData: ParsedScanData | undefined

  switch (type) {
    case 'wifi':
      parsedData = { type, data: parseWifiContent(content) }
      break
    case 'vcard':
      parsedData = { type, data: parseVCardContent(content) }
      break
    case 'email':
      parsedData = { type, data: parseEmailContent(content) }
      break
    case 'phone':
      parsedData = { type, data: parsePhoneContent(content) }
      break
    case 'url':
    case 'text':
    default:
      parsedData = { type, data: content }
  }

  return {
    rawContent: content,
    type,
    parsedData,
    timestamp: Date.now()
  }
}

function parseWifiContent(content: string): WifiParsedData {
  const result: WifiParsedData = {
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false
  }

  const wifiMatch = content.match(/WIFI:(.*);$/)
  if (!wifiMatch) return result

  const parts = wifiMatch[1].split(';')
  for (const part of parts) {
    const [key, value] = part.split(':')
    if (key === 'S') result.ssid = value || ''
    if (key === 'P') result.password = value || ''
    if (key === 'T') {
      const enc = value?.toUpperCase()
      if (enc === 'WPA' || enc === 'WEP' || enc === 'NOPASS') {
        result.encryption = enc === 'NOPASS' ? 'nopass' : enc
      }
    }
    if (key === 'H') result.hidden = value === 'true'
  }

  return result
}

function parseVCardContent(content: string): VCardParsedData {
  const result: VCardParsedData = {}

  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('FN:')) {
      result.name = trimmed.substring(3)
    }
    if (trimmed.startsWith('TEL') && trimmed.includes(':')) {
      const telIndex = trimmed.indexOf(':')
      result.phone = trimmed.substring(telIndex + 1)
    }
    if (trimmed.startsWith('EMAIL') && trimmed.includes(':')) {
      const emailIndex = trimmed.indexOf(':')
      result.email = trimmed.substring(emailIndex + 1)
    }
    if (trimmed.startsWith('ORG:')) {
      result.organization = trimmed.substring(4)
    }
    if (trimmed.startsWith('TITLE:')) {
      result.title = trimmed.substring(6)
    }
    if (trimmed.startsWith('URL:')) {
      result.website = trimmed.substring(4)
    }
  }

  return result
}

function parseEmailContent(content: string): EmailParsedData {
  const result: EmailParsedData = { to: '' }

  const mailtoMatch = content.match(/^mailto:([^?]+)/)
  if (mailtoMatch) {
    result.to = decodeURIComponent(mailtoMatch[1])
  }

  const subjectMatch = content.match(/[?&]subject=([^&]+)/)
  if (subjectMatch) {
    result.subject = decodeURIComponent(subjectMatch[1])
  }

  const bodyMatch = content.match(/[?&]body=([^&]+)/)
  if (bodyMatch) {
    result.body = decodeURIComponent(bodyMatch[1])
  }

  return result
}

function parsePhoneContent(content: string): PhoneParsedData {
  const number = content.replace(/^tel:/, '').replace(/\s/g, '')
  return { number }
}

export async function scanFromCanvas(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement
): Promise<string | null> {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'dontInvert'
  })

  return code?.data || null
}

export function getScanResultDescription(result: ScanResult): string {
  switch (result.type) {
    case 'url':
      return `网址: ${result.rawContent}`
    case 'wifi': {
      const wifi = result.parsedData?.data as WifiParsedData
      return `WiFi: ${wifi?.ssid || '未知'}`
    }
    case 'vcard': {
      const vcard = result.parsedData?.data as VCardParsedData
      return `名片: ${vcard?.name || '未知'}`
    }
    case 'email': {
      const email = result.parsedData?.data as EmailParsedData
      return `邮件: ${email?.to || '未知'}`
    }
    case 'phone': {
      const phone = result.parsedData?.data as PhoneParsedData
      return `电话: ${phone?.number || '未知'}`
    }
    case 'sms':
      return `短信: ${result.rawContent.substring(0, 30)}...`
    default:
      return result.rawContent.length > 50
        ? result.rawContent.substring(0, 50) + '...'
        : result.rawContent
  }
}

export function getScanResultIcon(type: ScanResultType): string {
  const icons: Record<ScanResultType, string> = {
    url: 'Link',
    wifi: 'Connection',
    vcard: 'User',
    email: 'Message',
    phone: 'Phone',
    sms: 'ChatDotRound',
    text: 'Document',
    unknown: 'QuestionFilled'
  }
  return icons[type] || 'Document'
}
