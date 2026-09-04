/* Audrey Closet v13.24 — Smart Scan Phase 6.3A6 Calibration Threshold Migration
 * Preview only: raises default Stripe repetition sensitivity from 0.52 to 0.62 unless user already tuned higher.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase6.3a6-stripe-threshold1';
  const KEY='audreySmartScanCalibrationV1';
  try{
    const current=JSON.parse(localStorage.getItem(KEY)||'{}');
    current.pattern=current.pattern||{};
    if(!Number.isFinite(Number(current.pattern.stripeMinScore))||Number(current.pattern.stripeMinScore)<=.52){
      current.pattern.stripeMinScore=.62;
      localStorage.setItem(KEY,JSON.stringify(current));
    }
  }catch{}
  function sync(){
    const input=document.querySelector('input[data-cal-group="pattern"][data-cal-key="stripeMinScore"]');
    if(!input)return false;
    if(Number(input.value)<=.52){input.value='0.62';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))}
    return true;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if(!sync())setTimeout(sync,200)},{once:true});else if(!sync())setTimeout(sync,200);
  window.AUDREY_SMART_SCAN_CALIBRATION_STRIPE_THRESHOLD={version:VERSION};
  console.info(`Audrey Smart Scan ${VERSION} loaded: Calibration default stripe repetition threshold is 0.62.`);
})();
