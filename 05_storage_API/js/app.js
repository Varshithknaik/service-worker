const APP = {
  SW : null,
  cacheName: 'assetCache1',
  init(){
    APP.registerSW();

    APP.getCacheSize();
    document.querySelector('h2').addEventListener('click' , APP.addImage)
  },

  getCacheSize(){
    // lets see how much storage we are using
    if('storage' in navigator){

      if('estimate' in navigator.storage){
        // get the total storage and current usage
        // see if storage can be set to persistent or stay best-effort
        navigator.storage.estimate().then(({usage , quota}) => {
          // returned numbers are in bytes
          // divided by 1024 to convert to KB
          let usedKB = parseInt( usage / 1024 );
          let quotaKB = parseInt( quota / 1024 );

          console.log(`Using ${usedKB} KB of ${quotaKB} KB`);
        })

        navigator.storage.persist().then((isPer) => {
          console.log(`Browser grants persistent permission: ${isPer}`);
        });

        navigator.storage.persisted().then((isPersisted) => {
          console.log(`Is storage persisted: ${isPersisted}`);
        });
      }else{
        console.log('No Support for StorageManager methods')
      }
    }

    caches.open('imageCache-5').then((cache) => {
      cache.matchAll().then(( matches ) => {
        // matches is an Array of Response Objects
        let total = 0;
        matches.forEach((response) => {
          if(response.headers.has('content-length')){
            total += parseInt(response.headers.get('content-length'));
            console.log(`Adding size for ${response.url}`)
          }
        })

        console.log(`Total size in imageCache-2 is ${total}`);
      })
    })
  },

  registerSW(){
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          APP.SW = registration.installing || registration.waiting || registration.active
        }, (error) => {
          console.log(' Service Worker registration failed ' , error)
        }
      )
    }else{
      console.log('Service Worker not present')
    }
  },

  addImage() {
    const img = document.createElement('img');
    img.src = '/images/img4.jpg'
    img.alt = 'dynamically added Image'
    const p = document.createElement('p');
    p.append(img)

    document.querySelector('main').append(p)
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

let options = {
  ignoreSearch: false,
  ignoreMethod: false,
  ignoreVary: false 
}