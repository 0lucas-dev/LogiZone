<template>
  <div class="card card-vaga">
    <div class="card-header">
      <h3>{{ vaga.codigo }}</h3>
      <BadgeStatus :status="vaga.status" />
    </div>
    
    <div class="card-body">
      <p class="endereco">{{ vaga.logradouro }}, {{ vaga.numero }}</p>
      <p class="bairro">{{ vaga.bairro }}</p>
      
      <div v-if="vaga.status === 'OCUPADA' || vaga.status === 'IRREGULAR'" class="info-sessao mt-4">
        <p v-if="vaga.sessaoAtual">Placa: {{ vaga.sessaoAtual.veiculo.placa }}</p>
        <p v-if="vaga.sessaoAtual">Empresa: {{ vaga.sessaoAtual.veiculo.empresa }}</p>
        <p v-if="vaga.sessaoAtual" class="tempo">Tempo restante: <strong>{{ vaga.sessaoAtual.minutosRestantes }} min</strong></p>
      </div>
      
      <slot name="extra"></slot>
    </div>

    <div class="card-footer mt-4" v-if="mostrarBotaoCheckin">
      <button 
        class="btn btn-primary" 
        :disabled="vaga.status !== 'LIVRE'"
        @click="$emit('checkin', vaga.id)"
      >
        Fazer Check-in
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}
.card-header h3 {
  font-size: 1.25rem;
  margin: 0;
}
.endereco {
  font-weight: 500;
  margin-bottom: 0.25rem;
}
.bairro {
  color: var(--text-muted);
  font-size: 0.875rem;
}
.info-sessao {
  background-color: var(--background);
  padding: 0.75rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
}
.tempo {
  margin-top: 0.5rem;
  color: var(--warning);
}
.card-footer {
  margin-top: auto;
}
</style>
