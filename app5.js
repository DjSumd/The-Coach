// The Coach, part five: training ladders. Study, Say, Spot, Fill, Guided, Free.
const PACKS=(window.COACH&&window.COACH.packs)||[]; const PK={}; PACKS.forEach(p=>PK[p.id]=p);
if(!S.lad||typeof S.lad!=="object") S.lad={};
let LAD={pack:null,rung:null,home:null};

/* ---------- pack model ---------- */
function packKind(id){ return id==="scaffold"?"scaffold":NTL[id]?"notes":FBY[id]?"formula":null; }
function packName(id){ const k=packKind(id); return k==="scaffold"?"The committee scaffold":k==="notes"?NTL[id].title:FBY[id]?FBY[id].name:id; }
function packSteps(id){ const k=packKind(id); if(k==="scaffold") return SLOTS.map(([key,l,h],i)=>({slot:l,job:h,cue:phraseFor(key,i*13)})); if(k==="formula") return FBY[id].steps; return []; }
function packFormula(id){ // a formula-shaped object the runner hooks understand
  if(packKind(id)==="formula"){ const f=FBY[id]; const ex=(PK[id]||{}).examples||[]; return f.model&&f.model.slots?f:Object.assign({},f,{model:exModel(ex[0],f.steps.length)}); }
  const ex=(PK[id]||{}).examples||[];
  return {id:"scaffold",name:"The committee scaffold",who:"Jason's seven slots",steps:packSteps(id),model:exModel(ex[0],SLOTS.length)};
}
function exModel(ex,n){ if(!ex) return {slots:[]}; const s=Array.from({length:n},()=>[]); (ex.parts||[]).forEach(p=>{ if(s[p.tag]) s[p.tag].push(p.text); }); return {room:ex.room,prompt:ex.prompt,slots:s.map(x=>x.join(" "))}; }
const RUNGS={
  formula:[["Study","Annotated examples beside weak versions. Read every note."],["Say","Read two of the examples aloud, at the speed of the room."],["Spot","Eight sentences: name the step each one is doing."],["Fill","One step is blanked from a real example. You supply it."],["Guided","A full contribution with sentence starters on screen."],["Free","Harder rooms, step names only, less time to think."]],
  notes:[["Study","Twelve worked conversions: what was said, the strong note, the weak note, why."],["Spot","Eight questions: pick the note that serves you best."],["Convert","Short pieces: write or say the note, then compare."],["Guided","Longer exchanges, two speakers."],["Free","Full stretches of meeting, three or four speakers."]]
};
RUNGS.scaffold=RUNGS.formula;
const rungsOf=id=>RUNGS[packKind(id)]||[];
function lad(id){ const x=S.lad[id]=S.lad[id]||{}; x.lv=x.lv||0; x.st=x.st||{}; x.r=x.r||{}; x.w=x.w||{}; return x; }
const NEED={formula:[null,[2,.6],[6,0],[4,.5],[1,.7],[2,.7]], scaffold:[null,[2,.6],[6,0],[4,.5],[1,.7],[2,.7]], notes:[null,[6,0],[2,.7],[2,.7],[2,.7]]};
function rungStatus(id,i){ const x=lad(id); return i<x.lv?"passed":i===x.lv?"open":"locked"; }
function rungCount(id,i){ const k=packKind(id), x=lad(id), nd=(NEED[k]||[])[i]; if(i===0){ const n=((PK[id]||{}).examples||[]).length; const st=k==="notes"?(x.st.all?n:0):Object.values(x.st).filter(Boolean).length; return [Math.min(st,n),n]; } if(!nd) return [0,0]; if((k==="notes"&&i===1)||(k!=="notes"&&i===2)) return [x.r[i]?Math.max(...x.r[i]):0,8]; return [(x.r[i]||[]).filter(s=>s>=nd[1]).length,nd[0]]; }
function passRung(id,i){ const x=lad(id); if(x.lv===i){ x.lv=i+1; const rs=rungsOf(id); toast(x.lv>=rs.length?"Mastered":"Passed. "+rs[x.lv][0]+" is open."); } x.t=Date.now(); persist(); }
function ladScore(id,i,score){ const x=lad(id); (x.r[i]=x.r[i]||[]).push(score); x.t=Date.now(); const k=packKind(id), nd=(NEED[k]||[])[i]; const ss=S.sessions[dayNum()]=S.sessions[dayNum()]||{}; ss.train=true; if(nd&&rungCount(id,i)[0]>=nd[0]) passRung(id,i); else persist(); }
const ladPct=id=>Math.min(1,lad(id).lv/Math.max(1,rungsOf(id).length));

