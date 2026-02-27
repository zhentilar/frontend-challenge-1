<script setup lang="ts">
import { useChunksStore } from '~/stores/chunks'

const store = useChunksStore()

// Fetch data on server and hydrate to client
await useAsyncData('chunks', () => store.fetchChunks())
</script>

<template>
  <div class="min-h-screen bg-white">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
