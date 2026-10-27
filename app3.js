// The Coach, part three: the long contribution (the impromptu committee speech) and the debrief.
const L3 = window.COACH || {};
const LONG_LESSONS = (L3.longLessons||[]); const LONGL = {}; LONG_LESSONS.forEach(x=>LONGL[x.id]=x);
const LONG_SCEN = (L3.longScenarios||[]); const LONGS = {}; LONG_SCEN.forEach(x=>LONGS[x.id]=x);
const PHRASES = (L3.longPhrases||[]);
const SLOTS = [
  ["thanks","Thanks","Specific, to named people, for named things."],
  ["acknowledge","Acknowledge","The weight of the moment, said plainly."],
  ["standing","Standing","A line or two of earned authority."],
  ["common","Common ground","The shared purpose no one can dispute."],
  ["frame","Frame and evidence","The question as you see it, with comparison."],
  ["proposal","Proposal","Named, numbered, owned, attached to others."],
  ["close","Close","Summary, the quotable line, the minute wording."]
];
const EXTRA_SLOTS = [["hold","Holding the floor"],["floor","Getting the floor"],["reentry","Reclaiming an idea"],["build","Building on others"]];
if(!S.long||typeof S.long!=="object") S.long={};
if(!Array.isArray(S.debriefs)) S.debriefs=[];
if(!Array.isArray(S.myPhrases)) S.myPhrases=[];
if(!S.longRead||typeof S.longRead!=="object") S.longRead={};

/* ---------- drill builders ---------- */
function phraseFor(slot, salt){ const xs=PHRASES.filter(p=>p.slot===slot); const mine=S.myPhrases.filter(p=>p.slot===slot); const all=[...mine,...xs]; if(!all.length) return ""; return all[Math.abs((salt||0)+slot.length*7)%all.length].text; }
function longDrill(sc){
  const salt=Math.floor(Math.random()*1000);
  return {id:sc.id, gym:true, label:"The long contribution", type:"impromptu", long:false, longScen:sc, title:"Your contribution", how:"", items:[sc.task||"Make your contribution."], prep:90, seconds:sc.seconds||210, salt,
    targets:{wpm:[120,155],fillers:3,pauses:4},
    checks:["Did you thank someone specifically, by name, for a named thing?","Did you acknowledge the weight of the moment before arguing?","Did you state your standing in a line or two, then move on?","Did you name the shared purpose?","Did you frame the question and bring one piece of comparison or evidence?","Was your proposal named, numbered and attached to another speaker's point?","Did you close with a summary, a quotable line and wording for the minutes?"],
    onSave:(R)=>{ S.long[sc.id]=(S.long[sc.id]||0)+1; }};
}
function sprintDrill(){
  const pool=LONG_SCEN.length?LONG_SCEN:[{room:"Committee",briefing:"The chair has asked each member for a view on a proposed change.",task:"Give your view and a way forward."}];
  const sc=rnd(pool);
  return {id:"sprint", gym:true, label:"Scaffold sprint", type:"impromptu", sprint:true, longScen:{room:sc.room, briefing:sc.briefing, task:sc.task}, title:"Two minutes, seven slots", how:"Twenty seconds to think. Then two minutes, every slot touched, in order. No notes beyond the slot names.", items:[sc.task], prep:20, seconds:120, targets:{wpm:[120,160],fillers:2}, checks:["Did you touch all seven slots in order?","Was the proposal the longest part?","Did you finish on time, on a line that could be quoted?"]};
}
function summariseDrill(sc){
  const text=[sc.briefing,...(sc.before||[]).map(b=>b.who+": "+b.said)].join(" / ");
  return {id:"summ-"+sc.id, gym:true, label:"Summarise the room", type:"recall", title:"Summarise the room", how:"Read the briefing and both contributions. They disappear. Then summarise the room in sixty seconds, crediting each speaker by role, the way Jason does.", items:[[sc.briefing, ...(sc.before||[]).map(b=>b.who+": "+b.said)].join(" / ")], prep:75, seconds:60, targets:{wpm:[120,160]}, checks:["Did you credit each speaker by role or name?","Did you get the sequence right?","Was your summary fairer and shorter than the original?","Did you end by naming the question still open?"]};
}

