<script setup lang="ts">
import { useChunksStore } from '~/stores/chunks'
import { formatBytes, formatNumber, formatWithCommas } from '~/composables/useFormatters'

const store = useChunksStore()

// Computed properties from store
const loading = computed(() => store.loading)
const error = computed(() => store.error)
const isAllSelected = computed(() => store.isAllSelected)
const selectedCount = computed(() => store.selectedCount)
const selectedDates = computed(() => store.selectedDates)
const selectedSummary = computed(() => store.selectedChunksSummary)
const downloadModalOpen = computed({
  get: () => store.downloadModalOpen,
  set: (val) => { if (!val) store.closeDownloadModal() }
})
const deleteModalOpen = computed({
  get: () => store.deleteModalOpen,
  set: (val) => { if (!val) store.closeDeleteModal() }
})
const downloadResult = computed(() => store.downloadResult)
const deleteResult = computed(() => store.deleteResult)

// Stats from data
const totalRecords = computed(() => store.totalRecords)
const totalChunks = computed(() => store.totalChunks)
const totalSize = computed(() => store.totalSize)

function handleSelectAll() {
  store.toggleAllSelection()
}

function handleDownload() {
  store.downloadSelected()
}

function handleDelete() {
  store.openDeleteModal()
}

function confirmDelete() {
  store.deleteSelected()
}
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="dashboard__header">
      <div class="dashboard__title-section">
        <h1 class="dashboard__title">Backup Data Integrity</h1>
        <p class="dashboard__subtitle">Monitor and manage backup data chunks</p>
      </div>
      
      <!-- Action bar -->
      <div class="dashboard__actions">
        <div class="dashboard__selection-info">
          <UCheckbox
            :model-value="isAllSelected"
            :indeterminate="selectedCount > 0 && !isAllSelected"
            color="success"
            @update:model-value="handleSelectAll"
          >
            <span class="text-sm">
              {{ isAllSelected ? 'Deselect All' : 'Select All' }}
            </span>
          </UCheckbox>
          
          <span v-if="selectedCount > 0" class="dashboard__selected-count">
            {{ formatWithCommas(selectedCount) }} selected
          </span>
        </div>
        
        <div class="dashboard__buttons">
          <UButton
            color="success"
            :disabled="selectedCount === 0"
            :loading="loading"
            icon="i-heroicons-arrow-down-tray"
            @click="handleDownload"
          >
            Download ({{ selectedCount }})
          </UButton>
          
          <UButton
            color="error"
            :disabled="selectedCount === 0"
            :loading="loading"
            icon="i-heroicons-trash"
            @click="handleDelete"
          >
            Delete ({{ selectedCount }})
          </UButton>
        </div>
      </div>
    </header>

    <!-- Error state -->
    <div v-if="error" class="dashboard__error">
      <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5" />
      <span>{{ error }}</span>
      <UButton size="sm" color="neutral" variant="soft" @click="store.fetchChunks()">
        Retry
      </UButton>
    </div>

    <!-- Loading state -->
    <div v-else-if="loading && !store.data" class="dashboard__loading">
      <div class="loading-spinner"></div>
      <p>Loading chunk data...</p>
    </div>

    <!-- Main content -->
    <main v-else class="dashboard__main">
      <ChunkGrid />
    </main>

    <!-- Footer -->
    <footer class="dashboard__footer">
      <div class="dashboard__stats">
        <div class="dashboard__stat">
          <span class="dashboard__stat-label">Total Records</span>
          <span class="dashboard__stat-value">{{ formatNumber(totalRecords) }}</span>
        </div>
        <div class="dashboard__stat-divider"></div>
        <div class="dashboard__stat">
          <span class="dashboard__stat-label">Total Chunks</span>
          <span class="dashboard__stat-value">{{ formatWithCommas(totalChunks) }}</span>
        </div>
        <div class="dashboard__stat-divider"></div>
        <div class="dashboard__stat">
          <span class="dashboard__stat-label">Size On Disk</span>
          <span class="dashboard__stat-value">{{ formatBytes(totalSize) }}</span>
        </div>
      </div>
      
      <ColorScale />
    </footer>

    <!-- Modals -->
    <DownloadModal
      :open="downloadModalOpen"
      :files="downloadResult"
      @close="store.closeDownloadModal()"
    />
    
    <DeleteModal
      :open="deleteModalOpen"
      :selected-dates="selectedDates"
      :summary="selectedSummary"
      :result="deleteResult"
      :loading="loading"
      @close="store.closeDeleteModal()"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.dashboard__title-section {
  flex-shrink: 0;
}

.dashboard__title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.dashboard__subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0 0;
}

.dashboard__actions {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.dashboard__selection-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dashboard__selected-count {
  font-size: 14px;
  color: #059669;
  font-weight: 500;
  padding: 4px 12px;
  background: #ecfdf5;
  border-radius: 16px;
}

.dashboard__buttons {
  display: flex;
  gap: 8px;
}

.dashboard__error {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  margin-bottom: 24px;
}

.dashboard__loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #6b7280;
  min-height: 400px;
}

.dashboard__main {
  flex: 1;
  margin-bottom: 24px;
}

.dashboard__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 16px;
}

.dashboard__stats {
  display: flex;
  align-items: center;
  gap: 24px;
}

.dashboard__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dashboard__stat-label {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dashboard__stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.dashboard__stat-divider {
  width: 1px;
  height: 32px;
  background: #e5e7eb;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }
  
  .dashboard__header {
    flex-direction: column;
    gap: 16px;
  }
  
  .dashboard__actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .dashboard__footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
