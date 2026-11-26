const C='lombada-v3';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
/* apaga só caches antigos do próprio Lombada: o domínio é compartilhado com o Rastro e o Trama */
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('lombada-')&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const EXT=/^(fonts\.googleapis\.com|fonts\.gstatic\.com|books\.google\.com|books\.googleusercontent\.com|covers\.openlibrary\.org)$/;
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  const own=u.origin===location.origin&&u.pathname.startsWith(new URL(self.registration.scope).pathname);
  if(!own&&!EXT.test(u.hostname))return;
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request,own?{cache:'no-cache'}:undefined).then(r=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp))}return r}).catch(()=>hit);
    return hit||net}))});
