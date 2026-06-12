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

    <div class="view-toggle mb-4 flex gap-2">
      <button class="btn btn-sm" :class="modoView === 'lista' ? 'btn-primary' : ''" @click="modoView = 'lista'" style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 4px;"><span class="material-symbols-outlined" style="font-size: 18px;">format_list_bulleted</span> Ver Lista</button>
      <button class="btn btn-sm" :class="modoView === 'mapa' ? 'btn-primary' : ''" @click="modoView = 'mapa'" style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 4px;"><span class="material-symbols-outlined" style="font-size: 18px;">map</span> Ver Mapa Real</button>
    </div>

    <div v-show="carregando && vagasFiltradas.length === 0" class="text-center mt-4 loading-retro">
      <span class="retro-blink material-symbols-outlined" style="font-size: 18px; vertical-align: middle;">autorenew</span> Carregando vagas...
    </div>

    <div v-show="!carregando && vagasFiltradas.length === 0" class="text-center mt-4">
      Nenhuma vaga encontrada.
    </div>

    <div v-show="vagasFiltradas.length > 0" style="position: relative;">
      <div v-if="carregando" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); padding: 4px 8px; border-radius: 4px; color: white; z-index: 9999; font-size: 12px;">Atualizando...</div>
      <div v-show="modoView === 'lista'" class="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3">
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

      <div v-show="modoView === 'mapa'" class="mapa-container mt-2">
        <div id="leaflet-map" style="height: 500px; width: 100%; border-radius: 8px; z-index: 1;"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import type { Vaga } from '@/types';
import CardVaga from './CardVaga.vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const props = defineProps<{
  vagas: Vaga[];
  carregando: boolean;
  mostrarBotaoCheckin?: boolean;
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

const modoView = ref<'lista' | 'mapa'>('mapa');
let map: L.Map | null = null;
let markers: L.LayerGroup | null = null;

const initMap = async () => {
  await nextTick();
  if (!map) {
    map = L.map('leaflet-map').setView([-22.2139, -49.9458], 14); // Centro generico ou media das vagas
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // Fix para ícones padrão do leaflet não carregando no vue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    markers = L.layerGroup().addTo(map);
  }
  updateMarkers();
  setTimeout(() => { map?.invalidateSize(); }, 400);
};

const updateMarkers = () => {
  if (!map || !markers) return;
  markers.clearLayers();

  const bounds = L.latLngBounds([]);

  vagasFiltradas.value.forEach(vaga => {
    if (vaga.latitude && vaga.longitude) {
      const latlng = L.latLng(vaga.latitude, vaga.longitude);
      bounds.extend(latlng);

      const color = vaga.status === 'LIVRE' ? 'green' : vaga.status === 'OCUPADA' ? 'red' : 'orange';
      
      const popupContent = `
        <div style="font-family: Arial, sans-serif; min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid #ccc; padding-bottom: 4px; color: black">
            Vaga ${vaga.codigo} - <span style="color: ${color};">${vaga.status}</span>
          </h4>
          <p style="margin: 4px 0;"><strong><span class="material-symbols-outlined" style="font-size: 16px; vertical-align: text-bottom;">location_on</span> Local:</strong> ${vaga.logradouro}, ${vaga.numero}</p>
          <p style="margin: 4px 0;"><strong><span class="material-symbols-outlined" style="font-size: 16px; vertical-align: text-bottom;">schedule</span> Horário:</strong> ${vaga.horariosDisponiveis || '08:00 - 18:00'}</p>
          <p style="margin: 4px 0;"><strong><span class="material-symbols-outlined" style="font-size: 16px; vertical-align: text-bottom;">directions_car</span> Veículos:</strong> ${vaga.tiposVeiculos || 'TODOS'}</p>
          <p style="margin: 4px 0;"><strong><span class="material-symbols-outlined" style="font-size: 16px; vertical-align: text-bottom;">hourglass_empty</span> Limite:</strong> ${vaga.limiteTempo} min</p>
          ${vaga.status === 'LIVRE' && props.mostrarBotaoCheckin ? `<button onclick="document.dispatchEvent(new CustomEvent('vaga-checkin', { detail: ${vaga.id} }))" style="margin-top: 8px; width: 100%; padding: 6px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Fazer Check-in</button>` : ''}
        </div>
      `;

      const marker = L.marker(latlng).bindPopup(popupContent);
      markers?.addLayer(marker);
    }
  });

  if (vagasFiltradas.value.length > 0 && map) {
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 18 });
  }
};

watch(() => modoView.value, (newVal) => {
  if (newVal === 'mapa') {
    initMap();
    setTimeout(() => { map?.invalidateSize(); updateMarkers(); }, 200);
  }
});

watch(() => vagasFiltradas.value, () => {
  if (modoView.value === 'mapa') {
    updateMarkers();
  }
}, { deep: true });

onMounted(() => {
  document.addEventListener('vaga-checkin', ((e: CustomEvent) => {
    emit('checkin', e.detail);
  }) as EventListener);
  
  if (modoView.value === 'mapa') {
    initMap();
  }
});

const emit = defineEmits<{
  checkin: [vagaId: number];
}>();
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