/* ---------- drills ---------- */
function scoreOfR(R){ const n=R.checks.length; return n?R.checks.filter(Boolean).length/n:1; }
function sayDrill(id){ const ex=((PK[id]||{}).examples||[]).slice(0,6).sort(()=>Math.random()-.5).slice(0,2); const k=packKind(id);
  return {id:"lad-say-"+id,gym:true,label:"Train · Say",type:"read",long:true,title:packName(id),how:"Read it as if it were yours: standing, full voice, at the speed of the room. Feel where each step begins.",items:ex.map(e=>(e.parts||[]).map(p=>p.text).join("\n\n")),seconds:90,targets:{wpm:[115,155]},
    checks:["Each step sounded like a new beat, with a pause between.","The landed words landed.","I did not rush the proposal or the close.","The last sentence ended down, and I held it."],ladder:{id,rung:1},onSave:R=>ladScore(id,1,scoreOfR(R))}; }
function fillDrill(id){ const P=PK[id]||{}; const steps=packSteps(id); const items=[], ans=[], ctx=[];
  const pool=[]; (P.examples||[]).forEach((e,ei)=>{ const tags=[...new Set((e.parts||[]).map(p=>p.tag))]; tags.forEach(t=>pool.push([ei,t])); });
  pool.sort(()=>Math.random()-.5).slice(0,5).forEach(([ei,t])=>{ const e=P.examples[ei]; const st=steps[t]||{slot:"step"}; let done=false; const txt=(e.parts||[]).map(p=>{ if(p.tag!==t) return p.text; if(done) return null; done=true; return `[YOUR TURN · ${st.slot}]`; }).filter(x=>x!==null).join(" "); items.push(txt); ans.push({text:(e.parts||[]).filter(p=>p.tag===t).map(p=>p.text).join(" "),note:(e.parts||[]).filter(p=>p.tag===t).map(p=>p.note).join(" "),room:e.room,step:st}); ctx.push(`${e.room}. ${st.slot}: ${st.job}`); });
  return {id:"lad-fill-"+id,gym:true,label:"Train · Fill",type:"impromptu",long:true,title:packName(id),how:"Read the contribution aloud from the start. When you reach the gap, say that step yourself, then carry on to the end.",items,fillAns:ans,fillCtx:ctx,prep:15,seconds:75,
    checks:["My version did the job of this step.","It joined cleanly to the sentences either side.","It was no longer than it needed to be.","I'd be happy to say it in the real room."],ladder:{id,rung:3},onSave:R=>ladScore(id,3,scoreOfR(R))}; }
function promptDrill(id,rung,guided){ const P=PK[id]||{}; const f=packFormula(id); const lvls=guided?[1]:[2,3];
  const ps=(P.prompts||[]).filter(p=>lvls.includes(p.level)); const fallback=(FBY[id]&&FBY[id].prompts)||[]; const pool=ps.length?ps:fallback; const x=lad(id); const used=(x.r[rung]||[]).length; const p=pool[used%Math.max(1,pool.length)]||{room:"Committee",prompt:"Make your contribution.",seconds:120};
  const d=formulaDrill(f,p,null); d.id="lad-"+(guided?"g":"f")+"-"+id; d.label=guided?"Train · Guided":"Train · Free · level "+(p.level||2); d.prep=guided?60:20; d.showCues=!!guided; d.ladder={id,rung};
  const o=d.onSave; d.onSave=R=>{ try{ o(R); }catch(e){} ladScore(id,rung,scoreOfR(R)); }; return d; }
function notesSpeakDrill(id,rung,dr,k){ return {id:"lad-nd-"+id+"-"+k,gym:true,label:"Train · "+rungsOf(id)[rung][0],type:"impromptu",title:NTL[id].title,how:dr.task,said:dr.input,items:[dr.task],prep:20,seconds:dr.seconds||60,ladModel:dr.model,
  checks:["I used the notes, not my memory of the words.","I credited a speaker in their own words.","I said something that moves the room on.","It was the length the moment needed."],ladder:{id,rung},onSave:R=>{ lad(id).w[rung+"-"+k]={done:true}; ladScore(id,rung,scoreOfR(R)); }}; }

