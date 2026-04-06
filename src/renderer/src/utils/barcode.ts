import bwipjs from 'bwip-js'
import type { BarcodeType, BarcodeOptions } from '../types/barcode'
import { DEFAULT_BARCODE_OPTIONS } from '../types/barcode'

function mapBarcodeType(type: BarcodeType): string {
  const typeMap: Record<BarcodeType, string> = {
    code128: 'code128',
    code39: 'code39',
    code93: 'code93',
    ean13: 'ean13',
    ean8: 'ean8',
    upca: 'upca',
    upce: 'upce',
    itf: 'itf14',
    codabar: 'codabar',
    databar: 'databar'
  }
  return typeMap[type] || 'code128'
}

export async function generateBarcode(
  content: string,
  options: Partial<BarcodeOptions> = {}
): Promise<string> {
  const opts = { ...DEFAULT_BARCODE_OPTIONS, ...options }

  try {
    const canvas = document.createElement('canvas')

    bwipjs.toCanvas(canvas, {
      bcid: mapBarcodeType(opts.type),
      text: content,
      scale: opts.width,
      height: opts.height / 2,
      includetext: opts.showText,
      textxalign: 'center',
      textsize: opts.fontSize,
      barcolor: opts.barColor,
      backgroundcolor: opts.backgroundColor
    })

    return canvas.toDataURL('image/png')
  } catch (error) {
    throw new Error(`条形码生成失败: ${error}`)
  }
}

export async function generateBarcodeSvg(
  content: string,
  options: Partial<BarcodeOptions> = {}
): Promise<string> {
  const opts = { ...DEFAULT_BARCODE_OPTIONS, ...options }

  try {
    const svg = bwipjs.toSVG({
      bcid: mapBarcodeType(opts.type),
      text: content,
      scale: opts.width,
      height: opts.height / 2,
      includetext: opts.showText,
      textxalign: 'center',
      textsize: opts.fontSize,
      barcolor: opts.barColor,
      backgroundcolor: opts.backgroundColor
    })

    return svg
  } catch (error) {
    throw new Error(`条形码生成失败: ${error}`)
  }
}

export async function generateBarcodeBuffer(
  content: string,
  options: Partial<BarcodeOptions> = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_BARCODE_OPTIONS, ...options }

  try {
    const buffer = bwipjs.toBuffer({
      bcid: mapBarcodeType(opts.type),
      text: content,
      scale: opts.width,
      height: opts.height / 2,
      includetext: opts.showText,
      textxalign: 'center',
      textsize: opts.fontSize,
      barcolor: opts.barColor,
      backgroundcolor: opts.backgroundColor
    })

    return buffer
  } catch (error) {
    throw new Error(`条形码生成失败: ${error}`)
  }
}

export function calculateEANChecksum(content: string): string {
  const digits = content.replace(/\D/g, '').slice(0, 12)
  if (digits.length < 12) return ''

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3)
  }

  const checksum = (10 - (sum % 10)) % 10
  return digits + checksum.toString()
}
