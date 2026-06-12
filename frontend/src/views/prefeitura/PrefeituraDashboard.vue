<template>
  <div class="prefeitura-dashboard">
    <NavBar />
    <div class="container mt-6">
      <div class="header-simple flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h2 class="m-0">Prefeitura LogiZone</h2>
          <p class="text-muted text-sm m-0">Monitoramento e cadastro de vagas do município</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-sm" :class="activeTab === 'dashboard' ? 'btn-primary' : ''" @click="activeTab = 'dashboard'">
            <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: text-bottom;">dashboard</span> Visão Geral
          </button>
          <button class="btn btn-sm" :class="activeTab === 'vagas' ? 'btn-primary' : ''" @click="activeTab = 'vagas'">
            <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: text-bottom;">local_parking</span> Gestão de Vagas
          </button>
        </div>
      </div>

      <!-- VISÃO GERAL / DASHBOARD -->
      <div v-show="activeTab === 'dashboard'">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="card p-4 text-center border-l-4" style="border-left-color: #10b981;">
            <span class="material-symbols-outlined text-muted mb-2" style="font-size: 32px;">done_all</span>
            <div class="text-3xl font-bold" style="color: #10b981;">{{ relatorio.vagasLivres }}</div>
            <div class="text-sm text-muted">Vagas Livres</div>
          </div>
          <div class="card p-4 text-center border-l-4" style="border-left-color: #f59e0b;">
            <span class="material-symbols-outlined text-muted mb-2" style="font-size: 32px;">directions_car</span>
            <div class="text-3xl font-bold" style="color: #f59e0b;">{{ relatorio.vagasOcupadas }}</div>
            <div class="text-sm text-muted">Vagas Ocupadas</div>
          </div>
          <div class="card p-4 text-center border-l-4" style="border-left-color: #ef4444;">
            <span class="material-symbols-outlined text-muted mb-2" style="font-size: 32px;">warning</span>
            <div class="text-3xl font-bold" style="color: #ef4444;">{{ relatorio.vagasIrregulares }}</div>
            <div class="text-sm text-muted">Irregulares / Vencidas</div>
          </div>
          <div class="card p-4 text-center border-l-4" style="border-left-color: #3b82f6;">
            <span class="material-symbols-outlined text-muted mb-2" style="font-size: 32px;">receipt_long</span>
            <div class="text-3xl font-bold" style="color: #3b82f6;">{{ relatorio.totalInfracoesHoje }}</div>
            <div class="text-sm text-muted">Infrações (Hoje)</div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="card p-4">
            <h3 class="m-0 mb-4 text-base border-b pb-2">Veículos nas Vagas Agora</h3>
            <div style="height: 250px; display: flex; justify-content: center; align-items: center;">
              <Doughnut v-if="chartData.datasets && chartData.datasets.length" :data="chartData" :options="chartOptions" />
              <div v-else class="text-muted text-sm">Sem veículos estacionados.</div>
            </div>
          </div>
          <div class="card p-4 flex flex-col justify-between">
            <div>
              <h3 class="m-0 mb-4 text-base border-b pb-2">Resumo Operacional Diário</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center border-b pb-2">
                  <span class="text-muted">Total de Vagas Físicas</span>
                  <span class="font-bold text-lg">{{ relatorio.totalVagas }}</span>
                </div>
                <div class="flex justify-between items-center border-b pb-2">
                  <span class="text-muted">Sessões Realizadas Hoje</span>
                  <span class="font-bold text-lg">{{ relatorio.totalSessoesHoje }}</span>
                </div>
                <div class="flex justify-between items-center pb-2">
                  <span class="text-muted">Ponto de Maior Uso (Hoje)</span>
                  <span class="font-bold text-lg text-primary">{{ relatorio.vagaMaisUsada || 'Nenhum' }}</span>
                </div>
              </div>
            </div>
            <button @click="carregarRelatorio" class="btn btn-sm btn-outline w-full mt-4 flex justify-center items-center gap-2">
              <span class="material-symbols-outlined" style="font-size: 16px;">refresh</span> Atualizar Dados
            </button>
          </div>
        </div>
      </div>

      <!-- GESTÃO DE VAGAS -->
      <div v-show="activeTab === 'vagas'" class="grid md:grid-cols-2 gap-6">
        <!-- Adicionar Nova Vaga -->
        <div class="card p-0">
          <div class="p-4 border-b flex justify-between items-center">
            <h3 class="m-0 text-lg">{{ vagaEditandoId ? 'Editar Vaga' : 'Nova Vaga' }}</h3>
            <button v-if="vagaEditandoId" type="button" class="btn btn-sm text-muted" @click="cancelarEdicao">
              Cancelar
            </button>
          </div>
          <form @submit.prevent="adicionarVaga" class="p-4">
            <!-- Seção 1: Identificação e Regras -->
            <div class="mb-4">
              <h4 class="text-sm font-semibold mb-2 text-primary border-b pb-1">Identificação e Regras</h4>
              <div class="grid grid-cols-2 gap-3">
                <div class="form-group">
                  <label>Código</label>
                  <input v-model="form.codigo" type="text" class="form-control" required placeholder="Ex: VAGA-001" />
                </div>
                <div class="form-group">
                  <label>Tamanho</label>
                  <select v-model="form.tamanho" class="form-control" required>
                    <option value="UTILITARIO">Utilitário</option>
                    <option value="VAN">Van</option>
                    <option value="CAMINHAO">Caminhão</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Veículos Permitidos</label>
                  <input v-model="form.tiposVeiculos" type="text" class="form-control" placeholder="TODOS, CAMINHAO..." />
                </div>
                <div class="form-group">
                  <label>Horários</label>
                  <input v-model="form.horariosDisponiveis" type="text" class="form-control" placeholder="08:00 - 18:00" />
                </div>
                <div class="form-group">
                  <label>Valor / Minuto (R$)</label>
                  <input v-model.number="form.valorMinuto" type="number" step="0.01" class="form-control" required />
                </div>
                <div class="form-group">
                  <label>Tempo Máx (min)</label>
                  <input v-model.number="form.limiteTempo" type="number" class="form-control" required />
                </div>
              </div>
            </div>

            <!-- Seção 2: Localização -->
            <div class="mb-2">
              <h4 class="text-sm font-semibold mb-2 text-primary border-b pb-1 flex justify-between items-center">
                <span>Localização</span>
                <span class="text-xs text-muted font-normal">Dica: Clique no mapa para preencher</span>
              </h4>
              <div class="grid grid-cols-2 gap-3">
                <div class="form-group col-span-2">
                  <label>Logradouro</label>
                  <input v-model="form.logradouro" type="text" class="form-control" required />
                </div>
                <div class="form-group">
                  <label>Número</label>
                  <input v-model="form.numero" type="text" class="form-control" required />
                </div>
                <div class="form-group">
                  <label>Bairro</label>
                  <input v-model="form.bairro" type="text" class="form-control" required />
                </div>
                <div class="form-group">
                  <label>Latitude</label>
                  <input v-model.number="form.latitude" type="number" step="any" class="form-control" required />
                </div>
                <div class="form-group">
                  <label>Longitude</label>
                  <input v-model.number="form.longitude" type="number" step="any" class="form-control" required />
                </div>
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
            <div class="flex gap-2">
              <button class="btn btn-sm" :class="modoView === 'lista' ? 'btn-primary' : ''" @click="modoView = 'lista'">Lista</button>
              <button class="btn btn-sm" :class="modoView === 'mapa' ? 'btn-primary' : ''" @click="modoView = 'mapa'">Mapa</button>
            </div>
            <span class="badge-pill bg-gray-100">{{ vagasStore.vagas.length }}</span>
          </div>
          
          <div v-show="vagasStore.carregando && vagasStore.vagas.length === 0" class="text-center p-6 text-muted">
            <div class="spinner mb-2"></div>
            <div>Carregando vagas...</div>
          </div>
          
          <div v-show="vagasStore.vagas.length > 0" class="flex-1 overflow-y-auto p-0 relative">
            <div v-show="modoView === 'mapa'" style="height: 100%; min-height: 400px; width: 100%;">
              <div id="mapa-prefeitura" style="height: 100%; width: 100%; z-index: 1;"></div>
            </div>

            <table class="w-full" v-show="modoView === 'lista'">
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
                        <button 
                          @click="editarVaga(vaga)" 
                          :disabled="vaga.status === 'OCUPADA'"
                          class="text-xs bg-transparent border-0 cursor-pointer p-0"
                          :class="vaga.status === 'OCUPADA' ? 'text-muted' : 'text-primary hover:underline'">
                          Editar
                        </button>
                        <button 
                          @click="excluirVaga(vaga.id)" 
                          :disabled="vaga.status === 'OCUPADA'"
                          class="text-xs bg-transparent border-0 cursor-pointer p-0"
                          :class="vaga.status === 'OCUPADA' ? 'text-muted' : 'text-error hover:underline'">
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
import { ref, onMounted, watch, nextTick } from 'vue';
import NavBar from '@/components/NavBar.vue';
import BadgeStatus from '@/components/BadgeStatus.vue';
import { useVagasStore } from '@/stores/vagas';
import {
  Chart as ChartJS, Title, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale, LineElement, PointElement, ArcElement
} from 'chart.js';
import { Doughnut } from 'vue-chartjs';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, ArcElement);

