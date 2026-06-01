<template>
  <span class="badge" :class="badgeClass">
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: 'LIVRE' | 'OCUPADA' | 'IRREGULAR' | 'EXPIRADA' | 'ENCERRADA';
}>();

const statusLabel = computed(() => {
  if (props.status === 'LIVRE') return '■ LIVRE';
  if (props.status === 'OCUPADA') return '■ OCUPADA';
  if (props.status === 'IRREGULAR') return '■ IRREGULAR';
  if (props.status === 'EXPIRADA') return '■ EXPIRADA';
  if (props.status === 'ENCERRADA') return '■ ENCERRADA';
  return props.status;
});

const badgeClass = computed(() => {
  return {
    'badge-livre': props.status === 'LIVRE',
    'badge-ocupada': props.status === 'OCUPADA',
    'badge-irregular': props.status === 'IRREGULAR' || props.status === 'EXPIRADA',
    'badge-encerrada': props.status === 'ENCERRADA'
  };
});
</script>

<style scoped>
.badge {
  display: inline-block;
  padding: 2px 8px;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  box-shadow: var(--inset-border);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.badge-livre {
  background-color: #00ff00;
  color: #003300;
}

.badge-ocupada {
  background-color: #ffff00;
  color: #333300;
}

.badge-irregular {
  background-color: #ff0000;
  color: #ffffff;
  animation: blink-cursor 1s step-end infinite;
}

.badge-encerrada {
  background-color: #808080;
  color: #ffffff;
}
</style>
