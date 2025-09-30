// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/LoginForm.vue'),
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/HomePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../pages/AdminPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/create-provao',
    name: 'CreateProvao',
    component: () => import('../pages/CreateProvaoPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/insert',
    name: 'Insert',
    component: () => import('../pages/InsertDataPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/results',
    name: 'Results',
    component: () => import('../pages/ResultsPage.vue'),
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guarda de navegação
router.beforeEach(async (to, from, next) => {
  const { user, checkAuth } = useAuth()
  
  await checkAuth()

  if (to.meta.requiresAuth && !user.value) {
    next('/login')
  } else if (to.path === '/login' && user.value) {
    next('/')
  } else {
    next()
  }
})

export default router