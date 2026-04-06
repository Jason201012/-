import QRCodeStyling from 'qr-code-styling'
import type { QRStyleOptions, GradientColor } from '../types/style'

interface QRCodeStylingOptions {
  width: number
  height: number
  type: 'svg' | 'canvas'
  data: string
  margin: number
  dotsOptions: {
    type: string
    color?: string
    gradient?: {
      type: 'linear' | 'radial'
      rotation?: number
      colorStops: { offset: number; color: string }[]
    }
  }
  cornersSquareOptions: {
    type: string
    color?: string
    gradient?: {
      type: 'linear' | 'radial'
      rotation?: number
      colorStops: { offset: number; color: string }[]
    }
  }
  cornersDotOptions: {
    type: string
    color?: string
    gradient?: {
      type: 'linear' | 'radial'
      rotation?: number
      colorStops: { offset: number; color: string }[]
    }
  }
  backgroundOptions: {
    color?: string
    gradient?: {
      type: 'linear' | 'radial'
      rotation?: number
      colorStops: { offset: number; color: string }[]
    }
  }
  imageOptions: {
    crossOrigin: string
    margin: number
    imageSize: number
    saveAsSVG?: boolean
  }
  image?: string
  qrOptions?: {
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  }
}

function colorToGradientOptions(color: string | GradientColor) {
  if (typeof color === 'string') {
    return { color }
  }
  return {
    gradient: {
      type: color.type,
      rotation: color.rotation || 0,
      colorStops: color.colorStops
    }
  }
}

export function createStyledQRCode(
  data: string,
  options: QRStyleOptions,
  size: number = 300,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M',
  logo?: string
): QRCodeStyling {
  const qrOptions: QRCodeStylingOptions = {
    width: size,
    height: size,
    type: 'canvas',
    data,
    margin: 0,
    dotsOptions: {
      type: options.dotsStyle,
      ...colorToGradientOptions(options.dotsColor)
    },
    cornersSquareOptions: {
      type: options.cornersSquareStyle,
      ...colorToGradientOptions(options.cornersSquareColor)
    },
    cornersDotOptions: {
      type: options.cornersDotStyle,
      ...colorToGradientOptions(options.cornersDotColor)
    },
    backgroundOptions: {
      ...colorToGradientOptions(options.backgroundOptions.color)
    },
    imageOptions: {
      crossOrigin: options.imageOptions.crossOrigin,
      margin: options.imageOptions.margin,
      imageSize: options.imageOptions.imageSize
    },
    qrOptions: {
      errorCorrectionLevel
    }
  }

  if (logo) {
    qrOptions.image = logo
  }

  return new QRCodeStyling(qrOptions)
}

export async function generateStyledQRCodeDataUrl(
  data: string,
  options: QRStyleOptions,
  size: number = 300,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M',
  logo?: string
): Promise<string> {
  const qrCode = createStyledQRCode(data, options, size, errorCorrectionLevel, logo)
  return await qrCode.getRawData('png').then((blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob as Blob)
    })
  })
}

export async function generateStyledQRCodeSvg(
  data: string,
  options: QRStyleOptions,
  size: number = 300,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M',
  logo?: string
): Promise<string> {
  const qrCode = createStyledQRCode(data, options, size, errorCorrectionLevel, logo)
  const blob = await qrCode.getRawData('svg')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(blob as Blob)
  })
}

export function renderQRCodeToElement(qrCode: QRCodeStyling, element: HTMLElement): void {
  qrCode.append(element)
}

export function updateQRCodeData(qrCode: QRCodeStyling, data: string): void {
  qrCode.update({ data })
}

export function updateQRCodeOptions(
  qrCode: QRCodeStyling,
  options: Partial<QRCodeStylingOptions>
): void {
  qrCode.update(options)
}
