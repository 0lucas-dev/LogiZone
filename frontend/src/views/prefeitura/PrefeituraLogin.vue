<template>
  <div class="login-container container">
    <div class="card login-card">
      <h2 class="text-center mb-4">Acesso Prefeitura</h2>
      <p class="text-center text-muted mb-4">Faça login para gerenciar as vagas da cidade.</p>
      
      <form @submit.prevent="fazerLogin">
        <div class="form-group">
          <label for="usuario">Usuário Gestor</label>
          <input id="usuario" v-model="form.usuario" type="text" class="form-control" required placeholder="admin" />
        </div>
        
        <div class="form-group mt-3">
          <label for="senha">Senha</label>
          <input id="senha" v-model="form.senha" type="password" class="form-control" required placeholder="admin" />
        </div>

        <button type="submit" class="btn btn-secondary mt-4 w-full" style="background-color:#059669;color:white">
          Acessar Painel
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUsuarioStore } from '@/stores/usuario';

const router = useRouter();
const usuarioStore = useUsuarioStore();

const form = ref({
  usuario: '',
  senha: ''
});

function fazerLogin() {
  // Simulação de login da prefeitura
  if (form.value.usuario && form.value.senha) {
    usuarioStore.loginPrefeitura({ id: 1, nome: 'Gestor Municipal' });
    router.push('/prefeitura/dashboard');
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
</style>
