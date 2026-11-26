<template>
  <div class="workspace">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-content">
        <h1 id="hero-title">上传图片，<br /><span>轻松分享。</span></h1>
        <p>上传后即可复制图片链接，支持 Markdown 和二维码。</p>
      </div>
    </section>

    <section id="upload" class="panel upload-panel" aria-labelledby="upload-title">
      <div class="panel-heading">
        <div class="panel-title">
          <UploadIcon aria-hidden="true" />
          <h2 id="upload-title">上传图片</h2>
        </div>
        <span class="provider"><span aria-hidden="true"></span>Imgur 存储</span>
      </div>
      <Upload @select="addFiles" />
    </section>

    <section id="history" class="panel history-panel" aria-labelledby="history-title">
      <div class="panel-heading">
        <div class="panel-title">
          <ClockIcon aria-hidden="true" />
          <h2 id="history-title">上传记录</h2>
          <span v-if="completed.length" class="history-count">{{ completed.length }}</span>
        </div>
        <div v-if="uploads.length" class="history-actions">
          <button
            class="button button-subtle"
            type="button"
            :disabled="!completed.length"
            @click="copyAll"
          >
            <CopyIcon aria-hidden="true" />
            复制全部
          </button>
          <button
            class="button button-subtle"
            type="button"
            :disabled="!hasFinished"
            @click="clearFinished"
          >
            <TrashIcon aria-hidden="true" />
            清空记录
          </button>
        </div>
      </div>

      <ResList v-if="uploads.length" :items="uploads" :api-origin="apiOrigin" @retry="retry" />
      <div v-else class="history-empty">
        <span aria-hidden="true"><ImageIcon /></span>
        <p>暂无上传记录</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ClockIcon, CopyIcon, ImageIcon, TrashIcon, UploadIcon } from '@radix-icons/vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import ResList from '@/components/ResList/ResList.vue'
import Upload from '@/components/Upload/Upload.vue'
import { useToast } from '@/components/ui/toast/use-toast'
import {
  copyText,
  getImageUrl,
  getShareUrl,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MB,
  prepareUpload,
  readUploadHistory,
  saveUploadHistory,
  type SavedUpload,
  type UploadItem,
} from '@/utils'

const apiOrigin = new URL(
  import.meta.env.VITE_IMG_API_URL || location.origin,
  location.origin,
).href.replace(/\/+$/, '')

const { toast } = useToast()
const maximumConcurrentUploads = 3
let lastId = 0
let ongoingUploads = 0
let disposed = false
const uploads = ref<UploadItem[]>(
  readUploadHistory().map((item) => ({ ...item, id: ++lastId, status: 'success' })),
)

const completed = computed(() =>
  uploads.value.flatMap<SavedUpload>((item) =>
    item.status === 'success' && item.originalUrl
      ? [{ name: item.name, size: item.size, originalUrl: item.originalUrl }]
      : [],
  ),
)
const hasFinished = computed(() =>
  uploads.value.some((item) => item.status === 'success' || item.status === 'error'),
)

watch(completed, saveUploadHistory)

function addFiles(files: File[]) {
  const valid = files.filter((file) =>
    file.type.startsWith('image/') && file.size > 0 && file.size <= MAX_IMAGE_BYTES,
  )
  if (valid.length !== files.length) {
    toast({
      title: '部分文件无法上传',
      description: '请选择有效图片，每张最多 ' + MAX_IMAGE_MB + ' MB。',
    })
  }

  for (const file of valid) {
    uploads.value.push({
      id: ++lastId,
      name: file.name,
      size: file.size,
      file,
      status: 'queued',
      preview: URL.createObjectURL(file),
    })
  }
  startQueuedUploads()
}

function startQueuedUploads() {
  while (!disposed && ongoingUploads < maximumConcurrentUploads) {
    const item = uploads.value.find((upload) => upload.status === 'queued')
    if (!item) return

    ongoingUploads += 1
    item.status = 'uploading'
    void sendUpload(item)
  }
}

async function sendUpload(item: UploadItem) {
  try {
    if (!item.file) throw new Error('请重新选择这张图片')
    const file = await prepareUpload(item.file)
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error('转换后的图片超过 ' + MAX_IMAGE_MB + ' MB')
    }

    const form = new FormData()
    form.append('file', file)
    const response = await fetch(apiOrigin + '/upload', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(35_000),
    })
    const result = await response.json().catch(() => null)
    const originalUrl = getImageUrl(result?.data?.link)
    if (!response.ok || result?.success !== true || !originalUrl) {
      const upstreamError = result?.data?.error
      if (response.status === 429) throw new Error('Imgur 请求过多，请稍后重试')
      throw new Error(typeof upstreamError === 'string' ? upstreamError : 'Imgur 上传失败，请重试')
    }

    item.originalUrl = originalUrl
    item.status = 'success'
    item.file = undefined
    releasePreview(item)
  } catch (error) {
    item.status = 'error'
    item.error = error instanceof Error ? error.message : '上传失败，请重试'
    if (error instanceof Error && error.name === 'TimeoutError') {
      item.error = '上传超时，请重试'
    }
  } finally {
    ongoingUploads -= 1
    startQueuedUploads()
  }
}

function retry(item: UploadItem) {
  if (item.status !== 'error') return
  item.error = undefined
  item.status = 'queued'
  startQueuedUploads()
}

function releasePreview(item: UploadItem) {
  if (item.preview) URL.revokeObjectURL(item.preview)
  item.preview = undefined
}

function clearFinished() {
  uploads.value = uploads.value.filter((item) => {
    if (item.status === 'queued' || item.status === 'uploading') return true
    releasePreview(item)
    return false
  })
}

async function copyAll() {
  if (!completed.value.length) return
  const links = completed.value.map(({ originalUrl }) => getShareUrl(originalUrl, apiOrigin))
  const copied = await copyText(links.join('\n'))
  toast({ title: copied ? '已复制全部链接' : '复制失败，请重试' })
}

onBeforeUnmount(() => {
  disposed = true
  uploads.value.forEach(releasePreview)
})
</script>

<style scoped lang="less">
@import 'Home.less';
</style>
