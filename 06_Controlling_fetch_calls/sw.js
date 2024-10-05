const version = 5;
const staticName = `staticCache-${version}`;
const dynamicName = `dynamicCache`;
const fontName = `fontCache-${version}`;
const imgName = `imageCache-${version}`;

const assets = ['/', '/index.html', '/css/main.css', '/js/app.js'];

const imgAssets = [
  '/images/img1.jpg',
  // '/images/img1.jpg?id=one',
  // '/images/img2.jpg',
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
  console.log('fetch request for', ev.request.url, 'from', ev.clientId);
  // Version 1 - pass thru
  // ev.respondWith( fetch(ev.request) )

  // Version 2 - check cache first for the file. If Missing do a fetch
  // ev.respondWith( //Expects Promise
  //   caches.match(ev.request).then( cacheRes => {
  //     if( cacheRes === undefined ){
  //       console.log(`MISSING ${ev.request.url}`)
  //     }

  //     return cacheRes || fetch(ev.request)
  //   })
  // )  

  // Version 3 - Check cache. Fetch if Missing. then ass response to cache
  ev.respondWith(
    caches.match(ev.request).then( cacheRes => {
      if( cacheRes === undefined ){
        console.log(`MISSING ${ev.request.url}`)
      }
      return cacheRes || fetch(ev.request).then( (fetchResponse) => {
        let type = fetchResponse.headers.get('content-type');
        if( (type && type.match(/^text\/css/i) ) || ev.request.url.match(/fonts.googleapis.com/i) ){
          // css to save in dynamic cache
          console.log(`Save a CSS file ${ev.request.url}`)
          return caches.open(dynamicName).then((cache) => {
            cache.put( ev.request , fetchResponse.clone() )
            return fetchResponse;
          })
        }else if( (type && type.match(/^font\//i)) || ev.request.url.match(/fonts.googleapis.com/i)){
          // Font to save in dynamic cache
          console.log(`Save a CSS file ${ev.request.url}`)
          return caches.open(fontName).then((cache) => {
            cache.put( ev.request , fetchResponse.clone() )
            return fetchResponse;
          })
        }else if( type && type.match(/^image\//i)  ){
          // Image to save in dynamic cache
          console.log(`Save a Image file ${ev.request.url}`)
          return caches.open(imgName).then((cache) => {
            cache.put( ev.request , fetchResponse.clone() )
            return fetchResponse;
          })
        }
        else{
          console.log(`OTHER save ${ev.request.url}`)
          return caches.open(dynamicName).then((cache) => {
            cache.put( ev.request , fetchResponse.clone() )
            return fetchResponse;
          })
        }
      })
    })
   );
});

self.addEventListener('message', (ev) => {
  //message from web page ev.data.
  //Extendable Event
  console.log('ev',ev)
});