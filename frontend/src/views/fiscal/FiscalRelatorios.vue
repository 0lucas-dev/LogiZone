<template>
  <div class="relatorios">
    <NavBar />
    <div class="container mt-4">
      <h2 class="mb-4">Relatórios e Estatísticas</h2>

      <div v-if="carregando" class="text-center">Carregando relatórios...</div>
      
      <div v-else class="grid md:grid-cols-2">
        <div class="card">
          <h3 class="mb-4">Mapa de Calor (Vagas Mais Utilizadas)</h3>
          <p class="text-muted mb-4">Baseado nos check-ins dos últimos 30 dias</p>
          
          <div v-if="mapaCalor.length === 0" class="text-center">
            Sem dados suficientes para gerar o gráfico.
          </div>
          
          <div v-else class="grafico-barras">
            <div v-for="item in top5Vagas" :key="item.vagaId" class="barra-container">
              <div class="barra-label">
                {{ item.codigo }}
                <span class="text-muted">({{ item.totalSessoes30dias }} check-ins)</span>
              </div>
              <div class="barra-track">
                <div 
                  class="barra-fill" 
                  :style="{ width: calcularPorcentagem(item.totalSessoes30dias) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="mb-4">Lista Completa (Últimos 30 dias)</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Vaga</th>
                <th>Localização</th>
                <th>Check-ins</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in mapaCalor" :key="item.vagaId">
                <td><strong>{{ item.codigo }}</strong></td>
                <td><small>{{ item.lat.toFixed(4) }}, {{ item.lng.toFixed(4) }}</small></td>
                <td>{{ item.totalSessoes30dias }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import NavBar from '@/components/NavBar.vue';
import type { MapaCalorItem } from '@/types';

const mapaCalor = ref<MapaCalorItem[]>([]);
const carregando = ref(true);

onMounted(async () => {
  try {
    const response = await axios.get('/api/relatorios/mapa-calor');
    if (response.data.sucesso) {
      mapaCalor.value = response.data.dados;
    }
  } catch (error) {
    console.error('Erro ao buscar mapa de calor', error);
  } finally {
    carregando.value = false;
  }
});

const top5Vagas = computed(() => {
  return mapaCalor.value.slice(0, 5);
});

const maxSessoes = computed(() => {
  if (mapaCalor.value.length === 0) return 1;
  return Math.max(...mapaCalor.value.map(i => i.totalSessoes30dias));
});

function calcularPorcentagem(valor: number) {
  if (maxSessoes.value === 0) return 0;
  return (valor / maxSessoes.value) * 100;
}
</script>

<style scoped>
.text-muted {
  color: var(--text-muted);
}
.grafico-barras {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.barra-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-weight: 500;
}
.barra-track {
  width: 100%;
  height: 1.5rem;
  background-color: var(--background);
  border-radius: var(--radius);
  overflow: hidden;
}
.barra-fill {
  height: 100%;
  background-color: var(--primary);
  border-radius: var(--radius);
  transition: width 1s ease-out;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th, .table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.table th {
  background-color: var(--background);
  font-weight: 600;
}
</style>
