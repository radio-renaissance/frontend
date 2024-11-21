<script setup lang="ts">
import axios from 'axios'
import { ref, watch } from 'vue'
import config from '../../config.json'
import { useRouter } from 'vue-router'

const props = defineProps({
  name: {
    type: String
  },
  progressUpdatePeriod: {
    type: Number,
    default: 100
  },
  playing: {
    type: String,
    default: 'false'
  },
  lineLength: {
    type: Number,
    default: 50
  },
  focused: {
    type: String,
    default: 'false'
  }
})

// const protocol = 'http'
// const host = 'careful-poodle-proven.ngrok-free.app'
// const host = '192.168.0.103'
// const port = 80
// const port = 8081

const router = useRouter()

let mediaSource = new MediaSource()
let audioURL = URL.createObjectURL(mediaSource)
let sourceBuffer = null
let abortController = null

let metaUrl = `${config.protocol}://${config.host}:${config.port}/v1/${props.name}/meta`
let streamUrl = `${config.protocol}://${config.host}:${config.port}/v1/${props.name}/stream`
let downloadBaseUrl = `${config.protocol}://${config.host}:${config.port}/v1/${props.name}/download`
let artId = null
// let streamUrl = `http://192.168.0.103:8081/v1/${props.name}/stream`
let streamSource = ref(audioURL)

const title = ref('Loading...')
const artist = ref('Loading...')

const duration = ref<number>(null)
const elapsedProgress = ref<number>(null)
const elapsedStopwatch = ref<number>(null)
const remaining = ref<number>(null)

const progress = ref<number>(null)
const playing = ref<boolean>(props.playing === 'true')
const focused = ref<boolean>(props.focused === 'true')

// var audio = new Audio(streamUrl)
var audio = ref(null)

let progressUpdateTimer = null
let stopwatchUpdateTimer = null

async function startStreaming() {
  sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
  abortController = new AbortController()

  try {
     // Use Fetch API to stream audio data
     const response = await fetch(streamUrl, {
       headers: config.headers,
       signal: abortController.signal
     });

     if (!response.body) {
       throw new Error("ReadableStream not supported in this environment");
     }

     const reader = response.body.getReader();
     let done = false;

     while (!done) {
       const { value, done: streamDone } = await reader.read();
       if (value) {
         // Append received data to the source buffer
         try {
           sourceBuffer.appendBuffer(value);
         } catch (error) {
           console.warn('Appending to buffer did not succeed')
         }
       }
       done = streamDone;
     }

     // Signal the end of the stream
     mediaSource.endOfStream();
   } catch (error) {
     console.error("Error during streaming:", error);
     mediaSource.endOfStream("error");
   }
}

async function stopStreaming() {
  // mediaSource.removeSourceBuffer(sourceBuffer)
  abortController.abort()
  mediaSource = new MediaSource()
  audioURL = URL.createObjectURL(mediaSource)
  streamSource.value = audioURL
  // mediaSource.endOfStream('error')
}

async function fetchAudio() {
  mediaSource.addEventListener("sourceopen", async () => {
    // console.log('buffer')

    const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");

    try {
       // Use Fetch API to stream audio data
       const response = await fetch(streamUrl, {
         headers: config.headers,
       });

       if (!response.body) {
         throw new Error("ReadableStream not supported in this environment");
       }

       const reader = response.body.getReader();
       let done = false;

       while (!done) {
         const { value, done: streamDone } = await reader.read();
         if (value) {
           // Append received data to the source buffer
           sourceBuffer.appendBuffer(value);
         }
         done = streamDone;
       }

       // Signal the end of the stream
       mediaSource.endOfStream();
     } catch (error) {
       console.error("Error during streaming:", error);
       mediaSource.endOfStream("error");
     }
  })

  // try {
  //   const response = await axios.get(streamUrl, {
  //     responseType: "blob", // Ensure the response is a Blob
  //     headers: {
  //       'ngrok-skip-browser-warning': 'foo'
  //     }
  //   })

  //   // Create a blob URL for the audio
  //   streamSource.value = URL.createObjectURL(response.data)
  //   console.log(streamSource.value)
  // } catch (error) {
  //   console.error("Error fetching audio:", error)
  // }
}

function play() {
  // startStreaming()
  audio.value.play()
  playing.value = true
}

function stop() {
  // stopStreaming()
  audio.value.pause()
  playing.value = false
}

function updateProgress() {
  progress.value = elapsedProgress.value / duration.value
}

function padd(value, nZeros) {
  const valueAsString = '' + value

  if (valueAsString.length < nZeros) {
    let padding = ''

    for (let i = 0; i < nZeros - valueAsString.length; i++) {
      padding += '0'
    }

    return padding + valueAsString
  }

  return valueAsString
}

