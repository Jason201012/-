import * as QRCode from 'qrcode'
import type { QRCodeOptions, QRCodeData, VCardData, WifiData, EmailData } from '../types/qrcode'

export async function generateQRCode(data: QRCodeData): Promise<string> {
  const { content, options } = data
  
  try {
    const dataUrl = await QRCode.toDataURL(content, {
      errorCorrectionLevel: options.errorCorrectionLevel,
      width: options.width,
      margin: options.margin,
      color: options.color
    })
    
    if (data.logo) {
      return await embedLogo(dataUrl, data.logo.src, data.logo.size)
    }
    
    return dataUrl
  } catch (error) {
    throw new Error(`生成二维码失败: ${error}`)
  }
}

export async function generateQRCodeSvg(data: QRCodeData): Promise<string> {
  const { content, options } = data
  
  try {
    return await QRCode.toString(content, {
      type: 'svg',
      errorCorrectionLevel: options.errorCorrectionLevel,
      width: options.width,
      margin: options.margin,
      color: options.color
    })
  } catch (error) {
    throw new Error(`生成SVG二维码失败: ${error}`)
  }
}

export async function generateQRCodeBuffer(data: QRCodeData): Promise<Buffer> {
  const { content, options } = data
  
  try {
    return await QRCode.toBuffer(content, {
      errorCorrectionLevel: options.errorCorrectionLevel,
      width: options.width,
      margin: options.margin,
      color: options.color
    })
  } catch (error) {
    throw new Error(`生成二维码Buffer失败: ${error}`)
  }
}

async function embedLogo(qrDataUrl: string, logoSrc: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const qrImage = new Image()
    const logoImage = new Image()
    
    qrImage.onload = () => {
      logoImage.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('无法创建Canvas上下文'))
          return
        }
        
        canvas.width = qrImage.width
        canvas.height = qrImage.height
        
        ctx.drawImage(qrImage, 0, 0)
        
        const logoSize = size || qrImage.width * 0.2
        const x = (qrImage.width - logoSize) / 2
        const y = (qrImage.height - logoSize) / 2
        
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(x - 2, y - 2, logoSize + 4, logoSize + 4)
        
        ctx.drawImage(logoImage, x, y, logoSize, logoSize)
        
        resolve(canvas.toDataURL('image/png'))
      }
      
      logoImage.onerror = () => reject(new Error('Logo加载失败'))
      logoImage.src = logoSrc
    }
    
    qrImage.onerror = () => reject(new Error('二维码图片加载失败'))
    qrImage.src = qrDataUrl
  })
}

export function formatVCard(data: VCardData): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0']
  
  if (data.name) {
    lines.push(`FN:${data.name}`)
    const nameParts = data.name.split(' ')
    if (nameParts.length >= 2) {
      lines.push(`N:${nameParts.slice(1).join(' ')};${nameParts[0]};;;`)
    } else {
      lines.push(`N:${data.name};;;;`)
    }
  }
  
  if (data.phone) {
    lines.push(`TEL:${data.phone}`)
  }
  
  if (data.email) {
    lines.push(`EMAIL:${data.email}`)
  }
  
  if (data.organization) {
    lines.push(`ORG:${data.organization}`)
  }
  
  if (data.title) {
    lines.push(`TITLE:${data.title}`)
  }
  
  if (data.address) {
    lines.push(`ADR:;;${data.address};;;;`)
  }
  
  if (data.website) {
    lines.push(`URL:${data.website}`)
  }
  
  lines.push('END:VCARD')
  
  return lines.join('\n')
}

export function formatWifi(data: WifiData): string {
  const parts = [
    `S:${data.ssid}`,
    `T:${data.encryption}`,
    `P:${data.password}`,
    `H:${data.hidden ? 'true' : 'false'}`,
    ''
  ]
  
  return `WIFI:${parts.join(';')};`
}

export function formatEmail(data: EmailData): string {
  let url = `mailto:${data.to}`
  const params: string[] = []
  
  if (data.subject) {
    params.push(`subject=${encodeURIComponent(data.subject)}`)
  }
  
  if (data.body) {
    params.push(`body=${encodeURIComponent(data.body)}`)
  }
  
  if (params.length > 0) {
    url += '?' + params.join('&')
  }
  
  return url
}

export function formatPhone(number: string): string {
  return `tel:${number.replace(/\s/g, '')}`
}

export function formatSms(number: string, message?: string): string {
  let url = `sms:${number.replace(/\s/g, '')}`
  if (message) {
    url += `?body=${encodeURIComponent(message)}`
  }
  return url
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-+()]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7
}
