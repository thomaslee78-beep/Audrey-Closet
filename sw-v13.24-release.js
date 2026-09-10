/* Audrey Closet v13.24 — production service worker
 * Phase 7A8D: mandatory app shell + runtime JavaScript, best-effort decorative assets.
 */
const CACHE='audrey-closet-v13.24-release3';
importScripts('./release-assets-v13.24.js');
const ASSETS=Array.isArray(self.AUDREY_RELEASE_ASSETS_V1324)?self.AUDREY_RELEASE_ASSETS_V1324:[];
const SHELL=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const RUNTIME_JS=ASSETS.filter(asset=>/\.js(?:$|\?)/.test(asset));
const CORE=[...new Set([...SHELL,...RUNTIME_JS])];

async function cacheOne(cache,asset){
  const request=new Request(asset,{cache:'reload'});
  const response=await fetch(request);
  if(!response||!response.ok)throw new Error('HTTP '+(response&&response.status)+' for '+asset);
  await cache.put(request,response.clone());
}

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    // Offline-ready means the shell and every JavaScript runtime dependency exist.
    for(const asset of CORE)await cacheOne(cache,asset);
    // Decorative/media assets should not block worker activation; they can populate
    // opportunistically now or on first online use.
    const secondary=ASSETS.filter(asset=>!CORE.includes(asset));
    const results=await Promise.allSettled(secondary.map(asset=>cacheOne(cache,asset)));
    const failed=secondary.filter((_,i)=>results[i].status==='rejected');
    if(failed.length)console.warn('Audrey v13.24 secondary precache misses',failed);
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('audrey-closet-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

function sameOrigin(request){try{return new URL(request.url).origin===self.location.origin}catch{return false}}
function navigation(request){return request.mode==='navigate'||request.destination==='document'}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||!sameOrigin(request))return;
  if(navigation(request)){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        if(response&&response.ok){const cache=await caches.open(CACHE);cache.put('./index.html',response.clone()).catch(()=>{})}
        return response;
      }catch{
        return (await caches.match(request,{ignoreSearch:true}))||(await caches.match('./index.html',{ignoreSearch:true}))||(await caches.match('./',{ignoreSearch:true}))||Response.error();
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(request,{ignoreSearch:true});
    if(cached){
      event.waitUntil(fetch(request).then(async response=>{if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone())}}).catch(()=>{}));
      return cached;
    }
    try{
      const response=await fetch(request);
      if(response&&response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone()).catch(()=>{})}
      return response;
    }catch{return Response.error()}
  })());
});
