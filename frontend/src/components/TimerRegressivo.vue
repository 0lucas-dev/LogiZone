<template>
  <div class="timer-container">
    <div class="timer-display">
      <div class="timer-text" :class="colorClass">
        {{ formatTime(segundosRestantes) }}
      </div>
      <div class="timer-label">Tempo Restante</div>
    </div>
    <div class="progress-bar-bg">
      <div class="progress-bar-fill" :class="colorClassBg" :style="{ width: percentual + '%' }"></div>
    </div>
    <div class="progress-labels">
      <span>0%</span>
      <span>{{ percentual.toFixed(0) }}%</span>
      <span>100%</span>
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
.timer-display {
  text-align: center;
  margin-bottom: 12px;
}
.timer-text {
  font-family: 'VT323', monospace;
  font-size: 64px;
  font-weight: bold;
  background: #000000;
  color: #00ff00;
  padding: 16px 32px;
  display: inline-block;
  box-shadow: var(--inset-border);
  letter-spacing: 8px;
  line-height: 1;
}
.timer-label {
  font-size: 16px;
  color: var(--text-muted);
  margin-top: 8px;
}
.progress-bar-bg {
  width: 100%;
  height: 20px;
  background-color: var(--surface-raised);
  box-shadow: var(--inset-border);
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  transition: width 1s linear;
}
.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}

.text-green { color: #00ff00; }
.text-yellow { color: #ffff00; }
.text-red { color: #ff0000; animation: blink-cursor 0.5s step-end infinite; }

.bg-green { background-color: #008000; }
.bg-yellow { background-color: #cc6600; }
.bg-red { background-color: #cc0000; }
</style>
