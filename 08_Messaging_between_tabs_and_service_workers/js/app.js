const APP = {
  SW : null,
  cacheName: 'assetCache1',
  init(){
    APP.registerSW();
    
    document.getElementById('colorForm')
      .addEventListener('submit' , APP.saveColor)

    document.querySelector('h2').addEventListener('click', (ev) => {
      // Send a message to all the service worker
      // have it bounce back to all pages sharing that sw
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
      // listen for latest SW 
      navigator.serviceWorker.addEventListener('controllerchange', async() => {
        APP.SW = navigator.serviceWorker.controller;
      })
      // listen for messages from the service worker
      navigator.serviceWorker.addEventListener('message', APP.onMessage)
    }else{
      console.log('Service Worker not present')
    }
  },


  saveColor(ev) {
    ev.preventDefault();
    let name = document.getElementById('name');
    let color = document.getElementById('color');
    let strName = name.value.trim();
    let strColor = color.value.trim();
    if (strName && strColor) {
      let person = {
        id: Date.now(),
        name: strName,
        color: strColor,
      };
      console.log('Save', person);
      //send the data to the service worker
      //, otherAction: 'hello'
      APP.sendMessage({ addPerson: person });
    }
  },

  sendMessage(msg){
    // Send some structured-clonable data from webpage to the sw
    if(navigator.serviceWorker.controller){
      navigator.serviceWorker.controller.postMessage(msg)
    }
  },
  //  it gets from ev.data (onMessage)
  onMessage({data}){
    // get a message from the service worker
    console.log('Web page reciving' , data)
  }
}

document.addEventListener('DOMContentLoaded', APP.init)

let options = {
  ignoreSearch: false,
  ignoreMethod: false,
  ignoreVary: false 
}