const activeTab = ref('dashboard');
const relatorio = ref({
  totalVagas: 0,
  vagasLivres: 0,
  vagasOcupadas: 0,
  vagasIrregulares: 0,
  totalSessoesHoje: 0,
  totalInfracoesHoje: 0,
  vagaMaisUsada: null as string | null,
  veiculosOcupando: {} as Record<string, number>
});

const chartData = ref<any>({ labels: [], datasets: [] });
const chartOptions = { responsive: true, maintainAspectRatio: false };

async function carregarRelatorio() {
  try {
    const res = await axios.get('/api/relatorios/resumo');
    if (res.data.sucesso) {
      relatorio.value = res.data.dados;
      
      const vOcupando = relatorio.value.veiculosOcupando || {};
      const labels = Object.keys(vOcupando);
      const data = Object.values(vOcupando);
      
      if (labels.length === 0) {
        chartData.value = {
          labels: ['Nenhum veículo'],
          datasets: [{ data: [1], backgroundColor: ['#333333'] }]
        };
      } else {
        const bgColors = labels.map(l => {
          if (l === 'VAN') return '#0ea5e9';
          if (l === 'CAMINHAO') return '#f59e0b';
          if (l === 'UTILITARIO') return '#8b5cf6';
          return '#10b981';
        });
        chartData.value = {
          labels,
          datasets: [{
            data,
            backgroundColor: bgColors,
            borderWidth: 0
          }]
        };
      }
    }
  } catch (e) {
    console.error("Erro ao buscar relatório", e);
  }
}

