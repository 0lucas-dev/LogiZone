import { createRouter, createWebHashHistory } from 'vue-router';
import { useUsuarioStore } from '@/stores/usuario';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/PerfilSeletor.vue')
    },
    // Rotas do Motorista
    {
      path: '/motorista/login',
      name: 'motorista-login',
      component: () => import('@/views/motorista/MotoristaLogin.vue')
    },
    {
      path: '/motorista/cadastro',
      name: 'motorista-cadastro',
      component: () => import('@/views/motorista/MotoristaCadastro.vue')
    },
    {
      path: '/motorista/mapa',
      name: 'motorista-mapa',
      component: () => import('@/views/motorista/MotoristaMapaVagas.vue'),
      meta: { requiresAuth: true, perfil: 'motorista' }
    },
    {
      path: '/motorista/carteira',
      name: 'motorista-carteira',
      component: () => import('@/views/motorista/MotoristaCarteira.vue'),
      meta: { requiresAuth: true, perfil: 'motorista' }
    },
    {
      path: '/motorista/sessao-ativa',
      name: 'motorista-sessao-ativa',
      component: () => import('@/views/motorista/MotoristaTimerView.vue'),
      meta: { requiresAuth: true, perfil: 'motorista' }
    },
    {
      path: '/motorista/historico',
      name: 'motorista-historico',
      component: () => import('@/views/motorista/MotoristaHistorico.vue'),
      meta: { requiresAuth: true, perfil: 'motorista' }
    },
    // Rotas do Fiscal
    {
      path: '/fiscal/login',
      name: 'fiscal-login',
      component: () => import('@/views/fiscal/FiscalLogin.vue')
    },
    {
      path: '/fiscal/dashboard',
      name: 'fiscal-dashboard',
      component: () => import('@/views/fiscal/FiscalDashboard.vue'),
      meta: { requiresAuth: true, perfil: 'fiscal' }
    },
    {
      path: '/fiscal/vaga/:id',
      name: 'fiscal-vaga',
      component: () => import('@/views/fiscal/FiscalDetalheVaga.vue'),
      meta: { requiresAuth: true, perfil: 'fiscal' }
    },
    {
      path: '/fiscal/infracao/nova',
      name: 'fiscal-infracao-nova',
      component: () => import('@/views/fiscal/FiscalNovaInfracao.vue'),
      meta: { requiresAuth: true, perfil: 'fiscal' }
    },
    {
      path: '/fiscal/infracoes',
      name: 'fiscal-infracoes',
      component: () => import('@/views/fiscal/FiscalListaInfracoes.vue'),
      meta: { requiresAuth: true, perfil: 'fiscal' }
    },
    {
      path: '/fiscal/relatorios',
      name: 'fiscal-relatorios',
      component: () => import('@/views/fiscal/FiscalRelatorios.vue'),
      meta: { requiresAuth: true, perfil: 'fiscal' }
    },
    // Rotas da Empresa/Autônomo
    {
      path: '/empresa/login',
      name: 'empresa-login',
      component: () => import('@/views/empresa/EmpresaLogin.vue')
    },
    {
      path: '/empresa/dashboard',
      name: 'empresa-dashboard',
      component: () => import('@/views/empresa/EmpresaDashboard.vue'),
      meta: { requiresAuth: true, perfil: 'empresa' }
    },
    // Rotas da Prefeitura
    {
      path: '/prefeitura/login',
      name: 'prefeitura-login',
      component: () => import('@/views/prefeitura/PrefeituraLogin.vue')
    },
    {
      path: '/prefeitura/dashboard',
      name: 'prefeitura-dashboard',
      component: () => import('@/views/prefeitura/PrefeituraDashboard.vue'),
      meta: { requiresAuth: true, perfil: 'prefeitura' }
    }
  ]
});

router.beforeEach((to, from, next) => {
  const usuarioStore = useUsuarioStore();
  
  if (to.meta.requiresAuth) {
    if (!usuarioStore.estaLogado) {
      next('/');
      return;
    }
    
    if (to.meta.perfil && to.meta.perfil !== usuarioStore.perfil) {
      next('/');
      return;
    }
  }
  
  next();
});

export default router;