function pad(value, nZeros) {
  const minutes = Math.floor(value / 60)
  const seconds = value - minutes * 60

  return `${padd(minutes, nZeros)}:${padd(seconds, nZeros)}`

  // const roundedValue = '' + (Math.floor(value * Math.pow(10, nZeros)) / Math.pow(10, nZeros))
  // const components = roundedValue.split('.')

  // if (components.length < 2) {
  //   components[1] = ''
  // } 

  // let padding = ''

  // for (let i = 0; i < nZeros - components[1].length; i++) {
  //   padding += '0'
  // }

  // return `${components[0]}.${components[1]}${padding}`
}

function truncate(str) {
  if (str.length > props.lineLength) {
    return str.substring(0, props.lineLength - 3) + '...'
  }
  return str
}

async function downloadMp3(url) {
  try {
    // Fetch the file as a blob
    const response = await axios.get(url, {
      responseType: 'blob', // Important to get the file as a Blob
    });

    let fileName = 'audio.mp3'
    const contentDisposition = response.headers['content-disposition']

    // console.log(contentDisposition)

    if (contentDisposition) {
      // const fileNameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)|filename="(.+)"/)
      const fileNameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/)
      if (fileNameMatch) {
        fileName = decodeURIComponent(fileNameMatch[1] || fileNameMatch[2])
      }
    }

    // Create a Blob from the response data
    const blob = new Blob([response.data], { type: 'audio/mpeg' })

    // Create a link element
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob) // Create a URL for the Blob
    link.download = fileName // Set the desired file name

    // Append the link to the document, trigger the download, and remove the link
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Optional: Revoke the URL object to free up resources
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('Error downloading the MP3 file:', error);
  }
}

function download() {
  const downloadUrl = `${downloadBaseUrl}/${artId}`
  // console.log(downloadUrl)

  downloadMp3(downloadUrl)
  // window.open(downloadUrl)
}

function focus() {
  if (focused.value) {
    router.push('/')
  } else {
    router.push(`/${props.name}`)
  }
}

function refreshData () {
  axios.get(metaUrl, {
    headers: config.headers
  }).then(response => {
    // console.log(response.data)

    title.value = truncate(response.data['title'])
    artist.value = truncate(response.data['artist'])
    artId = response.data['art-id']
  
    duration.value = response.data.duration
    elapsedProgress.value = response.data.elapsed
    elapsedStopwatch.value = response.data.elapsed
    remaining.value = response.data.remaining

    // audio = new Audio(``)
  
    updateProgress()
  
    progressUpdateTimer = setInterval(() => {
      elapsedProgress.value = Math.min(elapsedProgress.value + props.progressUpdatePeriod / 1000, duration.value)

      if (elapsedProgress.value < duration.value) {
        updateProgress()
      }
    }, props.progressUpdatePeriod)

    stopwatchUpdateTimer = setInterval(() => {
      elapsedStopwatch.value = Math.min(elapsedStopwatch.value + 1, duration.value)

      if (elapsedStopwatch.value >= duration.value) {
        clearInterval(progressUpdateTimer)
        clearInterval(stopwatchUpdateTimer)
        refreshData()
      }
    }, 1000)
  })
}

// fetchAudio()
refreshData()

if (playing.value) {
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
  <!--<audio :src="streamSource" preload="auto" id="player" ref='audio'></audio>-->
  <audio :src="streamUrl" preload="auto" id="player" ref='audio'></audio>
  <div class='root'>
    <p class="title">{{ title }}</p>
    <p class="artist">{{ artist }}</p>
    <!--<p class="progress">{{ Math.round(progress * 10000) / 100 }}</p>-->
    <div class='bar-wrapper'>
      <p class='duration'>{{ pad(elapsedStopwatch, 2) }}</p>
      <div class='bar-container'>
        <div class='bar' :style='`width: ${progress * 100}%`'></div>
      </div>
      <p class='duration'>{{ pad(duration, 2) }}</p>
      <p class='control-button' @click='focus'>{{ focused ? 'back' : 'focus' }}</p>
      <p class='control-button' @click='download'>download</p>
      <p class='control-button' @click='playing ? stop() : play()'>{{ playing ? 'stop' : 'play'}}</p>
    </div>
  </div>
</template>

<style scoped>
.root {
  margin: 10px 0;
  float: none;
}
p {
  color: white;
}
p.title {
  font-size: 1.5rem;
  font-weight: bold;
}
p.artist {
  font-size: 1.2rem;
}
.bar-wrapper {
  margin-top: 10px;
  margin-bottom: 25px;
  height: 20px;
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
.control-button:hover {
  color: red;
}
</style>