/* ---------- runner hooks ---------- */
const _runTop4=runTop, _runLive4=runLive, _runPrep4=runPrep, _runReview4=runReview;
runTop=function(d,phase){ let h=_runTop4(d,phase); if(d.fillCtx&&phase!=="review") h+=`<div class="callout" style="margin:8px 0"><div class="eyebrow">Your step</div>${esc(d.fillCtx[R.idx]||"")}</div>`; return h; };
runPrep=function(d){ if(d.showCues&&d.formula){ R.kw=R.kw||{}; return `<div class="card"><div class="eyebrow">Your plan, step by step</div>${d.formula.steps.map((s,i)=>`<div class="kwrow"><div style="font-weight:600"><b style="color:var(--acc)">${i+1}</b> ${esc(s.slot)} <span class="note" style="font-weight:400">${esc(s.job)}</span></div><div class="note" style="font-family:var(--serif);font-style:italic;font-size:1rem;color:var(--ink2)">${esc(s.cue||"")}</div><input class="search" data-kw="s${i}" value="${esc(R.kw["s"+i]||"")}" placeholder="Your keyword"></div>`).join("")}</div>`; } return _runPrep4(d); };
runLive=function(d){ if(d.showCues&&d.formula){ const kw=R.kw||{}; return `<div class="card" style="padding:10px 16px">${d.formula.steps.map((s,i)=>`<div class="livekw" style="flex-wrap:wrap"><b>${i+1}</b><span class="l">${esc(s.slot)}</span><span class="k" style="flex:1">${esc(kw["s"+i]||"")}</span><div class="note" style="width:100%;padding-left:30px;font-family:var(--serif);font-style:italic;font-size:.98rem">${esc(s.cue||"")}</div></div>`).join("")}</div>`; } return _runLive4(d); };
runReview=function(d){
  if(d.fillAns){ const a=d.fillAns[R.idx]||{}; return `<div class="card"><div class="eyebrow">What the example said · ${esc((a.step||{}).slot||"")}</div><div class="model">${mark(a.text||"")}</div><p class="sub" style="margin:0">${esc(a.note||"")}</p><div class="row" style="margin-top:8px">${hearBtn(a.text||"")}</div></div>`; }
  if(d.ladModel) return `<div class="card"><div class="eyebrow">A model answer</div><div class="model">${mark(d.ladModel)}</div><div class="row">${hearBtn(d.ladModel)}</div></div>`;
  return _runReview4(d);
};

