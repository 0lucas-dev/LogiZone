import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Fiscal } from '@/types'; // update types later

export const useUsuarioStore = defineStore('usuario', () => {
  const motorista = ref<any>(null);
  const empresa = ref<any>(null);
  const prefeitura = ref<any>(null);
  const fiscal = ref<Fiscal | null>(null);
  const perfil = ref<'motorista' | 'empresa' | 'prefeitura' | 'fiscal' | null>(null);

  const estaLogado = computed(() => {
    return (perfil.value === 'motorista' && motorista.value !== null) ||
           (perfil.value === 'empresa' && empresa.value !== null) ||
           (perfil.value === 'prefeitura' && prefeitura.value !== null) ||
           (perfil.value === 'fiscal' && fiscal.value !== null);
  });

  const nomeUsuario = computed(() => {
    if (perfil.value === 'motorista' && motorista.value) {
      return motorista.value.nome;
    }
    if (perfil.value === 'empresa' && empresa.value) {
      return empresa.value.nome;
    }
    if (perfil.value === 'prefeitura' && prefeitura.value) {
      return prefeitura.value.nome;
    }
    if (perfil.value === 'fiscal' && fiscal.value) {
      return fiscal.value.nome;
    }
    return '';
  });

  function loginMotorista(m: any) {
    motorista.value = m;
    perfil.value = 'motorista';
  }

  function loginEmpresa(e: any) {
    empresa.value = e;
    perfil.value = 'empresa';
  }

  function loginPrefeitura(p: any) {
    prefeitura.value = p;
    perfil.value = 'prefeitura';
  }

  function loginFiscal(f: Fiscal) {
    fiscal.value = f;
    perfil.value = 'fiscal';
  }

  function logout() {
    motorista.value = null;
    empresa.value = null;
    prefeitura.value = null;
    fiscal.value = null;
    perfil.value = null;
  }

  return {
    motorista,
    empresa,
    prefeitura,
    fiscal,
    perfil,
    estaLogado,
    nomeUsuario,
    loginMotorista,
    loginEmpresa,
    loginPrefeitura,
    loginFiscal,
    logout
  };
});
