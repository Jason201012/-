import type { StyleTemplate, QRStyleOptions } from '../types/style'

const createPresetTemplate = (
  id: string,
  name: string,
  description: string,
  options: QRStyleOptions
): StyleTemplate => ({
  id,
  name,
  description,
  options,
  createdAt: Date.now(),
  isPreset: true
})

export const presetTemplates: StyleTemplate[] = [
  createPresetTemplate('default', '经典黑白', '经典的黑白二维码样式', {
    dotsStyle: 'square',
    cornersSquareStyle: 'square',
    cornersDotStyle: 'square',
    dotsColor: '#000000',
    cornersSquareColor: '#000000',
    cornersDotColor: '#000000',
    backgroundOptions: { color: '#ffffff' },
    imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.4 }
  }),
  createPresetTemplate('rounded', '圆角风格', '柔和的圆角二维码样式', {
    dotsStyle: 'rounded',
    cornersSquareStyle: 'extra-rounded',
    cornersDotStyle: 'dot',
    dotsColor: '#409eff',
    cornersSquareColor: '#409eff',
    cornersDotColor: '#409eff',
    backgroundOptions: { color: '#ffffff' },
    imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.4 }
  }),
  createPresetTemplate('dots', '圆点风格', '可爱的圆点二维码样式', {
    dotsStyle: 'dots',
    cornersSquareStyle: 'dot',
    cornersDotStyle: 'dot',
    dotsColor: '#67c23a',
    cornersSquareColor: '#67c23a',
    cornersDotColor: '#67c23a',
    backgroundOptions: { color: '#ffffff' },
    imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.4 }
  }),
  createPresetTemplate('gradient-blue', '蓝色渐变', '优雅的蓝色渐变样式', {
    dotsStyle: 'rounded',
    cornersSquareStyle: 'extra-rounded',
    cornersDotStyle: 'dot',
    dotsColor: {
      type: 'linear',
      rotation: 45,
      colorStops: [
        { offset: 0, color: '#667eea' },
        { offset: 1, color: '#764ba2' }
      ]
    },
    cornersSquareColor: '#667eea',
    cornersDotColor: '#764ba2',
    backgroundOptions: { color: '#ffffff' },
    imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.4 }
  }),
  createPresetTemplate('gradient-sunset', '日落渐变', '温暖的日落渐变样式', {
    dotsStyle: 'classy-rounded',
    cornersSquareStyle: 'extra-rounded',
    cornersDotStyle: 'dot',
    dotsColor: {
      type: 'linear',
      rotation: 135,
      colorStops: [
        { offset: 0, color: '#f093fb' },
        { offset: 1, color: '#f5576c' }
      ]
    },
    cornersSquareColor: '#f5576c',
    cornersDotColor: '#f093fb',
    backgroundOptions: { color: '#ffffff' },
    imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.4 }
  }),
  createPresetTemplate('gradient-ocean', '海洋渐变', '清新的海洋渐变样式', {
    dotsStyle: 'extra-rounded',
    cornersSquareStyle: 'extra-rounded',
    cornersDotStyle: 'dot',
    dotsColor: {
      type: 'radial',
      colorStops: [
        { offset: 0, color: '#00c6fb' },
        { offset: 1, color: '#005bea' }
      ]
    },
    cornersSquareColor: '#005bea',
    cornersDotColor: '#00c6fb',
    backgroundOptions: { color: '#ffffff' },
    imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.4 }
  }),
  createPresetTemplate('dark-mode', '深色模式', '适合深色背景的样式', {
    dotsStyle: 'rounded',
    cornersSquareStyle: 'extra-rounded',
    cornersDotStyle: 'dot',
    dotsColor: '#ffffff',
    cornersSquareColor: '#ffffff',
    cornersDotColor: '#ffffff',
    backgroundOptions: { color: '#1a1a2e' },
    imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.4 }
  }),
  createPresetTemplate('neon', '霓虹风格', '炫酷的霓虹灯效果', {
    dotsStyle: 'extra-rounded',
    cornersSquareStyle: 'extra-rounded',
    cornersDotStyle: 'dot',
    dotsColor: '#00ff88',
    cornersSquareColor: '#00ff88',
    cornersDotColor: '#00ffcc',
    backgroundOptions: { color: '#0a0a0a' },
    imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.4 }
  })
]

export function getPresetTemplate(id: string): StyleTemplate | undefined {
  return presetTemplates.find((t) => t.id === id)
}

export function getAllPresetTemplates(): StyleTemplate[] {
  return presetTemplates
}
