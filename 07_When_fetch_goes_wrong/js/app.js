const APP = {
  SW : null,
  cacheName: 'assetCache1',
  init(){
    APP.registerSW();
    document.querySelector('h2').addEventListener('click' , APP.addImage)
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

  addImage(ev) {
    let img = document.createElement('img');
    let p = document.createElement('p');
    let main = document.querySelector('main');
    //handle the load and error events for the image
    img.addEventListener('load', (ev) => {
      p.append(img);
      main.insertBefore(p, main.querySelector('p'));
    });
    img.addEventListener('error', (err) => {
      //don't bother adding a broken image
      p.textContent = 'Sorry. Your new image cannot be found';
      main.insertBefore(p, main.querySelector('p'));
    });
    //try to load the image
    img.src = '/img/this-image-does-not-exist.jpg';
    img.alt = 'dynamically added image';
  },
}

document.addEventListener('DOMContentLoaded', APP.init)

let options = {
  ignoreSearch: false,
  ignoreMethod: false,
  ignoreVary: false 
}