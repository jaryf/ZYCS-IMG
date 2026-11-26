<template>
  <div
    class="dropzone"
    :class="{ 'is-dragging': dragDepth > 0 }"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      hidden
      @change="onFileChange"
    />
    <div class="dropzone-icon" aria-hidden="true"><UploadIcon /></div>
    <div class="dropzone-copy">
      <p class="dropzone-title">拖放图片到这里</p>
      <p>也可以粘贴剪贴板中的图片</p>
    </div>
    <button class="button button-primary" type="button" @click="fileInput?.click()">
      <PlusIcon aria-hidden="true" />
      选择图片
    </button>
    <p class="dropzone-hint">支持批量上传 · 每张最多 {{ MAX_IMAGE_MB }} MB</p>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, UploadIcon } from '@radix-icons/vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { MAX_IMAGE_MB } from '@/utils'

const emit = defineEmits<{ select: [files: File[]] }>()
const fileInput = ref<HTMLInputElement>()
const dragDepth = ref(0)

function onFileChange(event: Event) {
  const input = event.currentTarget as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (files.length) emit('select', files)
}

function onDragEnter(event: DragEvent) {
  if (event.dataTransfer?.types.includes('Files')) dragDepth.value += 1
}

function onDragLeave() {
  dragDepth.value = Math.max(0, dragDepth.value - 1)
}

function onDrop(event: DragEvent) {
  dragDepth.value = 0
  const files = Array.from(event.dataTransfer?.files ?? [])
  if (files.length) emit('select', files)
}

function onPaste(event: ClipboardEvent) {
  const files = Array.from(event.clipboardData?.files ?? []).filter((file) =>
    file.type.startsWith('image/'),
  )
  if (!files.length) return
  event.preventDefault()
  emit('select', files)
}

onMounted(() => document.addEventListener('paste', onPaste))
onUnmounted(() => document.removeEventListener('paste', onPaste))
</script>

<style scoped lang="less">
@import 'Upload.less';
</style>
