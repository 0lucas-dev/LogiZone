<template>
  <div class="motorista-carteira">
    <NavBar />
    <div class="container mt-4">
      <div class="header mb-6">
        <h2>Minha Carteira & Veículos</h2>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <!-- Saldo Pessoal -->
        <div class="card text-center p-6">
          <h3 class="text-lg text-muted mb-2">Saldo Pessoal</h3>
          <div class="text-4xl font-bold text-green-600 mb-4">
            R$ {{ motorista?.creditos?.toFixed(2) || '0.00' }}
          </div>
          <button @click="adicionarCreditos" class="btn btn-primary">
            + Adicionar Créditos (Simular)
          </button>
        </div>

        <!-- Veículos Pessoais -->
        <div class="card">
          <h3 class="mb-4">Meus Veículos</h3>
          <form @submit.prevent="cadastrarVeiculo" class="mb-4 pb-4 border-b">
            <div class="grid grid-cols-2 gap-2 mb-2">
              <input v-model="formVeiculo.placa" type="text" class="form-control" placeholder="Placa (Ex: ABC1234)" required maxlength="8" />
              <input v-model="formVeiculo.renavam" type="text" class="form-control" placeholder="RENAVAM" required />
            </div>
            <div class="flex gap-2">
              <select v-model="formVeiculo.tipo" class="form-control" required>
                <option value="CAMINHAO">Caminhão</option>
                <option value="VAN">Van</option>
                <option value="UTILITARIO">Utilitário</option>
              </select>
              <button type="submit" class="btn btn-secondary" style="background-color: var(--primary); color: white;">Adicionar</button>
            </div>
          </form>

          <div class="veiculos-lista">
            <div v-for="v in motorista?.veiculos" :key="v.id" class="p-2 border rounded mb-2 flex justify-between items-center">
              <div>
                <strong>{{ v.placa }}</strong>
                <div class="text-xs text-muted">{{ v.tipo }}</div>
              </div>
            </div>
            <div v-if="!motorista?.veiculos?.length" class="text-sm text-muted">
              Nenhum veículo cadastrado.
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
import { useUsuarioStore } from '@/stores/usuario';
import axios from 'axios';

const usuarioStore = useUsuarioStore();
const motorista = ref<any>(null);

const formVeiculo = ref({
  placa: '',
  renavam: '',
  tipo: 'CAMINHAO'
});

async function carregarDados() {
  if (!usuarioStore.motorista?.id) return;
  try {
    const res = await axios.get(`/api/motoristas/${usuarioStore.motorista.id}/perfil`);
    motorista.value = res.data.dados;
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  carregarDados();
});

async function adicionarCreditos() {
  const valorStr = prompt("Valor a recarregar (Simulação):");
  if (!valorStr) return;
  const valor = parseFloat(valorStr);
  if (valor > 0) {
    await axios.post(`/api/motoristas/${motorista.value.id}/creditos`, { valor });
    await carregarDados();
  }
}

async function cadastrarVeiculo() {
  try {
    await axios.post('/api/veiculos', {
      ...formVeiculo.value,
      motoristaId: motorista.value.id
    });
    alert('Veículo cadastrado!');
    formVeiculo.value = { placa: '', renavam: '', tipo: 'CAMINHAO' };
    await carregarDados();
  } catch (error: any) {
    alert(error.response?.data?.erro || 'Erro ao cadastrar veículo');
  }
}
</script>
