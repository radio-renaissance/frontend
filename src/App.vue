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

function contact() {
  window.open('https://t.me/zeionara')
}

const randomNumber = Math.random()
const footerIntro = randomNumber < 0.5 ? 'from the mind of' : 'by'
</script>

<template>
  <main>
    <p id="date">{{ date }}</p>
    <router-view />
    <p id="footer">{{ footerIntro }} <span id="mention" @click="contact">@zeionara</span></p>
  </main>
  <!--<div class='column-container'>
    <Station name="pranks" />
    <Station name="anus" />
    <Station name="2ch" />
    <Station name="314" />
    <Station name="baneks" />
    <Station name="books" />
  </div>-->
</template>

<style scoped>
p {
  color: white;
  font-size: 2rem;
  text-align: center;
  margin-bottom: 30px;
  font-family: monospace;
}
#date {
  font-weight: bold;
  cursor: pointer;
}
#date:hover {
  color: blue;
}
#footer {
  font-size: 0.9rem;
  margin-top: 30px;
}
#mention {
  font-weight: bold;
  cursor: pointer;
}
#mention:hover {
  color: green;
}
</style>
