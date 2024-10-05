const version = 1;
self.addEventListener('install', function(ev) {
  ev.waitUntil(
    Promise.resolve().then(() => {
      manuel();
    }).then(() => {
      // The promise returned from teja will wait untill it resolves before going to the next then();
      return teja();
    }).then((val) => {
      console.log('installed' , val , 'from teja promise');
      // when this then() returns undefined it goes to ev.waitUntil()
      // which will then change our state from installing to installed
    })
  )
  // self.skipWaiting(); // Skip the waiting to activate
  // But... page will not use the new sw yet
});


function teja(){
  return new Promise((resolve , reject) => {
    setTimeout(() => {
      console.log('teja promise')
      resolve(2);
    }, 2000)
  })
}

function manuel(){
  console.log('manuel');
}

self.addEventListener('activate' , (ev) => {
  console.log('activated - this worker not used untill page reloads')
  // clients.claim().then(() => {
  // //claim means that the html file will use this new service worker.
  //   console.log(
  //     'the service worker has now claimed all pages so they use the new service worker.'
  //   );
  // })
})

self.addEventListener('fetch' , (ev) => {
  // ev.request each time the webpage asks for any resource;
  // Extendable Event
  console.log(`fetch request for  ${ev.request.url} from ${ev.clientId}`)
})

self.addEventListener('message' , (ev) => {
  console.log(ev.data)
})