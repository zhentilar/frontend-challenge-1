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
  // Open the URL in a new tab
  window.open(url, '_blank')
}
</script>

<template>
  <UModal 
    :open="open" 
    @close="emit('close')"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-arrow-down-circle" class="w-5 h-5 text-emerald-600" />
        <span>Download Files</span>
      </div>
    </template>

    <div class="space-y-4">
      <p class="text-sm text-gray-600">
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
              <UButton
                size="xs"
                color="neutral"
                variant="soft"
                icon="i-heroicons-clipboard"
                @click="copyToClipboard(file.downloadUrl)"
              />
              <UButton
                size="xs"
                color="success"
                icon="i-heroicons-arrow-down-tray"
                @click="handleDownload(file.downloadUrl)"
              >
                Download
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 text-gray-500">
        No files to download.
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton color="neutral" variant="soft" @click="emit('close')">
          Close
        </UButton>
      </div>
    </template>
  </UModal>
</template>
