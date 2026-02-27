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

function copyToClipboard(url: string) {
  navigator.clipboard.writeText(url)
}

function handleDownload(url: string) {
  window.open(url, '_blank')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>
      
      <!-- Modal Content -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
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
                    class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                    @click="copyToClipboard(file.downloadUrl)"
                  >
                    Copy URL
                  </button>
                  <button
                    type="button"
                    class="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700"
                    @click="handleDownload(file.downloadUrl)"
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
    </div>
  </Teleport>
</template>
