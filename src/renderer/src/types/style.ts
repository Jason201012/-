export type DotStyle = 'square' | 'rounded' | 'dots' | 'classy-rounded' | 'extra-rounded'
export type CornerSquareStyle = 'square' | 'extra-rounded' | 'dot'
export type CornerDotStyle = 'square' | 'dot'

export interface GradientColor {
  type: 'linear' | 'radial'
  rotation?: number
  colorStops: {
    offset: number
    color: string
  }[]
}

export interface QRStyleOptions {
  dotsStyle: DotStyle
  cornersSquareStyle: CornerSquareStyle
  cornersDotStyle: CornerDotStyle
  dotsColor: string | GradientColor
  cornersSquareColor: string | GradientColor
  cornersDotColor: string | GradientColor
  backgroundOptions: {
    color: string | GradientColor
  }
  imageOptions: {
    crossOrigin: string
    margin: number
    imageSize: number
  }
}

export interface StyleTemplate {
  id: string
  name: string
  description: string
  preview?: string
  options: QRStyleOptions
  createdAt: number
  isPreset: boolean
}

export const DOT_STYLE_OPTIONS = [
  { value: 'square', label: '方形' },
  { value: 'rounded', label: '圆角' },
  { value: 'dots', label: '圆点' },
  { value: 'classy-rounded', label: '优雅圆角' },
  { value: 'extra-rounded', label: '大圆角' }
]

export const CORNER_SQUARE_STYLE_OPTIONS = [
  { value: 'square', label: '方形' },
  { value: 'extra-rounded', label: '圆角' },
  { value: 'dot', label: '圆形' }
]

export const CORNER_DOT_STYLE_OPTIONS = [
  { value: 'square', label: '方形' },
  { value: 'dot', label: '圆形' }
]

export const DEFAULT_STYLE_OPTIONS: QRStyleOptions = {
  dotsStyle: 'square',
  cornersSquareStyle: 'square',
  cornersDotStyle: 'square',
  dotsColor: '#000000',
  cornersSquareColor: '#000000',
  cornersDotColor: '#000000',
  backgroundOptions: {
    color: '#ffffff'
  },
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: 5,
    imageSize: 0.4
  }
}
