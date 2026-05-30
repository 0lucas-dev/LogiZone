<template>
  <div class="detalhe-vaga">
    <NavBar />
    <div class="container mt-4">
      <div class="header-actions mb-4">
        <h2>Detalhes da Vaga</h2>
        <button class="btn btn-outline" @click="voltar">Voltar</button>
      </div>

      <div v-if="carregando" class="text-center">Carregando dados da vaga...</div>

      <div v-else-if="vaga" class="grid md:grid-cols-2">
        <!-- Info da Vaga -->
        <div class="card">
          <div class="vaga-header">
            <h3>{{ vaga.codigo }}</h3>
            <BadgeStatus :status="vaga.status" />
          </div>
          
          <div class="vaga-body mt-4">
            <p><strong>Endereço:</strong> {{ vaga.logradouro }}, {{ vaga.numero }}</p>
            <p><strong>Bairro:</strong> {{ vaga.bairro }} - {{ vaga.cidade }}</p>
            <p><strong>Limite de Tempo:</strong> {{ vaga.limiteTempo }} minutos</p>
          </div>

          <div class="acoes-vaga mt-4" v-if="vaga.status === 'IRREGULAR' || vaga.status === 'LIVRE'">
            <button class="btn btn-danger" @click="registrarInfracao">
              Registrar Infração
            </button>
          </div>
        </div>

        <!-- Sessão Atual -->
        <div class="card">
          <h3>Sessão Atual</h3>
          <div v-if="vaga.sessaoAtual" class="sessao-atual mt-4">
            <p><strong>Placa:</strong> {{ vaga.sessaoAtual.veiculo.placa }}</p>
            <p><strong>Empresa:</strong> {{ vaga.sessaoAtual.veiculo.empresa }}</p>
            <p><strong>Início:</strong> {{ formatarHora(vaga.sessaoAtual.iniciadaEm) }}</p>
            <div class="tempo-box mt-4 p-4 text-center" :class="vaga.status === 'IRREGULAR' ? 'bg-red-light' : 'bg-yellow-light'">
              <h4>Tempo Restante</h4>
              <p class="tempo-numero" :class="vaga.status === 'IRREGULAR' ? 'text-danger' : 'text-warning'">
                {{ vaga.sessaoAtual.minutosRestantes }} min
              </p>
            </div>
          </div>
          <div v-else class="text-muted mt-4">
            Nenhum veículo estacionado (com check-in) no momento.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import NavBar from '@/components/NavBar.vue';
import BadgeStatus from '@/components/BadgeStatus.vue';
import type { Vaga } from '@/types';

const route = useRoute();
const router = useRouter();

const vaga = ref<Vaga | null>(null);
const carregando = ref(true);

onMounted(async () => {
  try {
    const response = await axios.get(`/api/vagas/${route.params.id}`);
    if (response.data.sucesso) {
      vaga.value = response.data.dados;
    }
  } catch (error) {
    console.error('Erro ao buscar vaga', error);
  } finally {
    carregando.value = false;
  }
});

function voltar() {
  router.back();
}

function registrarInfracao() {
  if (vaga.value) {
    router.push(`/fiscal/infracao/nova?vagaId=${vaga.value.id}`);
  }
}

function formatarHora(dataString: string) {
  return new Date(dataString).toLocaleTimeString('pt-BR');
}
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.vaga-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1rem;
}
.vaga-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--primary);
}
.vaga-body p {
  margin-bottom: 0.5rem;
}
.tempo-box {
  border-radius: var(--radius);
}
.tempo-numero {
  font-size: 2.5rem;
  font-weight: bold;
}
.bg-red-light { background-color: #fef2f2; }
.bg-yellow-light { background-color: #fefce8; }
.text-danger { color: var(--danger); }
.text-warning { color: var(--warning); }
.text-muted { color: var(--text-muted); }
</style>
