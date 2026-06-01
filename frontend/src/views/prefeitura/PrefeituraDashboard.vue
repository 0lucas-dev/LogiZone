<template>
  <div class="prefeitura-dashboard">
    <NavBar />
    <div class="container mt-6">
      <div class="header-simple border-b pb-4 mb-6">
        <h2 class="m-0">Gestão de Vagas</h2>
        <p class="text-muted text-sm m-0">Monitoramento e cadastro de vagas do município</p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- Adicionar Nova Vaga -->
        <div class="card p-0">
          <div class="p-4 border-b">
            <h3 class="m-0 text-lg">Nova Vaga</h3>
          </div>
          <form @submit.prevent="adicionarVaga" class="p-4">
            <div class="form-group">
              <label>Código da Vaga</label>
              <input v-model="form.codigo" type="text" class="form-control" required placeholder="Ex: VAGA-001" />
            </div>
            <div class="grid grid-cols-2 gap-4 mt-4">
              <div class="form-group">
                <label>Tamanho</label>
                <select v-model="form.tamanho" class="form-control" required>
                  <option value="UTILITARIO">Utilitário</option>
                  <option value="VAN">Van</option>
                  <option value="CAMINHAO">Caminhão</option>
                </select>
              </div>
              <div class="form-group">
                <label>Valor / Minuto (R$)</label>
                <input v-model.number="form.valorMinuto" type="number" step="0.01" class="form-control" required />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 mt-2">
              <div class="form-group">
                <label>Tempo Máx (min)</label>
                <input v-model.number="form.limiteTempo" type="number" class="form-control" required />
              </div>
              <div class="form-group">
                <label>Logradouro</label>
                <input v-model="form.logradouro" type="text" class="form-control" required />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 mt-2">
              <div class="form-group">
                <label>Número</label>
                <input v-model="form.numero" type="text" class="form-control" required />
              </div>
              <div class="form-group">
                <label>Bairro</label>
                <input v-model="form.bairro" type="text" class="form-control" required />
              </div>
            </div>
            
            <button type="submit" class="btn btn-primary w-full mt-4">
              Cadastrar Vaga
            </button>
          </form>
        </div>

        <!-- Lista de Vagas -->
        <div class="card p-0 flex flex-col" style="max-height: 600px;">
          <div class="p-4 border-b flex justify-between items-center">
            <h3 class="m-0 text-lg">Vagas Cadastradas</h3>
            <span class="badge-pill bg-gray-100">{{ vagasStore.vagas.length }}</span>
          </div>
          
          <div v-if="vagasStore.carregando" class="text-center p-6 text-muted">
            <div class="spinner mb-2"></div>
            <div>Carregando vagas...</div>
          </div>
          
          <div v-else class="flex-1 overflow-y-auto p-0">
            <table class="w-full">
              <tbody>
                <tr v-for="vaga in vagasStore.vagas" :key="vaga.id">
                  <td>
                    <div class="font-medium text-primary">{{ vaga.codigo }}</div>
                    <div class="text-xs text-muted mt-1">{{ vaga.logradouro }}, {{ vaga.numero }}</div>
                    <div class="text-xs mt-1 text-muted">
                      {{ vaga.tamanho || 'N/A' }} • R$ {{ vaga.valorMinuto?.toFixed(2) || '1.00' }}/min • Máx: {{ vaga.limiteTempo }}min
                    </div>
                  </td>
                  <td class="text-right align-top pt-4">
                    <BadgeStatus :status="vaga.status" />
                  </td>
                </tr>
                <tr v-if="vagasStore.vagas.length === 0">
                  <td colspan="2" class="text-center text-muted p-6">
                    Nenhuma vaga cadastrada.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import NavBar from '@/components/NavBar.vue';
import BadgeStatus from '@/components/BadgeStatus.vue';
import { useVagasStore } from '@/stores/vagas';
import axios from 'axios';

const vagasStore = useVagasStore();

const form = ref({
  codigo: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: 'Cidade Padrão',
  latitude: -23.5505,
  longitude: -46.6333,
  tamanho: 'VAN',
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
      form.value.codigo = '';
      vagasStore.buscarVagas();
    }
  } catch (error) {
    alert('Erro ao cadastrar vaga');
  }
}
</script>

<style scoped>
.overflow-y-auto {
  overflow-y: auto;
}
.align-top {
  vertical-align: top;
}
.bg-gray-100 {
  background-color: #f5f5f5;
}
</style>
