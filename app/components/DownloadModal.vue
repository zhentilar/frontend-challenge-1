<script setup lang="ts">
import type { DownloadFile } from '~/types'
import { formatBytes } from '~/composables/useFormatters'

defineProps<{
  open: boolean
  files: DownloadFile[] | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// Toast notification state
interface Toast {
  id: number
  message: string
  type: 'success' | 'info'
}

const toasts = ref<Toast[]>([])
let toastId = 0
const toastTimeouts = new Map<number, ReturnType<typeof setTimeout>>()

function removeToast(id: number) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

function showToast(message: string, type: 'success' | 'info' = 'success') {
  const id = ++toastId
  toasts.value.push({ id, message, type })
  
  // Remove toast after 2 seconds and clean up timeout reference
  const timeoutId = setTimeout(() => {
    removeToast(id)
    toastTimeouts.delete(id)
  }, 2000)
  toastTimeouts.set(id, timeoutId)
}

// Clean up all timeouts on unmount
onUnmounted(() => {
  for (const timeoutId of toastTimeouts.values()) {
    clearTimeout(timeoutId)
  }
  toastTimeouts.clear()
})

async function copyToClipboard(url: string, fileName: string) {
  try {
    await navigator.clipboard.writeText(url)
    showToast(`Copied "${fileName}" to clipboard`)
  } catch (err) {
    console.warn('Failed to copy to clipboard:', err)
    showToast(`Failed to copy "${fileName}" - please copy manually`, 'info')
  }
}

async function handleDownload(url: string, fileName: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Download failed')
    
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
    
    showToast(`Downloaded "${fileName}"`)
  } catch (error) {
    // Fallback: open in new tab if fetch fails
    console.warn('Download failed, opening in new tab instead:', error)
    window.open(url, '_blank')
    showToast(`Download failed - opened "${fileName}" in new tab`, 'info')
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>
      
      <!-- Modal Content -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col animate-modal">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span class="font-semibold text-gray-900">Download Files</span>
          </div>
          <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-4 overflow-y-auto flex-1">
          <p class="text-sm text-gray-600 mb-4">
            Your download links are ready. Click on a link to download or copy the URL.
          </p>

          <div v-if="files && files.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
            <div 
              v-for="file in files" 
              :key="file.fileId"
              class="p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ file.fileName }}</p>
                  <p class="text-sm text-gray-500">{{ formatBytes(file.fileSize) }}</p>
                  <p class="text-xs text-gray-400 mt-1">
                    Expires: {{ new Date(file.expirationDate).toLocaleDateString() }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
                    @click="copyToClipboard(file.downloadUrl, file.fileName)"
                  >
                    Copy URL
                  </button>
                  <button
                    type="button"
                    class="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-all duration-200 hover:scale-105 active:scale-95"
                    @click="handleDownload(file.downloadUrl, file.fileName)"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            No files to download.
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 p-4 border-t">
          <button 
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            @click="emit('close')"
          >
            Close
          </button>
        </div>
      </div>

      <!-- Toast Notifications -->
      <div class="fixed bottom-8 right-8 z-50 flex flex-col gap-2">
        <TransitionGroup name="toast">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            class="px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[200px]"
            :class="{
              'bg-emerald-600 text-white': toast.type === 'success',
              'bg-blue-600 text-white': toast.type === 'info'
            }"
          >
            <svg v-if="toast.type === 'success'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm font-medium">{{ toast.message }}</span>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal {
  animation: modal-enter 0.2s ease-out;
}

.toast-enter-active {
  animation: toast-in 0.3s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.2s ease-in;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>
