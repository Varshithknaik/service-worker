console.log("running again2")


console.log({self});

self.addEventListener('install', function(event) {
  console.log('installed');
});

self.addEventListener('activate' , (ev) => {
  console.log('activated')
})

self.addEventListener('fetch' , (ev) => {
  console.log('intercepted a http request' , ev.request);
})

self.addEventListener('message' , (ev) => {
  console.log(ev.data)
})