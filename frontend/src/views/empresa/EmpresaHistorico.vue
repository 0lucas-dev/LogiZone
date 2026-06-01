<template>
  <div class="empresa-historico">
    <NavBar />
    <div class="container mt-6">
      <div class="header-simple border-b pb-4 mb-6">
        <h2 class="m-0">Histórico de Uso</h2>
        <p class="text-muted text-sm m-0">Acompanhe as sessões onde a frota ou a carteira da empresa foi utilizada.</p>
      </div>

      <div class="card p-0">
        <div v-if="carregando" class="text-center p-6 text-muted">
          <div class="spinner mb-2"></div>
          <div>Buscando registros...</div>
        </div>
        
        <div v-else-if="sessoes.length === 0" class="text-center p-6 text-muted">
          <p>Nenhum registro de uso encontrado para a empresa.</p>
        </div>

        <div v-else style="overflow-x: auto;">
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Vaga</th>
                <th>Veículo</th>
                <th>Motorista</th>
                <th>Duração</th>
                <th>Status</th>
                <th class="text-right">Custo / Pagador</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sessao in sessoes" :key="sessao.id">
                <td>
                  <div class="font-medium">{{ formatarData(sessao.iniciadaEm) }}</div>
                  <div class="text-xs text-muted">{{ formatarHora(sessao.iniciadaEm) }}</div>
                </td>
                <td>
                  <div class="font-medium">{{ sessao.vaga?.codigo || 'ID ' + sessao.vagaId }}</div>
                  <div class="text-xs text-muted" style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    {{ sessao.vaga?.logradouro || '' }}
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <span class="badge-pill font-mono">
                      {{ sessao.veiculo?.placa || 'N/A' }}
                    </span>
                    <span class="text-[10px] uppercase font-bold" :class="sessao.veiculo?.empresaId === usuarioStore.empresa?.id ? 'text-primary' : 'text-muted'">
                      {{ sessao.veiculo?.empresaId === usuarioStore.empresa?.id ? 'Frota' : 'Pessoal' }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="font-medium">{{ sessao.motorista?.nome || 'Desconhecido' }}</div>
                  <div class="text-xs text-muted">{{ sessao.motorista?.cpf || '' }}</div>
                </td>
                <td>
                  <div class="text-sm">
                    {{ calcularDuracao(sessao.iniciadaEm, sessao.encerradaEm) }}
                  </div>
                </td>
                <td>
                  <BadgeStatus :status="sessao.status" />
                </td>
                <td class="text-right">
                  <div class="font-bold" :class="sessao.pagadorTipo === 'EMPRESA' && sessao.pagadorId === usuarioStore.empresa?.id ? 'text-danger' : 'text-muted'">
                    R$ {{ sessao.valorCobrado?.toFixed(2) || '0.00' }}
                  </div>
                  <div class="text-[10px] uppercase font-bold" :class="sessao.pagadorTipo === 'EMPRESA' && sessao.pagadorId === usuarioStore.empresa?.id ? 'text-danger' : 'text-muted'">
                    Saldo {{ sessao.pagadorTipo === 'EMPRESA' && sessao.pagadorId === usuarioStore.empresa?.id ? 'Empresa' : 'Pessoal' }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import NavBar from '@/components/NavBar.vue';
import BadgeStatus from '@/components/BadgeStatus.vue';
import { useUsuarioStore } from '@/stores/usuario';
import type { Sessao } from '@/types';

const usuarioStore = useUsuarioStore();
const sessoes = ref<Sessao[]>([]);
const carregando = ref(true);

onMounted(async () => {
  try {
    const empresaId = usuarioStore.empresa?.id;
    if (!empresaId) return;
    
    const response = await axios.get(`/api/empresas/${empresaId}/historico`);
    if (response.data.sucesso) {
      sessoes.value = response.data.sessoes;
    }
  } catch (error) {
    console.error('Erro ao buscar histórico', error);
  } finally {
    carregando.value = false;
  }
});

function formatarData(dataString: string) {
  return new Date(dataString).toLocaleDateString('pt-BR');
}

function formatarHora(dataString: string) {
  return new Date(dataString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function calcularDuracao(inicio: string, fim: string | null) {
  if (!fim) return 'Em andamento';
  const diffMs = new Date(fim).getTime() - new Date(inicio).getTime();
  const minutos = Math.floor(diffMs / 60000);
  
  if (minutos < 60) return `${minutos} min`;
  
  const horas = Math.floor(minutos / 60);
  const minRestantes = minutos % 60;
  return `${horas}h ${minRestantes}m`;
}
</script>

<style scoped>
.font-mono {
  font-family: monospace;
}
.text-\[10px\] {
  font-size: 10px;
}
.uppercase {
  text-transform: uppercase;
}
</style>
