<template>
  <div class="empresa-dashboard">
    <NavBar />
    
    <div class="desktop-app-window">
      <!-- Toolbar Superior tipo Desktop App -->
      <div class="desktop-toolbar">
        <div class="toolbar-group">
          <button class="tool-btn" :class="{ active: activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">
            <span class="material-symbols-outlined" style="font-size: 18px;">sensors</span> Visão em Tempo Real
          </button>
          <button class="tool-btn" :class="{ active: activeTab === 'frota' }" @click="activeTab = 'frota'">
            <span class="material-symbols-outlined" style="font-size: 18px;">local_shipping</span> Frota
          </button>
          <button class="tool-btn" :class="{ active: activeTab === 'motoristas' }" @click="activeTab = 'motoristas'">
            <span class="material-symbols-outlined" style="font-size: 18px;">person</span> Motoristas
          </button>
        </div>
        
        <div class="toolbar-separator"></div>
        
        <div class="toolbar-group">
          <button class="tool-btn" @click="adicionarCreditos">
            <span class="material-symbols-outlined" style="font-size: 18px;">credit_card</span> Adicionar Fundos
          </button>
        </div>
        
        <div class="toolbar-spacer"></div>
        
        <div class="toolbar-info">
          Saldo Atual: <strong class="text-success">R$ {{ empresa?.creditos?.toFixed(2) || '0.00' }}</strong>
        </div>
      </div>

      <!-- Área de Trabalho Principal -->
      <div class="desktop-workspace">
        
        <!-- GUIA: DASHBOARD E CHARTS -->
        <div v-show="activeTab === 'dashboard'" class="workspace-panel">
          <div class="panel-header">Visão em Tempo Real e Operações</div>
          <div class="panel-body dashboard-grid">
            
            <!-- KPIs Topo -->
            <div class="kpi-row">
              <div class="kpi-box">
                <div class="kpi-title">Frota Total</div>
                <div class="kpi-value">{{ empresa?.veiculos?.length || 0 }}</div>
              </div>
              <div class="kpi-box">
                <div class="kpi-title">Sessões em Andamento</div>
                <div class="kpi-value text-success">{{ kpiSessoesAtivas }}</div>
              </div>
              <div class="kpi-box">
                <div class="kpi-title">Gastos (Este Mês)</div>
                <div class="kpi-value text-danger">R$ {{ kpiGastosMes.toFixed(2) }}</div>
              </div>
              <div class="kpi-box">
                <div class="kpi-title">Check-ins (Este Mês)</div>
                <div class="kpi-value text-primary">{{ kpiCheckinsMes }}</div>
              </div>
            </div>

            <!-- Gráficos -->
            <div class="charts-row">
              <div class="chart-box" style="flex: 2;">
                <div class="chart-header">Utilização de Vagas (Últimos 7 dias)</div>
                <div class="chart-content">
                  <LineChart :data="lineChartData" :options="chartOptions" />
                </div>
              </div>
              <div class="chart-box" style="flex: 1;">
                <div class="chart-header">Gastos por Veículo</div>
                <div class="chart-content">
                  <BarChart :data="barChartData" :options="chartOptions" />
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- GUIA: FROTA -->
        <div v-show="activeTab === 'frota'" class="workspace-panel">
          <div class="panel-header">Controle de Frota</div>
          <div class="panel-body split-view">
            
            <div class="split-sidebar">
              <div class="form-group-desktop">
                <label>Cadastrar Novo Veículo</label>
                <form @submit.prevent="cadastrarVeiculo" class="flex flex-col gap-2 mt-2">
                  <input v-model="formVeiculo.placa" type="text" class="input-desktop" placeholder="Placa (Ex: ABC1234)" required maxlength="8" />
                  <input v-model="formVeiculo.renavam" type="text" class="input-desktop" placeholder="Renavam" required />
                  <select v-model="formVeiculo.tipo" class="input-desktop" required>
                    <option value="CAMINHAO">Caminhão</option>
                    <option value="VAN">Van</option>
                    <option value="UTILITARIO">Utilitário</option>
                  </select>
                  <button type="submit" class="btn-desktop btn-primary-desktop mt-2">Salvar Veículo</button>
                </form>
              </div>
            </div>

            <div class="split-main">
              <div class="datagrid-container">
                <table class="datagrid">
                  <thead>
                    <tr>
                      <th>Placa</th>
                      <th>Tipo</th>
                      <th>Motoristas Atribuídos</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="v in empresa?.veiculos" :key="v.id">
                      <td class="font-mono font-bold">{{ v.placa }}</td>
                      <td>{{ v.tipo }}</td>
                      <td>
                        <div v-for="atr in v.atribuicoes" :key="atr.id" class="badge-motorista">
                          {{ atr.motorista.nome }}
                          <span class="remove-badge" @click="desatribuirMotorista(v.id, atr.motoristaId)">×</span>
                        </div>
                        <div v-if="!v.atribuicoes || v.atribuicoes.length === 0" class="text-xs text-muted">Nenhum motorista.</div>
                      </td>
                      <td>
                        <div class="flex gap-2">
                          <button class="btn-desktop btn-sm" @click="abrirModalAtribuir(v)">Atribuir</button>
                          <button class="btn-desktop btn-sm text-danger">Excluir</button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="!empresa?.veiculos?.length">
                      <td colspan="4" class="text-center text-muted py-4">Nenhum veículo na frota.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        <!-- GUIA: MOTORISTAS -->
        <div v-show="activeTab === 'motoristas'" class="workspace-panel">
          <div class="panel-header">Controle de Motoristas</div>
          <div class="panel-body split-view">
            
            <div class="split-sidebar">
              <div class="form-group-desktop">
                <label>Vincular Novo Motorista</label>
                <form @submit.prevent="vincularMotorista" class="flex flex-col gap-2 mt-2">
                  <input v-model="formVinculo.cpf" type="text" class="input-desktop" required placeholder="CPF: 000.000.000-00" />
                  <button type="submit" class="btn-desktop btn-primary-desktop mt-2">Vincular Conta</button>
                </form>
              </div>
            </div>

            <div class="split-main">
              <div class="datagrid-container">
                <table class="datagrid">
                  <thead>
                    <tr>
                      <th>Nome do Motorista</th>
                      <th>CPF</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="v in vinculos" :key="v.id">
                      <td class="font-bold">{{ v.motorista.nome }}</td>
                      <td class="font-mono text-muted">{{ v.motorista.cpf }}</td>
                      <td>
                        <span class="status-indicator" :class="v.status === 'ATIVO' ? 'active' : ''"></span>
                        {{ v.status }}
                      </td>
                      <td>
                        <button v-if="v.status === 'ATIVO'" @click="desvincular(v.motorista.id)" class="btn-desktop btn-sm text-danger">Desvincular</button>
                      </td>
                    </tr>
                    <tr v-if="vinculos.length === 0">
                      <td colspan="4" class="text-center text-muted py-4">Nenhum motorista vinculado.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- Status Bar -->
      <div class="desktop-statusbar">
        <div class="status-item">Pronto</div>
        <div class="status-spacer"></div>
        <div class="status-item">Conectado como: <strong>{{ empresa?.nome || 'Empresa' }}</strong></div>
        <div class="status-item">CNPJ: {{ empresa?.cnpj || '---' }}</div>
      </div>
      <!-- MODAL ATRIBUIR MOTORISTA -->
      <div class="modal-overlay" v-if="modalAtribuirAberto" @click.self="fecharModalAtribuir">
        <div class="modal-content">
          <div class="modal-header">
            <h4>Atribuir Motorista - {{ veiculoSelecionado?.placa }}</h4>
            <span class="modal-close" @click="fecharModalAtribuir">&times;</span>
          </div>
          <div class="modal-body">
            <p class="text-sm mb-4" style="color: #aaa;">Selecione o motorista para este veículo. Motoristas já atribuídos não aparecem na lista.</p>
            <select v-model="motoristaSelecionadoId" class="input-desktop w-full mb-4">
              <option :value="undefined" disabled>Selecione um motorista...</option>
              <option v-for="vinc in motoristasDisponiveis" :key="vinc.motorista.id" :value="vinc.motorista.id">
                {{ vinc.motorista.nome }} (CPF: {{ vinc.motorista.cpf }})
              </option>
            </select>
            <div v-if="motoristasDisponiveis.length === 0" class="text-danger text-sm mb-4">
              Não há motoristas disponíveis para atribuição.
            </div>
            <div class="flex justify-end gap-2">
              <button class="btn-desktop" @click="fecharModalAtribuir">Cancelar</button>
              <button class="btn-desktop btn-primary-desktop" :disabled="!motoristaSelecionadoId" @click="confirmarAtribuicao">Confirmar</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUsuarioStore } from '@/stores/usuario';
