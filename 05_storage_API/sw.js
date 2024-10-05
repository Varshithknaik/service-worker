const version = 5;
const staticName = `staticCache-${version}`;
const dynamicName = `dynamicCache`;
const fontName = `fontCache-${version}`;
const imgName = `imageCache-${version}`;

const assets = ['/', '/index.html', '/css/main.css', '/js/app.js'];

const imgAssets = [
  '/images/img1.jpg',
  '/images/img1.jpg?id=one',
  '/images/img2.jpg',
  // '/images/img2.jpg',
  '/images/img3.jpg', 
  // '/images/img3.jpg',
  '/images/img4.jpg',
  // '/images/img4.jpg',
]

self.addEventListener('install', (ev) => {
  // service worker has been installed.
  //Extendable Event
  console.log(`Version ${version} installed`);
  ev.waitUntil(
    caches.open(staticName).then((cache) => {
      cache.addAll(assets).then(() => {
        console.log(`${staticName} has been updated`);
      },(err) => {
        console.warn(`${staticName} has not been updated`) 
      })
    }).then(() => {
       caches.open(imgName).then((cache) => {
        cache.addAll(imgAssets).then(() => {
          console.log(`${imgName} has been updated`)
        },() => {
          console.warn(`failed to update ${imgName}`)
        })
      })
    })
  )
});

self.addEventListener('activate', (ev) => {
  // when the service worker has been activated to replace an old one.
  //Extendable Event
  console.log('activated');
  // delete old versions of caches.
  ev.waitUntil(
    caches.keys().then(( keys) => {
      return Promise.all(
        keys.filter(key => (key != staticName  && key != imgName)).map(key => caches.delete(key))
      )
    })
  )
});

self.addEventListener('fetch', (ev) => {
  // ev.request each time the webpage asks for any resource.
  //Extendable Event
  // console.log('fetch request for', ev.request.url, 'from', ev.clientId);
  //check the cache then do a fetch if missing
});

self.addEventListener('message', (ev) => {
  //message from web page ev.data.
  //Extendable Event
});