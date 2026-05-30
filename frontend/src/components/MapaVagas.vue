<template>
  <div class="mapa-vagas">
    <div class="filtros mb-4">
      <input 
        type="text" 
        v-model="busca" 
        placeholder="Buscar por bairro, rua ou código..." 
        class="form-control"
      />
    </div>

    <div v-if="carregando" class="text-center mt-4">
      Carregando vagas...
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