/* ---------- views ---------- */
let spotSet=null, ladShowNotes=true;
function openLadder(id,home,rung){ LAD={pack:id,rung:rung==null?null:rung,home:home||tab}; tab=LAD.home; spotSet=null; render(); scrollTo(0,0); }
function ladderCard(id){ const rs=rungsOf(id), x=lad(id); return `<div class="card ox tap" data-lad="${id}"><div class="row spread" style="flex-wrap:nowrap"><div><div class="eyebrow">Train it</div><div style="font-family:var(--serif);font-size:1.3rem;font-weight:600">${x.lv>=rs.length?"Mastered":`Level ${x.lv+1} of ${rs.length}: ${rs[x.lv][0]}`}</div><div class="note">${rs.map(r=>r[0]).join(" · ")}</div></div><span class="go">${IC.arrow}</span></div><div class="bar"><i style="width:${Math.round(ladPct(id)*100)}%"></i></div></div>`; }
function vLadder(){
  const id=LAD.pack, P=PK[id], k=packKind(id); if(!k){ LAD.pack=null; return render(); }
  if(!P) return `<button class="back" data-lad-back>${I.back} Back</button><div class="empty"><strong>Training material is still loading</strong>Update the app to get it.</div>`;
  if(LAD.rung!=null) return vRung(id,LAD.rung);
  const rs=rungsOf(id), x=lad(id);
  return `<button class="back" data-lad-back>${I.back} ${k==="notes"?"Notes":k==="scaffold"?"The long contribution":"The greats"}</button>
    <div class="eyebrow">Training ladder</div><h1 style="font-size:2rem">${esc(packName(id))}</h1><p class="sub" style="margin-top:4px">Each level opens when you pass the one before. Go back to any passed level whenever you like.</p>
    ${k!=="notes"?`<div class="card flat" style="padding:12px 14px">${minitrack(packSteps(id))}</div>`:""}
    <div class="track" style="margin-top:14px">${rs.map(([n,desc],i)=>{ const st=rungStatus(id,i), [a,b]=rungCount(id,i); return `<div class="node" ${st!=="locked"?`data-rung="${i}" style="cursor:pointer"`:`style="opacity:.45"`}><div class="dot" style="${st==="passed"?"":st==="open"?"background:var(--panel);color:var(--acc);border:2px solid var(--acc)":"background:var(--line2);box-shadow:none"}">${st==="passed"?"✓":i+1}</div><div style="flex:1;padding:4px 0 6px"><div class="row spread"><div class="lbl" style="margin:0;font-size:1.05rem">${esc(n)}</div><span class="note">${st==="locked"?"locked":b?`${a}/${b}`:""}</span></div><div class="job">${esc(desc)}</div>${st==="open"?`<button class="btn primary small" style="margin-top:8px" data-rung="${i}">${i===0?"Start":"Go"}</button>`:""}</div></div>`; }).join("")}</div>
    ${k!=="notes"&&k!=="scaffold"&&(P.bank||[]).length?`<button class="btn wide" data-rung="bank">Example bank: ${(P.bank||[]).reduce((s,b)=>s+(b.lines||[]).length,0)} lines to say aloud</button>`:""}
    ${k==="scaffold"?`<button class="btn wide" data-lg-item="phrases" data-lad-close>Phrase bank: ${PHRASES.length} lines by slot</button>`:""}`;
}
function vRung(id,i){
  const k=packKind(id), back=`<button class="back" data-rung-back>${I.back} ${esc(packName(id))}</button>`;
  if(i==="bank") return back+vBank(id);
  const name=rungsOf(id)[i][0];
  if(i===0) return back+(k==="notes"?vStudyNotes(id):vStudy(id));
  if(k==="notes"){ if(i===1) return back+vNotesQuiz(id); return back+vNotesDrills(id,i); }
  if(i===2) return back+vSpotSteps(id);
  return back;
}
function stepChip(steps,t){ const s=steps[t]||{slot:"?"}; return `<span class="slotlabel">${t+1} · ${esc(s.slot)}</span>`; }
function vStudy(id){
  const P=PK[id], steps=packSteps(id), x=lad(id); const ex=P.examples||[];
  return `<div class="eyebrow">Level 1 · Study</div><h2>Annotated examples</h2><p class="sub">Read each one twice: first for the argument, then for the notes. Then mark it studied. Compare the weak version and say out loud what changed.</p>
    <div class="row"><button class="btn small ${ladShowNotes?"on":""}" data-lad-notes>${ladShowNotes?"Notes on":"Notes off"}</button><span class="note">${Object.keys(x.st).length} of ${ex.length} studied</span></div>
    ${ex.map((e,ei)=>`<div class="card"><div class="eyebrow">${esc(e.room||"")}</div><h3 style="font-size:1.35rem">${esc(e.title||"")}</h3><p class="note" style="margin:4px 0 10px">${esc(e.prompt||"")}</p>
      ${(e.parts||[]).map(p=>`<div style="margin:12px 0">${stepChip(steps,p.tag)}<div class="model" style="margin:4px 0;font-size:1.12rem">${mark(p.text)}</div>${ladShowNotes&&p.note?`<div class="note" style="padding-left:12px;border-left:2px solid var(--line2);color:var(--ink2)">${esc(p.note)}</div>`:""}</div>`).join("")}
      <div class="row" style="margin:8px 0">${hearBtn((e.parts||[]).map(p=>p.text).join(" "))}</div>
      ${e.weak?`<hr class="sep" style="margin:14px 0"><div class="eyebrow" style="color:var(--bad)">The weak version</div><div class="mistake">${esc(e.weak.text||"")}</div><ul class="rules">${(e.weak.why||[]).map(w=>`<li style="font-weight:400">${esc(w)}</li>`).join("")}</ul>`:""}
      <button class="btn ${x.st[ei]?"on":"brass"}" style="margin-top:10px" data-studied="${ei}">${x.st[ei]?"Studied":"Mark studied"}</button></div>`).join("")}`;
}
function vStudyNotes(id){
  const P=PK[id], x=lad(id), ex=P.examples||[];
  return `<div class="eyebrow">Level 1 · Study</div><h2>Worked conversions</h2><p class="sub">What was said, the strong note, the weak note, and the principle. Cover the strong note with your thumb and write your own in your head before you read it.</p>
    ${ex.map(e=>`<div class="card"><div class="eyebrow" style="color:var(--c-notes)">${esc(e.title||"")}</div><div class="model" style="font-size:1.05rem;border-left-color:var(--c-notes);background:color-mix(in srgb,var(--c-notes) 6%,transparent)">${esc(e.input||"")}</div>
      <div class="slotlabel" style="color:var(--good);margin-top:10px">Strong</div><div class="notesview">${esc(e.output||"")}</div><div class="slotlabel" style="color:var(--bad);margin-top:10px">Weak</div><div class="notesview" style="color:var(--ink3)">${esc(e.weak||"")}</div><div style="height:8px"></div>
      <p class="sub" style="margin:0">${esc(e.why||"")}</p></div>`).join("")}
    <button class="btn primary wide" data-studied="all">${x.st.all?"Studied":"I've studied all twelve"}</button>`;
}
function vBank(id){
  const P=PK[id], steps=packSteps(id);
  return `<div class="eyebrow">Example bank</div><h2>${esc(packName(id))}</h2><p class="sub">Ten lines for every step. Say them until they sound like yours; fill each [bracket] with something real as you go.</p>
    ${(P.bank||[]).map(b=>`<div class="card"><div class="row spread">${stepChip(steps,b.tag)}<button class="btn small" data-bank-say="${b.tag}">${I.mic} Say five</button></div><p class="note" style="margin:4px 0 6px">${esc((steps[b.tag]||{}).job||"")}</p>${(b.lines||[]).map(l=>`<div style="padding:8px 0;border-top:1px solid var(--line);font-family:var(--serif);font-size:1.12rem;line-height:1.4">${mark(l)}</div>`).join("")}</div>`).join("")}`;
}
function vSpotSteps(id){
  const P=PK[id], steps=packSteps(id);
  if(!spotSet||spotSet.id!==id){ const parts=[]; (P.examples||[]).forEach(e=>(e.parts||[]).forEach(p=>parts.push(p))); spotSet={id,items:parts.sort(()=>Math.random()-.5).slice(0,8),i:0,score:0,ans:null}; }
  const q=spotSet; if(q.i>=q.items.length){ const pass=q.score>=6; return `<div class="empty"><strong>${q.score} of ${q.items.length}</strong>${pass?"Passed. You can hear the architecture.":"Six or more to pass. The ones you missed are worth rereading in Study."}</div><div class="row" style="justify-content:center"><button class="btn primary" data-spot-again>${pass?"Again":"Try again"}</button><button class="btn" data-rung-back>Back to the ladder</button></div>`; }
  const it=q.items[q.i];
  return `<div class="row spread"><div class="eyebrow">Level 3 · Spot</div><span class="note">${q.i+1} of ${q.items.length} · ${q.score} right</span></div><h2>Which step is this?</h2>
    <div class="model" style="font-size:1.18rem">${mark(it.text)}</div>
    <div class="quiz">${steps.map((s,t)=>{ const cls=q.ans!=null?(t===it.tag?"right":t===q.ans?"wrong":""):""; return `<button class="opt ${cls}" data-spot-step="${t}">${t+1} · ${esc(s.slot)} <span class="note" style="font-weight:400">${esc(s.job.length>70?s.job.slice(0,67)+"…":s.job)}</span></button>`; }).join("")}</div>
    ${q.ans!=null?`<div class="callout"><div class="eyebrow">${q.ans===it.tag?"Yes":"It's "+esc((steps[it.tag]||{}).slot)}</div>${esc(it.note||"")}</div><button class="btn primary wide" style="margin-top:10px" data-spot-on>Next</button>`:""}`;
}
function vNotesQuiz(id){
  const P=PK[id];
  if(!spotSet||spotSet.id!==id){ spotSet={id,items:(P.quiz||[]).slice().sort(()=>Math.random()-.5),i:0,score:0,ans:null}; }
  const q=spotSet; if(q.i>=q.items.length){ const pass=q.score>=6; return `<div class="empty"><strong>${q.score} of ${q.items.length}</strong>${pass?"Passed.":"Six or more to pass."}</div><div class="row" style="justify-content:center"><button class="btn primary" data-spot-again>Again</button><button class="btn" data-rung-back>Back to the ladder</button></div>`; }
  const it=q.items[q.i];
  return `<div class="row spread"><div class="eyebrow" style="color:var(--c-notes)">Level 2 · Spot</div><span class="note">${q.i+1} of ${q.items.length} · ${q.score} right</span></div>
    <div class="model" style="font-size:1.05rem;border-left-color:var(--c-notes);background:color-mix(in srgb,var(--c-notes) 6%,transparent)">${esc(it.input||"")}</div><h3 style="margin:8px 0">${esc(it.q||"")}</h3>
    <div class="quiz">${(it.options||[]).map((o,t)=>{ const cls=q.ans!=null?(t===it.answer?"right":t===q.ans?"wrong":""):""; return `<button class="opt ${cls}" style="white-space:pre-wrap;font-weight:500" data-spot-step="${t}">${esc(o)}</button>`; }).join("")}</div>
    ${q.ans!=null?`<div class="callout">${esc(it.why||"")}</div><button class="btn primary wide" style="margin-top:10px" data-spot-on>Next</button>`:""}`;
}
function vNotesDrills(id,i){
  const P=PK[id], x=lad(id), level=i-1; const ds=(P.drills||[]).map((d,k)=>Object.assign({k},d)).filter(d=>d.level===level);
  const [a,b]=rungCount(id,i);
  return `<div class="row spread"><div class="eyebrow" style="color:var(--c-notes)">Level ${i+1} · ${esc(rungsOf(id)[i][0])}</div><span class="note">${a} of ${b} done well</span></div>
    ${ds.map(d=>{ const w=x.w[i+"-"+d.k]||{}; return `<div class="card"><div class="model" style="font-size:1.02rem;border-left-color:var(--c-notes);background:color-mix(in srgb,var(--c-notes) 6%,transparent);white-space:pre-wrap">${esc(d.input||"")}</div><p style="font-weight:600;margin:8px 0">${esc(d.task||"")}</p>
      ${d.kind==="speak"?`<button class="btn primary" data-nd-speak="${i}-${d.k}">${I.mic} Speak it (${d.seconds||60}s)</button>${w.done?` <span class="note">done</span>`:""}`:
      `<textarea class="search" data-nd-w="${i}-${d.k}" placeholder="Your notes" style="min-height:120px;font-family:var(--sans)">${esc(w.text||"")}</textarea>
       ${w.shown?`<div class="slotlabel" style="color:var(--good);margin-top:6px">A model</div><div class="notesview">${esc(d.model||"")}</div>${w.graded==null?`<div class="row" style="margin-top:8px"><button class="btn" data-nd-grade="${i}-${d.k}-0">Not yet</button><button class="btn primary" style="flex:1" data-nd-grade="${i}-${d.k}-1">Mine does the same job</button></div>`:`<p class="note" style="margin-top:6px">${w.graded?"Marked as done well.":"Marked not yet. Try it again later."}</p>`}`:`<button class="btn" data-nd-show="${i}-${d.k}">Compare with a model</button>`}`}</div>`; }).join("")}`;
}