import NavBar from '@/components/NavBar.vue';
import axios from 'axios';

// Gráficos Imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line as LineChart, Bar as BarChart } from 'vue-chartjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

ChartJS.defaults.color = '#a0a0a0';
ChartJS.defaults.borderColor = '#333333';

const usuarioStore = useUsuarioStore();
const empresa = ref<any>(null);
const vinculos = ref<any[]>([]);
const historico = ref<any[]>([]);

const kpiSessoesAtivas = computed(() => {
  return historico.value.filter(s => s.status === 'ATIVA').length;
});

const kpiGastosMes = computed(() => {
  const agora = new Date();
  return historico.value.filter(s => {
    const d = new Date(s.iniciadaEm);
    return s.pagadorTipo === 'EMPRESA' && d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
  }).reduce((acc, curr) => acc + (curr.valorCobrado || 0), 0);
});

const kpiCheckinsMes = computed(() => {
  const agora = new Date();
  return historico.value.filter(s => {
    const d = new Date(s.iniciadaEm);
    return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
  }).length;
});

const activeTab = ref<'dashboard'|'frota'|'motoristas'>('dashboard');

const modalAtribuirAberto = ref(false);
const veiculoSelecionado = ref<any>(null);
const motoristaSelecionadoId = ref<number | undefined>(undefined);

