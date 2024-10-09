const version = 'client-msg-1';

self.addEventListener('install', (ev) => {
  console.log('installed');
});
self.addEventListener('activate', (ev) => {
  console.log('activated');
});
self.addEventListener('fetch', (ev) => {
  // console.log(`fetch request for ${ev.request.url}`);
  console.log(ev.clientId);
});

self.addEventListener('message', (ev) => {
  console.log('message received', ev.data, ev.source.id);
  sendMessage({ helloFromMessage: 'in SW' , currentTime : Date.now() }, ev.source.id);
  sendMessage('to all clients');
});

function sendMessage(msg, clientid) {
  //send a message to a client
  if(clientid){
    clients.get(clientid).then(client => {
      client.postMessage({msg , openTab: 'domr' });
    })
  }else{
    // cliets.claim(); //claim all clients within its scope
    clients.matchAll().then(clientList => {
      clientList.forEach((client) => {
        client.postMessage({ msg ,openTab: 'domr' });
      })
    })
  }
}