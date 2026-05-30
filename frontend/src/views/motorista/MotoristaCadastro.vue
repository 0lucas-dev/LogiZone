<template>
  <div class="cadastro-container container">
    <div class="card login-card">
      <h2 class="text-center mb-4">Criar Conta Motorista</h2>
      
      <form @submit.prevent="cadastrar">
        <div class="form-group">
          <label for="cpf">CPF</label>
          <input id="cpf" v-model="form.cpf" type="text" class="form-control" required placeholder="000.000.000-00" />
        </div>
        
        <div class="form-group mt-3">
          <label for="nome">Nome Completo</label>
          <input id="nome" v-model="form.nome" type="text" class="form-control" required />
        </div>

        <div class="form-group mt-3">
          <label for="senha">Senha</label>
          <input id="senha" v-model="form.senha" type="password" class="form-control" required />
        </div>

        <div v-if="erro" class="erro-msg mt-4">{{ erro }}</div>

        <button type="submit" class="btn mt-4 w-full" style="background-color:#4f46e5;color:white" :disabled="carregando">
          {{ carregando ? 'Cadastrando...' : 'Cadastrar' }}
        </button>
      </form>

      <div class="text-center mt-4">
        <p>Já tem cadastro? <RouterLink to="/motorista/login">Faça Login</RouterLink></p>
      </div>
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

const form = ref({
  cpf: '',
  nome: '',
  senha: ''
});

const erro = ref('');
const carregando = ref(false);

async function cadastrar() {
  erro.value = '';
  carregando.value = true;
  
  try {
    const response = await axios.post('/api/motoristas/registro', form.value);
    
    if (response.data.sucesso) {
      alert('Cadastro realizado com sucesso!');
      router.push('/motorista/login');
    }
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.erro) {
      erro.value = err.response.data.erro;
    } else {
      erro.value = 'Erro ao tentar cadastrar.';
    }
  } finally {
    carregando.value = false;
  }
}
</script>

<style scoped>
.cadastro-container {
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
