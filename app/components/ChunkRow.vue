<script setup lang="ts">
import type { ChunkGroup, ChunkDate } from '~/types'
import { formatBytes, formatNumber, formatCompressionRatio } from '~/composables/useFormatters'

const props = defineProps<{
  group: ChunkGroup
  minDataCount: number
  maxDataCount: number
  allSelected: boolean
  partialSelected: boolean
}>()

const emit = defineEmits<{
  (e: 'toggleBucket', date: ChunkDate): void
  (e: 'toggleGroup', hour: number): void
}>()

const hourLabel = computed(() => {
  return `${props.group.date.hour}:00`
})

function isBucketSelected(bucket: { date: ChunkDate }): boolean {
  // This will be handled by the parent via prop
  return false
}

function handleGroupToggle() {
  emit('toggleGroup', props.group.date.hour)
}

function handleBucketClick(date: ChunkDate) {
  emit('toggleBucket', date)
}
</script>

<template>
  <div class="chunk-row">
    <div class="chunk-row__header">
      <UCheckbox
        :model-value="allSelected"
        :indeterminate="partialSelected && !allSelected"
        color="success"
        @update:model-value="handleGroupToggle"
      />
      <span class="chunk-row__hour">{{ hourLabel }}</span>
      <div class="chunk-row__stats">
        <span class="chunk-row__stat" title="Records">
          <UIcon name="i-heroicons-document-text" class="w-3 h-3" />
          {{ formatNumber(group.dataCount) }}
        </span>
        <span class="chunk-row__stat" title="Size">
          <UIcon name="i-heroicons-folder" class="w-3 h-3" />
          {{ formatBytes(group.sizeOnDisk) }}
        </span>
        <span class="chunk-row__stat" title="Compression">
          <UIcon name="i-heroicons-arrow-trending-down" class="w-3 h-3" />
          {{ formatCompressionRatio(group.compressionRatio) }}
        </span>
      </div>
    </div>
    <div class="chunk-row__cells">
      <slot 
        :buckets="group.buckets"
        :min-data-count="minDataCount"
        :max-data-count"
        :on-bucket-click="handleBucketClick"
      ></slot>
    </div>
  </div>
</template>

<style scoped>
.chunk-row {
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.chunk-row:last-child {
  border-bottom: none;
}

.chunk-row__header {
  flex-shrink: 0;
  width: 180px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chunk-row__hour {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  min-width: 40px;
}

.chunk-row__stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: auto;
}

.chunk-row__stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #6b7280;
}

.chunk-row__cells {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  align-content: flex-start;
}
</style>
