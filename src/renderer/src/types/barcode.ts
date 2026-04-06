export type BarcodeType =
  | 'code128'
  | 'code39'
  | 'code93'
  | 'ean13'
  | 'ean8'
  | 'upca'
  | 'upce'
  | 'itf'
  | 'codabar'
  | 'databar'

export interface BarcodeOptions {
  type: BarcodeType
  width: number
  height: number
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
  showText: boolean
  fontSize: number
  textColor: string
  barColor: string
  backgroundColor: string
}

export const BARCODE_TYPE_OPTIONS = [
  { value: 'code128', label: 'Code 128', description: '通用条形码，支持全ASCII字符' },
  { value: 'code39', label: 'Code 39', description: '支持数字、大写字母和特殊字符' },
  { value: 'code93', label: 'Code 93', description: '高密度条形码' },
  { value: 'ean13', label: 'EAN-13', description: '国际商品条码（13位数字）' },
  { value: 'ean8', label: 'EAN-8', description: '缩短版商品条码（8位数字）' },
  { value: 'upca', label: 'UPC-A', description: '美国商品条码（12位数字）' },
  { value: 'upce', label: 'UPC-E', description: '缩短版UPC（6位数字）' },
  { value: 'itf', label: 'ITF', description: '交叉二五码，用于物流包装' },
  { value: 'codabar', label: 'Codabar', description: '用于图书馆和血库' },
  { value: 'databar', label: 'DataBar', description: 'GS1 DataBar 条码' }
]

export const DEFAULT_BARCODE_OPTIONS: BarcodeOptions = {
  type: 'code128',
  width: 2,
  height: 100,
  marginTop: 10,
  marginBottom: 10,
  marginLeft: 10,
  marginRight: 10,
  showText: true,
  fontSize: 14,
  textColor: '#000000',
  barColor: '#000000',
  backgroundColor: '#ffffff'
}

export function validateBarcodeContent(
  content: string,
  type: BarcodeType
): { valid: boolean; message: string } {
  if (!content || content.trim() === '') {
    return { valid: false, message: '请输入条形码内容' }
  }

  // eslint-disable-next-line no-control-regex
  const validators: Record<BarcodeType, { pattern: RegExp; message: string }> = {
    code128: { pattern: /^[\x00-\x7F]+$/, message: 'Code 128 支持 ASCII 字符' }, // eslint-disable-line no-control-regex
    code39: {
      pattern: /^[0-9A-Z\-. $/+%]+$/,
      message: 'Code 39 仅支持数字、大写字母和 - . $ / + % 空格'
    },
    code93: {
      pattern: /^[0-9A-Z\-. $/+%]+$/,
      message: 'Code 93 仅支持数字、大写字母和 - . $ / + % 空格'
    },
    ean13: { pattern: /^\d{12,13}$/, message: 'EAN-13 需要12-13位数字' },
    ean8: { pattern: /^\d{7,8}$/, message: 'EAN-8 需要7-8位数字' },
    upca: { pattern: /^\d{11,12}$/, message: 'UPC-A 需要11-12位数字' },
    upce: { pattern: /^\d{6}$/, message: 'UPC-E 需要6位数字' },
    itf: { pattern: /^\d+$/, message: 'ITF 仅支持数字，且位数需为偶数' },
    codabar: { pattern: /^[0-9\-$:/.+]+$/, message: 'Codabar 支持数字和 - $ : / . +' },
    databar: { pattern: /^\d+$/, message: 'DataBar 仅支持数字' }
  }

  const validator = validators[type]

  if (!validator.pattern.test(content)) {
    return { valid: false, message: validator.message }
  }

  if (type === 'itf' && content.length % 2 !== 0) {
    return { valid: false, message: 'ITF 条码内容位数必须为偶数' }
  }

  return { valid: true, message: '' }
}
