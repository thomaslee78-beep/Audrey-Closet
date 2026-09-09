/* Audrey Closet Smart Scan Service — Phase 7A4B
 * Cloudflare Worker-style serverless proxy for public Smart Scan.
 * Required secret: OPENAI_API_KEY
 * Optional KV binding: SMARTSCAN_USAGE_KV (per-install/IP daily quotas)
 */
const SERVICE_VERSION='13.24-phase7a4b-worker2';
const APP_ID='audrey-closet';
const FEATURE='smartscan';
const DEFAULT_MODEL='gpt-5.6-luna';
const ALLOWED_MODELS=new Set(['gpt-5.6-luna','gpt-5.6-terra','gpt-5.6-sol']);
const ALLOWED_ORIGINS=new Set([
  'https://thomaslee78-beep.github.io'
]);
const MAX_BODY_BYTES=8_000_000;
const MAX_IMAGE_CHARS=7_500_000;
const DEFAULT_DAILY_LIMIT=30;
const TAXONOMY={
  categories:['Tops','Bottoms','Dresses','Outerwear','Shoes','Accessories','Misc'],
  patterns:['Solid','Stripe','Plaid','Floral/Print','Graphic','Colorblock','Other'],
  colors:['Black','White','Cream','Gray','Brown','Coffee','Tan','Beige','Burgundy','Red','Orange','Yellow','Mustard','Olive','Green','Mint','Turquoise','Blue','Navy','Purple','Pink','Multicolor'],
  types:{
    Tops:['T-shirt','Long-sleeve T-shirt','Tank top','Blouse','Button-down shirt','Polo','Sweater','Sweatshirt','Hoodie','Cardigan','Crop top','Camisole','Other'],
    Bottoms:['Jeans','Pants / Trousers','Leggings','Shorts','Skirt','Joggers / Sweatpants','Other'],
    Dresses:['Mini Dress','Midi Dress','Maxi Dress','Shirt Dress','Sweater Dress','Slip Dress','Wrap Dress','Casual Dress','Formal / Event Dress','Other'],
    Outerwear:['Jacket','Coat','Blazer','Vest','Rain jacket','Puffer','Fleece','Other'],
    Shoes:['Sneakers','Athletic shoes','Boots','Sandals','Flats','Heels','Loafers','Slippers','Other'],
    Accessories:['Hat','Belt','Bag / Purse','Backpack','Scarf','Jewelry','Sunglasses','Hair accessory','Gloves','Other'],
    Misc:['Jumpsuit / Romper','Swimsuit','Socks','Tights','Underwear','Pajamas / Sleepwear','Costume','Uniform','Other']
  }
};

function cors(origin){
  const allowed=origin&&ALLOWED_ORIGINS.has(origin)?origin:'';
  return{'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,X-Audrey-App,X-Audrey-Feature,X-Audrey-Request','Access-Control-Max-Age':'86400','Vary':'Origin'};
}
function json(body,status=200,origin=''){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8',...cors(origin)}})}
function error(code,message,status,origin,retryAfter){const body={ok:false,error:{code,message}};if(retryAfter)body.retryAfter=retryAfter;return json(body,status,origin)}
function validOrigin(request){const origin=request.headers.get('Origin')||'';return origin&&ALLOWED_ORIGINS.has(origin)}
function extractText(body){
  if(typeof body?.output_text==='string'&&body.output_text.trim())return body.output_text.trim();
  for(const out of body?.output||[])for(const c of out?.content||[])if((c?.type==='output_text'||c?.type==='text')&&typeof c.text==='string'&&c.text.trim())return c.text.trim();
  return'';
}
function schema(){
  const allTypes=[...new Set(Object.values(TAXONOMY.types).flat())];
  return{name:'audrey_smart_scan_result',strict:true,schema:{type:'object',additionalProperties:false,properties:{category:{type:'string',enum:['',...TAXONOMY.categories]},type:{type:'string',enum:['',...allTypes]},color:{type:'string',enum:['',...TAXONOMY.colors]},pattern:{type:'string',enum:['',...TAXONOMY.patterns]},brand:{type:'string'},size:{type:'string'},confidence:{type:'object',additionalProperties:false,properties:{category:{type:'number',minimum:0,maximum:1},type:{type:'number',minimum:0,maximum:1},color:{type:'number',minimum:0,maximum:1},pattern:{type:'number',minimum:0,maximum:1}},required:['category','type','color','pattern']}},required:['category','type','color','pattern','brand','size','confidence']}};
}
function validateResult(raw){
  if(!raw||!TAXONOMY.categories.includes(raw.category)||!TAXONOMY.colors.includes(raw.color)||!TAXONOMY.patterns.includes(raw.pattern))return false;
  if(raw.type&&!(TAXONOMY.types[raw.category]||[]).includes(raw.type))return false;
  return true;
}
async function quota(request,env,installId){
  const dailyLimit=Math.max(1,Number(env.SMARTSCAN_DAILY_LIMIT||DEFAULT_DAILY_LIMIT)||DEFAULT_DAILY_LIMIT);
  if(!env.SMARTSCAN_USAGE_KV)return{allowed:true,limit:dailyLimit,remaining:null,mode:'log-only'};
  const day=new Date().toISOString().slice(0,10),ip=request.headers.get('CF-Connecting-IP')||'unknown';
  const rawKey=`${APP_ID}:${FEATURE}:${day}:${installId||'no-install'}:${ip}`;
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(rawKey));
  const hash=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
  const key='quota:'+hash,count=Number(await env.SMARTSCAN_USAGE_KV.get(key)||0);
  if(count>=dailyLimit)return{allowed:false,limit:dailyLimit,remaining:0,mode:'kv'};
  await env.SMARTSCAN_USAGE_KV.put(key,String(count+1),{expirationTtl:172800});
  return{allowed:true,limit:dailyLimit,remaining:Math.max(0,dailyLimit-count-1),mode:'kv'};
}
function logUsage(entry){console.log(JSON.stringify({type:'audrey.ai.usage',serviceVersion:SERVICE_VERSION,...entry}))}