const vagasStore = useVagasStore();
const modoView = ref<'lista' | 'mapa'>('lista');
let map: L.Map | null = null;
let markers: L.LayerGroup | null = null;

const vagaEditandoId = ref<number | null>(null);

const form = ref({
  codigo: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: 'Marília',
  latitude: -22.2139,
  longitude: -49.9458,
  tamanho: 'VAN',
  valorMinuto: 1.00,
  limiteTempo: 45,
  horariosDisponiveis: '08:00 - 18:00',
  tiposVeiculos: 'TODOS'
});

function cancelarEdicao() {
  vagaEditandoId.value = null;
  form.value = {
    codigo: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: 'Marília',
    latitude: -22.2139,
    longitude: -49.9458,
    tamanho: 'VAN',
    valorMinuto: 1.00,
    limiteTempo: 45,
    horariosDisponiveis: '08:00 - 18:00',
    tiposVeiculos: 'TODOS'
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
    limiteTempo: vaga.limiteTempo || 45,
    horariosDisponiveis: vaga.horariosDisponiveis || '08:00 - 18:00',
    tiposVeiculos: vaga.tiposVeiculos || 'TODOS'
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

const initMap = async () => {
  await nextTick();
  if (!map) {
    map = L.map('mapa-prefeitura').setView([-22.2139, -49.9458], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    markers = L.layerGroup().addTo(map);

    // Auto-preencher coordenadas ao clicar no mapa
    map.on('click', (e: L.LeafletMouseEvent) => {
      form.value.latitude = parseFloat(e.latlng.lat.toFixed(6));
      form.value.longitude = parseFloat(e.latlng.lng.toFixed(6));
    });
  }
  updateMarkers();
  setTimeout(() => { map?.invalidateSize(); }, 400);
};

const updateMarkers = () => {
  if (!map || !markers) return;
  markers.clearLayers();

  const bounds = L.latLngBounds([]);

  vagasStore.vagas.forEach(vaga => {
    if (vaga.latitude && vaga.longitude) {
      const latlng = L.latLng(vaga.latitude, vaga.longitude);
      bounds.extend(latlng);

      const color = vaga.status === 'LIVRE' ? 'green' : vaga.status === 'OCUPADA' ? 'red' : 'orange';
      
      const popupContent = `
        <div style="font-family: Arial, sans-serif; min-width: 150px;">
          <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid #ccc; padding-bottom: 4px; color: black">
            ${vaga.codigo} - <span style="color: ${color};">${vaga.status}</span>
          </h4>
          <p style="margin: 4px 0;"><strong><span class="material-symbols-outlined" style="font-size: 16px; vertical-align: text-bottom;">location_on</span></strong> ${vaga.logradouro}</p>
          ${vaga.status === 'OCUPADA'
            ? '<div style="margin-top: 8px; font-size: 12px; text-align: center; color: #888;">Vaga em uso</div>'
            : `<button onclick="document.dispatchEvent(new CustomEvent('editar-vaga', { detail: ${vaga.id} }))" style="margin-top: 8px; width: 100%; padding: 6px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Editar</button>`
          }
        </div>
      `;

      const marker = L.marker(latlng).bindPopup(popupContent);
      markers?.addLayer(marker);
    }
  });

  if (vagasStore.vagas.length > 0 && map) {
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 18 });
  }
};

watch(() => modoView.value, (newVal) => {
  if (newVal === 'mapa') {
    initMap();
    setTimeout(() => { map?.invalidateSize(); updateMarkers(); }, 200);
  }
});

watch(() => vagasStore.vagas, () => {
  if (modoView.value === 'mapa') updateMarkers();
}, { deep: true });

onMounted(() => {
  vagasStore.buscarVagas();
  carregarRelatorio();
  
  // Polling de 30 segundos
  setInterval(() => {
    if (activeTab.value === 'dashboard') {
      carregarRelatorio();
    }
  }, 30000);
  
  document.addEventListener('editar-vaga', ((e: CustomEvent) => {
    const v = vagasStore.vagas.find(v => v.id === e.detail);
    if(v) {
      modoView.value = 'lista';
      editarVaga(v);
    }
  }) as EventListener);
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
