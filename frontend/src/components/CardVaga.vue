<template>
  <div class="card card-vaga">
    <h3>
      {{ vaga.codigo }}
      <span style="float:right; font-family: var(--font-body); font-size: 14px;">
        <BadgeStatus :status="vaga.status" />
      </span>
    </h3>
    
    <div class="card-body">
      <p class="endereco"> {{ vaga.logradouro }}, {{ vaga.numero }}</p>
      <p class="bairro">{{ vaga.bairro }}</p>
      
      <div v-if="vaga.status === 'OCUPADA' || vaga.status === 'IRREGULAR'" class="info-sessao mt-4">
        <div class="info-sessao-title">── Sessão Ativa ──</div>
        <p v-if="vaga.sessaoAtual">Placa: <strong>{{ vaga.sessaoAtual.veiculo.placa }}</strong></p>
        <p v-if="vaga.sessaoAtual">Tempo restante: <strong class="tempo-valor">{{ vaga.sessaoAtual.minutosRestantes }} min</strong></p>
      </div>

      <div class="info-vaga-detalhes mt-4" style="font-size: 13px; color: var(--text-muted); background: var(--surface-low); padding: 8px; border-radius: 4px;">
        <div style="margin-bottom: 4px;"><strong><span class="material-symbols-outlined" style="font-size: 16px; vertical-align: text-bottom;">schedule</span> Horário:</strong> {{ vaga.horariosDisponiveis || '08:00 - 18:00' }}</div>
        <div style="margin-bottom: 4px;"><strong><span class="material-symbols-outlined" style="font-size: 16px; vertical-align: text-bottom;">directions_car</span> Veículos:</strong> {{ vaga.tiposVeiculos || 'TODOS' }}</div>
        <div><strong><span class="material-symbols-outlined" style="font-size: 16px; vertical-align: text-bottom;">hourglass_empty</span> Limite:</strong> {{ vaga.limiteTempo }} minutos</div>
      </div>
      
      <slot name="extra"></slot>
    </div>

    <div class="card-footer mt-4" v-if="mostrarBotaoCheckin">
      <button class="btn btn-primary" :disabled="vaga.status !== 'LIVRE'" @click="$emit('checkin', vaga.id)">
        CHECK-IN
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Vaga } from '@/types';
import BadgeStatus from './BadgeStatus.vue';

const props = defineProps<{
  vaga: Vaga;
  mostrarBotaoCheckin?: boolean;
}>();

defineEmits<{
  checkin: [vagaId: number];
}>();
</script>

<style scoped>
.card-vaga {
  display: flex;
  flex-direction: column;
}
.card-body {
  flex: 1;
}
.endereco {
  font-weight: 500;
  margin-bottom: 4px;
}
.bairro {
  color: var(--text-muted);
  font-size: 16px;
}
.info-sessao {
  background-color: var(--surface-raised);
  padding: 8px;
  box-shadow: var(--inset-border);
  font-size: 16px;
}
.info-sessao-title {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  margin-bottom: 4px;
}
.tempo-valor {
  color: var(--warning);
}
.card-footer {
  margin-top: auto;
}
</style>
