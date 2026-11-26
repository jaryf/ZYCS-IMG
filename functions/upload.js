const MAX_FILE_BYTES = 15 * 1024 * 1024
const DEFAULT_CLIENT_ID = '546c25a59c58ad7'

function uploadError(status, error, headers) {
  return Response.json({ success: false, status, data: { error } }, { status, headers })
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return uploadError(405, '上传接口仅接受 POST 请求', { Allow: 'POST' })
  }

  let image
  try {
    image = (await request.formData()).get('file')
  } catch {
    return uploadError(400, '请用表单上传图片')
  }

  if (!image || typeof image === 'string' || !image.size || !image.type.startsWith('image/')) {
    return uploadError(400, '请选择有效的图片文件')
  }
  if (image.size > MAX_FILE_BYTES) {
    return uploadError(413, '单张图片不能超过 15 MB')
  }

  const clientId = env?.IMGUR_CLIENT_ID?.trim() || DEFAULT_CLIENT_ID
  const endpoint = new URL('https://api.imgur.com/3/upload')
  endpoint.searchParams.set('client_id', clientId)
  const body = new FormData()
  body.append('image', image)

  try {
    return await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: 'Client-ID ' + clientId },
      body,
      signal: AbortSignal.timeout(25_000),
    })
  } catch (error) {
    if (error?.name === 'TimeoutError') {
      return uploadError(504, 'Imgur 响应超时，请重试')
    }
    return uploadError(502, '无法连接 Imgur，请稍后重试')
  }
}
