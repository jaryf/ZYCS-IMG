export const MAX_IMAGE_MB = 15
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024

type UploadStatus = 'queued' | 'uploading' | 'success' | 'error'

export interface SavedUpload {
  name: string
  size?: number
  originalUrl: string
}

export interface UploadItem {
  id: number
  name: string
  size?: number
  status: UploadStatus
  file?: File
  preview?: string
  originalUrl?: string
  error?: string
}

const HISTORY_KEY = 'zychUpImageList'

export function getImageUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return
  try {
    const url = new URL(value)
    if (['https:', 'http:'].includes(url.protocol) && url.pathname.split('/').pop()) {
      return url.href
    }
  } catch {
    return
  }
}

export function getShareUrl(originalUrl: string, apiOrigin: string) {
  const hostname = new URL(apiOrigin).hostname
  if (['localhost', '127.0.0.1', '[::1]'].includes(hostname)) return originalUrl
  const filename = new URL(originalUrl).pathname.split('/').pop()
  return apiOrigin + '/v2/' + filename
}

export function readUploadHistory(): SavedUpload[] {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    if (!Array.isArray(history)) return []

    return history.flatMap((item) => {
      const originalUrl = getImageUrl(item?.originalUrl ?? item?.upload_result?.data?.link)
      if (!originalUrl) return []

      const name = item.name ?? item.upload_result?._vh_filename
      return [{
        name: typeof name === 'string' && name ? name : '图片',
        size: typeof item.size === 'number' && item.size > 0 ? item.size : undefined,
        originalUrl,
      }]
    })
  } catch {
    return []
  }
}

export function saveUploadHistory(items: SavedUpload[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
  } catch {
    // Uploads and copying remain available when browser storage is unavailable.
  }
}

export async function prepareUpload(file: File) {
  if (file.type !== 'image/webp') return file

  const objectUrl = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = objectUrl
    await image.decode()

    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')
    if (!context) return file

    context.drawImage(image, 0, 0)
    const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    return png
      ? new File([png], file.name.replace(/\.webp$/i, '') + '.png', { type: 'image/png' })
      : file
  } catch {
    return file
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function formatFileSize(size?: number) {
  if (size === undefined) return ''
  if (size >= 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB'
  return Math.max(1, Math.round(size / 1024)) + ' KB'
}

export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    const field = document.createElement('textarea')
    field.value = value
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.append(field)
    field.select()

    try {
      return document.execCommand('copy')
    } catch {
      return false
    } finally {
      field.remove()
    }
  }
}
