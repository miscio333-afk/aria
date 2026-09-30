(()=>{ // scroll-driven frame scrubber + performance-mode audio
let CFG={beats:null,frames:603,fps:20,dur:30.125,audio:"public/audio/song.m4a"};
if(location.protocol.startsWith("http"))fetch("content.json").then(r=>{if(!r.ok)throw 0;return r.json();}).then(c=>{if(c.beats)CFG.beats=c.beats;if(c.audio)CFG.audio=c.audio;if(c.frames)CFG.frames=c.frames;if(c.dur)CFG.dur=c.dur;if(c.captions)CFG.captions=c.captions;init();}).catch(()=>init());
else init(); // file:// — nessun fetch (CORS), si usano i default inline
function init(){
  const beats=CFG.beats||[{chapter:"hero",clip:[0,5],vh:120},{chapter:"climax",clip:[5,22],vh:250},{chapter:"finale",clip:[22,CFG.dur],vh:120}];
  const wrap=document.getElementById("stage-wrap"),canvas=document.getElementById("stage"),
        poster=document.getElementById("poster"),ctx=canvas.getContext("2d");
  const copies=[...document.querySelectorAll(".copy")];
  // split hero title into per-letter spans for staggered rollover (keeps <em> intact)
  (function splitLetters(){const h=document.querySelector('.copy[data-chapter="hero"] h1');if(!h)return;
    let i=0;const walk=n=>{[...n.childNodes].forEach(c=>{
      if(c.nodeType===3){const f=document.createDocumentFragment();
        [...c.textContent].forEach(ch=>{if(ch===" "){f.appendChild(document.createTextNode(" "));return;}
          const s=document.createElement("span");s.className="ch";s.textContent=ch;
          s.style.setProperty("--i",i++);f.appendChild(s);});
        n.replaceChild(f,c);}else if(c.nodeType===1)walk(c);});};
    walk(h);})();
  const cache=new Map(),MAXC=24,loading=new Set();
  const pad=n=>String(n).padStart(4,"0");
  const url=i=>`frames/frame-${pad(Math.max(0,Math.min(CFG.frames-1,i)))}.webp`;
  function load(i){i=Math.max(0,Math.min(CFG.frames-1,Math.round(i)));
    if(cache.has(i))return Promise.resolve(cache.get(i));
    if(loading.has(i))return Promise.resolve(null);loading.add(i);
    return new Promise(res=>{const im=new Image();im.decoding="async";
      im.onload=()=>{loading.delete(i);cache.set(i,im);
        if(cache.size>MAXC){const k=cache.keys().next().value;const b=cache.get(k);try{b.src="";}catch(e){}cache.delete(k);}
        res(im);};
      im.onerror=()=>{loading.delete(i);res(null);};im.src=url(i);});}
  let cur=-1,firstDrawn=false,perfActive=false;
  function draw(i){load(i).then(im=>{if(!im||perfActive&&false)return;cur=i;
    ctx.drawImage(im,0,0,canvas.width,canvas.height);
    if(!firstDrawn){firstDrawn=true;poster.style.opacity="0";setTimeout(()=>poster.remove(),500);}});}
  // Sync-critical direct draw: draws the best cached frame NOW (no async wait),
  // used while the autoplay runs so frames never trail the audio clock.
  function drawDirect(i){i=Math.max(0,Math.min(CFG.frames-1,Math.round(i)));
    let im=cache.get(i);
    if(!im){for(let d=1;d<=8;d++){im=cache.get(i-d);if(im)break;}}
    load(i);for(let k=1;k<=10;k++){load(i+k);load(i-k);}
    if(!im)return;cur=i;
    ctx.drawImage(im,0,0,canvas.width,canvas.height);
    if(!firstDrawn){firstDrawn=true;poster.style.opacity="0";setTimeout(()=>poster.remove(),500);}}
  // audio: performance mode — user gesture starts linear playback, fades at beat edges
  // Single shared element: the visible <audio> in #ascolta is the player; the hero button drives it.
  const audio=document.querySelector("#ascolta audio")||new Audio(CFG.audio);
  if(audio.tagName!=="AUDIO"){audio.preload="auto";audio.src=CFG.audio;}
  const btn=document.getElementById("audio-btn");let muted=false;
  try{muted=localStorage.getItem("pa-muted")==="1";}catch(e){}
  function paintBtn(msg){if(btn)btn.textContent=msg||(muted?"Audio disattivato — riattiva":(audio.paused?"Ascolta con audio 🔊":"In riproduzione… tocca per fermare"));}
  paintBtn();
  audio.addEventListener("playing",()=>{muted=false;paintBtn();});
  audio.addEventListener("pause",paintBtn);
  audio.addEventListener("error",()=>paintBtn("Audio non caricato — ricarica la pagina"));
  if(btn)btn.addEventListener("click",()=>{startPerformance();});
  // --- Synced performance: 10s autoplay, audio is the master clock throughout ---
  // scrollY follows audio.currentTime 1:1 across the whole pinned travel. Any user input cancels.
  let perf=null;
  function beatPx(){const{top,h}=metrics();const totalVh=beats.reduce((a,b)=>a+b.vh,0);
    let a=0;return beats.map(b=>{const x0=top+a/totalVh*h;a+=b.vh;return[x0,top+a/totalVh*h];});}
  function cancelPerf(silent){if(!perf)return;const p=perf;perf=null;perfActive=false;
    removeEventListener("wheel",p.cancel,{passive:true});removeEventListener("touchstart",p.cancel,{passive:true});
    removeEventListener("pointerdown",p.cancel);removeEventListener("keydown",p.cancel);
    cancelAnimationFrame(p.raf);if(!silent){audio.pause();finishBtn("Rigioca ⟳");}}
  function finishBtn(label){if(btn){btn.style.display="";btn.textContent=label;}}
  function startPerformance(){
    if(perf){cancelPerf();return;}
    if(reduce){draw(100);return;}
    const{top,h}=metrics();
    const yStart=top+2,yEnd=top+h-2;
    btn.style.display="none"; // button disappears during autoplay (spec)
    audio.pause();audio.currentTime=0;audio.volume=1;
    const cancel=()=>cancelPerf();
    perf={cancel,raf:0};
    scrollTo({top:yStart,behavior:"instant"});
    audio.play().catch(()=>{cancelPerf(true);finishBtn("Tocca di nuovo per avviare l'audio");return;});
    addEventListener("wheel",cancel,{passive:true,once:true});
    addEventListener("touchstart",cancel,{passive:true,once:true});
    addEventListener("pointerdown",cancel,{once:true});addEventListener("keydown",cancel,{once:true});
    (function tick(){
      if(!perf)return;
      if(audio.ended){scrollTo({top:yEnd,behavior:"instant"});drawDirect(CFG.frames-1);perf=null;perfActive=false;
        removeEventListener("wheel",cancel);removeEventListener("touchstart",cancel);
        removeEventListener("pointerdown",cancel);removeEventListener("keydown",cancel);
        finishBtn("Rigioca ⟳");onScroll();return;}
      // Extrapolated audio clock: audio.currentTime quantizes coarsely (~4Hz),
      // so project forward with performance.now() between updates for smooth motion.
      const raw=audio.paused?0:audio.currentTime;
      if(raw!==tick._lastRaw){tick._lastRaw=raw;tick._lastPerf=performance.now();}
      const est=audio.paused?raw:raw+((performance.now()-(tick._lastPerf||performance.now()))/1000);
      const k=Math.min(1,est/CFG.dur);
      scrollTo({top:yStart+(yEnd-yStart)*k,behavior:"instant"});
      perfActive=true;
      showCaption(est/3);
      drawDirect(k*(CFG.frames-1));
      perf.raf=requestAnimationFrame(tick);
    })();
  }
  let faded=false;
  function fadeOut(){if(audio.paused||faded)return;faded=true;
    // simple ramp: lower volume over 600ms then pause
    const t0=performance.now();(function step(){const k=1-(performance.now()-t0)/600;
      if(k<=0||audio.paused){audio.pause();audio.volume=1;faded=false;}else{audio.volume=Math.max(0,k);requestAnimationFrame(step);}})();}
  audio.addEventListener("play",()=>{faded=false;});
  // scroll mapping: piecewise beats
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  function metrics(){const top=wrap.offsetTop,h=wrap.offsetHeight-innerHeight;return{top,h};}
  const capEl=document.getElementById("caption"),
        capLine=capEl?capEl.querySelector(".cap-line"):null,
        capSub=capEl?capEl.querySelector(".cap-sub"):null;
  const CAPS=CFG.captions&&CFG.captions.length?CFG.captions:[
   {line:"Aria è arrivata.",sub:"Il primo singolo sta per alzare la polvere.",layout:"bl",motion:"rise-blur"},
   {line:"Trenta secondi.",sub:"Tanto basta per non dimenticarla più.",layout:"tc",motion:"slide-r"},
   {line:"Canta piano.",sub:"Per farsi sentire forte.",layout:"bc",motion:"wipe"},
   {line:"«Non sei polvere»",sub:"Il titolo è una promessa, non un titolo.",layout:"tl",motion:"tracking"},
   {line:"Un take solo.",sub:"Niente rete. Niente filtri. Niente scuse.",layout:"br",motion:"scale"},
   {line:"Polvere",sub:"Si alza. Lei resta.",layout:"center",motion:"zoomout"},
   {line:"E se fosse per te?",sub:"Questa canzone parla a chi resta in piedi.",layout:"left-stagger",motion:"stagger"},
   {line:"Coming soon",sub:"Ovunque si ascolta musica. Prestissimo.",layout:"bc-badge",motion:"rise"},
   {line:"Segui la genesi.",sub:"Il viaggio comincia prima dell'uscita.",layout:"right-it",motion:"slide-blur"},
   {line:"Non sei polvere.",sub:"Avvisami all'uscita — il primo singolo di Aria.",layout:"center-cta",motion:"glow-hold"}];
  let capIdx=-1;
  const slotNum=document.getElementById("slot-num");
  function showCaption(i){ // one phrase per 3s slot
    if(!capEl||!CAPS.length)return;
    i=Math.max(0,Math.min(CAPS.length-1,Math.floor(i)));
    if(i===capIdx)return;capIdx=i;
    const c=CAPS[i];
    capLine.textContent=c.line;capSub.textContent=c.sub||"";
    capEl.className="cap lay-"+c.layout+" mo-"+c.motion;
    if(slotNum)slotNum.textContent=String(i+1).padStart(2,"0")+" / "+String(CAPS.length).padStart(2,"0");
    void capEl.offsetWidth; // restart entrance animation
    capEl.classList.add("show");}
  const pbar=document.getElementById("progress-bar");
  function onScroll(){
    if(reduce){copies.forEach(c=>c.classList.add("visible"));draw(100);return;}
    const{top,h}=metrics();const y=Math.max(0,Math.min(h,scrollY-top));
    document.body.classList.toggle("stage-active",scrollY>top&&scrollY<top+h);
    if(pbar)pbar.style.width=(y/Math.max(1,h)*100).toFixed(2)+"%";
    showCaption(y/Math.max(1,h)*10);
    const totalVh=beats.reduce((a,b)=>a+b.vh,0);let acc=0,frame=0,active=beats[0].chapter;
    beats.forEach((b,bi)=>{const px0=acc/totalVh*h,px1=(acc+b.vh)/totalVh*h;
      if(y>=px0&&y<=px1){const t=(y-px0)/Math.max(1,px1-px0);
        const[f0,f1]=[b.clip[0]/CFG.dur*(CFG.frames-1),b.clip[1]/CFG.dur*(CFG.frames-1)];
        frame=f0+(f1-f0)*t;active=b.chapter;
        if(bi===2&&t>0.85&&!audio.paused)fadeOut();}
      acc+=b.vh;});
    if(y>=h){frame=CFG.frames-1;active=beats[beats.length-1].chapter;}
    copies.forEach(c=>c.classList.toggle("visible",c.dataset.chapter===active));
    if(perfActive)return; // autoplay draws frames directly; scroll handler only moves copy/progress
    const i=Math.round(frame);
    if(i!==cur)draw(i);
    // prefetch neighbours in scroll direction
    for(let k=1;k<=4;k++)load(i+k);
  }
  let tick=false;addEventListener("scroll",()=>{if(!tick){tick=true;requestAnimationFrame(()=>{tick=false;onScroll();});}},{passive:true});
  addEventListener("resize",onScroll);
  draw(0);load(100);load(200);onScroll();
}})();