/* ---------- runner hooks (wrap app2's) ---------- */
const _runTop2 = runTop;
runTop = function(d, phase){
  if(!d.longScen) return _runTop2(d, phase);
  const sc=d.longScen;
  let h=`<div class="eyebrow" style="margin-top:8px">${esc(sc.room||"")}</div>`;
  if(phase==="ready"||phase==="review"&&false){
    h+=`<div class="card" style="padding:14px"><div class="eyebrow">The briefing</div><p style="margin:0">${esc(sc.briefing||"")}</p></div>`;
    (sc.before||[]).forEach(b=>{ h+=`<div class="card" style="padding:14px"><div class="eyebrow">${esc(b.who)}</div><div class="model" style="margin:6px 0;font-size:1.12rem">${esc(b.said)}</div>${hearBtn(b.said)}</div>`; });
  }
  if((phase==="ready"||phase==="prep")&&(sc.notes||[]).length) h+=`<div class="card" style="padding:14px;border-color:rgba(195,154,85,.5)"><div class="eyebrow">Your notes</div><ul class="rules" style="margin-top:4px">${sc.notes.map(n=>`<li style="font-weight:400">${esc(n)}</li>`).join("")}</ul></div>`;
  return h;
};
function runPrep(d){
  if(!d.longScen) return "";
  R.kw=R.kw||{};
  if(d.sprint) return `<div class="card">${SLOTS.map(([k,l],i)=>`<div class="row spread" style="padding:6px 0;border-bottom:1px solid var(--line)"><span><b style="color:var(--brass2)">${i+1}</b> ${esc(l)}</span></div>`).join("")}</div>`;
  return `<div class="card"><div class="eyebrow">Jot a keyword or two per slot</div>${SLOTS.map(([k,l,hint],i)=>`<div style="margin:8px 0"><div class="row spread"><span style="font-weight:600"><b style="color:var(--brass2)">${i+1}</b> ${esc(l)}</span><span class="note">${esc(hint)}</span></div><input class="search" data-kw="${k}" value="${esc(R.kw[k]||"")}" placeholder="${esc(phraseFor(k,d.salt).slice(0,70))}" style="margin:4px 0 0;width:100%;background:var(--panel2);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:10px 12px;font:inherit;font-size:1rem"></div>`).join("")}</div>`;
}
function runLive(d){
  if(!d.longScen) return "";
  const kw=R.kw||{};
  return `<div class="card" style="padding:12px 16px">${SLOTS.map(([k,l],i)=>`<div style="display:flex;gap:10px;align-items:baseline;padding:5px 0;border-bottom:1px solid var(--line)"><b style="color:var(--brass2);font-family:var(--serif);font-size:1.2rem;width:18px">${i+1}</b><span class="note" style="width:96px;flex:none">${esc(l)}</span><span style="font-family:var(--serif);font-size:1.2rem">${esc(kw[k]||"")}</span></div>`).join("")}</div>`;
}
const _runReview2 = runReview;
runReview = function(d){
  let h=_runReview2(d);
  if(d.longScen&&d.longScen.model&&d.longScen.model.slots){
    const m=d.longScen.model.slots; const kw=R.kw||{};
    h+=`<div class="card"><div class="eyebrow">A version that would be heard</div>${SLOTS.map(([k,l])=>m[k]?`<div style="margin:10px 0"><div class="row spread"><span class="note" style="text-transform:uppercase;letter-spacing:.1em;font-size:.66rem;color:var(--brass)">${esc(l)}</span>${kw[k]?`<span class="note">you: ${esc(kw[k])}</span>`:""}</div><div class="model" style="margin:4px 0;font-size:1.1rem">${mark(m[k])}</div></div>`:"").join("")}
      ${d.longScen.why?`<p class="sub">${esc(d.longScen.why)}</p>`:""}<div class="row">${hearBtn(SLOTS.map(([k])=>m[k]||"").join(" "))}</div></div>`;
  }
  return h;
};

