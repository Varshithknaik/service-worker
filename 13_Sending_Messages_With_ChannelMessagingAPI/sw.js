const version = 'channel-message-sw-1';

self.addEventListener('install', (ev) => {});
self.addEventListener('activate', (ev) => {});
self.addEventListener('fetch', (ev) => {});

self.addEventListener('message', (ev) => {
  //message from a client
  if( ev.data.TYPE && ev.data.TYPE === 'PORT'){
    // we are getting a port
    console.log(ev.ports[0])
    self.port = ev.ports[0];
    self.port.onmessage = gotMessage;
  }
});

function gotMessage(ev) {
  //received a message on a port
  console.log(ev.data);
  sendMessage();
}

function sendMessage() {
  //send a message on a port
  if( 'port' in self ){
    self.port.postMessage({message: 'hello from PORT 2'});

  }else{
    // Use other clients API
  }
}