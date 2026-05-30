<template>
  <div class="timer-view">
    <NavBar />
    <div class="container mt-4">
      <div v-if="!sessao" class="text-center mt-4">
        <p>Nenhuma sessão ativa encontrada.</p>
        <button class="btn btn-primary mt-4" @click="voltarAoMapa">Voltar ao Mapa</button>
      </div>

      <div v-else class="card timer-card mx-auto">
        <h2 class="text-center mb-4">Check-in Ativo</h2>
        
        <div class="info-vaga text-center mb-4">
          <h3>{{ sessao.vaga?.codigo }}</h3>
          <p>{{ sessao.vaga?.logradouro }}, {{ sessao.vaga?.numero }}</p>
          <p class="bairro">{{ sessao.vaga?.bairro }}</p>
        </div>

        <div class="timer-wrapper mb-4">
          <TimerRegressivo 
            :minutosRestantes="sessao.minutosRestantes || 0"
            :limiteTempo="sessao.vaga?.limiteTempo || 45"
            @expirado="tempoEsgotado = true"
          />
          <div class="text-center mt-3 text-lg font-bold">
            Custo Parcial: <span class="text-green-600">R$ {{ sessao.valorAtual?.toFixed(2) || '0.00' }}</span>
          </div>
        </div>

        <div v-if="tempoEsgotado" class="alerta-esgotado mb-4 text-center">
          ⚠️ Tempo esgotado — risco de multa
        </div>

        <button 
          class="btn btn-danger" 
          @click="fazerCheckout"
          :disabled="carregando"
        >
          {{ carregando ? 'Encerrando...' : 'Encerrar Uso (Check-out)' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '@/components/NavBar.vue';
import TimerRegressivo from '@/components/TimerRegressivo.vue';
import { useVagasStore } from '@/stores/vagas';

const router = useRouter();
const vagasStore = useVagasStore();

const carregando = ref(false);
const tempoEsgotado = ref(false);

const sessao = computed(() => vagasStore.sessaoAtiva);

onMounted(() => {
  if (!vagasStore.sessaoAtiva) {
    router.push('/motorista/mapa');
  } else if (vagasStore.sessaoAtiva.minutosRestantes !== undefined && vagasStore.sessaoAtiva.minutosRestantes <= 0) {
    tempoEsgotado.value = true;
  }
});

function voltarAoMapa() {
  router.push('/motorista/mapa');
}

async function fazerCheckout() {
  if (!sessao.value) return;
  
  carregando.value = true;
  const result = await vagasStore.fazerCheckout(sessao.value.id);
  carregando.value = false;
  
  if (result.sucesso) {
    router.push('/motorista/historico');
  } else {
    alert(result.erro);
  }
}
</script>

<style scoped>
.timer-card {
  max-width: 500px;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.info-vaga h3 {
  color: var(--primary);
  margin-bottom: 0.5rem;
}
.bairro {
  color: var(--text-muted);
}
.timer-wrapper {
  padding: 2rem 0;
}
.alerta-esgotado {
  color: var(--danger);
  font-weight: bold;
  background-color: #fee2e2;
  padding: 1rem;
  border-radius: var(--radius);
}
</style>
