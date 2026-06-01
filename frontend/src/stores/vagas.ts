import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import type { Vaga, Sessao } from '@/types';

export const useVagasStore = defineStore('vagas', () => {
  const vagas = ref<Vaga[]>([]);
  const carregando = ref(false);
  const sessaoAtiva = ref<Sessao | null>(null);

  async function buscarVagas() {
    carregando.value = true;
    try {
      const response = await axios.get('/api/vagas');
      if (response.data.sucesso) {
        vagas.value = response.data.dados;
      }
    } catch (error) {
      console.error('Erro ao buscar vagas', error);
    } finally {
      carregando.value = false;
    }
  }

  async function fazerCheckin(vagaId: number, veiculoId: number, pagadorTipo: string, pagadorId: number, motoristaId: number) {
    try {
      const response = await axios.post('/api/sessoes/checkin', { vagaId, veiculoId, pagadorTipo, pagadorId, motoristaId });
      if (response.data.sucesso) {
        await buscarSessaoAtiva(response.data.dados.id);
        await buscarVagas();
        return { sucesso: true };
      }
    } catch (error: any) {
      return { 
        sucesso: false, 
        erro: error.response?.data?.erro || 'Erro ao fazer check-in' 
      };
    }
  }

  async function fazerCheckout(sessaoId: number) {
    try {
      const response = await axios.post('/api/sessoes/checkout', { sessaoId });
      if (response.data.sucesso) {
        sessaoAtiva.value = null;
        await buscarVagas();
        return { sucesso: true };
      }
    } catch (error: any) {
      return { 
        sucesso: false, 
        erro: error.response?.data?.erro || 'Erro ao fazer check-out' 
      };
    }
  }

  async function buscarSessaoAtiva(sessaoId: number) {
    try {
      const response = await axios.get(`/api/sessoes/${sessaoId}`);
      if (response.data.sucesso) {
        sessaoAtiva.value = response.data.dados;
      }
    } catch (error) {
      console.error('Erro ao buscar sessão ativa', error);
    }
  }

  return {
    vagas,
    carregando,
    sessaoAtiva,
    buscarVagas,
    fazerCheckin,
    fazerCheckout,
    buscarSessaoAtiva
  };
});
