import { defineStore } from 'pinia'
import type { SignedFilesResponse, ChunkGroup, Bucket, ChunkDate, DownloadFile, DeleteResult } from '~/types'

interface ChunksState {
  data: SignedFilesResponse | null
  loading: boolean
  error: string | null
  selectedChunks: Map<string, ChunkDate>
  downloadModalOpen: boolean
  deleteModalOpen: boolean
  downloadResult: DownloadFile[] | null
  deleteResult: DeleteResult | null
}

export const useChunksStore = defineStore('chunks', {
  state: (): ChunksState => ({
    data: null,
    loading: false,
    error: null,
    selectedChunks: new Map(),
    downloadModalOpen: false,
    deleteModalOpen: false,
    downloadResult: null,
    deleteResult: null,
  }),

  getters: {
    groups(): ChunkGroup[] {
      return this.data?.groups || []
    },
    
    totalRecords(): number {
      return this.data?.dataCount || 0
    },
    
    totalChunks(): number {
      return this.data?.dataChunkCount || 0
    },
    
    totalSize(): number {
      return this.data?.sizeOnDisk || 0
    },
    
    minDataCount(): number {
      return this.data?.minDataCount || 0
    },
    
    maxDataCount(): number {
      return this.data?.maxDataCount || 0
    },
    
    selectedCount(): number {
      return this.selectedChunks.size
    },
    
    selectedDates(): ChunkDate[] {
      return Array.from(this.selectedChunks.values())
    },
    
    isAllSelected(): boolean {
      if (!this.data) return false
      const totalBuckets = this.data.groups.reduce((sum: number, group: ChunkGroup) => sum + group.buckets.length, 0)
      return this.selectedChunks.size === totalBuckets
    },
    
    isGroupSelected(): (hour: number) => boolean {
      return (hour: number) => {
        if (!this.data) return false
        const group = this.data.groups.find((g: ChunkGroup) => g.date.hour === hour)
        if (!group) return false
        return group.buckets.every((bucket: Bucket) => {
          const key = `${bucket.date.year}-${bucket.date.month}-${bucket.date.day}-${bucket.date.hour}-${bucket.date.minute}`
          return this.selectedChunks.has(key)
        })
      }
    },
    
    isGroupPartial(): (hour: number) => boolean {
      return (hour: number) => {
        if (!this.data) return false
        const group = this.data.groups.find((g: ChunkGroup) => g.date.hour === hour)
        if (!group) return false
        const selectedInGroup = group.buckets.filter((bucket: Bucket) => {
          const key = `${bucket.date.year}-${bucket.date.month}-${bucket.date.day}-${bucket.date.hour}-${bucket.date.minute}`
          return this.selectedChunks.has(key)
        }).length
        return selectedInGroup > 0 && selectedInGroup < group.buckets.length
      }
    },
    
    selectedChunksSummary(): { count: number; size: number; records: number } {
      if (!this.data) return { count: 0, size: 0, records: 0 }
      
      let totalSize = 0
      let totalRecords = 0
      
      for (const group of this.data.groups) {
        for (const bucket of group.buckets) {
          const key = `${bucket.date.year}-${bucket.date.month}-${bucket.date.day}-${bucket.date.hour}-${bucket.date.minute}`
          if (this.selectedChunks.has(key)) {
            totalSize += bucket.sizeOnDisk
            totalRecords += bucket.dataCount
          }
        }
      }
      
      return {
        count: this.selectedChunks.size,
        size: totalSize,
        records: totalRecords
      }
    },
  },

  actions: {
    getBucketKey(date: ChunkDate): string {
      return `${date.year}-${date.month}-${date.day}-${date.hour}-${date.minute}`
    },

    async fetchChunks(): Promise<SignedFilesResponse | null> {
      this.loading = true
      this.error = null
      
      try {
        const response = await $fetch<SignedFilesResponse>('/api/chunks')
        this.data = response
        return response
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch chunks'
        console.error('Error fetching chunks:', err)
        return null
      } finally {
        this.loading = false
      }
    },

    toggleBucketSelection(date: ChunkDate) {
      const key = this.getBucketKey(date)
      
      if (this.selectedChunks.has(key)) {
        this.selectedChunks.delete(key)
      } else {
        this.selectedChunks.set(key, date)
      }
    },

    isBucketSelected(date: ChunkDate): boolean {
      const key = this.getBucketKey(date)
      return this.selectedChunks.has(key)
    },

    toggleGroupSelection(hour: number) {
      if (!this.data) return
      
      const group = this.data.groups.find((g: ChunkGroup) => g.date.hour === hour)
      if (!group) return
      
      const allSelected = group.buckets.every((bucket: Bucket) => {
        const key = this.getBucketKey(bucket.date)
        return this.selectedChunks.has(key)
      })
      
      if (allSelected) {
        // Deselect all in group
        for (const bucket of group.buckets) {
          const key = this.getBucketKey(bucket.date)
          this.selectedChunks.delete(key)
        }
      } else {
        // Select all in group
        for (const bucket of group.buckets) {
          const key = this.getBucketKey(bucket.date)
          if (!this.selectedChunks.has(key)) {
            this.selectedChunks.set(key, bucket.date)
          }
        }
      }
    },

    toggleAllSelection() {
      if (!this.data) return
      
      if (this.isAllSelected) {
        // Deselect all
        this.selectedChunks.clear()
      } else {
        // Select all
        this.selectedChunks.clear()
        for (const group of this.data.groups) {
          for (const bucket of group.buckets) {
            const key = this.getBucketKey(bucket.date)
            this.selectedChunks.set(key, bucket.date)
          }
        }
      }
    },

    clearSelection() {
      this.selectedChunks.clear()
    },

    async downloadSelected() {
      if (this.selectedChunks.size === 0) return
      
      this.loading = true
      
      try {
        const dates = Array.from(this.selectedChunks.values())
        const response = await $fetch<DownloadFile[]>('/api/chunks/download-urls', {
          method: 'POST',
          body: { dates }
        })
        this.downloadResult = response
        this.downloadModalOpen = true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to get download URLs'
        console.error('Error downloading:', err)
      } finally {
        this.loading = false
      }
    },

    async deleteSelected() {
      if (this.selectedChunks.size === 0) return
      
      this.loading = true
      
      try {
        const dates = Array.from(this.selectedChunks.values())
        const response = await $fetch<DeleteResult>('/api/chunks', {
          method: 'DELETE',
          body: { dates }
        })
        this.deleteResult = response
        
        // Clear selection after successful delete
        if (response.status === 'completed') {
          this.selectedChunks.clear()
        }
        
        this.deleteModalOpen = true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete chunks'
        console.error('Error deleting:', err)
      } finally {
        this.loading = false
      }
    },

    openDownloadModal() {
      this.downloadModalOpen = true
    },

    closeDownloadModal() {
      this.downloadModalOpen = false
      this.downloadResult = null
    },

    openDeleteModal() {
      this.deleteModalOpen = true
    },

    closeDeleteModal() {
      this.deleteModalOpen = false
      this.deleteResult = null
    },
  }
})