export default{
  async fetch(request,env){
    const origin=request.headers.get('Origin')||'';
    if(request.method==='OPTIONS'){
      return validOrigin(request)
        ? new Response(null,{status:204,headers:cors(origin)})
        : error('ORIGIN_NOT_ALLOWED','Origin is not allowed.',403,origin);
    }
    const url=new URL(request.url);
    if(url.pathname==='/health'&&request.method==='GET')return json({ok:true,service:'audrey-smartscan',version:SERVICE_VERSION,provider:'openai',defaultModel:DEFAULT_MODEL},200,origin);
    if(url.pathname!=='/v1/smartscan/analyze'||request.method!=='POST')return error('NOT_FOUND','Not found.',404,origin);
    if(!validOrigin(request))return error('ORIGIN_NOT_ALLOWED','Origin is not allowed.',403,origin);
    if(request.headers.get('X-Audrey-App')!==APP_ID||request.headers.get('X-Audrey-Feature')!==FEATURE)return error('INVALID_CLIENT','Invalid application or feature.',403,origin);
    if(!env.OPENAI_API_KEY)return error('SERVICE_NOT_CONFIGURED','Smart Scan service is not configured.',503,origin);
    const len=Number(request.headers.get('Content-Length')||0);if(len>MAX_BODY_BYTES)return error('REQUEST_TOO_LARGE','Smart Scan image is too large.',413,origin);

    let body;try{body=await request.json()}catch{return error('INVALID_JSON','Request body must be valid JSON.',400,origin)}
    if(body?.appId!==APP_ID||body?.feature!==FEATURE)return error('INVALID_CLIENT','Invalid Smart Scan client envelope.',403,origin);
    const requestId=String(body.requestId||request.headers.get('X-Audrey-Request')||'').slice(0,160);
    const installId=String(body.installId||'').slice(0,160);
    const model=ALLOWED_MODELS.has(body.model)?body.model:DEFAULT_MODEL;
    const detail=['low','high','auto'].includes(body.detail)?body.detail:'auto';
    const image=String(body.image||'');
    if(!requestId||!image.startsWith('data:image/'))return error('INVALID_REQUEST','A request ID and image are required.',400,origin);
    if(image.length>MAX_IMAGE_CHARS)return error('IMAGE_TOO_LARGE','Smart Scan image is too large.',413,origin);
    const q=await quota(request,env,installId);if(!q.allowed)return error('RATE_LIMITED','Daily Smart Scan limit reached for this device/network.',429,origin,'tomorrow');

    const prompt='Analyze this clothing item for Audrey Closet. Choose only values from the supplied taxonomy. Return the most likely category, exact type within that category, primary color, pattern, visible brand if any, visible size if any, and confidence for category/type/color/pattern. Taxonomy: '+JSON.stringify(TAXONOMY);
    const providerRequest={model,input:[{role:'user',content:[{type:'input_text',text:prompt},{type:'input_image',image_url:image,detail}]}],text:{format:{type:'json_schema',...schema()}},max_output_tokens:500};
    const started=Date.now();
    let providerResponse,providerBody={};
    try{
      providerResponse=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+env.OPENAI_API_KEY},body:JSON.stringify(providerRequest)});
      try{providerBody=await providerResponse.json()}catch{}
    }catch(err){logUsage({requestId,installId,model,status:'provider-network-error',requestMs:Date.now()-started});return error('PROVIDER_UNAVAILABLE','AI provider is temporarily unavailable.',502,origin)}
    const requestMs=Date.now()-started;
    if(!providerResponse.ok){logUsage({requestId,installId,model,status:'provider-error',providerStatus:providerResponse.status,requestMs});return error('PROVIDER_ERROR','AI provider could not complete Smart Scan.',502,origin)}
    const text=extractText(providerBody);let raw;try{raw=JSON.parse(text)}catch{return error('INVALID_PROVIDER_RESPONSE','AI provider returned an unreadable Smart Scan result.',502,origin)}
    if(!validateResult(raw))return error('INVALID_PROVIDER_RESULT','AI provider returned a result outside Audrey taxonomy.',502,origin);
    const c=raw.confidence||{};
    const result={category:{value:raw.category,confidence:c.category||0},type:{value:raw.type||'',confidence:c.type||0},color:{value:raw.color,confidence:c.color||0},pattern:{value:raw.pattern,confidence:c.pattern||0},brand:{value:raw.brand||'',confidence:null},size:{value:raw.size||'',confidence:null}};
    const usage=providerBody?.usage||{};
    logUsage({requestId,installId,userId:body.userId||null,sessionId:body.sessionId||'',appId:APP_ID,feature:FEATURE,model,status:'success',requestMs,providerRequestId:providerBody?.id||'',usage,quota:q});
    return json({ok:true,serviceVersion:SERVICE_VERSION,requestId,provider:'openai',providerRequestId:providerBody?.id||'',model,requestMs,usage,quota:{limit:q.limit,remaining:q.remaining},result},200,origin);
  }
};
