<script setup lang="ts">
import Station from '../components/Station.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <main>
    <div class='column-container'>
      <Station :name="route.params.station" focused="true"/>
    </div>
  </main>
</template>
