<template>
  <div class="historico-view">
    <NavBar />
    <div class="container mt-4">
      <h2 class="mb-4">Histórico de Sessões</h2>

      <div v-if="carregando" class="text-center mt-4">
        Carregando histórico...
      </div>

      <div v-else-if="sessoes.length === 0" class="text-center mt-4">
        Nenhuma sessão encontrada para este veículo.
      </div>

      <div v-else class="historico-lista">
        <div v-for="sessao in sessoes" :key="sessao.id" class="card mb-4">
          <div class="sessao-header">
            <h4>{{ sessao.vaga?.codigo }}</h4>
            <BadgeStatus :status="sessao.status" />
          </div>
          
          <div class="sessao-body">
            <p><strong>Endereço:</strong> {{ sessao.vaga?.logradouro }}, {{ sessao.vaga?.numero }} - {{ sessao.vaga?.bairro }}</p>
            <p><strong>Início:</strong> {{ formatarDataHora(sessao.iniciadaEm) }}</p>
            <p v-if="sessao.encerradaEm"><strong>Fim:</strong> {{ formatarDataHora(sessao.encerradaEm) }}</p>
            <p v-if="sessao.encerradaEm"><strong>Duração:</strong> {{ calcularDuracao(sessao.iniciadaEm, sessao.encerradaEm) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import NavBar from '@/components/NavBar.vue';
import BadgeStatus from '@/components/BadgeStatus.vue';
import { useUsuarioStore } from '@/stores/usuario';
import type { Sessao } from '@/types';

const usuarioStore = useUsuarioStore();
const sessoes = ref<Sessao[]>([]);
const carregando = ref(true);

onMounted(async () => {
  if (usuarioStore.veiculo) {
    try {
      const response = await axios.get(`/api/veiculos/${usuarioStore.veiculo.placa}`);
      if (response.data.sucesso && response.data.dados.sessoes) {
        sessoes.value = response.data.dados.sessoes;
      }
    } catch (error) {
      console.error('Erro ao buscar histórico', error);
    } finally {
      carregando.value = false;
    }
  }
});

function formatarDataHora(dataString: string) {
  return new Date(dataString).toLocaleString('pt-BR');
}

function calcularDuracao(inicio: string, fim: string) {
  const diffMs = new Date(fim).getTime() - new Date(inicio).getTime();
  const minutos = Math.floor(diffMs / 60000);
  
  if (minutos < 60) return `${minutos} min`;
  
  const horas = Math.floor(minutos / 60);
  const minRestantes = minutos % 60;
  return `${horas}h ${minRestantes}m`;
}
</script>

<style scoped>
.sessao-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.sessao-header h4 {
  margin: 0;
  color: var(--primary);
}
.sessao-body p {
  margin-bottom: 0.5rem;
}
</style>
