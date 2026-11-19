const CACHE='homewod-v14';
const ASSETS=['./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==location.origin)return;
  // Network first (always the newest version); cache is only an offline fallback
  e.respondWith((async()=>{
    try{
      const fresh=req.mode==='navigate'?new Request(req.url,{cache:'no-store',credentials:'same-origin'}):new Request(req,{cache:'no-store'});
      const res=await fetch(fresh);
      if(res&&res.ok&&res.type==='basic'){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp)).catch(()=>{})}
      return res;
    }catch(err){
      try{const r=await fetch(req);if(r)return r}catch(_){}
      const c=(await caches.match(req,{ignoreSearch:true}))||(req.mode==='navigate'?((await caches.match('./en.html'))&&url.pathname.endsWith('en.html')?await caches.match('./en.html'):(await caches.match('./'))||(await caches.match('./index.html'))):null);
      return c||Response.error();
    }
  })());
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c)return c.focus()}return self.clients.openWindow('./')}))});
