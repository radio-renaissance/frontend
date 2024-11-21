<script setup lang="ts">
import Station from './components/Station.vue'
import { ref } from 'vue'
import { padd } from './util.ts'

function format(date) {
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()

  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  const milliseconds = date.getMilliseconds()

  return `${padd(day, 2)}-${padd(month, 2)}-${year} ${padd(hours, 2)}:${padd(minutes, 2)}:${padd(seconds, 2)}.${padd(milliseconds, 3)}`
}

let date = ref(format(new Date()))

setInterval(() => {
  date.value = format(new Date())
}, 17)
</script>

<template>
  <p>{{ date }}</p>
  <div class='column-container'>
    <Station name="pranks" />
    <Station name="anus" />
    <Station name="2ch" />
    <Station name="314" />
    <Station name="baneks" />
    <Station name="books" />
  </div>
</template>

<style scoped>
p {
  color: white;
  font-size: 2rem;
  text-align: center;
  margin-bottom: 30px;
  font-family: monospace;
}
</style>
