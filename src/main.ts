import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import * as Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'

// if ('serviceWorker' in navigator) {
//   console.log('registering')
//   navigator.serviceWorker.register('/stream-worker.js', { scope: '/'}).then(() => {
//     console.log('Service Worker registered.');
//   })
//     .catch((error) => {
//       console.error('Service Worker registration failed:', error);
//     });
// }

const app = createApp(App)

app.use(router)
app.use(VueAxios, axios)

app.mount('#app')
