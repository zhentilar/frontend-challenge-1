<script setup lang="ts">
import type { ChunkGroup, ChunkDate, Bucket } from '~/types'
import { useChunksStore } from '~/stores/chunks'
import { getBucketColor, getTextColor } from '~/composables/useColorMapping'

const store = useChunksStore()

const groups = computed(() => store.groups)
const minDataCount = computed(() => store.minDataCount)
const maxDataCount = computed(() => store.maxDataCount)

function isBucketSelected(bucket: Bucket): boolean {
  return store.isBucketSelected(bucket.date)
}

function isGroupSelected(hour: number): boolean {
  return store.isGroupSelected(hour)
}

function isGroupPartial(hour: number): boolean {
  return store.isGroupPartial(hour)
}

function handleBucketClick(date: ChunkDate) {
  // Don't allow clicking on empty buckets
  const group = groups.value?.find(g => g.date.hour === date.hour)
  if (!group) return
  
  const bucket = group.buckets.find(b => b.date.minute === date.minute)
  if (!bucket || bucket.dataCount === 0) return
  
  store.toggleBucketSelection(date)
}

function handleGroupToggle(hour: number) {
  store.toggleGroupSelection(hour)
}
</script>

<template>
  <div class="chunk-grid">
    <div class="chunk-grid__header">
      <div class="chunk-grid__header-label"></div>
      <div class="chunk-grid__header-cells">
        <span 
          v-for="minute in 60" 
          :key="minute"
          class="chunk-grid__minute-label"
          :class="{ 'chunk-grid__minute-label--show': minute % 10 === 1 }"
        >
          {{ minute - 1 }}
        </span>
      </div>
    </div>
    
    <div class="chunk-grid__body">
      <div 
        v-for="group in groups" 
        :key="group.date.hour"
        class="chunk-grid__row"
      >
        <div class="chunk-grid__row-header">
          <UCheckbox
            :model-value="isGroupSelected(group.date.hour)"
            :indeterminate="isGroupPartial(group.date.hour) && !isGroupSelected(group.date.hour)"
            color="success"
            @update:model-value="handleGroupToggle(group.date.hour)"
          />
          <span class="chunk-grid__hour-label">{{ group.date.hour }}:00</span>
          <div class="chunk-grid__row-stats">
            <span class="chunk-grid__stat" :title="`${group.dataCount} records`">
              <UIcon name="i-heroicons-document-text" class="w-3 h-3" />
              {{ (group.dataCount / 1000).toFixed(1) }}K
            </span>
            <span class="chunk-grid__stat" :title="`${group.sizeOnDisk} bytes`">
              <UIcon name="i-heroicons-folder" class="w-3 h-3" />
              {{ (group.sizeOnDisk / 1024 / 1024).toFixed(1) }} MB
            </span>
            <span class="chunk-grid__stat" :title="`${group.compressionRatio.toFixed(2)}% compression`">
              <UIcon name="i-heroicons-arrow-trending-down" class="w-3 h-3" />
              {{ group.compressionRatio.toFixed(0) }}%
            </span>
          </div>
        </div>
        
        <div class="chunk-grid__cells">
          <button
            v-for="bucket in group.buckets"
            :key="bucket.date.minute"
            class="chunk-grid__cell"
            :class="{ 
              'chunk-grid__cell--selected': isBucketSelected(bucket),
              'chunk-grid__cell--empty': bucket.dataCount === 0
            }"
            :style="{ 
              backgroundColor: getBucketColor(bucket, minDataCount, maxDataCount),
              color: getTextColor(getBucketColor(bucket, minDataCount, maxDataCount))
            }"
            :title="`${bucket.date.hour}:${String(bucket.date.minute).padStart(2, '0')} - ${bucket.dataCount} records`"
            @click="handleBucketClick(bucket.date)"
          >
            <span v-if="isBucketSelected(bucket)" class="chunk-grid__check">✓</span>
            <span v-else class="chunk-grid__minute">{{ bucket.date.minute }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chunk-grid {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chunk-grid__header {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.chunk-grid__header-label {
  width: 180px;
  flex-shrink: 0;
}

.chunk-grid__header-cells {
  flex: 1;
  display: flex;
  gap: 3px;
}

.chunk-grid__minute-label {
  width: 28px;
  font-size: 10px;
  color: #9ca3af;
  text-align: center;
}

.chunk-grid__minute-label--show {
  color: #6b7280;
  font-weight: 500;
}

.chunk-grid__body {
  max-height: 600px;
  overflow-y: auto;
}

.chunk-grid__row {
  display: flex;
  gap: 12px;
  padding: 6px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.chunk-grid__row:last-child {
  border-bottom: none;
}

.chunk-grid__row:hover {
  background: #fafafa;
}

.chunk-grid__row-header {
  width: 180px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chunk-grid__hour-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  min-width: 40px;
}

.chunk-grid__row-stats {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-left: auto;
}

.chunk-grid__stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #6b7280;
}

.chunk-grid__cells {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(60, 28px);
  gap: 3px;
}

.chunk-grid__cell {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(0, 0, 0, 0.08);
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

.chunk-grid__cell:hover {
  transform: scale(1.15);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.chunk-grid__cell--selected {
  border-color: #059669;
  box-shadow: 0 0 0 2px #059669;
}

.chunk-grid__cell--empty {
  background-color: #f3f4f6 !important;
  color: #d1d5db !important;
  cursor: default;
  opacity: 0.5;
}

.chunk-grid__check {
  font-size: 12px;
  font-weight: bold;
}

.chunk-grid__minute {
  opacity: 0.85;
}
</style>
