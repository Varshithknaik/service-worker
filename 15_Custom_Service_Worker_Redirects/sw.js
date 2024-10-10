self.addEventListener('install', (ev) => {
  console.log('installed');
});
self.addEventListener('activate', (ev) => {
  console.log('activated');
});

self.addEventListener('fetch', (ev) => {
  console.log('fetch request for', ev.request.url);
  let url = new URL(ev.request.url);
  let mode = ev.request.mode;
  let seconds = new Date().getSeconds();

  if (mode === 'navigate' && url.origin === location.origin) {
    //local html file request
    if (seconds % 2 === 0) {
      let resp = new Response('', {
        status: 307, //Temporary Redirect
        headers: {
          'cache-control': 'Max-Age=0, no-store',
          location: './custom.html',
        },
      });

      ev.respondWith(resp);
    } else {
      ev.respondWith(fetch(ev.request));
    }
  } else {
    ev.respondWith(fetch(ev.request));
  }
});