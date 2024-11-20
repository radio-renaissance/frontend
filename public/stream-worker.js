// console.log('INIT')

// self.addEventListener('fetch', msg => {
//   console.log("RUNNING")
// })

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  console.log("RUNNING")

  // Intercept audio requests
  if (url.pathname.endsWith('stream')) {
    event.respondWith(
      fetch(event.request, {
        headers: new Headers({
          ...Object.fromEntries(event.request.headers.entries()), // Copy existing headers
          'ngrok-skip-browser-warning': 'foo', // Add your custom header
        }),
      })
    );
  }
});
