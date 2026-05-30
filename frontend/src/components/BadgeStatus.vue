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
  if (props.status === 'LIVRE') return '🟢 LIVRE';
  if (props.status === 'OCUPADA') return '🟡 OCUPADA';
  if (props.status === 'IRREGULAR') return '🔴 IRREGULAR';
  if (props.status === 'EXPIRADA') return '🔴 EXPIRADA';
  if (props.status === 'ENCERRADA') return '⚫ ENCERRADA';
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
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-livre {
  background-color: #dcfce7;
  color: #166534;
}

.badge-ocupada {
  background-color: #fef08a;
  color: #854d0e;
}

.badge-irregular {
  background-color: #fee2e2;
  color: #991b1b;
}

.badge-encerrada {
  background-color: #f1f5f9;
  color: #475569;
}
</style>
