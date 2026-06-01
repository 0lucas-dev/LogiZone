<template>
  <div class="timer-view">
    <NavBar />
    <div class="container mt-6">
      <div v-if="!sessao" class="text-center card">
        <h3 class="mb-4 text-xl">Sem Sessão</h3>
        <p class="text-muted mb-6">Nenhuma sessão ativa encontrada.</p>
        <button class="btn btn-primary" @click="voltarAoMapa">Voltar ao Mapa</button>
      </div>

      <div v-else class="card mx-auto max-w-[500px]">
        <div class="border-b pb-4 mb-4 text-center">
          <h3 class="m-0 text-xl font-bold text-navy">Check-in Ativo</h3>
        </div>
        
        <div class="info-vaga text-center mb-6 p-4 bg-gray-50 border rounded">
          <div class="font-bold text-lg text-primary mb-2">{{ sessao.vaga?.codigo }}</div>
          <p class="text-sm mb-1">{{ sessao.vaga?.logradouro }}, {{ sessao.vaga?.numero }}</p>
          <p class="text-xs text-muted m-0">{{ sessao.vaga?.bairro }}</p>
        </div>

        <div class="mb-6">
          <TimerRegressivo 
            :minutosRestantes="sessao.minutosRestantes || 0"
            :limiteTempo="sessao.vaga?.limiteTempo || 45"
            @expirado="tempoEsgotado = true"
          />
          <div class="text-center mt-4 p-4 border rounded bg-gray-50">
            <span class="text-sm text-muted block mb-1">Custo Parcial</span>
            <span class="text-2xl font-bold text-primary">R$ {{ sessao.valorAtual?.toFixed(2) || '0.00' }}</span>
          </div>
        </div>

        <div v-if="tempoEsgotado" class="mb-6 text-center text-danger font-bold p-3 border border-danger rounded bg-danger-light" style="background-color: #fef2f2;">
          Tempo Esgotado — Risco de Multa
        </div>

        <button 
          class="btn btn-primary w-full text-lg py-3" 
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
  
  if (result?.sucesso) {
    router.push('/motorista/historico');
  } else {
    alert(result?.erro || 'Erro ao fazer check-out');
  }
}
</script>

<style scoped>
.max-w-\[500px\] {
  max-width: 500px;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.bg-gray-50 {

}
.rounded {
  border-radius: var(--radius);
}
.text-navy {
  color: var(--primary);
}
.block {
  display: block;
}
</style>
