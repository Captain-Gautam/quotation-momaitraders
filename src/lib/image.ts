const MAX_LOGO_DIMENSION = 512
const MAX_LOGO_FILE_SIZE = 8 * 1024 * 1024

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () =>
      reject(reader.error ?? new Error('Could not read the image.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not open the image.'))
    image.src = source
  })
}

export async function fileToLogoDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choose an image file (PNG, JPG, or SVG).')
  }

  if (file.size > MAX_LOGO_FILE_SIZE) {
    throw new Error('Logo must be smaller than 8 MB.')
  }

  const source = await readFileAsDataUrl(file)
  const image = await loadImage(source)
  const sourceWidth = image.naturalWidth || image.width
  const sourceHeight = image.naturalHeight || image.height
  const scale = Math.min(
    1,
    MAX_LOGO_DIMENSION / Math.max(sourceWidth, sourceHeight),
  )
  const width = Math.max(1, Math.round(sourceWidth * scale))
  const height = Math.max(1, Math.round(sourceHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Your browser could not process this image.')
  }

  context.drawImage(image, 0, 0, width, height)

  try {
    return canvas.toDataURL('image/png')
  } catch {
    throw new Error('This image could not be converted. Try a PNG or JPG file.')
  }
}
