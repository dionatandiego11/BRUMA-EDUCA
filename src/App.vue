<!-- src/App.vue -->
<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from './composables/useAuth'

const { checkAuth } = useAuth()

onMounted(() => {
  checkAuth()
})
</script>