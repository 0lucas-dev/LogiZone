<template>
  <nav class="navbar">
    <div class="container navbar-container">
      <div class="brand">
        <RouterLink to="/" class="brand-link">
          <span class="brand-text">LogiZone</span>
        </RouterLink>
      </div>

      <button class="mobile-toggle" @click="menuAberto = !menuAberto" v-if="usuarioStore.estaLogado">
        {{ menuAberto ? '✕' : '☰' }}
      </button>

      <div class="nav-links" :class="{ open: menuAberto }" v-if="usuarioStore.estaLogado">
        <span class="user-info">
          {{ usuarioStore.nomeUsuario }}
        </span>
        
        <div class="nav-separator"></div>

        <template v-if="usuarioStore.perfil === 'motorista'">
          <RouterLink to="/motorista/mapa" class="nav-link">Mapa</RouterLink>
          <RouterLink to="/motorista/carteira" class="nav-link">Carteira</RouterLink>
          <RouterLink to="/motorista/historico" class="nav-link">Histórico</RouterLink>
        </template>
        
        <template v-if="usuarioStore.perfil === 'empresa'">
          <RouterLink to="/empresa/dashboard" class="nav-link">Dashboard</RouterLink>
          <RouterLink to="/empresa/historico" class="nav-link">Histórico</RouterLink>
        </template>

        <template v-if="usuarioStore.perfil === 'prefeitura'">
          <RouterLink to="/prefeitura/dashboard" class="nav-link">Monitoramento</RouterLink>
        </template>

        <button @click="sair" class="btn-logout">Sair</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUsuarioStore } from '@/stores/usuario';

const router = useRouter();
const usuarioStore = useUsuarioStore();
const menuAberto = ref(false);

function sair() {
  usuarioStore.logout();
  menuAberto.value = false;
  router.push('/');
}
</script>

<style scoped>
.navbar {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  position: relative;
  z-index: 10;
}
.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
}
.brand-link {
  text-decoration: none;
}
.brand-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: -0.02em;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
}
.nav-separator {
  width: 1px;
  height: 20px;
  background-color: var(--border-color);
  margin: 0 16px;
}
.user-info {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
}
.nav-link {
  color: var(--text-muted) !important;
  text-decoration: none !important;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: var(--radius);
  transition: all 0.2s;
}
.nav-link:hover {
  color: var(--text-main) !important;
  background-color: var(--surface-hover);
}
.nav-link.router-link-active {
  color: var(--primary) !important;
  background-color: var(--surface-hover);
}
.btn-logout {
  color: var(--danger);
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  margin-left: 8px;
}
.btn-logout:hover {
  text-decoration: underline;
}

.mobile-toggle {
  display: none;
  color: var(--text-main);
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .mobile-toggle {
    display: block;
  }
  .nav-links {
    display: none;
    position: absolute;
    top: 56px;
    left: 0;
    right: 0;
    background-color: var(--card-bg);
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    height: auto;
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  }
  .nav-links.open {
    display: flex;
  }
  .nav-separator {
    display: none;
  }
  .user-info {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color);
    width: 100%;
  }
  .nav-link, .btn-logout {
    width: 100%;
    padding: 12px;
    margin: 0;
    text-align: left;
  }
}
</style>
