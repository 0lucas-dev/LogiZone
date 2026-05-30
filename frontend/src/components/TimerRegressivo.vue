<template>
  <div class="timer-container">
    <div class="timer-text" :class="colorClass">
      {{ formatTime(segundosRestantes) }}
    </div>
    <div class="progress-bar-bg">
      <div class="progress-bar-fill" :class="colorClassBg" :style="{ width: percentual + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  minutosRestantes: number;
  limiteTempo: number;
}>();

const emit = defineEmits<{
  expirado: [];
}>();

const totalSegundos = props.limiteTempo * 60;
const segundosRestantes = ref(Math.max(0, props.minutosRestantes * 60));

let interval: number | undefined;

onMounted(() => {
  interval = setInterval(() => {
    if (segundosRestantes.value > 0) {
      segundosRestantes.value--;
    } else {
      emit('expirado');
      if (interval) clearInterval(interval);
    }
  }, 1000) as unknown as number;
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});

const percentual = computed(() => {
  return Math.min(100, Math.max(0, (segundosRestantes.value / totalSegundos) * 100));
});

const colorClass = computed(() => {
  if (percentual.value > 50) return 'text-green';
  if (percentual.value > 20) return 'text-yellow';
  return 'text-red';
});

const colorClassBg = computed(() => {
  if (percentual.value > 50) return 'bg-green';
  if (percentual.value > 20) return 'bg-yellow';
  return 'bg-red';
});

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
</script>

<style scoped>
.timer-container {
  width: 100%;
}
.timer-text {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0.5rem;
}
.progress-bar-bg {
  width: 100%;
  height: 0.5rem;
  background-color: var(--border);
  border-radius: 9999px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  transition: width 1s linear, background-color 0.5s;
}

.text-green { color: var(--success); }
.text-yellow { color: var(--warning); }
.text-red { color: var(--danger); }

.bg-green { background-color: var(--success); }
.bg-yellow { background-color: var(--warning); }
.bg-red { background-color: var(--danger); }
</style>
