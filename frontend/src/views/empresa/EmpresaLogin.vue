<template>
  <div class="login-container container">
    <div class="card login-card">
      <h2 class="text-center mb-6 text-2xl font-bold text-navy">Acesso Empresa</h2>
      
      <div class="flex border-b mb-6">
        <button class="flex-1 py-2 text-center text-sm font-medium transition-colors border-b-2" 
                :class="aba === 'login' ? 'border-primary text-primary' : 'border-transparent text-muted'" 
                @click="aba = 'login'">Login</button>
        <button class="flex-1 py-2 text-center text-sm font-medium transition-colors border-b-2" 
                :class="aba === 'registro' ? 'border-primary text-primary' : 'border-transparent text-muted'" 
                @click="aba = 'registro'">Cadastrar</button>
      </div>

      <form v-if="aba === 'login'" @submit.prevent="fazerLogin">
        <div class="form-group">
          <label>CNPJ</label>
          <input v-model="formLogin.cnpj" type="text" class="form-control" required placeholder="00.000.000/0001-00" />
        </div>
        <div class="form-group mb-6">
          <label>Senha</label>
          <input v-model="formLogin.senha" type="password" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-primary w-full">Entrar</button>
        <div class="text-center mt-6">
          <RouterLink to="/" class="text-sm text-muted">← Voltar ao Início</RouterLink>
        </div>
      </form>

      <form v-else @submit.prevent="fazerRegistro">
        <div class="form-group">
          <label>CNPJ</label>
          <input v-model="formRegistro.cnpj" type="text" class="form-control" required placeholder="00.000.000/0001-00" />
        </div>
        <div class="form-group">
          <label>Nome da Empresa / Nome</label>
          <input v-model="formRegistro.nome" type="text" class="form-control" required />
        </div>
        <div class="form-group">
          <label>Tipo</label>
          <select v-model="formRegistro.tipo" class="form-control">
            <option value="EMPRESA">Empresa</option>
            <option value="AUTONOMO">Autônomo</option>
          </select>
        </div>
        <div class="form-group mb-6">
          <label>Senha</label>
          <input v-model="formRegistro.senha" type="password" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-primary w-full">Cadastrar e Entrar</button>
        <div class="text-center mt-6">
          <RouterLink to="/" class="text-sm text-muted">← Voltar ao Início</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUsuarioStore } from '@/stores/usuario';
import axios from 'axios';

const router = useRouter();
const usuarioStore = useUsuarioStore();
const aba = ref('login');

const formLogin = ref({ cnpj: '', senha: '' });
const formRegistro = ref({ cnpj: '', nome: '', tipo: 'EMPRESA', senha: '' });

async function fazerLogin() {
  try {
    const res = await axios.post('/api/empresas/login', formLogin.value);
    if (res.data.sucesso) {
      usuarioStore.loginEmpresa(res.data.empresa);
      router.push('/empresa/dashboard');
    }
  } catch (error) {
    alert('Erro no login. Verifique as credenciais.');
  }
}

async function fazerRegistro() {
  try {
    const res = await axios.post('/api/empresas/registro', formRegistro.value);
    if (res.data.sucesso) {
      usuarioStore.loginEmpresa(res.data.empresa);
      router.push('/empresa/dashboard');
    }
  } catch (error) {
    alert('Erro ao registrar.');
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;

}
.login-card {
  width: 100%;
  max-width: 420px;



}
.text-navy {
  color: var(--primary);
}
.border-primary {
  border-color: var(--primary);
}
.border-transparent {
  border-color: transparent;
}
.transition-colors {
  transition: color 0.2s, border-color 0.2s;
}
</style>
