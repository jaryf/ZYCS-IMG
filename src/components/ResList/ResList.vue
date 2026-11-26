<template>
  <ul class="results">
    <li v-for="item in items" :key="item.id" class="result">
      <div class="result-image" aria-hidden="true">
        <ImageIcon />
        <img
          v-if="item.preview || item.originalUrl"
          :key="item.preview || item.originalUrl"
          :src="item.preview || linkFor(item.originalUrl)"
          loading="lazy"
          decoding="async"
          alt=""
          @error="onPreviewError($event, item.originalUrl)"
        />
      </div>

      <div class="result-info">
        <div class="result-filename">
          <p :title="item.name">{{ item.name }}</p>
          <span v-if="item.size" class="result-size">{{ formatFileSize(item.size) }}</span>
        </div>
        <a
          v-if="item.status === 'success' && item.originalUrl"
          class="result-url"
          :href="linkFor(item.originalUrl)"
          target="_blank"
          rel="noopener noreferrer"
          :title="linkFor(item.originalUrl)"
        >{{ linkFor(item.originalUrl) }}</a>
        <p v-else class="result-status" :class="item.status" role="status">
          <span v-if="item.status === 'uploading'" class="spinner" aria-hidden="true"></span>
          {{ item.status === 'error' ? item.error : statusText[item.status] }}
        </p>
      </div>

      <div v-if="item.status === 'success' && item.originalUrl" class="result-actions">
        <button class="button button-secondary" type="button" @click="copyLink(item.originalUrl)">
          <CopyIcon aria-hidden="true" />复制链接
        </button>
        <button class="button button-secondary" type="button" @click="copyMarkdown(item)">
          Markdown
        </button>
        <PopoverRoot>
          <PopoverTrigger as-child>
            <button class="button button-secondary qr-button" type="button" aria-label="显示二维码">
              <GridIcon aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverPortal>
            <PopoverContent class="qr-popover" :side-offset="8" align="end" aria-label="图片二维码">
              <QrcodeVue :value="linkFor(item.originalUrl)" :size="148" :margin="2" level="M" />
              <p>扫码打开图片</p>
            </PopoverContent>
          </PopoverPortal>
        </PopoverRoot>
      </div>
      <button v-else-if="item.status === 'error'" class="button button-secondary" type="button" @click="emit('retry', item)">
        <ReloadIcon aria-hidden="true" />重试
      </button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { CopyIcon, GridIcon, ImageIcon, ReloadIcon } from '@radix-icons/vue'
import QrcodeVue from 'qrcode.vue'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'radix-vue'
import { useToast } from '@/components/ui/toast/use-toast'
import { copyText, formatFileSize, getShareUrl, type UploadItem } from '@/utils'

const props = defineProps<{ items: UploadItem[]; apiOrigin: string }>()
const emit = defineEmits<{ retry: [item: UploadItem] }>()
const { toast } = useToast()

const statusText = {
  queued: '等待上传',
  uploading: '正在上传…',
  success: '已上传',
}

function linkFor(originalUrl?: string) {
  return originalUrl ? getShareUrl(originalUrl, props.apiOrigin) : ''
}

function onPreviewError(event: Event, originalUrl?: string) {
  const image = event.currentTarget as HTMLImageElement
  if (originalUrl && image.src !== originalUrl) {
    image.src = originalUrl
  } else {
    image.hidden = true
  }
}

async function copyLink(originalUrl: string) {
  const copied = await copyText(linkFor(originalUrl))
  toast({ title: copied ? '已复制图片链接' : '复制失败，请重试' })
}

async function copyMarkdown(item: UploadItem) {
  const alt = item.name.replace(/[\\[\]]/g, '\\$&')
  const markdown = '![' + alt + '](' + linkFor(item.originalUrl) + ')'
  const copied = await copyText(markdown)
  toast({ title: copied ? '已复制 Markdown' : '复制失败，请重试' })
}
</script>

<style scoped lang="less">
@import 'ResList.less';
</style>
