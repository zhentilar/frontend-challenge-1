<script setup lang="ts">
import type { Bucket, ChunkDate } from '~/types'
import { getBucketColor, getTextColor } from '~/composables/useColorMapping'

const props = defineProps<{
  bucket: Bucket | null
  minDataCount: number
  maxDataCount: number
  selected: boolean
}>()

const emit = defineEmits<{
  (e: 'click', date: ChunkDate): void
}>()

const backgroundColor = computed(() => {
  return getBucketColor(props.bucket, props.minDataCount, props.maxDataCount)
})

const textColor = computed(() => {
  return getTextColor(backgroundColor.value)
})

function handleClick() {
  if (props.bucket) {
    emit('click', props.bucket.date)
  }
}
</script>

<template>
  <button
    class="chunk-cell"
    :class="{ 
      'chunk-cell--selected': selected,
      'chunk-cell--empty': !bucket || bucket.dataCount === 0,
      'chunk-cell--has-data': bucket && bucket.dataCount > 0
    }"
    :style="{ 
      backgroundColor: bucket ? backgroundColor : '#f3f4f6',
      color: bucket ? textColor : '#9ca3af'
    }"
    :disabled="!bucket"
    :title="bucket ? `${bucket.date.hour}:${String(bucket.date.minute).padStart(2, '0')} - ${bucket.dataCount} records, ${bucket.sizeOnDisk} bytes` : 'No data'"
    @click="handleClick"
  >
    <span v-if="selected" class="chunk-cell__check">✓</span>
    <span v-else-if="bucket" class="chunk-cell__minute">{{ String(bucket.date.minute).padStart(2, '0') }}</span>
  </button>
</template>

<style scoped>
.chunk-cell {
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
  line-height: 1;
}

.chunk-cell:hover:not(:disabled) {
  transform: scale(1.1);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.chunk-cell--selected {
  border-color: #059669;
  box-shadow: 0 0 0 2px #059669;
}

.chunk-cell--empty {
  cursor: default;
  opacity: 0.5;
}

.chunk-cell--has-data {
  cursor: pointer;
}

.chunk-cell__check {
  font-size: 12px;
  font-weight: bold;
  color: #047857;
}

.chunk-cell__minute {
  opacity: 0.8;
}
</style>
