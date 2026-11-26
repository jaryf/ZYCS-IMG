<template>
  <Header />
  <main class="shell"><RouterView /></main>
  <Footer />
  <Toaster />
</template>

<script setup lang="ts">
import Header from '@/components/Header/Header.vue'
import Footer from '@/components/Footer/Footer.vue'
import { Toaster } from '@/components/ui/toast'
</script>