/* ---------- views ---------- */
let mtSec="long", longItem=null, phraseSlot="thanks", dbOpen=null;
const _vMeetings2 = vMeetings;
vMeetings = function(){
  const secs=[["long","The long contribution"],["moves","The moves"],["debrief","Debrief"]];
  const seg=`<div class="seg">${secs.map(([k,l])=>`<button class="${mtSec===k?"on":""}" data-mt-sec="${k}">${l}</button>`).join("")}</div>`;
  if(mtSec==="moves"){ const inner=_vMeetings2(); return mvMove?inner:inner.replace("</p>","</p>"+seg); }
  if(mtSec==="debrief") return vDebrief(seg);
  if(longItem&&LONGL[longItem]) return vLongLesson(LONGL[longItem]);
  if(longItem==="phrases") return vPhrases();
  const done=LONG_SCEN.filter(sc=>S.long[sc.id]).length;
  return `<h1>Meetings</h1>${seg}
    <p class="sub">The two-to-five-minute impromptu contribution in a formal committee: carrying a practical solution inside a structure that a highly articulate room hears, remembers and adopts.</p>
    <div class="card ox"><div class="eyebrow">The scaffold</div>${SLOTS.map(([k,l,h],i)=>`<div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px solid var(--line)"><b style="color:var(--brass2);font-family:var(--serif);font-size:1.25rem;width:18px">${i+1}</b><div><div style="font-weight:600">${esc(l)}</div><div class="note">${esc(h)}</div></div></div>`).join("")}
      <div class="row" style="margin-top:12px"><button class="btn primary" data-lg-random>${I.mic} A random room</button><button class="btn" data-lg-sprint>${I.mic} Scaffold sprint</button><button class="btn ghost" data-lg-item="phrases">Phrase bank</button></div></div>
    <div class="eyebrow" style="margin-top:16px">Learn it</div>
    <div class="list">${LONG_LESSONS.map((x,i)=>`<div class="item" data-lg-item="${x.id}"><div class="row" style="gap:12px;flex-wrap:nowrap"><div class="tick ${S.longRead[x.id]?"done":""}">${S.longRead[x.id]?"✓":i+1}</div><div class="t">${esc(x.title)}</div></div><span class="arrow">›</span></div>`).join("")}</div>
    <div class="eyebrow" style="margin-top:16px">Practise it · ${done} of ${LONG_SCEN.length}</div>
    <p class="note">Read the briefing and what the others said. Ninety seconds to jot keywords into the slots. Then speak, with your keywords on screen. Then compare with a version that would be heard.</p>
    <div class="list">${LONG_SCEN.map(sc=>`<div class="item"><div style="flex:1" data-lg-run="${sc.id}"><div class="t" style="font-size:1.08rem">${esc(sc.room)}</div><div class="m">${esc((sc.task||"").slice(0,110))}${S.long[sc.id]?" · done":""}</div></div><button class="btn small ghost" data-lg-summ="${sc.id}" title="Summarise the room">Summarise</button></div>`).join("")}</div>`;
};
function vLongLesson(x){
  const ex=x.exercise||{};
  return `<button class="back" data-lg-back>${I.back} The long contribution</button><h1 style="font-size:2rem">${esc(x.title)}</h1>
    <div class="lesson" style="margin-top:12px">${paras(x.teach)}</div>
    ${x.model?`<div class="eyebrow" style="margin-top:14px">Model</div><div class="model">${mark(x.model)}</div><div class="row">${hearBtn(x.model)}</div>`:""}
    <hr class="sep"><div class="eyebrow">Exercise</div><p>${esc(ex.task||"")}</p>
    ${ex.kind==="speak"?`<button class="btn primary" data-lg-ex="${x.id}">${I.mic} Do it (${ex.seconds||90}s)</button>`:`<textarea class="search" data-note="${x.id}" placeholder="Write it here." style="min-height:180px;font-family:var(--serif);font-size:1.1rem">${esc((S.notes[x.id]||{}).text||"")}</textarea>`}
    ${(x.checks||[]).length?`<div class="eyebrow" style="margin-top:14px">Check</div><ul class="rules">${x.checks.map(c=>`<li>${esc(c)}</li>`).join("")}</ul>`:""}
    <div class="row" style="margin:16px 0"><button class="btn ${S.longRead[x.id]?"on":"brass"}" data-lg-done="${x.id}">${S.longRead[x.id]?"Lesson done":"Mark lesson done"}</button></div>`;
}
function vPhrases(){
  const all=[...SLOTS.map(s=>[s[0],s[1]]),...EXTRA_SLOTS];
  const list=[...S.myPhrases.filter(p=>p.slot===phraseSlot).map(p=>Object.assign({mine:true},p)), ...PHRASES.filter(p=>p.slot===phraseSlot)];
  return `<button class="back" data-lg-back>${I.back} The long contribution</button><h1 style="font-size:2rem">Phrase bank</h1><p class="sub">Say them until they're yours. Add the good ones you hear in real meetings; yours come first.</p>
    <div class="pills">${all.map(([k,l])=>`<button class="pill ${phraseSlot===k?"on":""}" data-ph-slot="${k}">${esc(l)}</button>`).join("")}</div>
    <div class="row" style="margin:4px 0 8px"><input class="search" id="newphrase" placeholder="Add a phrase you heard or want" style="flex:1;margin:0"><button class="btn" data-ph-add>Add</button></div>
    ${list.map(p=>`<div class="card" style="padding:12px 14px;margin:8px 0">${p.mine?`<div class="eyebrow">Yours</div>`:""}<div style="font-family:var(--serif);font-size:1.2rem;line-height:1.35">${mark(p.text)}</div>${p.note?`<div class="note" style="margin-top:4px">${esc(p.note)}</div>`:""}<div class="row" style="margin-top:6px">${hearBtn(p.text)}${p.mine?`<button class="btn small ghost" data-ph-del="${esc(p.id)}">Remove</button>`:""}</div></div>`).join("")}
    <div class="row" style="margin:10px 0 20px"><button class="btn primary" data-ph-drill="${phraseSlot}">${I.mic} Say five of these</button></div>`;
}
function vDebrief(seg){
  if(dbOpen){ const d=S.debriefs.find(x=>x.id===dbOpen); if(d) return vDebriefEdit(d); dbOpen=null; }
  return `<h1>Meetings</h1>${seg}<p class="sub">After a real meeting, while it's fresh: what happened, the lines that worked for others, what you said, and what you'd say next time. Then rehearse the next-time version aloud, so the better version is the one your memory keeps.</p>
    <div class="row" style="margin:6px 0 12px"><button class="btn primary" data-db-new>New debrief</button></div>
    ${S.debriefs.length?`<div class="list">${S.debriefs.slice().sort((a,b)=>b.t-a.t).map(d=>`<div class="item" data-db-open="${d.id}"><div><div class="t">${esc(d.meeting||"Untitled meeting")}</div><div class="m">${new Date(d.t).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}${d.next?" · next-time version written":""}</div></div><span class="arrow">›</span></div>`).join("")}</div>`:`<div class="empty"><strong>No debriefs yet</strong>Yesterday's committee is a good first one.</div>`}`;
}
function vDebriefEdit(d){
  const f=(k,label,ph,h)=>`<div class="eyebrow" style="margin-top:12px">${label}</div><textarea class="search" data-db="${k}" placeholder="${esc(ph)}" style="min-height:${h||90}px">${esc(d[k]||"")}</textarea>`;
  return `<button class="back" data-db-back>${I.back} Debriefs</button>
    <input class="search" data-db="meeting" placeholder="Meeting, e.g. SCSA Curriculum Advisory Committee" value="${esc(d.meeting||"")}" style="font-family:var(--serif);font-size:1.35rem">
    ${f("happened","What happened","The situation, who spoke, what was decided.",100)}
    ${f("others","Lines that worked for others","Write the phrases and moves you noticed. Each line you write here can go into your phrase bank.",120)}
    <div class="row"><select class="search" id="dbslot" style="flex:1;margin:0">${[...SLOTS.map(s=>[s[0],s[1]]),...EXTRA_SLOTS].map(([k,l])=>`<option value="${k}">${esc(l)}</option>`).join("")}</select><button class="btn small" data-db-steal>Add these lines to the phrase bank</button></div>
    ${f("said","What you said","As close as you can remember.",100)}
    ${f("missed","What wasn't heard, and why","Where it landed, where it didn't.",90)}
    <div class="eyebrow" style="margin-top:12px">Next time: the version that would be heard</div><p class="note" style="margin:0 0 6px">Write it in the seven slots. Then rehearse it.</p>
    ${SLOTS.map(([k,l])=>`<div class="note" style="margin-top:8px;font-weight:600;color:var(--ink2)">${esc(l)}</div><textarea class="search" data-db-slot="${k}" style="min-height:60px;font-family:var(--serif);font-size:1.08rem">${esc((d.slots||{})[k]||"")}</textarea>`).join("")}
    <div class="row" style="margin:12px 0 20px"><button class="btn primary" data-db-rehearse="${d.id}">${I.mic} Rehearse next-time version</button><button class="btn ghost" data-db-export="${d.id}">${I.down} Export</button><button class="btn ghost" data-db-del="${d.id}">Delete</button></div>`;
}
const dbText = d => SLOTS.map(([k])=>(d.slots||{})[k]||"").filter(x=>x.trim()).join("\n\n");

/* ---------- daily session: alternate long contribution and moves ---------- */
const _plan2 = sessionPlan2;
sessionPlan2 = function(){
  const steps=_plan2(); if(!LONG_SCEN.length) return steps;
  const day=dayNum(); const i=steps.findIndex(s=>s.key==="meet");
  if(day%2===0||i<0){ const r=seeded(day*29); const fresh=LONG_SCEN.filter(sc=>!S.long[sc.id]); const pool=fresh.length?fresh:LONG_SCEN; const sc=pool[Math.floor(r()*pool.length)];
    const st={key:"long",title:"The long contribution",sub:sc.room,lscen:sc.id}; if(i>=0) steps[i]=st; else steps.splice(3,0,st); }
  return steps;
};
const _runStep2 = runStep2;
runStep2 = function(key){ if(key==="long"){ const s=sessionPlan2().find(x=>x.key==="long"); startRunner(longDrill(LONGS[s.lscen]),{tab:"today",session:"long"}); return; } return _runStep2(key); };

/* ---------- events ---------- */
document.addEventListener("click", e=>{
  const b=e.target.closest("[data-mt-sec],[data-lg-item],[data-lg-back],[data-lg-run],[data-lg-summ],[data-lg-random],[data-lg-sprint],[data-lg-ex],[data-lg-done],[data-ph-slot],[data-ph-add],[data-ph-del],[data-ph-drill],[data-db-new],[data-db-open],[data-db-back],[data-db-steal],[data-db-rehearse],[data-db-export],[data-db-del],[data-step2],[data-go]");
  if(!b) return; const d=b.dataset;
  if(d.go!==undefined){ if(d.go==="meetings"&&(longItem||dbOpen)){ longItem=null; dbOpen=null; if(tab==="meetings") render(); } return; }
  if(d.step2!==undefined) return; // handled by app2 (wrapped runStep2)
  if(d.mtSec!==undefined){ mtSec=d.mtSec; longItem=null; dbOpen=null; mvMove=null; render(); scrollTo(0,0); return; }
  if(d.lgItem!==undefined){ longItem=d.lgItem; render(); scrollTo(0,0); return; }
  if(d.lgBack!==undefined){ longItem=null; render(); scrollTo(0,0); return; }
  if(d.lgRun!==undefined){ R&&stopAll(); startRunner(longDrill(LONGS[d.lgRun]),{tab:"meetings"}); return; }
  if(d.lgSumm!==undefined){ startRunner(summariseDrill(LONGS[d.lgSumm]),{tab:"meetings"}); return; }
  if(d.lgRandom!==undefined){ if(!LONG_SCEN.length) return toast("Scenarios are still loading"); const fresh=LONG_SCEN.filter(sc=>!S.long[sc.id]); startRunner(longDrill(rnd(fresh.length?fresh:LONG_SCEN)),{tab:"meetings"}); return; }
  if(d.lgSprint!==undefined){ startRunner(sprintDrill(),{tab:"meetings"}); return; }
  if(d.lgEx!==undefined){ const x=LONGL[d.lgEx], ex=x.exercise||{}; startRunner({id:"long-ex-"+x.id,gym:true,label:"The long contribution",type:"impromptu",title:x.title,how:ex.task,items:[ex.task],prep:30,seconds:ex.seconds||90,checks:x.checks||[],onSave:()=>{ S.longRead[x.id]=true; }},{tab:"meetings"}); return; }
  if(d.lgDone!==undefined){ S.longRead[d.lgDone]=!S.longRead[d.lgDone]; persist(); render(); return; }
  if(d.phSlot!==undefined){ phraseSlot=d.phSlot; render(); return; }
  if(d.phAdd!==undefined){ const v=document.getElementById("newphrase").value.trim(); if(!v) return; S.myPhrases.unshift({id:"my"+Date.now(),slot:phraseSlot,text:v}); persist(); render(); toast("Added"); return; }
  if(d.phDel!==undefined){ S.myPhrases=S.myPhrases.filter(p=>p.id!==d.phDel); persist(); render(); return; }
  if(d.phDrill!==undefined){ const xs=[...S.myPhrases.filter(p=>p.slot===d.phDrill),...PHRASES.filter(p=>p.slot===d.phDrill)].sort(()=>Math.random()-.5).slice(0,5); startRunner({id:"phr-"+d.phDrill,gym:true,label:"Phrase bank",type:"read",title:"Say them as yours",how:"Fill any [placeholder] with a real name or point as you speak. Natural pace, ending down.",items:xs.map(p=>p.text),checks:["Did it sound like your own sentence?","Did you fill the placeholder without stalling?","Did it end down?"]},{tab:"meetings"}); return; }
  if(d.dbNew!==undefined){ const x={id:"db"+Date.now(),t:Date.now(),meeting:"",slots:{}}; S.debriefs.push(x); persist(); dbOpen=x.id; render(); scrollTo(0,0); return; }
  if(d.dbOpen!==undefined){ dbOpen=d.dbOpen; render(); scrollTo(0,0); return; }
  if(d.dbBack!==undefined){ dbOpen=null; render(); return; }
  if(d.dbSteal!==undefined){ const x=S.debriefs.find(y=>y.id===dbOpen); const slot=document.getElementById("dbslot").value; const lines=String(x.others||"").split(/\n+/).map(s=>s.replace(/^[-*•\s]+/,"").trim()).filter(s=>s.length>6); lines.forEach((t,i)=>S.myPhrases.unshift({id:"my"+Date.now()+"-"+i,slot,text:t})); persist(); toast(lines.length?`${lines.length} added to the phrase bank`:"Write a line per phrase first"); return; }
  if(d.dbRehearse!==undefined){ const x=S.debriefs.find(y=>y.id===d.dbRehearse); const txt=dbText(x); if(plain(txt).length<20) return toast("Write the next-time version first"); startRunner({id:"db-"+x.id,gym:true,label:"Debrief",type:"read",long:true,title:x.meeting||"Next time",how:"Say it as you would in the room. Twice, the second time from the slot names only.",items:[txt],seconds:Math.max(60,Math.round(plain(txt).split(/\s+/).length/2.2)),targets:{wpm:[120,155]},checks:SLOTS.map(([k,l])=>`${l}: did it land?`)},{tab:"meetings"}); return; }
  if(d.dbExport!==undefined){ const x=S.debriefs.find(y=>y.id===d.dbExport); const md=`# ${x.meeting||"Debrief"}\n\n*${new Date(x.t).toLocaleDateString("en-AU")}*\n\n## What happened\n${x.happened||""}\n\n## Lines that worked for others\n${x.others||""}\n\n## What I said\n${x.said||""}\n\n## What wasn't heard\n${x.missed||""}\n\n## Next time\n${SLOTS.map(([k,l])=>`**${l}.** ${(x.slots||{})[k]||""}`).join("\n\n")}\n`; try{ const url=URL.createObjectURL(new Blob([md],{type:"text/markdown"})); const a=document.createElement("a"); a.href=url; a.download="debrief-"+new Date(x.t).toISOString().slice(0,10)+".md"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),4000); toast("Saved to your downloads"); }catch(err){ toast("Saving isn't available here"); } return; }
  if(d.dbDel!==undefined){ S.debriefs=S.debriefs.filter(y=>y.id!==d.dbDel); dbOpen=null; persist(); render(); return; }
});
let db3T=null;
document.addEventListener("input", e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.kw&&R){ R.kw=R.kw||{}; R.kw[t.dataset.kw]=t.value; return; }
  const x=dbOpen&&S.debriefs.find(y=>y.id===dbOpen); if(!x) return;
  if(t.dataset&&t.dataset.db){ x[t.dataset.db]=t.value; } else if(t.dataset&&t.dataset.dbSlot){ x.slots=x.slots||{}; x.slots[t.dataset.dbSlot]=t.value; } else return;
  clearTimeout(db3T); db3T=setTimeout(persist,400);
});
render();
