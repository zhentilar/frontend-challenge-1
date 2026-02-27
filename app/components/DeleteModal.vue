<script setup lang="ts">
import type { DeleteResult, ChunkDate } from '~/types'
import { formatBytes, formatNumber } from '~/composables/useFormatters'

const props = defineProps<{
  open: boolean
  selectedDates: ChunkDate[]
  summary: { count: number; size: number; records: number }
  result: DeleteResult | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const confirmed = ref(false)

watch(() => props.open, (newVal) => {
  if (newVal) {
    confirmed.value = false
  }
})

function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <UModal 
    :open="open" 
    @close="emit('close')"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-600" />
        <span>Delete Chunks</span>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Confirmation warning -->
      <div v-if="!result" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p class="font-medium text-red-800">This action is irreversible!</p>
            <p class="text-sm text-red-700 mt-1">
              Once you delete these chunks, they cannot be recovered. Please make sure you have backed up any important data.
            </p>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div v-if="!result" class="space-y-2">
        <h4 class="font-medium text-gray-900">Summary</h4>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="p-3 bg-gray-50 rounded-lg">
            <p class="text-2xl font-bold text-gray-900">{{ summary.count }}</p>
            <p class="text-xs text-gray-500">Chunks</p>
          </div>
          <div class="p-3 bg-gray-50 rounded-lg">
            <p class="text-2xl font-bold text-gray-900">{{ formatBytes(summary.size) }}</p>
            <p class="text-xs text-gray-500">Size</p>
          </div>
          <div class="p-3 bg-gray-50 rounded-lg">
            <p class="text-2xl font-bold text-gray-900">{{ formatNumber(summary.records) }}</p>
            <p class="text-xs text-gray-500">Records</p>
          </div>
        </div>
      </div>

      <!-- Selected files list -->
      <div v-if="!result && selectedDates.length > 0" class="space-y-2">
        <h4 class="font-medium text-gray-900">Files to delete</h4>
        <div class="max-h-48 overflow-y-auto space-y-1">
          <div 
            v-for="(date, index) in selectedDates.slice(0, 20)" 
            :key="index"
            class="flex items-center gap-2 text-sm text-gray-600"
          >
            <UIcon name="i-heroicons-document" class="w-4 h-4" />
            <span>chunk_{{ date.year }}_{{ String(date.month).padStart(2, '0') }}_{{ String(date.day).padStart(2, '0') }}_{{ String(date.hour).padStart(2, '0') }}_{{ String(date.minute).padStart(2, '0') }}.dat</span>
          </div>
          <div v-if="selectedDates.length > 20" class="text-sm text-gray-500 italic">
            ... and {{ selectedDates.length - 20 }} more files
          </div>
        </div>
      </div>

      <!-- Confirmation checkbox -->
      <div v-if="!result" class="flex items-start gap-3 pt-2">
        <UCheckbox
          v-model="confirmed"
          color="error"
        >
          <span class="text-sm text-gray-700">
            I understand this action cannot be undone
          </span>
        </UCheckbox>
      </div>

      <!-- Result -->
      <div v-if="result" class="p-4 rounded-lg" :class="{
        'bg-green-50 border border-green-200': result.status === 'completed',
        'bg-yellow-50 border border-yellow-200': result.status === 'partial',
        'bg-red-50 border border-red-200': result.status === 'failed'
      }">
        <div class="flex items-center gap-3">
          <UIcon 
            v-if="result.status === 'completed'" 
            name="i-heroicons-check-circle" 
            class="w-6 h-6 text-green-600" 
          />
          <UIcon 
            v-else-if="result.status === 'partial'" 
            name="i-heroicons-exclamation-circle" 
            class="w-6 h-6 text-yellow-600" 
          />
          <UIcon 
            v-else 
            name="i-heroicons-x-circle" 
            class="w-6 h-6 text-red-600" 
          />
          <div>
            <p class="font-medium" :class="{
              'text-green-800': result.status === 'completed',
              'text-yellow-800': result.status === 'partial',
              'text-red-800': result.status === 'failed'
            }">
              {{ result.additionalInfo }}
            </p>
            <p v-if="result.failedFileIds.length > 0" class="text-sm mt-1" :class="{
              'text-green-700': result.status === 'completed',
              'text-yellow-700': result.status === 'partial',
              'text-red-700': result.status === 'failed'
            }">
              Failed: {{ result.failedFileIds.length }} files
            </p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton color="neutral" variant="soft" @click="emit('close')">
          {{ result ? 'Close' : 'Cancel' }}
        </UButton>
        <UButton 
          v-if="!result"
          color="error" 
          :disabled="!confirmed || loading"
          :loading="loading"
          @click="handleConfirm"
        >
          Delete
        </UButton>
      </div>
    </template>
  </UModal>
</template>
