// The Coach, part seven: fixes from the audit. Full restore, the phone's back button, session ticks,
// recording pruning, leave warning, short versions of the long contribution, quick starts for short moves.

/* ---------- 1. full backup restore ---------- */
restoreBackup=function(text){
  let b; try{ b=JSON.parse(text); }catch(e){ return toast("That isn't a Coach backup"); }
  if(!b||b.app!=="coach"||!b.state) return toast("That isn't a Coach backup");
  const st=b.state;
  const maxMerge=(k)=>{ const src=st[k]; if(!src||typeof src!=="object"||Array.isArray(src)) return; S[k]=S[k]&&typeof S[k]==="object"?S[k]:{};
    for(const [id,v] of Object.entries(src)){ const cur=S[k][id];
      if(cur==null) S[k][id]=v;
      else if(typeof v==="number"&&typeof cur==="number") S[k][id]=Math.max(cur,v);
      else if(v===true||cur===true) S[k][id]=typeof cur==="object"?cur:true;
      else if(typeof v==="object"&&typeof cur==="object"){
        if(k==="lad") S[k][id]=((v.lv||0)>(cur.lv||0))?v:cur;
        else if(k==="lex") S[k][id]=((v.n||0)>(cur.n||0))?v:cur;
        else if(k==="sessions") S[k][id]=Object.assign({},v,cur);
        else S[k][id]=((v.t||v.n||0)>(cur.t||cur.n||0))?v:cur;
      } } };
  ["read","drills","applied","sessions","lex","moves","craft","notes","long","longRead","formulas","fRead","ntRead","nSims","lad"].forEach(maxMerge);
  const byId=(k,stamp)=>{ const mine=Array.isArray(S[k])?S[k]:[]; const theirs=Array.isArray(st[k])?st[k]:[]; const m=new Map(mine.map(x=>[x.id,x])); theirs.forEach(x=>{ if(!x||!x.id) return; const c=m.get(x.id); if(!c||((x[stamp]||0)>(c[stamp]||0))) m.set(x.id,x); }); S[k]=[...m.values()]; };
  byId("drafts","updated"); byId("debriefs","t"); byId("myPhrases","id"); byId("pads","t");
  S.days=[...new Set([...(S.days||[]),...(st.days||[])])];
  for(const k of ["spot","catchS"]) if(st[k]&&S[k]) for(const f of Object.keys(st[k])) S[k][f]=Math.max(S[k][f]||0,st[k][f]||0);
  const have=new Set(A.map(a=>a.id)); A=[...A,...(b.attempts||[]).filter(a=>a&&!have.has(a.id))].sort((x,y)=>x.t-y.t);
  persist(); render(); toast("Backup restored: everything merged");
};

/* ---------- 4. prune recordings ---------- */
const MAX_TAKES=150;
const _persist7=persist;
persist=function(){
  try{
    if(A.length>3000){ const drop=A.slice(0,A.length-3000); drop.forEach(a=>{ if(a.take) delTake(a.id); }); A=A.slice(-3000); }
    const takes=A.filter(a=>a.take); if(takes.length>MAX_TAKES){ takes.slice(0,takes.length-MAX_TAKES).forEach(a=>{ delTake(a.id); a.take=false; }); }
  }catch(e){}
  return _persist7();
};

/* ---------- 5. warn before throwing away a take ---------- */
confirmLeave=function(){ return confirm("Stop this take? It won't be saved."); };

/* ---------- 3. session ticks ---------- */
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-read],[data-studied]"); if(!b) return;
  const ss=S.sessions[dayNum()]=S.sessions[dayNum()]||{};
  if(b.dataset.read!==undefined&&S.read[b.dataset.read]){ ss.course=true; persist(); }
  if(b.dataset.studied!==undefined){ ss.train=true; persist(); }
});

/* ---------- short versions of the long contribution ---------- */
function shortDrill(sc){
  const d=longDrill(sc); const sh=(sc.model||{}).short||{};
  d.id=sc.id+"-short"; d.label="The long contribution · short version"; d.title="The short version"; d.prep=30; d.seconds=sh.seconds||60; d.shortVer=true;
  d.how="The chair asks for brevity. Thirty seconds to think; then about a minute: the proposal, named and numbered, and an action. Skip the preamble.";
  d.targets={wpm:[125,160],fillers:1};
  d.checks=["I was into the substance within ten seconds.","The proposal was named and numbered.","I attached it to one other speaker's point.","I closed with an action, owner and date, or minute wording.","I finished inside the time."];
  return d;
}
const _runReview7=runReview;
runReview=function(d){
  if(d.shortVer&&d.longScen){ const sh=((d.longScen.model||{}).short||{}).text||""; const full=_runReview7(Object.assign({},d,{shortVer:false}));
    return `<div class="card"><div class="eyebrow">The short version that would be heard</div><div class="model">${mark(sh)}</div><div class="row">${hearBtn(sh)}</div></div><details class="card exd"><summary><div style="font-family:var(--serif);font-size:1.15rem;font-weight:600">The full version, slot by slot</div></summary>${full}</details>`; }
  return _runReview7(d);
};
const _vMeetings7=vMeetings;
vMeetings=function(){
  let h=_vMeetings7();
  if(tab==="meetings"&&mtSec==="long"&&!longItem&&!(LAD&&LAD.pack)){
    h=h.replace(/<button class="btn small ghost" data-lg-summ="([^"]+)" title="Summarise the room">Summarise<\/button>/g,(m,id)=>`<div class="row" style="flex-direction:column;gap:4px;flex:none">${LONGS[id]&&LONGS[id].model&&LONGS[id].model.short?`<button class="btn small" data-lg-short="${id}">1 min</button>`:""}<button class="btn small ghost" data-lg-summ="${id}" title="Summarise the room">Summarise</button></div>`);
    h=h.replace('<button class="btn" data-lg-sprint>',`<button class="btn" data-lg-shortrand>${I.mic} The one-minute version</button><button class="btn" data-lg-sprint>`);
  }
  return h;
};

