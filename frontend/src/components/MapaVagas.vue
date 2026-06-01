<template>
  <div class="mapa-vagas">
    <div class="filtros mb-4">
      <div class="search-box">
        <input 
          type="text" 
          v-model="busca" 
          placeholder="Buscar por bairro, rua ou código..." 
          class="form-control"
          id="busca-vagas"
        />
      </div>
      <div class="resultados-info" v-if="busca">
        {{ vagasFiltradas.length }} resultado(s) encontrado(s)
      </div>
    </div>

    <div v-if="carregando" class="text-center mt-4 loading-retro">
      <span class="retro-blink">▶</span> Carregando vagas...
    </div>

    <div v-else-if="vagasFiltradas.length === 0" class="text-center mt-4">
      Nenhuma vaga encontrada.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3">
      <CardVaga 
        v-for="vaga in vagasFiltradas" 
        :key="vaga.id" 
        :vaga="vaga"
        :mostrarBotaoCheckin="mostrarBotaoCheckin"
        @checkin="$emit('checkin', $event)"
      >
        <template #extra>
          <slot name="card-extra" :vaga="vaga"></slot>
        </template>
      </CardVaga>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Vaga } from '@/types';
import CardVaga from './CardVaga.vue';

const props = defineProps<{
  vagas: Vaga[];
  carregando: boolean;
  mostrarBotaoCheckin?: boolean;
}>();

defineEmits<{
  checkin: [vagaId: number];
}>();

const busca = ref('');

const vagasFiltradas = computed(() => {
  const termo = busca.value.toLowerCase();
  if (!termo) return props.vagas;
  
  return props.vagas.filter(v => 
    v.codigo.toLowerCase().includes(termo) ||
    v.bairro.toLowerCase().includes(termo) ||
    v.logradouro.toLowerCase().includes(termo)
  );
});
</script>

<style scoped>
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-icon {
  font-size: 18px;
}
.resultados-info {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}
.loading-retro {
  font-size: 20px;
  padding: 32px;
}
</style>
