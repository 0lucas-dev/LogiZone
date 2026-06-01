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
          <div class="p-4 border-b flex justify-between items-center">
            <h3 class="m-0 text-lg">{{ vagaEditandoId ? 'Editar Vaga' : 'Nova Vaga' }}</h3>
            <button v-if="vagaEditandoId" type="button" class="btn btn-sm text-muted" @click="cancelarEdicao">
              Cancelar
            </button>
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
              {{ vagaEditandoId ? 'Atualizar Vaga' : 'Cadastrar Vaga' }}
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
                    <div class="flex flex-col items-end gap-2">
                      <BadgeStatus :status="vaga.status" />
                      <div class="flex gap-2 mt-2">
                        <button @click="editarVaga(vaga)" class="text-xs text-primary bg-transparent border-0 cursor-pointer p-0 hover:underline">
                          Editar
                        </button>
                        <button @click="excluirVaga(vaga.id)" class="text-xs text-error bg-transparent border-0 cursor-pointer p-0 hover:underline">
                          Excluir
                        </button>
                      </div>
                    </div>
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

const vagaEditandoId = ref<number | null>(null);

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

function cancelarEdicao() {
  vagaEditandoId.value = null;
  form.value = {
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
  };
}

function editarVaga(vaga: any) {
  vagaEditandoId.value = vaga.id;
  form.value = {
    codigo: vaga.codigo,
    logradouro: vaga.logradouro,
    numero: vaga.numero,
    bairro: vaga.bairro,
    cidade: vaga.cidade,
    latitude: vaga.latitude,
    longitude: vaga.longitude,
    tamanho: vaga.tamanho || 'VAN',
    valorMinuto: vaga.valorMinuto || 1.00,
    limiteTempo: vaga.limiteTempo || 45
  };
  // scroll para o topo para ver o formulário
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function excluirVaga(id: number) {
  if (confirm('Tem certeza que deseja excluir esta vaga?')) {
    try {
      const res = await axios.delete(`/api/vagas/${id}`);
      if (res.data.sucesso) {
        vagasStore.buscarVagas();
        if (vagaEditandoId.value === id) {
          cancelarEdicao();
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.erro || 'Erro ao excluir vaga');
    }
  }
}

onMounted(() => {
  vagasStore.buscarVagas();
});

async function adicionarVaga() {
  try {
    let res;
    if (vagaEditandoId.value) {
      res = await axios.patch(`/api/vagas/${vagaEditandoId.value}`, form.value);
    } else {
      res = await axios.post('/api/vagas', form.value);
    }
    
    if (res.data.sucesso) {
      cancelarEdicao();
      vagasStore.buscarVagas();
    }
  } catch (error: any) {
    alert(error.response?.data?.erro || 'Erro ao salvar vaga');
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
.text-error {
  color: #dc3545;
}
</style>
