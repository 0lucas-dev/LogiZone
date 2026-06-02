<template>
  <div class="login-container container">
    <div class="card login-card">
      <h2 class="text-center mb-6 text-2xl font-bold text-navy">Gestão Municipal</h2>
      
      <form @submit.prevent="fazerLogin">
        <div class="form-group">
          <label>Usuário Administrativo</label>
          <input v-model="usuario" type="text" class="form-control" required />
        </div>
        <div class="form-group mb-6">
          <label>Senha</label>
          <input v-model="senha" type="password" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-primary w-full">Acessar Painel</button>
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

const router = useRouter();
const usuarioStore = useUsuarioStore();

const usuario = ref('');
const senha = ref('');

function fazerLogin() {
  if (usuario.value && senha.value) {
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
.text-navy {
  color: var(--primary);
}
</style>
