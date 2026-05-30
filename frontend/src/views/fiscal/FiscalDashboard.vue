<template>
  <div class="fiscal-dashboard">
    <NavBar />
    <div class="container mt-4">
      <h2 class="mb-4">Painel de Fiscalização</h2>

      <!-- Resumo -->
      <div v-if="resumo" class="grid grid-cols-1 md:grid-cols-4 mb-4">
        <div class="card text-center stat-card">
          <h3>{{ resumo.totalVagas }}</h3>
          <p>Total de Vagas</p>
        </div>
        <div class="card text-center stat-card bg-green-light">
          <h3>{{ resumo.vagasLivres }}</h3>
          <p>Vagas Livres</p>
        </div>
        <div class="card text-center stat-card bg-yellow-light">
          <h3>{{ resumo.vagasOcupadas }}</h3>
          <p>Vagas Ocupadas</p>
        </div>
        <div class="card text-center stat-card bg-red-light">
          <h3>{{ resumo.vagasIrregulares }}</h3>
          <p>Vagas Irregulares</p>
        </div>
      </div>

      <!-- Lista de Vagas em Tempo Real -->
      <div class="vagas-lista card">
        <div class="header-lista mb-4">
          <h3>Monitoramento ao Vivo</h3>
          <input 
            type="text" 
            v-model="busca" 
            placeholder="Filtrar..." 
            class="form-control"
            style="max-width: 300px;"
          />
        </div>

        <div v-if="carregando" class="text-center">Carregando dados...</div>
        
        <table v-else class="table">
          <thead>
            <tr>
              <th>Vaga</th>
              <th>Endereço</th>
              <th>Status</th>
              <th>Veículo / Tempo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vaga in vagasFiltradas" :key="vaga.id">
              <td><strong>{{ vaga.codigo }}</strong></td>
              <td>{{ vaga.logradouro }}, {{ vaga.numero }}</td>
              <td><BadgeStatus :status="vaga.status" /></td>
              <td>
                <span v-if="vaga.sessaoAtual">
                  {{ vaga.sessaoAtual.veiculo.placa }}
                  <br>
                  <small :class="vaga.status === 'IRREGULAR' ? 'text-danger' : 'text-warning'">
                    Restam: {{ vaga.sessaoAtual.minutosRestantes }} min
                  </small>
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td class="acoes">
                <button class="btn-sm btn-outline" @click="verDetalhes(vaga.id)">Detalhes</button>
                <button 
                  v-if="vaga.status === 'IRREGULAR' || vaga.status === 'LIVRE'" 
                  class="btn-sm btn-danger ml-2"
                  @click="registrarInfracao(vaga.id)"
                  title="Registrar infração (SEM CHECK-IN se Livre, EXPIRADA se Irregular)"
                >
                  Multar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import NavBar from '@/components/NavBar.vue';
import BadgeStatus from '@/components/BadgeStatus.vue';
import type { ResumoRelatorio, Vaga } from '@/types';

const router = useRouter();

const resumo = ref<ResumoRelatorio | null>(null);
const vagas = ref<Vaga[]>([]);
const carregando = ref(true);
const busca = ref('');

let interval: number | undefined;

onMounted(async () => {
  await carregarDados();
  
  // Polling a cada 20 segundos
  interval = setInterval(() => {
    carregarDados();
  }, 20000) as unknown as number;
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});

async function carregarDados() {
  try {
    const [resResumo, resVagas] = await Promise.all([
      axios.get('/api/relatorios/resumo'),
      axios.get('/api/vagas')
    ]);

    if (resResumo.data.sucesso) resumo.value = resResumo.data.dados;
    if (resVagas.data.sucesso) vagas.value = resVagas.data.dados;
  } catch (error) {
    console.error('Erro ao carregar dashboard', error);
  } finally {
    carregando.value = false;
  }
}

const vagasFiltradas = computed(() => {
  const termo = busca.value.toLowerCase();
  if (!termo) return vagas.value;
  
  return vagas.value.filter(v => 
    v.codigo.toLowerCase().includes(termo) ||
    v.logradouro.toLowerCase().includes(termo) ||
    v.status.toLowerCase().includes(termo) ||
    (v.sessaoAtual && v.sessaoAtual.veiculo.placa.toLowerCase().includes(termo))
  );
});

function verDetalhes(id: number) {
  router.push(`/fiscal/vaga/${id}`);
}

function registrarInfracao(vagaId: number) {
  router.push(`/fiscal/infracao/nova?vagaId=${vagaId}`);
}
</script>

<style scoped>
.stat-card h3 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}
.bg-green-light { background-color: #f0fdf4; border-color: #bbf7d0; }
.bg-yellow-light { background-color: #fefce8; border-color: #fef08a; }
.bg-red-light { background-color: #fef2f2; border-color: #fecaca; }

.header-lista {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

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

.text-danger { color: var(--danger); font-weight: bold; }
.text-warning { color: var(--warning); font-weight: bold; }
.text-muted { color: var(--text-muted); }

.acoes {
  display: flex;
  gap: 0.5rem;
}
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: var(--radius);
  cursor: pointer;
}
.btn-outline {
  border: 1px solid var(--border);
  background-color: white;
}
.btn-outline:hover { background-color: var(--background); }
.btn-danger {
  background-color: var(--danger);
  color: white;
  border: none;
}
.btn-danger:hover { opacity: 0.9; }
</style>
