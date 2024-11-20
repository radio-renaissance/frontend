<script setup lang="ts">
import axios from 'axios'
import { ref, watch } from 'vue'

const props = defineProps({
  name: {
    type: String
  },
  progressUpdatePeriod: {
    type: Number,
    default: 2000
  },
  playing: {
    type: Boolean,
    default: false
  },
  lineLength: {
    type: Number,
    default: 50
  }
})

let metaUrl = `https://careful-poodle-proven.ngrok-free.app/v1/${props.name}/meta`
// let streamUrl = `https://careful-poodle-proven.ngrok-free.app/v1/${props.name}/stream`
let streamUrl = `http://192.168.0.103:8081/v1/${props.name}/stream`

const title = ref('Loading...')
const artist = ref('Loading...')

const duration = ref<number>(null)
const elapsed = ref<number>(null)
const remaining = ref<number>(null)

const progress = ref<number>(null)
const playing = ref<boolean>(props.playing)

// var audio = new Audio(streamUrl)
var audio = ref(null)

let timer = null

function play() {
  audio.value.play()
  playing.value = true
}

function stop() {
  console.log('pausing...')
  audio.value.pause()
  console.log('paused')
  console.log(audio)
  playing.value = false
}

function updateProgress() {
  progress.value = elapsed.value / duration.value
}

function pad(value, nZeros) {
  const roundedValue = '' + (Math.floor(value * Math.pow(10, nZeros)) / Math.pow(10, nZeros))
  const components = roundedValue.split('.')

  if (components.length < 2) {
    components[1] = ''
  } 

  let padding = ''

  for (let i = 0; i < nZeros - components[1].length; i++) {
    padding += '0'
  }

  return `${components[0]}.${components[1]}${padding}`
}

function truncate(str) {
  if (str.length > props.lineLength) {
    return str.substring(0, props.lineLength - 3) + '...'
  }
  return str
}

function refreshData () {
  axios.get(metaUrl, {
    headers: {
      'ngrok-skip-browser-warning': 'foo'
    }
  }).then(response => {
    console.log(response.data)

    title.value = truncate(response.data['title'])
    artist.value = truncate(response.data['artist'])
  
    duration.value = response.data.duration
    elapsed.value = response.data.elapsed
    remaining.value = response.data.remaining

    // audio = new Audio(``)
  
    updateProgress()
  
    timer = setInterval(() => {
      elapsed.value = Math.min(elapsed.value + props.progressUpdatePeriod / 1000, duration.value)

      if (elapsed.value >= duration.value) {
        clearInterval(timer)
        refreshData()
      } else {
        updateProgress()
      }
    }, props.progressUpdatePeriod)
  })
}

refreshData()

if (props.playing) {
  watch(audio, (newValue, oldValue) => {
    newValue.play()
  })
}


// function downloadAudio() {
//   axios({
//     url: `http://localhost:8080/api/station/anus/ondemand/download/150954dcb20151b5156905d3`,
//     method: 'GET',
//     responseType: 'blob'
//   })
// 	.then((response) => {
// 	    if (response.status === 200) {
// 		const url = 
// 		    window.URL.createObjectURL
// 		    (new Blob([response.data]));
// 		const link = document.createElement('a');
// 		link.href = url;
// 		link.setAttribute('download', 'image.jpg');
// 		document.body.appendChild(link);
// 		link.click();
// 		document.body.removeChild(link);
// 		window.URL.revokeObjectURL(url);
// 	    } else {
// 		console.error('Error: Received non-200 status code');
// 	    }
// 	})
// 	.catch((error) => {
// 	    console.error('Error downloading the image:', error);
// 	});
// }
</script>

<template>
  <audio :src="streamUrl" preload="auto" id="player" ref='audio'></audio>
  <div class='root'>
    <p class="title">{{ title }}</p>
    <p class="artist">{{ artist }}</p>
    <!--<p class="progress">{{ Math.round(progress * 10000) / 100 }}</p>-->
    <div class='bar-wrapper'>
      <p class='duration'>{{ pad(elapsed, 2) }}</p>
      <div class='bar-container'>
        <div class='bar' :style='`width: ${progress * 100}%`'></div>
      </div>
      <p class='duration'>{{ pad(duration, 2) }}</p>
      <p class='control-button' @click='playing ? stop() : play()'>{{ playing ? 'stop' : 'play'}}</p>
    </div>
  </div>
</template>

<style scoped>
.root {
  margin: 50px 0;
}
p {
  color: white;
}
p.title {
  font-size:2rem;
  font-weight: bold;
}
p.artist {
  font-size:1.5rem;
}
.bar-wrapper p, .bar-wrapper div {
  float: left;
}
.bar-container {
  width: 200px;
  height: 10px;
  margin: 0 10px;
  margin-top: 6px;
}
.bar {
  height: 10px;
  background: white;
}
.duration {
  font-family: monospace;
}
.control-button {
  font-weight: bold;
  font-family: monospace;
  margin-left: 10px;
  cursor: pointer;
}
</style>
