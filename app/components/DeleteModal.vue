<script setup lang="ts">
import { useChunksStore } from '~/stores/chunks'
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

const store = useChunksStore()
const error = computed(() => store.error)

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
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>
      
      <!-- Modal Content -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="font-semibold text-gray-900">Delete Chunks</span>
          </div>
          <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-4 overflow-y-auto flex-1 space-y-4">
          <!-- Error state -->
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="font-medium text-red-800">Error</p>
                <p class="text-sm text-red-700 mt-1">
                  {{ error }}
                </p>
              </div>
            </div>
          </div>

          <!-- Confirmation warning -->
          <div v-else-if="!result" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>chunk_{{ date.year }}_{{ String(date.month).padStart(2, '0') }}_{{ String(date.day).padStart(2, '0') }}_{{ String(date.hour).padStart(2, '0') }}_{{ String(date.minute).padStart(2, '0') }}.dat</span>
              </div>
              <div v-if="selectedDates.length > 20" class="text-sm text-gray-500 italic">
                ... and {{ selectedDates.length - 20 }} more files
              </div>
            </div>
          </div>

          <!-- Confirmation checkbox -->
          <div v-if="!result" class="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="confirm-delete"
              v-model="confirmed"
              class="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded"
            />
            <label for="confirm-delete" class="text-sm text-gray-700">
              I understand this action cannot be undone
            </label>
          </div>

          <!-- Result -->
          <div v-if="result" class="p-4 rounded-lg" :class="{
            'bg-green-50 border border-green-200': result.status === 'completed',
            'bg-yellow-50 border border-yellow-200': result.status === 'partial',
            'bg-red-50 border border-red-200': result.status === 'failed'
          }">
            <div class="flex items-center gap-3">
              <svg 
                v-if="result.status === 'completed'" 
                class="w-6 h-6 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg 
                v-else-if="result.status === 'partial'" 
                class="w-6 h-6 text-yellow-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <svg 
                v-else 
                class="w-6 h-6 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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

        <!-- Footer -->
        <div class="flex justify-end gap-3 p-4 border-t">
          <button 
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            @click="emit('close')"
          >
            {{ result ? 'Close' : 'Cancel' }}
          </button>
          <button 
            v-if="!result"
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!confirmed || loading"
            :class="{ 'opacity-50': loading }"
            @click="handleConfirm"
          >
            {{ loading ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
