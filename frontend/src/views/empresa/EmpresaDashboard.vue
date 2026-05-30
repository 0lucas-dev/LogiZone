<template>
  <div class="empresa-dashboard">
    <NavBar />
    <div class="container mt-4">
      <div class="header flex justify-between items-center mb-6">
        <h2>Painel da Empresa</h2>
        <div class="card p-3" style="min-width: 200px">
          <div class="text-sm text-muted">Saldo de Créditos</div>
          <div class="text-2xl font-bold text-green-600">R$ {{ empresa?.creditos.toFixed(2) }}</div>
          <button @click="adicionarCreditos" class="btn btn-sm btn-outline mt-2 w-full">+ Adicionar</button>
        </div>
      </div>

      <div class="card mb-4">
        <h3>Vincular Motorista (Autorizar Uso de Créditos)</h3>
        <form @submit.prevent="vincularMotorista">
          <div class="grid md:grid-cols-3 gap-3">
            <div class="form-group">
              <label>CPF do Motorista</label>
              <input v-model="formVinculo.cpf" type="text" class="form-control" required placeholder="000.000.000-00" />
            </div>
            <div class="form-group">
              <label>Tipo de Vínculo</label>
              <select v-model="formVinculo.tipoAcesso" class="form-control">
                <option value="FIXO">Fixo (Sempre Ativo)</option>
                <option value="TEMPORARIO">Temporário (Autônomo)</option>
              </select>
            </div>
            <div class="form-group" v-if="formVinculo.tipoAcesso === 'TEMPORARIO'">
              <label>Validade (Horas)</label>
              <input v-model="horasValidade" type="number" class="form-control" required min="1" />
            </div>
          </div>
          <button type="submit" class="btn mt-3" style="background-color:#4f46e5;color:white">Vincular Motorista</button>
        </form>
      </div>

      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <div class="card">
          <h3>Motoristas Vinculados</h3>
          <table class="w-full text-left border-collapse mt-3">
            <thead>
              <tr class="border-b">
                <th class="p-2">Nome / CPF</th>
                <th class="p-2">Acesso</th>
                <th class="p-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in vinculos" :key="v.id" class="border-b">
                <td class="p-2">{{ v.motorista.nome }}<br><small class="text-muted">{{ v.motorista.cpf }}</small></td>
                <td class="p-2">
                  <span class="badge" :class="v.status === 'ATIVO' ? 'badge-ativo' : 'badge-desativado'">{{ v.status }}</span><br>
                  <small class="text-xs">{{ v.tipoAcesso }}</small>
                </td>
                <td class="p-2">
                  <button v-if="v.status === 'ATIVO'" @click="desvincular(v.motorista.id)" class="text-red-600 underline text-sm">
                    Desvincular
                  </button>
                </td>
              </tr>
              <tr v-if="vinculos.length === 0">
                <td colspan="3" class="p-4 text-center text-muted">Nenhum motorista vinculado.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>Veículos da Empresa</h3>
          <form @submit.prevent="cadastrarVeiculo" class="mb-4 pb-4 border-b">
            <div class="grid grid-cols-2 gap-2 mb-2">
              <input v-model="formVeiculo.placa" type="text" class="form-control" placeholder="Placa" required maxlength="8" />
              <input v-model="formVeiculo.renavam" type="text" class="form-control" placeholder="RENAVAM" required />
            </div>
            <div class="flex gap-2">
              <select v-model="formVeiculo.tipo" class="form-control" required>
                <option value="CAMINHAO">Caminhão</option>
                <option value="VAN">Van</option>
                <option value="UTILITARIO">Utilitário</option>
              </select>
              <button type="submit" class="btn btn-secondary flex-1" style="background-color: var(--primary); color: white;">Adicionar</button>
            </div>
          </form>

          <div class="veiculos-lista">
            <div v-for="v in empresa?.veiculos" :key="v.id" class="p-2 border rounded mb-2">
              <div class="flex justify-between items-center mb-2">
                <div>
                  <strong>{{ v.placa }}</strong> <span class="text-xs text-muted">({{ v.tipo }})</span>
                </div>
              </div>
              <div class="mt-2 pt-2 border-t text-sm">
                <div class="font-bold mb-1 text-xs text-muted">Atribuir Motorista:</div>
                <div class="flex gap-2">
                  <select class="form-control text-sm py-1" v-model="v.novoMotoristaId">
                    <option :value="undefined" disabled>Selecione...</option>
                    <option v-for="vinc in vinculos.filter(vi => vi.status === 'ATIVO')" :key="vinc.motorista.id" :value="vinc.motorista.id">
                      {{ vinc.motorista.nome }} ({{ vinc.motorista.cpf }})
                    </option>
                  </select>
                  <button @click="atribuirMotorista(v.id, v.novoMotoristaId)" class="btn btn-sm btn-outline py-1">Atribuir</button>
                </div>
                
                <div class="mt-2" v-if="v.atribuicoes && v.atribuicoes.length > 0">
                  <div class="text-xs text-muted mb-1 font-bold">Motoristas Atribuídos:</div>
                  <div v-for="atr in v.atribuicoes" :key="atr.id" class="flex justify-between items-center bg-gray-50 p-1 mb-1 rounded text-xs">
                    <span>{{ atr.motorista.nome }}</span>
                    <button @click="desatribuirMotorista(v.id, atr.motoristaId)" class="text-red-500 underline text-xs">Remover</button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="!empresa?.veiculos?.length" class="text-sm text-muted">
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
const horasValidade = ref(24);

const formVeiculo = ref({
  placa: '',
  renavam: '',
  tipo: 'CAMINHAO'
});

async function carregarDados() {
  const empId = usuarioStore.empresa.id;
  try {
    const res = await axios.get(`/api/empresas/${empId}`);
    empresa.value = res.data;
    vinculos.value = res.data.vinculos;
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
    alert('Veículo cadastrado!');
    formVeiculo.value = { placa: '', renavam: '', tipo: 'CAMINHAO' };
    await carregarDados();
  } catch (error: any) {
    alert(error.response?.data?.erro || 'Erro ao cadastrar veículo');
  }
}

async function atribuirMotorista(veiculoId: number, motoristaId?: number) {
  if (!motoristaId) return alert("Selecione um motorista primeiro.");
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
  const valorStr = prompt("Valor a recarregar (Simulação):");
  if (!valorStr) return;
  const valor = parseFloat(valorStr);
  if (valor > 0) {
    await axios.post(`/api/empresas/${empresa.value.id}/creditos`, { valor });
    await carregarDados();
  }
}

async function vincularMotorista() {
  try {
    let expiraEm = null;
    if (formVinculo.value.tipoAcesso === 'TEMPORARIO') {
      expiraEm = new Date();
      expiraEm.setHours(expiraEm.getHours() + horasValidade.value);
    }

    await axios.post(`/api/empresas/${empresa.value.id}/vincular`, {
      ...formVinculo.value,
      expiraEm
    });
    alert('Motorista vinculado com sucesso!');
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
.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: bold;
}
.badge-ativo { background-color: #d1fae5; color: #065f46; }
.badge-desativado { background-color: #fee2e2; color: #b91c1c; }
</style>
