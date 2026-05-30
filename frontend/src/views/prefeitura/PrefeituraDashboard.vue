<template>
  <div class="prefeitura-dashboard">
    <NavBar />
    <div class="container mt-4">
      <h2 class="mb-4">Painel da Prefeitura</h2>

      <div class="grid md:grid-cols-2 gap-4">
        <!-- Adicionar Nova Vaga -->
        <div class="card">
          <h3>Adicionar Nova Vaga</h3>
          <form @submit.prevent="adicionarVaga">
            <div class="form-group">
              <label>Código da Vaga</label>
              <input v-model="form.codigo" type="text" class="form-control" required />
            </div>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <div class="form-group">
                <label>Tamanho</label>
                <select v-model="form.tamanho" class="form-control" required>
                  <option value="PEQUENA">Pequena (Utilitário)</option>
                  <option value="MEDIA">Média (Van/Toco)</option>
                  <option value="GRANDE">Grande (Carreta)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Valor / Minuto (R$)</label>
                <input v-model.number="form.valorMinuto" type="number" step="0.01" class="form-control" required />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <div class="form-group">
                <label>Tempo Limite (min)</label>
                <input v-model.number="form.limiteTempo" type="number" class="form-control" required />
              </div>
              <div class="form-group">
                <label>Logradouro</label>
                <input v-model="form.logradouro" type="text" class="form-control" required />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <div class="form-group">
                <label>Número</label>
                <input v-model="form.numero" type="text" class="form-control" required />
              </div>
              <div class="form-group">
                <label>Bairro</label>
                <input v-model="form.bairro" type="text" class="form-control" required />
              </div>
            </div>
            
            <button type="submit" class="btn btn-secondary mt-4 w-full" style="background-color:#059669;color:white">
              Cadastrar Vaga
            </button>
          </form>
        </div>

        <!-- Lista de Vagas -->
        <div class="card">
          <h3>Vagas Gerenciadas</h3>
          <div v-if="vagasStore.carregando" class="text-center p-4">Carregando...</div>
          <div v-else class="lista-vagas">
            <div v-for="vaga in vagasStore.vagas" :key="vaga.id" class="vaga-item p-3 border rounded mb-2">
              <div class="flex justify-between">
                <strong>{{ vaga.codigo }}</strong>
                <span class="badge" :class="'badge-' + vaga.status.toLowerCase()">
                  {{ vaga.status }}
                </span>
              </div>
              <div class="text-sm text-muted mt-1">
                {{ vaga.logradouro }}, {{ vaga.numero }}<br />
                {{ vaga.tamanho || 'N/A' }} • R$ {{ vaga.valorMinuto?.toFixed(2) }} / min • Máx: {{ vaga.limiteTempo }}min
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import NavBar from '@/components/NavBar.vue';
import { useVagasStore } from '@/stores/vagas';
import axios from 'axios';

const vagasStore = useVagasStore();

const form = ref({
  codigo: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: 'Cidade Padrão',
  latitude: -23.5505, // mock
  longitude: -46.6333, // mock
  tamanho: 'MEDIA',
  valorMinuto: 1.00,
  limiteTempo: 45
});

onMounted(() => {
  vagasStore.buscarVagas();
});

async function adicionarVaga() {
  try {
    const res = await axios.post('/api/vagas', form.value);
    if (res.data.sucesso) {
      alert('Vaga cadastrada!');
      form.value.codigo = '';
      vagasStore.buscarVagas();
    }
  } catch (error) {
    alert('Erro ao cadastrar vaga');
  }
}
</script>

<style scoped>
.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: bold;
}
.badge-livre { background-color: #d1fae5; color: #065f46; }
.badge-ocupada { background-color: #fef3c7; color: #92400e; }
.badge-irregular { background-color: #fee2e2; color: #b91c1c; }
.lista-vagas {
  max-height: 400px;
  overflow-y: auto;
}
</style>
