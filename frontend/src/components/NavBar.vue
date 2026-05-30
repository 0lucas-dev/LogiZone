<template>
  <nav class="navbar">
    <div class="container navbar-container">
      <div class="brand">
        <RouterLink to="/">Estacionamento Logístico</RouterLink>
      </div>

      <div class="nav-links" v-if="usuarioStore.estaLogado">
        <span class="user-info">Olá, {{ usuarioStore.nomeUsuario }}</span>
        
        <!-- Links Motorista -->
        <template v-if="usuarioStore.perfil === 'motorista'">
          <RouterLink to="/motorista/mapa" class="nav-link">Mapa</RouterLink>
          <RouterLink to="/motorista/carteira" class="nav-link">Carteira</RouterLink>
          <RouterLink to="/motorista/historico" class="nav-link">Histórico</RouterLink>
        </template>
        
        <!-- Links Empresa -->
        <template v-if="usuarioStore.perfil === 'empresa'">
          <RouterLink to="/empresa/dashboard" class="nav-link">Dashboard</RouterLink>
        </template>

        <!-- Links Prefeitura -->
        <template v-if="usuarioStore.perfil === 'prefeitura'">
          <RouterLink to="/prefeitura/dashboard" class="nav-link">Vagas</RouterLink>
        </template>

        <!-- Links Fiscal -->
        <template v-if="usuarioStore.perfil === 'fiscal'">
          <RouterLink to="/fiscal/dashboard" class="nav-link">Dashboard</RouterLink>
          <RouterLink to="/fiscal/infracoes" class="nav-link">Infrações</RouterLink>
          <RouterLink to="/fiscal/relatorios" class="nav-link">Relatórios</RouterLink>
        </template>

        <button @click="sair" class="btn-logout">Sair</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUsuarioStore } from '@/stores/usuario';

const router = useRouter();
const usuarioStore = useUsuarioStore();

function sair() {
  usuarioStore.logout();
  router.push('/');
}
</script>

<style scoped>
.navbar {
  background-color: var(--primary);
  color: white;
  padding: 1rem 0;
  box-shadow: var(--shadow);
}
.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.brand a {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.user-info {
  font-weight: 500;
  margin-right: 1rem;
}
.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}
.nav-link:hover, .nav-link.router-link-active {
  color: white;
}
.btn-logout {
  color: white;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-weight: 500;
  transition: background-color 0.2s;
}
.btn-logout:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .nav-links {
    display: none; /* Em um app real, teríamos um menu mobile */
  }
}
</style>
