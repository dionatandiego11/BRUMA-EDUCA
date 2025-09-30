// src/composables/useAuth.ts
import { ref, computed } from 'vue'
import { supabase } from '../services/supabaseClient'
import type { User } from '@supabase/supabase-js'

export const useAuth = () => {
  const user = ref<User | null>(null)
  const loading = ref(true)

  // Verificar sessão atual
  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user ?? null
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  // Login com email e senha
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      user.value = data.user
      return { success: true }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error: error.message }
    }
  }

  // Logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  // Escutar mudanças de autenticação
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user ?? null
    loading.value = false
  })

  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    checkAuth,
    signIn,
    signOut,
  }
}