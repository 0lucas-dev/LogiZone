<template>
  <div class="motorista-mapa">
    <NavBar />
    <div class="container mt-4">
      <div class="header-actions mb-4">
        <h2>Vagas Disponíveis</h2>
        <button 
          v-if="vagasStore.sessaoAtiva" 
          class="btn btn-warning"
          @click="irParaSessaoAtiva"
        >
          ⏱️ Meu Check-in Ativo
        </button>
      </div>

      <MapaVagas 
        :vagas="vagasStore.vagas" 
        :carregando="vagasStore.carregando"
        :mostrarBotaoCheckin="!vagasStore.sessaoAtiva"
        @checkin="abrirModalCheckin"
      />
    </div>

    <!-- Modal de Check-in (Pay-per-use) -->
    <div v-if="vagaSelecionada" class="modal-overlay">
      <div class="modal-content card">
        <h3 class="mb-4">Check-in: Vaga {{ vagaSelecionada.codigo }}</h3>
        
        <div class="info-vaga mb-4 text-sm text-muted">
          <div><strong>Local:</strong> {{ vagaSelecionada.logradouro }}, {{ vagaSelecionada.numero }}</div>
          <div><strong>Tarifa:</strong> R$ {{ vagaSelecionada.valorMinuto?.toFixed(2) }} / min</div>
          <div><strong>Tempo Máximo:</strong> {{ vagaSelecionada.limiteTempo }} min</div>
        </div>

        <form @submit.prevent="confirmarCheckin">
          <!-- Seleção de Veículo -->
          <div class="form-group mb-3">
            <label>Qual veículo você está usando?</label>
            <select v-model="form.veiculoId" class="form-control" required>
              <option value="" disabled>Selecione um veículo</option>
              
              <optgroup v-if="veiculosPessoais.length > 0" label="Meus Veículos (Pessoal)">
                <option v-for="v in veiculosPessoais" :key="v.id" :value="v.id">
                  {{ v.placa }} - {{ v.tipo }}
                </option>
              </optgroup>
              
              <template v-for="emp in veiculosEmpresas" :key="emp.id">
                <optgroup v-if="emp.veiculos && emp.veiculos.length > 0" :label="`Veículos: ${emp.nome}`">
                  <option v-for="v in emp.veiculos" :key="v.id" :value="v.id">
                    {{ v.placa }} - {{ v.tipo }}
                  </option>
                </optgroup>
              </template>
            </select>
          </div>

          <!-- Seleção de Pagador (Carteira) -->
          <div class="form-group mb-4">
            <label>Quem vai pagar esta vaga?</label>
            <select v-model="form.carteiraSelecionada" class="form-control" required>
              <option value="" disabled>Selecione a carteira</option>
              <option :value="`MOTORISTA:${motoristaId}`">
                Minha Carteira Pessoal (Saldo: R$ {{ saldoPessoal.toFixed(2) }})
              </option>
              <option v-for="vinc in vinculos" :key="vinc.empresa.id" :value="`EMPRESA:${vinc.empresa.id}`">
                Carteira {{ vinc.empresa.nome }} (Saldo: R$ {{ vinc.empresa.creditos.toFixed(2) }})
              </option>
            </select>
          </div>

          <div class="flex gap-2">
            <button type="button" class="btn flex-1" style="background-color: var(--danger); color: white;" @click="vagaSelecionada = null">Cancelar</button>
            <button type="submit" class="btn flex-1" style="background-color: #059669; color: white;">Iniciar Uso</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '@/components/NavBar.vue';
import MapaVagas from '@/components/MapaVagas.vue';
import { useVagasStore } from '@/stores/vagas';
import { useUsuarioStore } from '@/stores/usuario';
import axios from 'axios';

const router = useRouter();
const vagasStore = useVagasStore();
const usuarioStore = useUsuarioStore();

const motoristaId = computed(() => usuarioStore.motorista?.id);
const perfilCompleto = ref<any>(null);

const vagaSelecionada = ref<any>(null);
const form = ref({
  veiculoId: '',
  carteiraSelecionada: ''
});

let interval: number | undefined;

async function carregarPerfil() {
  if (!motoristaId.value) return;
  try {
    const res = await axios.get(`/api/motoristas/${motoristaId.value}/perfil`);
    perfilCompleto.value = res.data.dados;
  } catch (error) {
    console.error("Erro ao buscar perfil completo");
  }
}

onMounted(async () => {
  await vagasStore.buscarVagas();
  await carregarPerfil();
  
  // Polling a cada 30 segundos
  interval = setInterval(() => {
    vagasStore.buscarVagas();
  }, 30000) as unknown as number;
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});

// Computed properties para os selects
const veiculosPessoais = computed(() => perfilCompleto.value?.veiculos || []);
const vinculos = computed(() => perfilCompleto.value?.vinculos || []);
const veiculosEmpresas = computed(() => {
  return vinculos.value.map((v: any) => ({
    id: v.empresa.id,
    nome: v.empresa.nome,
    veiculos: v.empresa.veiculos
  }));
});
const saldoPessoal = computed(() => perfilCompleto.value?.creditos || 0);

function irParaSessaoAtiva() {
  router.push('/motorista/sessao-ativa');
}

function abrirModalCheckin(vagaId: number) {
  const vaga = vagasStore.vagas.find(v => v.id === vagaId);
  if (vaga) {
    vagaSelecionada.value = vaga;
    form.value.veiculoId = '';
    form.value.carteiraSelecionada = '';
  }
}

async function confirmarCheckin() {
  if (!form.value.veiculoId || !form.value.carteiraSelecionada || !vagaSelecionada.value) return;

  const [pagadorTipo, pagadorIdStr] = form.value.carteiraSelecionada.split(':');
  const pagadorId = parseInt(pagadorIdStr);
  const veiculoId = parseInt(form.value.veiculoId);

  const result = await vagasStore.fazerCheckin(
    vagaSelecionada.value.id, 
    veiculoId, 
    pagadorTipo, 
    pagadorId, 
    motoristaId.value
  );
  
  if (result.sucesso) {
    vagaSelecionada.value = null;
    router.push('/motorista/sessao-ativa');
  } else {
    alert(result.erro);
  }
}
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn-warning {
  background-color: var(--warning);
  color: var(--text-main);
  font-weight: bold;
}
.btn-warning:hover {
  background-color: #ca8a04;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: var(--radius);
  width: 90%;
  max-width: 500px;
}
</style>