/* ---------- wrap module views ---------- */
const _vGreats5=vGreats; vGreats=function(){ if(LAD.pack&&LAD.home==="greats") return vLadder(); return _vGreats5(); };
const _vFormula5=vFormula; vFormula=function(f){ let h=_vFormula5(f); const card=PK[f.id]?ladderCard(f.id):""; return h.replace('<div class="lesson"', card+'<div class="lesson"'); };
const _vMeetings5=vMeetings; vMeetings=function(){
  if(LAD.pack&&LAD.home==="meetings") return vLadder();
  let h=_vMeetings5();
  if(mtSec==="long"&&!longItem&&PK.scaffold) h=h.replace('<div class="eyebrow" style="margin-top:16px">Learn it</div>', ladderCard("scaffold")+'<div class="eyebrow" style="margin-top:16px">Learn it</div>');
  return h;
};
const _vNtLesson5=vNtLesson; vNtLesson=function(x){ let h=_vNtLesson5(x); return PK[x.id]?h.replace('<div class="lesson"', ladderCard(x.id)+'<div class="lesson"'):h; };
// level badge on formula cards
const _vGreatsList5=vGreats;

/* ---------- today: one training step, rotating formula / notes / scaffold ---------- */
function trainPick(){ const day=dayNum(); const live=Object.entries(S.lad).filter(([id,x])=>PK[id]&&x.lv>0&&x.lv<rungsOf(id).length).sort((a,b)=>(b[1].t||0)-(a[1].t||0)); if(live.length&&day%2===0) return live[0][0];
  const r=day%3; if(r===1){ const n=NT_LESSONS.find(l=>PK[l.id]&&lad(l.id).lv<rungsOf(l.id).length); if(n) return n.id; } if(r===2&&PK.scaffold&&lad("scaffold").lv<6) return "scaffold";
  const st=_plan5().find(s=>s.key==="greats"); if(st&&PK[st.fid]) return st.fid; const f=FORMULAS.find(f=>PK[f.id]&&lad(f.id).lv<6); return f?f.id:null; }
