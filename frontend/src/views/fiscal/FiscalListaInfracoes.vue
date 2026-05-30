<template>
  <div class="lista-infracoes">
    <NavBar />
    <div class="container mt-4">
      <h2 class="mb-4">Infrações Registradas</h2>

      <div class="card">
        <div v-if="carregando" class="text-center">Carregando infrações...</div>
        
        <div v-else-if="infracoes.length === 0" class="text-center">
          Nenhuma infração registrada.
        </div>

        <table v-else class="table">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Vaga</th>
              <th>Placa</th>
              <th>Motivo</th>
              <th>Fiscal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inf in infracoes" :key="inf.id">
              <td>{{ formatarData(inf.registradaEm) }}</td>
              <td>
                <span v-if="inf.vaga">{{ inf.vaga.codigo }}</span>
                <span v-else>ID {{ inf.vagaId }}</span>
              </td>
              <td>{{ inf.placaAvulsa || (inf.veiculo ? inf.veiculo.placa : 'Desconhecida') }}</td>
              <td>{{ formatarMotivo(inf.motivo) }}</td>
              <td>{{ inf.fiscal?.nome || `ID ${inf.fiscalId}` }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import NavBar from '@/components/NavBar.vue';
import type { Infracao } from '@/types';

const infracoes = ref<Infracao[]>([]);
const carregando = ref(true);

onMounted(async () => {
  try {
    const response = await axios.get('/api/infracoes');
    if (response.data.sucesso) {
      infracoes.value = response.data.dados;
    }
  } catch (error) {
    console.error('Erro ao buscar infrações', error);
  } finally {
    carregando.value = false;
  }
});

function formatarData(dataString: string) {
  return new Date(dataString).toLocaleString('pt-BR');
}

function formatarMotivo(motivo: string) {
  if (motivo === 'SEM_CHECKIN') return 'Sem check-in';
  if (motivo === 'TEMPO_EXPIRADO') return 'Tempo expirado';
  if (motivo === 'VEICULO_NAO_AUTORIZADO') return 'Não autorizado';
  return motivo;
}
</script>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th, .table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.table th {
  background-color: var(--background);
  font-weight: 600;
}
</style>