const abrirModalAtribuir = (veiculo: any) => {
  veiculoSelecionado.value = veiculo;
  motoristaSelecionadoId.value = undefined;
  modalAtribuirAberto.value = true;
};

const fecharModalAtribuir = () => {
  modalAtribuirAberto.value = false;
  veiculoSelecionado.value = null;
  motoristaSelecionadoId.value = undefined;
};

const confirmarAtribuicao = async () => {
  if (veiculoSelecionado.value && motoristaSelecionadoId.value) {
    await atribuirMotorista(veiculoSelecionado.value.id, motoristaSelecionadoId.value);
    fecharModalAtribuir();
  }
};

const motoristasDisponiveis = computed(() => {
  if (!veiculoSelecionado.value) return [];
  const atribuidosIds = veiculoSelecionado.value.atribuicoes?.map((a: any) => a.motoristaId) || [];
  return vinculos.value.filter((vi: any) => 
    vi.status === 'ATIVO' && !atribuidosIds.includes(vi.motorista.id)
  );
});

const formVinculo = ref({
  cpf: '',
  tipoAcesso: 'FIXO'
});

const formVeiculo = ref({
  placa: '',
  renavam: '',
  tipo: 'CAMINHAO'
});

// Dados Reais para gráficos
const lineChartData = ref<any>({ labels: [], datasets: [] });
const barChartData = ref<any>({ labels: [], datasets: [] });

function atualizarGraficos() {
  // Gráfico de Linha (últimos 7 dias)
  const dias = [];
  const dados = [];
  for(let i=6; i>=0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dias.push(`${d.getDate()}/${d.getMonth()+1}`);
    const count = historico.value.filter(s => {
      const sd = new Date(s.iniciadaEm);
      return sd.getDate() === d.getDate() && sd.getMonth() === d.getMonth();
    }).length;
    dados.push(count);
  }
  lineChartData.value = {
    labels: dias,
    datasets: [{
      label: 'Check-ins da Frota',
      data: dados,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderWidth: 2,
      tension: 0.3,
      fill: true
    }]
  };

  // Gráfico de Barras (Gastos)
  const gastosPorVeiculo: Record<string, number> = {};
  historico.value.forEach(s => {
    if (s.pagadorTipo === 'EMPRESA' && s.valorCobrado) {
      const placa = s.veiculo?.placa || 'Desconhecido';
      if(!gastosPorVeiculo[placa]) gastosPorVeiculo[placa] = 0;
      gastosPorVeiculo[placa] += s.valorCobrado;
    }
  });
  const placas = Object.keys(gastosPorVeiculo);
  const valores = Object.values(gastosPorVeiculo);
  const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];
  barChartData.value = {
    labels: placas.length ? placas : ['Nenhum dado'],
    datasets: [{
      label: 'Gastos (R$)',
      data: valores.length ? valores : [0],
      backgroundColor: placas.map((_, i) => colors[i % colors.length]),
      borderRadius: 4
    }]
  };
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  }
};

