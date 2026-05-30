<template>
  <div class="nova-infracao">
    <NavBar />
    <div class="container mt-4">
      <div class="card form-card mx-auto">
        <h2 class="mb-4">Registrar Infração</h2>

        <div v-if="sucesso" class="alerta-sucesso mb-4">
          Infração registrada com sucesso!
        </div>

        <form @submit.prevent="registrar" v-else>
          <div class="form-group">
            <label for="vagaId">Vaga (ID)</label>
            <input 
              id="vagaId" 
              v-model.number="form.vagaId" 
              type="number" 
              class="form-control" 
              required
              :readonly="!!route.query.vagaId"
            />
          </div>

          <div class="form-group">
            <label for="placa">Placa do Veículo Infrator (Opcional se desconhecida)</label>
            <input 
              id="placa" 
              v-model="form.placaAvulsa" 
              type="text" 
              class="form-control" 
              placeholder="Ex: ABC1234" 
              maxlength="8"
            />
          </div>

          <div class="form-group">
            <label for="motivo">Motivo da Infração</label>
            <select id="motivo" v-model="form.motivo" class="form-control" required>
              <option value="SEM_CHECKIN">Veículo sem check-in registrado</option>
              <option value="TEMPO_EXPIRADO">Tempo máximo de permanência excedido</option>
              <option value="VEICULO_NAO_AUTORIZADO">Veículo não é de carga/descarga</option>
            </select>
          </div>

          <div class="form-group">
            <label for="observacao">Observação</label>
            <textarea 
              id="observacao" 
              v-model="form.observacao" 
              class="form-control" 
              rows="3"
            ></textarea>
          </div>

          <div v-if="erro" class="erro-msg mt-4 mb-4">{{ erro }}</div>

          <div class="acoes mt-4">
            <button type="button" class="btn btn-outline" @click="voltar">Cancelar</button>
            <button type="submit" class="btn btn-danger ml-2" :disabled="carregando">
              {{ carregando ? 'Registrando...' : 'Registrar Infração' }}
            </button>
          </div>
        </form>

        <div v-if="sucesso" class="text-center mt-4">
          <button class="btn btn-outline" @click="voltar">Voltar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import NavBar from '@/components/NavBar.vue';
import { useUsuarioStore } from '@/stores/usuario';

const route = useRoute();
const router = useRouter();
const usuarioStore = useUsuarioStore();

const form = ref({
  vagaId: null as number | null,
  placaAvulsa: '',
  motivo: 'SEM_CHECKIN',
  observacao: ''
});

const erro = ref('');
const sucesso = ref(false);
const carregando = ref(false);

onMounted(() => {
  if (route.query.vagaId) {
    form.value.vagaId = parseInt(route.query.vagaId as string);
  }
});

function voltar() {
  router.back();
}

async function registrar() {
  if (!usuarioStore.fiscal) return;
  if (!form.value.vagaId) return;

  erro.value = '';
  carregando.value = true;

  try {
    const payload = {
      vagaId: form.value.vagaId,
      fiscalId: usuarioStore.fiscal.id,
      motivo: form.value.motivo,
      placaAvulsa: form.value.placaAvulsa || undefined,
      observacao: form.value.observacao || undefined
    };

    const response = await axios.post('/api/infracoes', payload);
    
    if (response.data.sucesso) {
      sucesso.value = true;
    }
  } catch (err: any) {
    erro.value = 'Erro ao registrar infração. Verifique os dados.';
  } finally {
    carregando.value = false;
  }
}
</script>

<style scoped>
.form-card {
  max-width: 600px;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.acoes {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.ml-2 {
  margin-left: 0.5rem;
}
.erro-msg {
  color: var(--danger);
  font-size: 0.875rem;
  background-color: #fee2e2;
  padding: 0.5rem;
  border-radius: var(--radius);
}
.alerta-sucesso {
  color: var(--success);
  font-weight: bold;
  background-color: #dcfce7;
  padding: 1rem;
  border-radius: var(--radius);
  text-align: center;
}
</style>
