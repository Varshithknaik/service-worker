
const version = 5;
const staticName = `staticCache-${version}`;
const dynamicName = `dynamicCache`;
const imgName = `imageCache-${version}`;

const options = {
  ignoreSearch: false,
  ignoreMethod: false,
  ignoreVary: false
}

const assets = ['/', '/index.html', '/css/main.css', '/js/app.js' , '/404.html'];

const imgAssets = [
  '/images/img1.jpg',
  '/images/distracted-boyfriend.jpg'
];

// TODO:
let DB = null;


self.addEventListener('install', (ev) => {
  // service worker has been installed.
  //Extendable Event
  console.log(`Version ${version} installed`);
  ev.waitUntil(
    caches.open(staticName).then((cache) => {
      return cache.addAll(assets).then(() => {
        console.log(`${staticName} has been updated`);
      },(err) => {
        console.warn(`${staticName} has not been updated`) 
      })
    }).then(() => {
       return caches.open(imgName).then((cache) => {
        return cache.addAll(imgAssets).then(() => {
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
      ).then(( em ) => {
        // empties is an Array of boolean values;
        // one for each cache deleted
        // TODO
        openDB();
      })
    })
  )
});

self.addEventListener('fetch', (ev) => {
  // Extendable Event.
  console.log(`MODE: ${ev.request.mode} for ${ev.request.url}`);
  ev.respondWith(
    caches.match( ev.request ).then((cacheRes) => {
      return (cacheRes || 
        Promise.resolve().then(() => {
          let opts = {
            mode: ev.request.mode, //cores , no-cors , same-origin, navigate
            cache: 'no-cache',

          }

          if( !ev.request.url.startsWith(location.origin)){
            // not on the same domain as my html file
            opts.mode = 'cors';
            opts.credentials = 'omit'
          }
          return fetch( ev.request.url , opts ).then(( fetchResponse ) => {
            if(fetchResponse.ok){
              return handleFetchResponse(fetchResponse, ev.request);
            }
  
            if(fetchResponse.status == 404){
              if(ev.request.url.match(/\.html/i)){
                return caches.open(staticName).then((cache) => {
                  return cache.match('/404.html');
                })
              }
  
              if( ev.request.url.match(/\.jpg$/i) || ev.request.url.match(/\.png/i) ){
                return caches.open(imgName).then((cache) => {
                  return cache.match('/images/distracted-boyfriend.jpg');
                })
              }
            }
          }, (err) => {
            return caches.open(staticName).then((cache) => {
              return cache.match('/404.html')
            })
          }) 
        })

      )
    })
  )
});

const handleFetchResponse = (fetchResponse, request) => {
  let type = fetchResponse.headers.get('content-type');
  // console.log('handle request for', type, request.url);
  if (type && type.match(/^image\//i)) {
    //save the image in image cache
    console.log(`SAVE ${request.url} in image cache`);
    return caches.open(imgName).then((cache) => {
      cache.put(request, fetchResponse.clone());
      return fetchResponse;
    });
  } else {
    //save in dynamic cache - html, css, fonts, js, etc
    console.log(`SAVE ${request.url} in dynamic cache`);
    return caches.open(dynamicName).then((cache) => {
      cache.put(request, fetchResponse.clone());
      return fetchResponse;
    });
  }
};

self.addEventListener('message', (ev) => {
  let data = ev.data;
  // console.log({ ev });
  const clientId = ev.source.id;
  // console.log('Service Worker Recived' , data , clientId)

  if( 'addPerson' in data ){
    // TODO: really do something with the data;
    // TODO: open the databse and wait for success
    // TODO: start a transaction
    // TODO: add() the data;
    // console.log({DB});
    // TODO: check for db then openDB or savePerson

    if(DB){
      savePerson( data.addPerson , clientId );
    }else{
      openDB( () => {
        savePerson( data.addPerson , clientId );
      })
    }


  }

  if('otherAction' in data){
    let msg = "Hola";
    sendMessage({ code: 0 , message: msg});
  }
});

const sendMessage = async (msg , clientId ) => {
  let allClients = [];

  if(clientId){
    let client = await clients.get( clientId );
    allClients.push(client);
  }else{
    allClients = await clients.matchAll({ includeUnctrolled:true });
  }

  return Promise.all( 
    allClients.map( client => {
      // console.log('postMessage' , msg , 'to' , clientId);
      return client.postMessage(msg);
    })
  )
}
const savePerson = (person , clientId ) => {
  if(person && DB ){
    let tx = DB.transaction('colorStore', 'readwrite');
    tx.onerror = (err) => {
      // failed transaction
    }

    tx.oncomplete = (ev) => {
      // finished saving.. send the message

      let msg = 'Thanks. The data was saved';
      sendMessage(
        {
          code: 0,
          message: msg,
          savedPerson: person
        },
        clientId
      );
    }
    console.log(tx)
    const store = tx.objectStore('colorStore');
    const req = store.put(person);
    req.onsuccess = (ev) => {
      // saved the persom
      // tx.commit() will be called automatically and will trigger tx.oncomplete next

    }
  }else{
    let msg = 'No Data was provided.';
    sendMessage({
      code: 0,
      message: msg,
      savePerson: person
    }, clientId)
  }
}

const openDB = (callback) => {
  let req = indexedDB.open('colorDB', version);
  req.onerror = (err) => {
    //could not open db
    console.warn(err);
    DB = null;
  };
  req.onupgradeneeded = (ev) => {
    console.log('db opened and upgraded as needed');

    let db = ev.target.result;
    if (!db.objectStoreNames.contains('colorStore')) {
      db.createObjectStore('colorStore', {
        keyPath: 'id',
      });
    }
  };
  req.onsuccess = (ev) => {
    DB = ev.target.result;
    console.log('db opened and upgraded as needed');
    if (callback) {
      callback();
    }
  };
};