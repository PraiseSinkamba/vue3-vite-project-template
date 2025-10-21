<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute('/admin/clients/[id]')
const clientId = route.params.id
</script>

<template>
  <div>Client id: {{ clientId }}</div>
</template>
