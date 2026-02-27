<script setup lang="ts">
import { getPaletteColors } from '~/composables/useColorMapping'

const colors = getPaletteColors()
</script>

<template>
  <div class="color-scale">
    <span class="color-scale__label">Less</span>
    <div class="color-scale__gradient">
      <div 
        v-for="(color, index) in colors" 
        :key="index"
        class="color-scale__cell"
        :style="{ backgroundColor: color }"
      />
    </div>
    <span class="color-scale__label">More</span>
  </div>
</template>

<style scoped>
.color-scale {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-scale__label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

.color-scale__gradient {
  display: flex;
  gap: 2px;
}

.color-scale__cell {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
