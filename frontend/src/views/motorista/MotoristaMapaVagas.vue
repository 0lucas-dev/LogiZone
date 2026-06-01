<template>
  <div class="motorista-mapa">
    <NavBar />
    <div class="container mt-6">
      <div class="header-simple flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 class="m-0">Vagas Disponíveis</h2>
          <p class="text-muted text-sm m-0">Encontre e estacione seu veículo</p>
        </div>
        <button 
          v-if="vagasStore.sessaoAtiva" 
          class="btn btn-primary"
          @click="irParaSessaoAtiva"
        >
          Meu Check-in Ativo
        </button>
      </div>

      <MapaVagas 
        :vagas="vagasStore.vagas" 
        :carregando="vagasStore.carregando"
        :mostrarBotaoCheckin="!vagasStore.sessaoAtiva"
        @checkin="abrirModalCheckin"
      />
    </div>

    <!-- Modal de Check-in -->
    <div v-if="vagaSelecionada" class="modal-overlay">
      <div class="card modal-content p-6">
        <h3 class="mb-4 text-xl">Check-in: Vaga {{ vagaSelecionada.codigo }}</h3>
        
        <div class="info-vaga mb-6 p-4 bg-gray-50 border rounded text-sm">
          <div class="mb-2"><strong>Local:</strong> {{ vagaSelecionada.logradouro }}, {{ vagaSelecionada.numero }}</div>
          <div class="mb-2"><strong>Tarifa:</strong> R$ {{ vagaSelecionada.valorMinuto?.toFixed(2) || '1.00' }} / min</div>
          <div><strong>Tempo Máximo:</strong> {{ vagaSelecionada.limiteTempo }} min</div>
        </div>

        <form @submit.prevent="confirmarCheckin">
          <div class="form-group mb-4">
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

          <div class="form-group mb-6">
            <label>Quem vai pagar esta vaga?</label>
            <select v-model="form.carteiraSelecionada" class="form-control" required>
              <option value="" disabled>Selecione a carteira</option>
              <option :value="`MOTORISTA:${motoristaId}`">
                Minha Carteira (Saldo: R$ {{ saldoPessoal.toFixed(2) }})
              </option>
              <option v-for="vinc in vinculos" :key="vinc.empresa.id" :value="`EMPRESA:${vinc.empresa.id}`">
                {{ vinc.empresa.nome }} (Saldo: R$ {{ vinc.empresa.creditos.toFixed(2) }})
              </option>
            </select>
          </div>

          <div class="flex gap-4">
            <button type="button" class="btn flex-1" @click="vagaSelecionada = null">Cancelar</button>
            <button type="submit" class="btn btn-primary flex-1">Iniciar Uso</button>
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
  
  if (result?.sucesso) {
    vagaSelecionada.value = null;
    router.push('/motorista/sessao-ativa');
  } else {
    alert(result?.erro || 'Erro ao fazer check-in');
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}
.modal-content {
  width: 90%;
  max-width: 500px;


  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
.bg-gray-50 {

}
.rounded {
  border-radius: var(--radius);
}
</style>
