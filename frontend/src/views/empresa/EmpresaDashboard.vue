<template>
  <div class="empresa-dashboard">
    <NavBar />
    <div class="container mt-6">
      
      <div class="header-simple flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 class="m-0">Dashboard Empresa</h2>
          <p class="text-muted text-sm m-0">Gestão de frota e créditos</p>
        </div>

        <div class="text-right">
          <div class="text-xs text-muted mb-1">Saldo em Créditos</div>
          <div class="text-xl font-bold mb-2">R$ {{ empresa?.creditos?.toFixed(2) || '0.00' }}</div>
          <button @click="adicionarCreditos" class="btn btn-outline btn-sm mb-2">Adicionar Fundos</button>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6 mb-6">
        
        <!-- Motoristas -->
        <div class="card p-0">
          <div class="p-4 border-b flex justify-between items-center">
            <h3 class="m-0 text-lg">Vínculos de Motoristas</h3>
          </div>
          
          <div class="p-4 bg-gray-50 border-b">
            <form @submit.prevent="vincularMotorista" class="flex gap-2">
              <input v-model="formVinculo.cpf" type="text" class="form-control" required placeholder="CPF: 000.000.000-00" />
              <button type="submit" class="btn btn-primary">Vincular</button>
            </form>
          </div>

          <div class="p-0">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th class="text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="v in vinculos" :key="v.id">
                  <td class="font-medium">{{ v.motorista.nome }}</td>
                  <td class="text-muted">{{ v.motorista.cpf }}</td>
                  <td class="text-right">
                    <button v-if="v.status === 'ATIVO'" @click="desvincular(v.motorista.id)" class="btn btn-sm text-danger" style="border:none">
                      Remover
                    </button>
                  </td>
                </tr>
                <tr v-if="vinculos.length === 0">
                  <td colspan="3" class="text-center text-muted p-4">Nenhum vínculo.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Veículos -->
        <div class="card p-0">
          <div class="p-4 border-b flex justify-between items-center">
            <h3 class="m-0 text-lg">Frota Cadastrada</h3>
          </div>
          
          <div class="p-4 bg-gray-50 border-b">
            <form @submit.prevent="cadastrarVeiculo" class="flex gap-2">
              <input v-model="formVeiculo.placa" type="text" class="form-control" placeholder="Placa" required maxlength="8" />
              <input v-model="formVeiculo.renavam" type="text" class="form-control" placeholder="Renavam" required />
              <select v-model="formVeiculo.tipo" class="form-control w-auto" required>
                <option value="CAMINHAO">Caminhão</option>
                <option value="VAN">Van</option>
                <option value="UTILITARIO">Utilitário</option>
              </select>
              <button type="submit" class="btn btn-primary">Add</button>
            </form>
          </div>

          <div class="p-4">
            <div v-for="v in empresa?.veiculos" :key="v.id" class="mb-4 pb-4 border-b last:border-0 last:pb-0 last:mb-0">
              <div class="flex justify-between items-center mb-2">
                <span class="font-bold font-mono">{{ v.placa }}</span>
                <span class="text-xs text-muted">{{ v.tipo }}</span>
              </div>
              
              <div class="text-sm">
                <div class="flex gap-2 mb-2">
                  <select class="form-control text-sm py-1 px-2 h-8" v-model="v.novoMotoristaId">
                    <option :value="undefined" disabled>Atribuir motorista...</option>
                    <option v-for="vinc in vinculos.filter((vi: any) => vi.status === 'ATIVO')" :key="vinc.motorista.id" :value="vinc.motorista.id">
                      {{ vinc.motorista.nome }}
                    </option>
                  </select>
                  <button @click="atribuirMotorista(v.id, v.novoMotoristaId)" class="btn btn-sm btn-outline h-8">Atribuir</button>
                </div>
                
                <div v-if="v.atribuicoes && v.atribuicoes.length > 0">
                  <div class="text-xs text-muted mb-1 mt-2">No veículo:</div>
                  <div v-for="atr in v.atribuicoes" :key="atr.id" class="flex justify-between items-center py-1 text-xs">
                    <span>{{ atr.motorista.nome }}</span>
                    <button @click="desatribuirMotorista(v.id, atr.motoristaId)" class="text-danger" style="background:none;border:none;cursor:pointer;">
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="!empresa?.veiculos?.length" class="text-center text-muted p-4">
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
import { useUsuarioStore } from '@/stores/usuario';
import NavBar from '@/components/NavBar.vue';
import axios from 'axios';

const usuarioStore = useUsuarioStore();
const empresa = ref<any>(null);
const vinculos = ref<any[]>([]);

const formVinculo = ref({
  cpf: '',
  tipoAcesso: 'FIXO'
});

const formVeiculo = ref({
  placa: '',
  renavam: '',
  tipo: 'CAMINHAO'
});

async function carregarDados() {
  const empId = usuarioStore.empresa?.id;
  if (!empId) return;
  try {
    const res = await axios.get(`/api/empresas/${empId}`);
    empresa.value = res.data;
    vinculos.value = res.data.vinculos || [];
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  carregarDados();
});

async function cadastrarVeiculo() {
  try {
    await axios.post('/api/veiculos', {
      ...formVeiculo.value,
      empresaId: empresa.value.id
    });
    formVeiculo.value = { placa: '', renavam: '', tipo: 'CAMINHAO' };
    await carregarDados();
  } catch (error: any) {
    alert(error.response?.data?.erro || 'Erro ao cadastrar veículo');
  }
}

async function atribuirMotorista(veiculoId: number, motoristaId?: number) {
  if (!motoristaId) return;
  try {
    await axios.post(`/api/veiculos/${veiculoId}/atribuir`, { motoristaId });
    await carregarDados();
  } catch (error: any) {
    alert(error.response?.data?.erro || 'Erro ao atribuir motorista.');
  }
}

async function desatribuirMotorista(veiculoId: number, motoristaId: number) {
  try {
    await axios.post(`/api/veiculos/${veiculoId}/desatribuir`, { motoristaId });
    await carregarDados();
  } catch (error: any) {
    alert('Erro ao desatribuir motorista.');
  }
}

async function adicionarCreditos() {
  const valorStr = prompt("Valor a recarregar:");
  if (!valorStr) return;
  const valor = parseFloat(valorStr);
  if (valor > 0) {
    await axios.post(`/api/empresas/${empresa.value.id}/creditos`, { valor });
    await carregarDados();
  }
}

async function vincularMotorista() {
  try {
    await axios.post(`/api/empresas/${empresa.value.id}/vincular`, {
      ...formVinculo.value,
      expiraEm: null
    });
    formVinculo.value = { cpf: '', tipoAcesso: 'FIXO' };
    await carregarDados();
  } catch (error: any) {
    alert(error.response?.data?.erro || 'Erro ao vincular motorista.');
  }
}

async function desvincular(motoristaId: number) {
  try {
    await axios.post(`/api/empresas/${empresa.value.id}/desvincular`, { motoristaId });
    await carregarDados();
  } catch (error) {
    alert('Erro ao desvincular.');
  }
}
</script>

<style scoped>
.font-mono {
  font-family: monospace;
}
.bg-gray-50 {

}
.last\:border-0:last-child {
  border-bottom: 0;
}
.last\:pb-0:last-child {
  padding-bottom: 0;
}
.last\:mb-0:last-child {
  margin-bottom: 0;
}
</style>