const _plan5=sessionPlan2;
sessionPlan2=function(){ const steps=_plan5(); if(!PACKS.length) return steps; const id=trainPick(); if(!id) return steps; const x=lad(id), rs=rungsOf(id); const st={key:"train",title:"Train: "+packName(id),sub:x.lv>=rs.length?"Mastered · free practice":`Level ${x.lv+1}: ${rs[x.lv][0]}`,pack:id};
  const i=steps.findIndex(s=>s.key==="greats"); if(i>=0) steps[i]=st; else steps.push(st); return steps; };
const _runStep5=runStep2;
runStep2=function(key){ if(key==="train"){ const s=sessionPlan2().find(x=>x.key==="train"); const id=s.pack, k=packKind(id); const home=k==="formula"?"greats":"meetings"; if(k==="notes") mtSec="notes"; if(k==="scaffold") mtSec="long"; const x=lad(id); openLadder(id,home, x.lv<rungsOf(id).length?null:null); return; } return _runStep5(key); };
STEPIC.train=IC.greats; STEPC.train="--c-greats";
const _vToday5=vToday;
vToday=function(){ let h=_vToday5(); const live=Object.entries(S.lad).filter(([id,x])=>PK[id]&&(x.lv>0||Object.keys(x.st||{}).length)).sort((a,b)=>(b[1].t||0)-(a[1].t||0)).slice(0,4);
  const block=`<div class="sectitle"><h3>Your training ladders</h3><span class="note">${Object.values(S.lad).filter(x=>x.lv>=6).length} mastered</span></div>${live.length?live.map(([id,x])=>{ const rs=rungsOf(id); return `<div class="fcard" data-lad="${id}"><div class="ini">${x.lv>=rs.length?"✓":x.lv+1}</div><div style="flex:1;min-width:0"><div class="t">${esc(packName(id))}</div><div class="w">${x.lv>=rs.length?"Mastered":`Level ${x.lv+1} of ${rs.length}: ${rs[x.lv][0]}`}</div><div class="bar"><i style="width:${Math.round(ladPct(id)*100)}%"></i></div></div></div>`; }).join(""):`<div class="callout">Every formula, the committee scaffold and every note-taking skill has a six-level ladder: study annotated examples, say them, spot the steps, fill a gap, speak guided, then speak free. Today's session starts one for you.</div>`}`;
  return h.replace('<div class="sectitle"><h3>Everything</h3>', block+'<div class="sectitle"><h3>Everything</h3>'); };

