<template>
  <div class="seletor-container">
    <header class="seletor-header">
      <div class="text-center">
        <h1 class="brand-title">LogiZone</h1>
        <p class="text-muted max-w-2xl mx-auto">
          Sistema de Vagas para carga e descarga de veículos
        </p>
      </div>
    </header>

    <main class="seletor-main">
      <div class="grid md:grid-cols-3 max-w-5xl mx-auto gap-4 w-full">
        
        <!-- Motorista -->
        <div class="card perfil-card" @click="irParaMotorista">
          <h3 class="perfil-title">Acessar Vagas</h3>
          <p class="perfil-desc">
            Encontre vagas, faça check-in pelo app e acompanhe seu histórico.
          </p>
          <button class="btn btn-outline w-full mt-4">Acessar</button>
        </div>

        <!-- Empresa -->
        <div class="card perfil-card" @click="irParaEmpresa">
          <h3 class="perfil-title">Acesso Empresa</h3>
          <p class="perfil-desc">
            Gestão de frotas, motoristas e créditos corporativos centralizada.
          </p>
          <button class="btn btn-outline w-full mt-4">Acessar</button>
        </div>

        <!-- Prefeitura -->
        <div class="card perfil-card" @click="irParaPrefeitura">
          <h3 class="perfil-title">Acesso Gestor Público</h3>
          <p class="perfil-desc">
            Monitoramento de ocupação e estatísticas de uso do município.
          </p>
          <button class="btn btn-outline w-full mt-4">Acessar</button>
        </div>

      </div>
    </main>

    <footer class="footer">
      <div class="container text-center">
        <p class="text-xs text-muted">LogiZone &copy; {{ new Date().getFullYear() }} — Minimalist UI</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function irParaMotorista() {
  router.push('/motorista/login');
}
function irParaEmpresa() {
  router.push('/empresa/login');
}
function irParaPrefeitura() {
  router.push('/prefeitura/login');
}
</script>

<style scoped>
.seletor-container {
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
}

.seletor-header {
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  z-index: 10;
}

.seletor-main {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 1024px;
  padding: 0 var(--spacing-md);
  box-sizing: border-box;
  z-index: 5;
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--primary);
  margin-bottom: 8px;
}

/* Cards */
.perfil-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  height: 100%;
}
.perfil-card:hover {
  border-color: var(--primary);
  background-color: var(--surface-hover);
}

.perfil-title {
  font-size: 1.25rem;
  margin-bottom: 8px;
}
.perfil-desc {
  font-size: 14px;
  color: var(--text-muted);
  flex-grow: 1;
}

.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 0;
  border-top: 1px solid var(--border-color);
  z-index: 10;
}
</style>