/* ---------- quick starts for the new short moves ---------- */
const SHORT_FAMS=["Called on","Under fire","Recovery","Questions","Media","Around the meeting"];
function shortScen(fams){ const xs=Object.values(SCEN).filter(sc=>{ const m=MOVEBY[sc.move]||{}; return fams?fams.includes(m.family):(sc.seconds||60)<=40; }); return xs.length?rnd(xs):null; }
const _vToday7=vToday;
vToday=function(){ let h=_vToday7(); const extra=`<button class="btn" data-qs-cold>${IC.meet} Called on cold</button><button class="btn" data-qs-fire>${IC.meet} Under fire</button><button class="btn" data-qs-short>${I.mic} Thirty seconds</button>`; return h.replace('<button class="btn" data-lg-sprint>', extra+'<button class="btn" data-lg-sprint>'); };

document.addEventListener("click",e=>{
  const b=e.target.closest("[data-lg-short],[data-lg-shortrand],[data-qs-cold],[data-qs-fire],[data-qs-short]"); if(!b) return; const d=b.dataset;
  if(d.lgShort!==undefined){ startRunner(shortDrill(LONGS[d.lgShort]),{tab:"meetings"}); return; }
  if(d.lgShortrand!==undefined){ const xs=LONG_SCEN.filter(s=>s.model&&s.model.short); if(!xs.length) return toast("Short versions are still loading"); startRunner(shortDrill(rnd(xs)),{tab:"meetings"}); return; }
  const pick=d.qsCold!==undefined?shortScen(["Called on"]):d.qsFire!==undefined?shortScen(["Under fire"]):shortScen(null);
  if(!pick) return toast("Nothing to practise yet"); startRunner(scenarioDrill(pick),{tab:"today"});
});

/* ---------- 6. Greats tabs fit a narrow phone ---------- */
const _vGreats7=vGreats;
vGreats=function(){ return _vGreats7().replace('data-g-sec="pick">Pick for the room<','data-g-sec="pick">Pick a room<').replace('data-g-sec="spot">Spot it<','data-g-sec="spot">Spot it<'); };

/* ---------- 2. the phone's back button ---------- */
const NAVK=["tab","view","mtSec","longItem","mvMove","ntItem","dbOpen","gSec","gItem","spSec","spItem","spDraft","lexField","lexEntry","progressSec"];
function navGet(){ const o={}; NAVK.forEach(k=>{ try{ o[k]=eval(k); }catch(e){} }); o.LAD=LAD&&LAD.pack?{pack:LAD.pack,rung:LAD.rung,home:LAD.home}:null; if(tab==="run") o.run=R?R.drill.id:"x"; return o; }
function navSet(o){ NAVK.forEach(k=>{ if(k in o){ try{ const v=o[k]; eval(k+"=v"); }catch(e){} } }); LAD=o.LAD?Object.assign({},o.LAD):{pack:null,rung:null,home:null}; lexReview=null; spotSet=null; }
let navCur=null, navLock=false;
const _render7=renderInner;
renderInner=function(){
  _render7();
  if(navLock) return;
  const o=navGet(); const sig=JSON.stringify(o);
  if(navCur===null){ try{ history.replaceState({nav:o},""); }catch(e){} navCur=sig; return; }
  if(sig!==navCur){ const wasRun=navCur.includes('"run"'); try{ if(wasRun&&!o.run) history.replaceState({nav:o},""); else history.pushState({nav:o},""); }catch(e){} navCur=sig; }
};
addEventListener("popstate",e=>{
  const o=e.state&&e.state.nav; if(!o) return;
  if(R){ if((R.phase==="live"||R.phase==="prep")&&!confirmLeave()){ try{ history.pushState({nav:navGet()},""); }catch(_){} return; } stopAll(); R=null; }
  if(o.run){ history.back(); return; }
  navLock=true; navSet(o); try{ render(); }finally{ navLock=false; } navCur=JSON.stringify(navGet()); scrollTo(0,0);
});
render();
