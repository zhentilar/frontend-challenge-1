<script setup lang="ts">
import { useChunksStore } from '~/stores/chunks'

const store = useChunksStore()

// Fetch data on server and hydrate to client
const { data } = await useAsyncData('chunks', () => store.fetchChunks())

// Ensure data is available
if (!data.value && import.meta.client) {
  await store.fetchChunks()
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