async function carregarDados() {
  const empId = usuarioStore.empresa?.id;
  if (!empId) return;
  try {
    const [resEmp, resHist] = await Promise.all([
      axios.get(`/api/empresas/${empId}`),
      axios.get(`/api/empresas/${empId}/historico`)
    ]);
    empresa.value = resEmp.data;
    vinculos.value = resEmp.data.vinculos || [];
    historico.value = resHist.data.sessoes || [];
    
    atualizarGraficos();
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
/* ESTILO DESKTOP / C# FORMS MODERNIZADO */
.desktop-app-window {
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #e0e0e0;
}

/* TOOLBAR */
.desktop-toolbar {
  background-color: #2d2d2d;
  border-bottom: 1px solid #111;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  height: 48px;
}
.toolbar-group {
  display: flex;
  gap: 4px;
}
.toolbar-separator {
  width: 1px;
  height: 24px;
  background-color: #444;
  margin: 0 12px;
}
.toolbar-spacer {
  flex-grow: 1;
}
.toolbar-info {
  font-size: 13px;
  padding: 0 12px;
}
.tool-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #ccc;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}
.tool-btn:hover {
  background: #3a3a3a;
  border-color: #555;
}
.tool-btn.active {
  background: #1e1e1e;
  border-color: #111;
  border-bottom-color: #1e1e1e;
  color: #fff;
  font-weight: 600;
}

/* WORKSPACE */
.desktop-workspace {
  flex-grow: 1;
  background-color: #1e1e1e;
  position: relative;
  overflow: hidden;
}
.workspace-panel {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
}
.panel-header {
  background-color: #252526;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #333;
  color: #999;
}
.panel-body {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
}

/* STATUS BAR */
.desktop-statusbar {
  background-color: #007acc;
  color: #fff;
  height: 24px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 12px;
}
.status-spacer { flex-grow: 1; }
.status-item { padding: 0 8px; border-left: 1px solid rgba(255,255,255,0.2); }
.status-item:first-child { border-left: none; }

/* DASHBOARD GRID */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.kpi-box {
  background-color: #252526;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.kpi-title { font-size: 12px; color: #aaa; text-transform: uppercase; margin-bottom: 8px; }
.kpi-value { font-size: 28px; font-weight: 300; }

.charts-row {
  display: flex;
  gap: 16px;
}
.chart-box {
  background-color: #252526;
  border: 1px solid #333;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}
.chart-header {
  padding: 12px 16px;
  border-bottom: 1px solid #333;
  font-size: 13px;
  font-weight: 600;
}
.chart-content {
  padding: 16px;
  height: 250px;
}

/* SPLIT VIEW (Forms) */
.split-view {
  display: flex;
  gap: 16px;
  padding: 0;
  height: 100%;
}
.split-sidebar {
  width: 300px;
  background-color: #252526;
  border-right: 1px solid #333;
  padding: 16px;
}
.split-main {
  flex-grow: 1;
  padding: 16px;
  overflow-y: auto;
}

/* CONTROLES DESKTOP */
.form-group-desktop label {
  font-size: 12px;
  font-weight: 600;
  color: #ccc;
  margin-bottom: 4px;
}
.input-desktop {
  background-color: #3c3c3c;
  border: 1px solid #555;
  color: #fff;
  padding: 6px 8px;
  font-size: 13px;
  border-radius: 2px;
  width: 100%;
}
.input-desktop:focus { border-color: #007acc; outline: none; }
.input-sm { padding: 2px 4px; font-size: 12px; }

.btn-desktop {
  background-color: #3c3c3c;
  border: 1px solid #555;
  color: #fff;
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 2px;
  cursor: pointer;
}
.btn-desktop:hover { background-color: #505050; }
.btn-primary-desktop {
  background-color: #0e639c;
  border-color: #1177bb;
}
.btn-primary-desktop:hover { background-color: #1177bb; }
.btn-sm { padding: 4px 8px; font-size: 12px; }
.text-danger { color: #f48771 !important; }

/* DATAGRID */
.datagrid-container {
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #1e1e1e;
  overflow: hidden;
}
.datagrid {
  width: 100%;
  border-collapse: collapse;
}
.datagrid th {
  background-color: #2d2d2d;
  color: #ccc;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid #444;
  border-right: 1px solid #444;
}
.datagrid td {
  padding: 8px 12px;
  border-bottom: 1px solid #333;
  border-right: 1px solid #333;
  font-size: 13px;
}
.datagrid tr:hover td {
  background-color: #2a2d2e;
}
.font-mono { font-family: Consolas, monospace; }

/* BADGES */
.badge-motorista {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: #333;
  border: 1px solid #555;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 11px;
  margin-right: 4px;
  margin-bottom: 4px;
}
.remove-badge {
  color: #f48771;
  cursor: pointer;
  font-weight: bold;
}
.remove-badge:hover { color: #ff5555; }

.status-indicator {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  background-color: #555;
  margin-right: 6px;
}
.status-indicator.active { background-color: #10b981; box-shadow: 0 0 5px #10b981; }

.text-success { color: #10b981 !important; }
.text-primary { color: #3b82f6 !important; }

/* MODAL / POPUP */
.modal-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background-color: #252526;
  border: 1px solid #444;
  border-radius: 6px;
  width: 400px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
}
.modal-header {
  padding: 12px 16px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h4 { margin: 0; font-size: 14px; font-weight: 600; }
.modal-close { cursor: pointer; font-size: 18px; color: #aaa; }
.modal-close:hover { color: #fff; }
.modal-body { padding: 16px; }
.w-full { width: 100%; }
.flex.justify-end { justify-content: flex-end; }
</style>
