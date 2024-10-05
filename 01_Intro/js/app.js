const APP = {
  SW : null,
  cacheName: 'assetCache1',
  init(){
    // Called after DOMContentLoaded
    // if('serviceWorker' in navigator){
    //   // 1. Register a service worker hosted at the root of the site using the default scope.
    //   navigator.serviceWorker.register('/sw.js', { 
    //     scope: '/'
    //   }).then( registration => {  // has three stages installing , active ,waiting 
    //     APP.SW = registration.installing ||
    //               registration.waiting || 
    //               registration.active
    //     console.log('service woker registered')
    //   })  

    //   // 2. See if the page is currently has a service worker.
    //   if(navigator.serviceWorker.controller){
    //     console.log('we have a service worker installed')
    //   }

    //   // 3. Register a handler to detect when a new or updated service worker is installed & activate.
    //   navigator.serviceWorker.oncontrollerchange = (ev) => {
    //     console.log("New Service Worker activated")
    //   }
    //   // 4. remove/unregister service workers
    //   // navigator.serviceWorker.getRegistrations().then((regs) => {
    //   //   console.log(regs);
    //   //   for(const reg of regs){
    //   //     reg.unregister().then((isUnreg) => console.log(isUnreg));
    //   //   }
    //   // })
    //   // 5. Listen for messages from the service worker

    // }else{
    //   console.log("Service Worker not supported")
    // }


    // Caching
    APP.startCaching()

    document
      .querySelector('header>h2')
      .addEventListener('click', APP.deleteCache)

    document.querySelector('h2').addEventListener('click' , APP.addImage)

  },

  addImage() {
    let img = document.createElement('img');
    img.src = '/images/img1.jpg'
    img.alt = 'dynamically added Image'
    let p = document.createElement('p');
    p.append('img')

    document.querySelector('main').append(p, img)
  },

  startCaching(){
    // Open Cache and save some response
    return caches.open(APP.cacheName).then(async (cache) => {
      console.log(`Cache ${APP.cacheName} opened ${cache}`)

      let urlString = '/images/img1.jpg';
      cache.add(urlString); // add = fetch + put

      let url = new URL("http://127.0.0.1:5500/images/img2.jpg")
      cache.add(url);

      const req = new Request('/images/img3.jpg');
      cache.add(req);

      cache.keys().then((keys) => {
        keys.forEach((key , index) => {
          // console.log(index , key);
        })
      })

      return cache;
    }).then(async (cache) => {
      // Check if cache is Exists
      caches.has(APP.cacheName).then((hasCache) => {
        // console.log(`${APP.cacheName} ${hasCache}`)
      })

      // Search for files in caches
      // cache.match() or cache.matchAll()
      // caches.match() - look in all caches

      let urlString = '/images/img4.jpg';
      return caches.match(urlString).then((cacheResponse) => {
        if(cacheResponse && 
            cacheResponse.status < 400 &&
            cacheResponse.headers.has('content-type') &&
            cacheResponse.headers.get('content-type').match(/^image\//i)){
          // not an error if not found

          console.log('found in the cache')
          // console.log(cacheResponse);
          return cacheResponse

        }else{
          // No Match found
          console.log('not found in the cache')
          return fetch(urlString).then((fetchResponse) => {
            // console.log(fetchResponse);
            if(!fetchResponse.ok) throw fetchResponse.statusText
            // We have a valid fetch
            cache.put(urlString, fetchResponse.clone()) // clone is present in request and response object
            return fetchResponse
          })
        }
      })
    }).then( (response) => {
      console.log(response);
      document.querySelector('output').textContent = response.url
      return response.blob();
    }).then((blob) => {
      let url = URL.createObjectURL(blob);
      let img = document.createElement('img');
      img.src = url;
      document.querySelector('output').append(img);
    })
  },

  deleteCache(){
    // click the h2 to delete our cache or something in a cache
    // Delete a response from the cache
    caches.open(APP.cacheName).then((cache) => {
      let url = '/images/img4.jpg';
      cache.delete(url).then((isGone) => { console.log(isGone)})
    })
    // Delete Entire Cache

    caches.delete(APP.cacheName).then((isGone) => {
      console.log(isGone)
    });
    
  }
}

document.addEventListener('DOMContentLoaded', APP.init)