/* ---------- events ---------- */
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-lad],[data-lad-back],[data-rung],[data-rung-back],[data-studied],[data-lad-notes],[data-spot-step],[data-spot-on],[data-spot-again],[data-bank-say],[data-nd-speak],[data-nd-show],[data-nd-grade],[data-lad-close],[data-go]");
  if(!b) return; const d=b.dataset;
  if(d.go!==undefined){ if(LAD.pack){ LAD={pack:null,rung:null,home:null}; render(); } return; }
  if(d.ladClose!==undefined){ LAD={pack:null,rung:null,home:null}; render(); scrollTo(0,0); return; }
  if(d.lad!==undefined){ const k=packKind(d.lad); if(k==="notes") mtSec="notes"; if(k==="scaffold") mtSec="long"; openLadder(d.lad,k==="formula"?"greats":"meetings"); return; }
  if(d.ladBack!==undefined){ LAD={pack:null,rung:null,home:null}; render(); scrollTo(0,0); return; }
  if(d.rungBack!==undefined){ LAD.rung=null; spotSet=null; render(); scrollTo(0,0); return; }
  if(d.rung!==undefined){ const id=LAD.pack, k=packKind(id); const i=d.rung==="bank"?"bank":+d.rung; const from={tab:LAD.home};
    if(i!=="bank"&&k!=="notes"){ if(i===1) return startRunner(sayDrill(id),from); if(i===3) return startRunner(fillDrill(id),from); if(i===4) return startRunner(promptDrill(id,4,true),from); if(i===5) return startRunner(promptDrill(id,5,false),from); }
    LAD.rung=i; spotSet=null; render(); scrollTo(0,0); return; }
  if(d.studied!==undefined){ const id=LAD.pack, x=lad(id); if(d.studied==="all") x.st.all=true; else x.st[d.studied]=!x.st[d.studied]; x.t=Date.now(); const [a,n]=rungCount(id,0); if(a>=n&&n) passRung(id,0); else persist(); render(); return; }
  if(d.ladNotes!==undefined){ ladShowNotes=!ladShowNotes; render(); return; }
  if(d.spotStep!==undefined){ const q=spotSet; if(!q||q.ans!=null) return; q.ans=+d.spotStep; const it=q.items[q.i]; const right=packKind(LAD.pack)==="notes"?it.answer:it.tag; if(q.ans===right) q.score++; render(); return; }
  if(d.spotOn!==undefined){ const q=spotSet; q.i++; q.ans=null; if(q.i>=q.items.length){ const id=LAD.pack, i=LAD.rung; const x=lad(id); (x.r[i]=x.r[i]||[]).push(q.score); x.t=Date.now(); const ss=S.sessions[dayNum()]=S.sessions[dayNum()]||{}; ss.train=true; if(q.score>=6) passRung(id,i); else persist(); } render(); scrollTo(0,0); return; }
  if(d.spotAgain!==undefined){ spotSet=null; render(); scrollTo(0,0); return; }
  if(d.bankSay!==undefined){ const id=LAD.pack, b2=(PK[id].bank||[]).find(x=>x.tag===+d.bankSay); const st=packSteps(id)[+d.bankSay]||{}; startRunner({id:"bank-"+id+"-"+d.bankSay,gym:true,label:"Example bank",type:"read",title:st.slot||"",how:"Fill each [bracket] with something real as you go. Natural pace, ending down.",items:(b2.lines||[]).slice().sort(()=>Math.random()-.5).slice(0,5),checks:["It sounded like my own sentence.","I filled the bracket without stalling.","It ended down."]},{tab:LAD.home}); return; }
  if(d.ndSpeak!==undefined){ const [i,k]=d.ndSpeak.split("-").map(Number); const dr=PK[LAD.pack].drills[k]; startRunner(notesSpeakDrill(LAD.pack,i,dr,k),{tab:LAD.home}); return; }
  if(d.ndShow!==undefined){ const x=lad(LAD.pack); const w=x.w[d.ndShow]=x.w[d.ndShow]||{}; w.shown=true; persist(); render(); return; }
  if(d.ndGrade!==undefined){ const [i,k,g]=d.ndGrade.split("-").map(Number); const x=lad(LAD.pack); const w=x.w[i+"-"+k]=x.w[i+"-"+k]||{}; if(w.graded!=null) return; w.graded=!!g; ladScore(LAD.pack,i,g?1:0); render(); return; }
});
let nd5T=null;
document.addEventListener("input",e=>{ const t=e.target; if(t.dataset&&t.dataset.ndW&&LAD.pack){ const x=lad(LAD.pack); const w=x.w[t.dataset.ndW]=x.w[t.dataset.ndW]||{}; w.text=t.value; clearTimeout(nd5T); nd5T=setTimeout(persist,400); } });
render();
