<template>
  <div class="motorista-carteira">
    <NavBar />
    <div class="container mt-6">
      <div class="header-simple border-b pb-4 mb-6">
        <h2 class="m-0">Minha Carteira</h2>
        <p class="text-muted text-sm m-0">Gerencie seus saldos e veículos cadastrados</p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- Saldo Pessoal -->
        <div class="card p-0 h-full flex flex-col">
          <div class="p-4 border-b">
            <h3 class="m-0 text-lg">Saldo em Conta</h3>
          </div>
          <div class="p-6 flex-1 flex flex-col justify-center items-center">
            <div class="text-3xl font-bold text-primary mb-6">
              R$ {{ motorista?.creditos?.toFixed(2) || '0.00' }}
            </div>
            <button @click="adicionarCreditos" class="btn btn-primary w-full max-w-[200px]">
              Adicionar Fundos
            </button>
          </div>
        </div>

        <!-- Veículos Pessoais -->
        <div class="card p-0 flex flex-col" style="max-height: 500px">
          <div class="p-4 border-b">
            <h3 class="m-0 text-lg">Meus Veículos</h3>
          </div>
          
          <div class="p-4 bg-gray-50 border-b">
            <form @submit.prevent="cadastrarVeiculo" class="flex gap-2">
              <input v-model="formVeiculo.placa" type="text" class="form-control" placeholder="Placa" required maxlength="8" />
              <select v-model="formVeiculo.tipo" class="form-control w-auto" required>
                <option value="CAMINHAO">Caminhão</option>
                <option value="VAN">Van</option>
                <option value="UTILITARIO">Utilitário</option>
              </select>
              <button type="submit" class="btn btn-primary">Add</button>
            </form>
          </div>

          <div class="flex-1 overflow-y-auto p-0">
            <table class="w-full">
              <tbody>
                <tr v-for="v in motorista?.veiculos" :key="v.id">
                  <td class="p-4">
                    <div class="font-bold font-mono">{{ v.placa }}</div>
                    <div class="text-xs text-muted">{{ v.tipo }}</div>
                  </td>
                </tr>
                <tr v-if="!motorista?.veiculos?.length">
                  <td class="text-center text-muted p-6">
                    Nenhum veículo cadastrado.
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
import { useUsuarioStore } from '@/stores/usuario';
import axios from 'axios';

const usuarioStore = useUsuarioStore();
const motorista = ref<any>(null);

const formVeiculo = ref({
  placa: '',
  renavam: '11111111111', // Dummy
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
  const valorStr = prompt("Valor a recarregar:");
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
    formVeiculo.value = { placa: '', renavam: '11111111111', tipo: 'CAMINHAO' };
    await carregarDados();
  } catch (error: any) {
    alert(error.response?.data?.erro || 'Erro ao cadastrar veículo');
  }
}
</script>

<style scoped>
.font-mono {
  font-family: monospace;
}
.bg-gray-50 {

}
.max-w-\[200px\] {
  max-width: 200px;
}
</style>
