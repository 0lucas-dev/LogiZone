<template>
  <div class="login-container container">
    <div class="card login-card">
      <h2 class="text-center mb-4">Login do Fiscal</h2>
      
      <form @submit.prevent="fazerLogin">
        <div class="form-group">
          <label for="matricula">Matrícula</label>
          <input 
            id="matricula" 
            v-model="matricula" 
            type="text" 
            class="form-control" 
            placeholder="Ex: F123" 
            required
          />
        </div>

        <div v-if="erro" class="erro-msg mt-4 mb-4">
          {{ erro }}
        </div>

        <button type="submit" class="btn btn-primary mt-4" :disabled="carregando">
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <div class="text-center mt-4">
        <RouterLink to="/">Voltar ao Início</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useUsuarioStore } from '@/stores/usuario';

const router = useRouter();
const usuarioStore = useUsuarioStore();

const matricula = ref('');
const erro = ref('');
const carregando = ref(false);

async function fazerLogin() {
  erro.value = '';
  carregando.value = true;
  
  try {
    const response = await axios.post('/api/fiscais/login', { matricula: matricula.value });
    
    if (response.data.sucesso) {
      usuarioStore.loginFiscal(response.data.dados);
      router.push('/fiscal/dashboard');
    }
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      erro.value = 'Matrícula não encontrada.';
    } else {
      erro.value = 'Erro ao tentar fazer login. Tente novamente.';
    }
  } finally {
    carregando.value = false;
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
  max-width: 400px;
}
.erro-msg {
  color: var(--danger);
  font-size: 0.875rem;
  background-color: #fee2e2;
  padding: 0.5rem;
  border-radius: var(--radius);
}
</style>
