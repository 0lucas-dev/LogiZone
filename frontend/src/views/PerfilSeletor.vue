<template>
  <div class="seletor-container container">
    <div class="header text-center mt-4 mb-4">
      <h1>Estacionamento Logístico</h1>
      <p>Gerenciador Inteligente de Vagas de Carga e Descarga</p>
    </div>

    <div class="perfis-grid grid md:grid-cols-2 lg:grid-cols-4">
      <div class="card text-center perfil-card" @click="irParaMotorista">
        <h2>Motorista</h2>
        <p>Encontre vagas, faça check-in e acompanhe seu tempo.</p>
        <button class="btn btn-primary mt-4 w-full">Entrar</button>
      </div>

      <div class="card text-center perfil-card" @click="irParaEmpresa">
        <h2>Empresa/Autônomo</h2>
        <p>Gerencie frotas, motoristas e adicione créditos.</p>
        <button class="btn btn-secondary mt-4 w-full" style="background-color:#4f46e5;color:white">Acessar</button>
      </div>

      <div class="card text-center perfil-card" @click="irParaPrefeitura">
        <h2>Prefeitura</h2>
        <p>Administre vagas, defina valores e monitore tudo.</p>
        <button class="btn btn-secondary mt-4 w-full" style="background-color:#059669;color:white">Acessar</button>
      </div>

      <!-- <div class="card text-center perfil-card" @click="irParaFiscal">
        <h2>👮 Fiscal</h2>
        <p>Monitore vagas, registre infrações e acesse relatórios.</p>
        <button class="btn btn-outline mt-4 w-full">Entrar</button>
      </div> -->
    </div>
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
  router.push('/prefeitura/dashboard');
}
function irParaFiscal() {
  router.push('/fiscal/login');
}
</script>

<style scoped>
.seletor-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
}
.header h1 {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 0.5rem;
}
.header p {
  font-size: 1.2rem;
  color: var(--text-muted);
}
.perfis-grid {
  margin-top: 2rem;
}
.perfil-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  padding: 3rem 2rem;
}
.perfil-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  border-color: var(--primary);
}
.perfil-card h2 {
  margin-bottom: 1rem;
}
</style>
