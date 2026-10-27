// The Coach, part two: Lexicon, Meetings, Speeches, and the senior daily session.
// Loaded after the main script; shares its globals (S, A, M, R, tab, view, render, startRunner, etc).
(function(){})();
const C = window.COACH || {};

/* ---------------- Lexicon data ---------------- */
const LEXF = []; // [{field, intro, entries}]
(C.lexicon||[]).forEach(f=>{ if(f&&f.entries&&f.entries.length) LEXF.push({field:f.field, intro:f.intro||"", entries:f.entries.map(e=>Object.assign({}, e, {field:f.field}))}); });
// Fold in The Floor's "big words in context", which were already pitched for committees.
(function(){
  const floor = (M.word||[]).filter(w=>String(w.id).startsWith("d-fvic-"));
  const by = {}; floor.forEach(w=>{ const f="From The Floor"; (by[f]=by[f]||[]).push({id:"fl-"+w.id, field:f, term:w.word, gloss:w.sense, say:w.say, note:w.note, level:2}); });
  const seen = new Set(LEXF.flatMap(f=>f.entries.map(e=>String(e.term).toLowerCase())));
  Object.entries(by).forEach(([f,arr])=>{ const es=arr.filter(e=>!seen.has(String(e.term).toLowerCase())); if(es.length) LEXF.push({field:f, intro:"Carried over from The Floor.", entries:es}); });
})();
const LEX = LEXF.flatMap(f=>f.entries); const LEXBY = {}; LEX.forEach(e=>LEXBY[e.id]=e);

/* ---------------- Meetings data ---------------- */
const MOVES = (C.moves||[]).filter(m=>m&&m.id);
const FAMILIES = ["Framing","Testing","Building","Dissenting","Procedure","Closing"].filter(f=>MOVES.some(m=>m.family===f)).concat([...new Set(MOVES.map(m=>m.family))].filter(f=>!["Framing","Testing","Building","Dissenting","Procedure","Closing"].includes(f)));
const SCEN = {}; MOVES.forEach(m=>(m.scenarios||[]).forEach(sc=>{ sc.move=m.id; SCEN[sc.id]=sc; }));
const MOVEBY = {}; MOVES.forEach(m=>MOVEBY[m.id]=m);

/* ---------------- Speeches data ---------------- */
const CRAFT = (C.craft||[]); const TYPES = (C.types||[]); const GREAT = (C.great||[]); const OPENS = (C.openings||[]); const CLOSES = (C.closings||[]);
const CRAFTBY={}; CRAFT.forEach(x=>CRAFTBY[x.id]=x); const TYPEBY={}; TYPES.forEach(x=>TYPEBY[x.id]=x); const GREATBY={}; GREAT.forEach(x=>GREATBY[x.id]=x);

/* ---------------- State ---------------- */
for(const k of ["lex","moves","craft","notes"]) if(!S[k]||typeof S[k]!=="object") S[k]={};
if(!Array.isArray(S.drafts)) S.drafts=[];
const lexDue = () => { const d=dayNum(); return Object.entries(S.lex).filter(([id,v])=>LEXBY[id]&&v.due<=d).map(([id])=>id); };
const lexSeen = id => !!S.lex[id];
function lexGrade(id, good){ const v=S.lex[id]||{interval:0,due:0,n:0}; v.n=(v.n||0)+1; v.interval = good ? Math.min(Math.max(1,(v.interval||0)*2||2),120) : 1; v.due=dayNum()+v.interval; S.lex[id]=v; persist(); }

/* ---------------- Runner hooks ---------------- */
function runTop(d, phase){
  let h="";
  if(d.room) h+=`<div class="eyebrow" style="margin-top:8px">${esc(d.room)}</div>`;
  if(d.setup && phase!=="review") h+=`<p class="sub">${esc(d.setup)}</p>`;
  if(d.said && phase!=="review") h+=`<div class="model" style="font-style:italic;border-left-color:var(--ox2);background:var(--oxsoft)">${esc(d.said)}</div>`;
  return h;
}
function runReview(d){
  let h="";
  if(d.models&&d.models.length) h+=`<div class="card"><div class="eyebrow">Two strong contributions</div>${d.models.map((m,i)=>`<div class="model">${mark(m.text)}</div><p class="note" style="margin:-4px 0 10px">${esc(m.why||"")}</p><div class="row" style="margin-bottom:8px">${hearBtn(m.text)}</div>`).join("")}</div>`;
  if(d.lexShow) h+=`<div class="card"><div class="eyebrow">${esc(d.lexShow.field)}</div><div style="font-family:var(--serif);font-size:1.6rem">${esc(d.lexShow.term)}</div><p class="sub">${esc(d.lexShow.gloss)}</p><div class="model">${mark(d.lexShow.say)}</div></div>`;
  return h;
}

/* ---------------- Drill builders ---------------- */
function scenarioDrill(sc, from){
  const m=MOVEBY[sc.move]||{};
  return {id:sc.id, gym:true, label:"Meeting · "+(m.family||""), type:"impromptu", title:m.name||"Contribution", how:"", room:sc.room, setup:sc.setup, said:sc.said, task:sc.task, items:[sc.task||"Make your contribution."], prep:12, seconds:sc.seconds||45, models:sc.models||[], checks:sc.checks||[], targets:{wpm:[120,160],fillers:1}, structure:null,
    onSave:()=>{ S.moves[sc.id]=(S.moves[sc.id]||0)+1; }};
}
function lexSayDrill(e){ return {id:"lex-say-"+e.id, gym:true, label:"Lexicon",  type:"read", title:e.term, how:"Say it as if it were already yours. Land the term; don't lean on it.", items:[e.say], context:e.gloss+(e.note?" "+e.note:""), checks:["Was the term pronounced fully and correctly?","Did the sentence sound like your own speech, not a quotation?","Did the sentence end down?"]}; }
function lexUseDrill(e){
  const sc = rnd(Object.values(SCEN).length?Object.values(SCEN):[{room:"Committee",said:"I'm not sure we've understood the proposal.",setup:""}]);
  return {id:"lex-use-"+e.id, gym:true, label:"Lexicon",  type:"impromptu", title:"Use it: "+e.term, how:`Make a contribution to this room that uses "${e.term}" naturally. Forty seconds.`, room:sc.room, setup:sc.setup, said:sc.said, items:[`Use "${e.term}" in your contribution.`], prep:12, seconds:40, lexShow:e, checks:["Did the term arrive naturally, not bolted on?","Did it do work the plain word could not?","Was the contribution worth making without the term?"], onSave:()=>{ if(!S.lex[e.id]) lexGrade(e.id,true); }};
}
function speechRehearseDrill(title, text, minutes, from){
  const secs = Math.round(((minutes&&minutes.length?(minutes[0]+minutes[1])/2:3))*60);
  return {id:"speech-"+title, gym:true, label:"Speech",  type:"read", long:true, title:"Rehearse: "+title, how:"Standing, at full voice, at the speed of the room. Take every breath mark and hold every ||.", items:[text], seconds:secs, targets:{wpm:[110,150]}, checks:["Did the opening land before you looked down?","Did you hold the silence before the key line?","Did you finish within ten per cent of the target time?","Did the last sentence end down, and did you hold after it?"]};
}

/* ---------------- Views: Lexicon ---------------- */
let lexField=null, lexLevel=0, lexQuery="", lexEntry=null, lexReview=null, lexShow=false;
function vLexicon(){
  if(lexReview) return vLexReview();
  if(lexEntry&&LEXBY[lexEntry]){ const e=LEXBY[lexEntry]; const v=S.lex[e.id];
    return `<button class="back" data-lx-back>${I.back} ${lexField?esc(lexField):"Lexicon"}</button>
      <div class="eyebrow">${esc(e.field)} · ${["","standard","senior","rare"][e.level||2]||""}</div>
      <h1 style="font-size:2.2rem">${esc(e.term)}</h1><p class="sub" style="margin-top:6px">${esc(e.gloss)}</p>
      <div class="model">${mark(e.say)}</div>${e.note?`<p class="note">${esc(e.note)}</p>`:""}
      <div class="row" style="margin-top:12px">${hearBtn(e.say)}<button class="btn" data-lx-say="${e.id}">${I.mic} Say it</button><button class="btn" data-lx-use="${e.id}">${I.mic} Use it</button><button class="btn ${v?"on":"brass"}" data-lx-keep="${e.id}">${v?"In review":"Learn this"}</button></div>`; }
  if(lexField!==null){
    const f=LEXF.find(x=>x.field===lexField); const q=lexQuery.trim().toLowerCase();
    const list=(f?f.entries:LEX).filter(e=>(!lexLevel||e.level===lexLevel)&&(!q||(e.term+" "+e.gloss+" "+e.say).toLowerCase().includes(q)));
    return `<button class="back" data-lx-field="">${I.back} Lexicon</button><h1 style="font-size:1.9rem">${esc(lexField||"All fields")}</h1>${f&&f.intro?`<p class="sub">${esc(f.intro)}</p>`:""}
      <input class="search" id="lxq" placeholder="Search terms" value="${esc(lexQuery)}">
      <div class="pills">${[[0,"All"],[1,"Standard"],[2,"Senior"],[3,"Rare"]].map(([k,l])=>`<button class="pill ${lexLevel===k?"on":""}" data-lx-level="${k}">${l}</button>`).join("")}</div>
      <div class="row" style="margin-bottom:6px"><button class="btn brass" data-lx-start="${esc(lexField)}">Learn ${Math.min(8,list.filter(e=>!lexSeen(e.id)).length)} new from here</button><span class="note">${list.length} terms</span></div>
      <div class="list">${list.map(e=>`<div class="item" data-lx-entry="${e.id}"><div><div class="t">${esc(e.term)}</div><div class="m">${esc(e.gloss.length>90?e.gloss.slice(0,87)+"…":e.gloss)}${lexSeen(e.id)?" · in review":""}</div></div><span class="arrow">›</span></div>`).join("")}</div>`;
  }
  const due=lexDue().length; const learnt=Object.keys(S.lex).filter(id=>LEXBY[id]).length;
  return `<h1>Lexicon</h1><p class="sub">${LEX.length} terms in ${LEXF.length} fields, each with the sentence you'd say and a note on when it lands. Learn them in small sets; they come back until they're yours.</p>
    <div class="stat"><div><b>${learnt}</b><span>learning</span></div><div><b>${due}</b><span>due today</span></div><div><b>${LEX.length-learnt}</b><span>new</span></div></div>
    <div class="row" style="margin:6px 0 12px"><button class="btn primary" data-lx-start="">${due?`Review ${due} due, then new`:"Learn eight new"}</button><button class="btn ghost" data-lx-field="__all">Search all</button></div>
    <div class="tiles">${LEXF.map(f=>{ const n=f.entries.length, k=f.entries.filter(e=>lexSeen(e.id)).length; return `<div class="tile" data-lx-field="${esc(f.field)}"><div class="t">${esc(f.field)}</div><div class="n">${n} terms${k?` · ${k} learning`:""}</div><div class="bar"><i style="width:${Math.round(k/n*100)}%"></i></div></div>`; }).join("")}</div>`;
}
function startLexReview(field, session){
  const due=lexDue(); const pool=(field&&field!=="__all"?LEX.filter(e=>e.field===field):LEX).filter(e=>!lexSeen(e.id));
  const fresh=[]; const sorted=pool.slice().sort((a,b)=>(a.level||2)-(b.level||2)); for(const e of sorted){ if(fresh.length>=8) break; fresh.push(e.id); }
  lexReview={queue:[...due.slice(0,20),...fresh], i:0, session:session||null, fresh:new Set(fresh)}; lexShow=false; tab="lexicon"; render(); scrollTo(0,0);
}
function vLexReview(){
  const q=lexReview; if(q.i>=q.queue.length){ const done=q.queue.length; if(q.session){ const ss=S.sessions[dayNum()]=S.sessions[dayNum()]||{}; ss[q.session]=true; persist(); } lexReview=null; return `<div class="empty"><strong>${done?"Done":"Nothing due"}</strong>${done?`${done} terms reviewed. They'll come back when they're due.`:"Pick a field to learn new terms."}</div><div class="row" style="justify-content:center"><button class="btn primary" data-go="${q.session?"today":"lexicon"}">Back</button></div>`; }
  const e=LEXBY[q.queue[q.i]]; const isNew=q.fresh.has(e.id);
  return `<button class="back" data-lx-quit>${I.back} Lexicon</button><div class="row spread"><div class="eyebrow">${esc(e.field)}${isNew?" · new":""}</div><span class="note">${q.i+1} of ${q.queue.length}</span></div>
    <div class="card"><p class="note">What's the word or phrase?</p><div style="font-family:var(--serif);font-size:1.45rem;line-height:1.3">${esc(e.gloss)}</div>
    ${lexShow?`<hr class="sep"><div style="font-family:var(--serif);font-size:2rem">${esc(e.term)}</div><div class="model">${mark(e.say)}</div>${e.note?`<p class="note">${esc(e.note)}</p>`:""}<div class="row">${hearBtn(e.say)}<button class="btn small" data-lx-say="${e.id}">${I.mic} Say it</button></div>`:""}</div>
    ${lexShow?`<div class="row"><button class="btn" data-lx-grade="0">${isNew?"Again soon":"Didn't have it"}</button><button class="btn primary" style="flex:1" data-lx-grade="1">${isNew?"Got it":"Had it"}</button></div>`:`<button class="btn primary big wide" data-lx-reveal>Show</button><p class="note" style="margin-top:8px">Say the term and a sentence using it before you look.</p>`}`;
}

/* ---------------- Views: Meetings ---------------- */
let mvMove=null;
function vMeetings(){
  if(mvMove&&MOVEBY[mvMove]){ const m=MOVEBY[mvMove];
    return `<button class="back" data-mv-back>${I.back} Meetings</button><div class="eyebrow">${esc(m.family)}</div><h1 style="font-size:2rem">${esc(m.name)}</h1><p class="sub" style="margin-top:6px"><b>${esc(m.what)}</b> ${esc(m.when||"")}</p>
      <hr class="sep"><div class="eyebrow">Teach</div><div class="lesson">${paras(m.teach)}</div>
      <div class="eyebrow" style="margin-top:14px">Phrasings</div>${(m.phrasings||[]).map(p=>`<div class="model" style="margin:8px 0">${mark(p)}</div>`).join("")}
      ${(m.avoid||[]).length?`<div class="eyebrow" style="margin-top:14px">Avoid</div>${m.avoid.map(a=>{ const [l,...w]=String(a).split(" : "); return `<div class="mistake" style="margin:8px 0">${esc(l)}${w.length?`<div class="note" style="font-family:var(--sans);margin-top:4px">${esc(w.join(" : "))}</div>`:""}</div>`; }).join("")}`:""}
      <hr class="sep"><div class="eyebrow">Practise it</div><p class="note">Read the room, then speak. Twelve seconds to think. Then compare with two strong contributions.</p>
      ${(m.scenarios||[]).map((sc,i)=>`<div class="step ${S.moves[sc.id]?"done":""}" data-mv-run="${sc.id}"><div class="num">${S.moves[sc.id]?"✓":i+1}</div><div style="flex:1"><div class="t" style="font-size:1.08rem">${esc(sc.room)}</div><div class="m">${esc(sc.task||"")}</div></div></div>`).join("")}`; }
  const total=Object.keys(SCEN).length, done=Object.keys(S.moves).filter(id=>SCEN[id]).length;
  return `<h1>Meetings</h1><p class="sub">The craft of the contribution: ${MOVES.length} moves that shape a committee of clever people, each taught, then practised against ${total} situations with model answers.</p>
    <div class="row" style="margin:6px 0 4px"><button class="btn primary" data-mv-random>${I.shuffle} A random room</button><span class="note">${done} of ${total} practised</span></div>
    ${FAMILIES.map(f=>`<hr class="sep"><div class="eyebrow">${esc(f)}</div><div class="list">${MOVES.filter(m=>m.family===f).map(m=>{ const n=(m.scenarios||[]).length, k=(m.scenarios||[]).filter(sc=>S.moves[sc.id]).length; return `<div class="item" data-mv-move="${m.id}"><div class="row" style="gap:12px;flex-wrap:nowrap"><div class="tick ${k===n&&n?"done":k?"part":""}">${k===n&&n?"✓":k||""}</div><div><div class="t">${esc(m.name)}</div><div class="m">${esc(m.what)}</div></div></div><span class="arrow">›</span></div>`; }).join("")}</div>`).join("")}`;
}

/* ---------------- Views: Speeches ---------------- */
let spSec="craft", spItem=null, spDraft=null, spNotes=false;
function vSpeeches(){
  if(spDraft) return vDraft();
  if(spItem){
    if(CRAFTBY[spItem]) return vCraft(CRAFTBY[spItem]);
    if(TYPEBY[spItem]) return vType(TYPEBY[spItem]);
    if(GREATBY[spItem]) return vGreat(GREATBY[spItem]);
  }
  const secs=[["craft","Craft"],["types","Occasions"],["great","Great"],["lines","Openings"],["mine","Mine"]];
  let body="";
  if(spSec==="craft") body=`<p class="sub">The craft, lesson by lesson: invention, arrangement, style, memory, delivery.</p><div class="list">${CRAFT.map((c,i)=>`<div class="item" data-sp-item="${c.id}"><div class="row" style="gap:12px;flex-wrap:nowrap"><div class="tick ${S.craft[c.id]?"done":""}">${S.craft[c.id]?"✓":i+1}</div><div class="t">${esc(c.title)}</div></div><span class="arrow">›</span></div>`).join("")}</div>`;
  if(spSec==="types") body=`<p class="sub">Each occasion has a shape, a model speech annotated paragraph by paragraph, and a workshop to draft your own.</p><div class="list">${TYPES.map(t=>`<div class="item" data-sp-item="${t.id}"><div><div class="t">${esc(t.name)}</div><div class="m">${esc(t.occasion)}${t.minutes?` · ${t.minutes[0]} to ${t.minutes[1]} min`:""}</div></div><span class="arrow">›</span></div>`).join("")}</div>`;
  if(spSec==="great") body=`<p class="sub">Great speeches, taken apart for their architecture, with a note on what you can borrow.</p><div class="list">${GREAT.map(g=>`<div class="item" data-sp-item="${g.id}"><div><div class="t">${esc(g.speaker)}</div><div class="m">${esc(g.occasion)} · ${esc(g.year)}</div></div><span class="arrow">›</span></div>`).join("")}</div>`;
  if(spSec==="lines"){ const devs=[...new Set([...OPENS,...CLOSES].map(x=>x.device))]; body=`<p class="sub">${OPENS.length} openings and ${CLOSES.length} closings. Say them aloud; steal the shape, not the words.</p>
    <div class="eyebrow" style="margin-top:12px">Openings</div>${OPENS.map(o=>lineCard(o)).join("")}<div class="eyebrow" style="margin-top:18px">Closings</div>${CLOSES.map(o=>lineCard(o)).join("")}`; }
  if(spSec==="mine") body=`<p class="sub">Your speeches. Draft by the shape of the occasion, then rehearse with the meter.</p><div class="row" style="margin:6px 0"><select class="search" id="newtype" style="flex:1">${TYPES.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join("")}<option value="free">Free form</option></select><button class="btn primary" data-sp-new>New speech</button></div>
    ${S.drafts.length?`<div class="list">${S.drafts.slice().sort((a,b)=>b.updated-a.updated).map(d=>`<div class="item" data-sp-open="${d.id}"><div><div class="t">${esc(d.title||"Untitled")}</div><div class="m">${esc(TYPEBY[d.type]?TYPEBY[d.type].name:"Free form")} · ${new Date(d.updated).toLocaleDateString("en-AU",{day:"numeric",month:"short"})}</div></div><span class="arrow">›</span></div>`).join("")}</div>`:`<div class="empty"><strong>No speeches yet</strong>Pick an occasion and start one. Draft each part from its prompt.</div>`}`;
  return `<h1>Speeches</h1><div class="seg">${secs.map(([k,l])=>`<button class="${spSec===k?"on":""}" data-sp-sec="${k}">${l}</button>`).join("")}</div>${body}`;
}
function lineCard(o){ return `<div class="card" style="padding:14px"><div class="row spread"><span class="eyebrow" style="margin:0">${esc(o.device)}</span><span class="note">${esc(o.occasion||"")}</span></div><div class="model" style="margin:8px 0">${mark(o.text)}</div><p class="note" style="margin:0 0 6px">${esc(o.note||"")}</p><div class="row">${hearBtn(o.text)}<button class="btn small" data-sp-say="${esc(o.id)}">${I.mic} Say it</button></div></div>`; }
function vCraft(c){
  const ex=c.exercise||{};
  return `<button class="back" data-sp-back>${I.back} Speeches</button><div class="eyebrow">Craft</div><h1 style="font-size:2rem">${esc(c.title)}</h1>
    <div class="lesson" style="margin-top:12px">${paras(c.teach)}</div>
    ${c.model?`<div class="eyebrow" style="margin-top:14px">Model</div><div class="model">${mark(c.model)}</div><div class="row">${hearBtn(c.model)}<button class="btn small" data-sp-readmodel="${c.id}">${I.mic} Read it aloud</button></div>`:""}
    <hr class="sep"><div class="eyebrow">Exercise</div><p>${esc(ex.task||"")}</p>
    ${ex.kind==="speak"?`<button class="btn primary" data-sp-ex="${c.id}">${I.mic} Do it (${ex.seconds||60}s)</button>`:`<textarea class="search" data-note="${c.id}" placeholder="Write it here. It stays on this phone." style="min-height:180px;font-family:var(--serif);font-size:1.1rem">${esc((S.notes[c.id]||{}).text||"")}</textarea><div class="row"><button class="btn small" data-sp-readnote="${c.id}">${I.mic} Read what you wrote aloud</button></div>`}
    ${(c.checks||[]).length?`<div class="eyebrow" style="margin-top:14px">Check</div><ul class="rules">${c.checks.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}
    <div class="row" style="margin:16px 0"><button class="btn ${S.craft[c.id]?"on":"brass"}" data-sp-done="${c.id}">${S.craft[c.id]?"Lesson done":"Mark lesson done"}</button></div>`;
}
function vType(t){
  const m=t.model||{paragraphs:[]}; const text=(m.paragraphs||[]).map(p=>p.text).join("\n\n");
  return `<button class="back" data-sp-back>${I.back} Speeches</button><div class="eyebrow">Occasion</div><h1 style="font-size:2rem">${esc(t.name)}</h1><p class="sub" style="margin-top:6px">${esc(t.occasion)} ${t.minutes?`${t.minutes[0]} to ${t.minutes[1]} minutes.`:""}</p><p><b>It must:</b> ${esc(t.purpose||"")}</p>
    <div class="eyebrow" style="margin-top:12px">The shape</div>${(t.parts||[]).map((p,i)=>`<div class="step" style="cursor:default"><div class="num">${i+1}</div><div style="flex:1"><div class="t">${esc(p.part)}${p.share?` <span class="note">· ${p.share}%</span>`:""}</div><div class="m">${esc(p.what)}</div></div></div>`).join("")}
    ${(t.pitfalls||[]).length?`<div class="eyebrow" style="margin-top:14px">Pitfalls</div><ul class="rules">${t.pitfalls.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}
    <hr class="sep"><div class="row spread"><div class="eyebrow">Model: ${esc(m.title||"")}</div><button class="btn small ghost" data-sp-notes>${spNotes?"Hide notes":"Show notes"}</button></div><p class="note">${esc(m.setting||"")}</p>
    ${(m.paragraphs||[]).map(p=>`<div class="model" style="margin:10px 0">${mark(p.text)}</div>${spNotes&&p.note?`<p class="note" style="margin:-4px 0 12px;padding-left:4px;border-left:2px solid var(--line)">${esc(p.note)}</p>`:""}`).join("")}
    <div class="row" style="margin:12px 0 18px"><button class="btn" data-sp-rehearse-type="${t.id}">${I.mic} Rehearse the model</button><button class="btn primary" data-sp-new-type="${t.id}">Draft your own</button></div>`;
}
function vGreat(g){
  return `<button class="back" data-sp-back>${I.back} Speeches</button><div class="eyebrow">${esc(g.year)}</div><h1 style="font-size:2rem">${esc(g.speaker)}</h1><p class="sub" style="margin-top:4px">${esc(g.occasion)}</p><p>${esc(g.context)}</p>
    ${g.excerpt?`<div class="model">${esc(g.excerpt)}</div>${g.quoted===false?`<p class="note">Paraphrase.</p>`:""}`:""}
    <div class="eyebrow" style="margin-top:14px">How it works</div>${(g.moves||[]).map(x=>`<div style="margin:12px 0"><div style="font-family:var(--serif);font-size:1.25rem">${esc(x.name)}</div><p class="sub" style="margin-top:2px">${esc(x.how)}</p></div>`).join("")}
    <div class="eyebrow" style="margin-top:14px">Borrow it</div><p>${esc(g.borrow)}</p>`;
}
function newDraft(typeId){ const t=TYPEBY[typeId]; const d={id:"sp"+Date.now(), type:t?typeId:"free", title:"", idea:"", parts:{}, free:"", updated:Date.now()}; S.drafts.push(d); persist(); spDraft=d.id; spItem=null; spSec="mine"; tab="speeches"; render(); scrollTo(0,0); }
function draftText(d){ const t=TYPEBY[d.type]; if(!t) return d.free||""; return (t.parts||[]).map(p=>d.parts[p.part]||"").filter(x=>x.trim()).join("\n\n"); }
function vDraft(){
  const d=S.drafts.find(x=>x.id===spDraft); if(!d){ spDraft=null; return vSpeeches(); }
  const t=TYPEBY[d.type]; const text=draftText(d); const words=plain(text).split(/\s+/).filter(Boolean).length;
  return `<button class="back" data-sp-back>${I.back} Speeches</button><div class="eyebrow">${esc(t?t.name:"Free form")}</div>
    <input class="search" data-dr="title" placeholder="Title" value="${esc(d.title)}" style="font-family:var(--serif);font-size:1.4rem">
    <textarea class="search" data-dr="idea" placeholder="The controlling idea: the one sentence this speech exists to deliver" style="min-height:70px">${esc(d.idea)}</textarea>
    ${t?(t.parts||[]).map(p=>`<div class="eyebrow" style="margin-top:12px">${esc(p.part)}</div><p class="note" style="margin:0 0 4px">${esc(p.prompt||p.what)}</p><textarea class="search" data-dr-part="${esc(p.part)}" style="min-height:110px;font-family:var(--serif);font-size:1.12rem">${esc(d.parts[p.part]||"")}</textarea>`).join(""):`<textarea class="search" data-dr="free" placeholder="Write the speech." style="min-height:320px;font-family:var(--serif);font-size:1.12rem">${esc(d.free)}</textarea>`}
    <p class="note">Mark it for delivery as you go: <b>|</b> for a breath, <b>||</b> for a held full stop, <b>*word*</b> for the word to land.</p>
    <div class="row spread"><span class="note" id="drwords">${words} words · about ${Math.max(1,Math.round(words/135))} min at 135 wpm${t&&t.minutes?` · target ${t.minutes[0]} to ${t.minutes[1]}`:""}</span></div>
    <div class="row" style="margin:12px 0"><button class="btn primary" data-sp-rehearse="${d.id}">${I.mic} Rehearse it</button><button class="btn" data-sp-preview="${d.id}">Preview</button><button class="btn ghost" data-sp-export="${d.id}">${I.down} Export</button><button class="btn ghost" data-sp-del="${d.id}">Delete</button></div>
    <div id="preview"></div>`;
}

/* ---------------- Daily session (senior) ---------------- */
function sessionPlan2(){
  const day=dayNum(); const steps=[];
  steps.push({key:"warm",title:"Warm-up",sub:"Breath, then articulation"});
  const cu=currentUnit(); const u=UNITS[cu];
  if(u){ const pend=(u.drills||[]).find(d=>!S.drills[d.id]); steps.push({key:"course",title:!S.read[cu]?"Lesson: "+u.title:pend?"Drill: "+pend.title:"Apply: "+u.title,sub:u.strand+" · unit "+(ORDER.indexOf(cu)+1)+" of "+ORDER.length}); }
  const due=lexDue().length; steps.push({key:"lex",title:"Lexicon",sub:`${due?due+" due, then ":""}eight new terms`});
  const all=Object.values(SCEN); if(all.length){ const r=seeded(day*17); const fresh=all.filter(sc=>!S.moves[sc.id]); const pick=(fresh.length?fresh:all)[Math.floor(r()*(fresh.length?fresh:all).length)]; steps.push({key:"meet",title:"Meeting: "+(MOVEBY[pick.move]||{}).name,sub:pick.room,scen:pick.id}); }
  const latest=S.drafts.slice().sort((a,b)=>b.updated-a.updated)[0];
  const nextCraft=CRAFT.find(c=>!S.craft[c.id]);
  if(latest&&draftText(latest).trim().length>200) steps.push({key:"speech",title:"Rehearse: "+(latest.title||"your speech"),sub:"Full voice, standing, against the clock",draft:latest.id});
  else if(nextCraft) steps.push({key:"speech",title:"Speech craft: "+nextCraft.title,sub:"Lesson and exercise",craft:nextCraft.id});
  return steps;
}
function vToday(){
  const plan=sessionPlan2(); const ss=S.sessions[dayNum()]||{}; const done=plan.filter(s=>ss[s.key]).length;
  const hour=new Date().getHours(); const greet=hour<12?"Morning":hour<17?"Afternoon":"Evening";
  const avg=k=>{ const xs=A.slice(-30).map(a=>a.metrics&&a.metrics[k]).filter(v=>v!=null); return xs.length?Math.round(xs.reduce((s,v)=>s+v,0)/xs.length*10)/10:null; };
  return `<h1>${greet}.</h1><p class="sub">${done===plan.length?"Today's session is done. Anything further is extra.":"Fifteen minutes, out loud. Each step draws on a different part of the craft."}</p>
    ${plan.map((s,i)=>`<div class="step ${ss[s.key]?"done":""}" data-step2="${s.key}"><div class="num">${ss[s.key]?"✓":i+1}</div><div style="flex:1"><div class="t">${esc(s.title)}</div><div class="m">${esc(s.sub)}</div></div></div>`).join("")}
    <div class="tiles" style="margin-top:14px"><div class="tile" data-go="gym"><div class="t">Gym</div><div class="n">Free practice on stories, scenarios, passages</div></div><div class="tile" data-go="progress"><div class="t">Progress</div><div class="n">${A.length} attempts · avg ${avg("wpm")??"–"} wpm</div></div></div>
    <div class="stat"><div><b>${Object.keys(S.lex).length}</b><span>terms learning</span></div><div><b>${Object.keys(S.moves).length}</b><span>rooms practised</span></div><div><b>${ORDER.filter(unitDone).length}</b><span>units done</span></div></div>`;
}
function runStep2(key){
  const s=sessionPlan2().find(x=>x.key===key); if(!s) return; const from={tab:"today",session:key};
  if(key==="warm"){ startRunner(breathWarm(),{tab:"today",session:"warm-b"}); R.next=()=>startRunner(warmupDrill(),from); return; }
  if(key==="course"){ const cu=currentUnit(), u=UNITS[cu]; if(!S.read[cu]){ tab="course"; view=cu; render(); scrollTo(0,0); return; } const pend=(u.drills||[]).find(d=>!S.drills[d.id]); if(pend){ startRunner(pend,from); return; } startRunner(applyDrill(u),from); return; }
  if(key==="lex"){ startLexReview(null,"lex"); return; }
  if(key==="meet"){ startRunner(scenarioDrill(SCEN[s.scen]),from); return; }
  if(key==="speech"){ if(s.draft){ const d=S.drafts.find(x=>x.id===s.draft); const t=TYPEBY[d.type]; startRunner(speechRehearseDrill(d.title||"your speech",draftText(d),t&&t.minutes),from); return; } tab="speeches"; spItem=s.craft; render(); scrollTo(0,0); const ss=S.sessions[dayNum()]=S.sessions[dayNum()]||{}; ss.speech=true; persist(); return; }
}

/* ---------------- Render override ---------------- */
function renderInner(){
  document.getElementById("hdrDate").textContent=new Date().toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"});
  const tabs=[["today","Today",I.today],["lexicon","Lexicon",'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2zM8 7h6M8 11h8"/></svg>'],["meetings","Meetings",'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><circle cx="4.5" cy="8" r="2"/><circle cx="19.5" cy="8" r="2"/><circle cx="4.5" cy="16" r="2"/><circle cx="19.5" cy="16" r="2"/></svg>'],["speeches","Speeches",'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18M8 21h8M5 8l7-3 7 3M7 8v4l5 2 5-2V8"/></svg>'],["course","Course",I.course]];
  const active = tab==="run"&&R&&R.from ? R.from.tab : (tab==="gym"||tab==="progress"||tab==="settings") ? "today" : tab;
  document.getElementById("tabs").innerHTML=tabs.map(([k,l,ic])=>`<button class="${k===active?"on":""}" data-go="${k}">${ic}${l}</button>`).join("");
  const v=document.getElementById("view");
  v.innerHTML = tab==="run"?vRun(): tab==="course"?vCourse(): tab==="gym"?vGym(): tab==="progress"?vProgress(): tab==="settings"?vSettings(): tab==="lexicon"?vLexicon(): tab==="meetings"?vMeetings(): tab==="speeches"?vSpeeches(): vToday();
  if(tab==="run"&&R&&R.phase==="live"&&R.drill.type==="mirror"&&camStream){ const c=document.getElementById("cam"); if(c){ c.srcObject=camStream; c.play().catch(()=>{}); } }
}

/* ---------------- Events ---------------- */
document.addEventListener("click", e=>{
  const b=e.target.closest("[data-step2],[data-lx-field],[data-lx-level],[data-lx-entry],[data-lx-back],[data-lx-say],[data-lx-use],[data-lx-keep],[data-lx-start],[data-lx-reveal],[data-lx-grade],[data-lx-quit],[data-mv-move],[data-mv-back],[data-mv-run],[data-mv-random],[data-sp-sec],[data-sp-item],[data-sp-back],[data-sp-done],[data-sp-ex],[data-sp-readmodel],[data-sp-readnote],[data-sp-notes],[data-sp-rehearse-type],[data-sp-new-type],[data-sp-new],[data-sp-open],[data-sp-rehearse],[data-sp-preview],[data-sp-export],[data-sp-del],[data-sp-say],[data-go]");
  if(!b) return; const d=b.dataset;
  if(d.go!==undefined){ let ch=false; if(d.go==="lexicon"&&(lexReview||lexEntry||lexField!==null)){ lexReview=null; lexEntry=null; lexField=null; lexQuery=""; lexLevel=0; ch=true; } if(d.go==="meetings"&&mvMove){ mvMove=null; ch=true; } if(d.go==="speeches"&&(spItem||spDraft)){ spItem=null; spDraft=null; ch=true; } if(ch&&tab===d.go){ render(); scrollTo(0,0); } return; } // main handler does the rest
  if(d.step2!==undefined) return runStep2(d.step2);
  // Lexicon
  if(d.lxField!==undefined){ lexField=d.lxField===""?null:(d.lxField==="__all"?"":d.lxField); lexEntry=null; lexQuery=""; render(); scrollTo(0,0); return; }
  if(d.lxLevel!==undefined){ lexLevel=+d.lxLevel; render(); return; }
  if(d.lxEntry!==undefined){ lexEntry=d.lxEntry; render(); scrollTo(0,0); return; }
  if(d.lxBack!==undefined){ lexEntry=null; render(); return; }
  if(d.lxSay!==undefined){ startRunner(lexSayDrill(LEXBY[d.lxSay]),{tab:"lexicon"}); return; }
  if(d.lxUse!==undefined){ startRunner(lexUseDrill(LEXBY[d.lxUse]),{tab:"lexicon"}); return; }
  if(d.lxKeep!==undefined){ if(S.lex[d.lxKeep]){ delete S.lex[d.lxKeep]; toast("Removed from review"); } else { S.lex[d.lxKeep]={interval:1,due:dayNum()+1,n:0}; toast("It'll come back tomorrow"); } persist(); render(); return; }
  if(d.lxStart!==undefined){ startLexReview(d.lxStart||null,null); return; }
  if(d.lxReveal!==undefined){ lexShow=true; render(); return; }
  if(d.lxGrade!==undefined){ const id=lexReview.queue[lexReview.i]; lexGrade(id, d.lxGrade==="1"); if(d.lxGrade==="0"&&lexReview.fresh.has(id)) lexReview.queue.push(id); lexReview.i++; lexShow=false; render(); scrollTo(0,0); return; }
  if(d.lxQuit!==undefined){ lexReview=null; render(); return; }
  // Meetings
  if(d.mvMove!==undefined){ mvMove=d.mvMove; render(); scrollTo(0,0); return; }
  if(d.mvBack!==undefined){ mvMove=null; render(); scrollTo(0,0); return; }
  if(d.mvRun!==undefined){ startRunner(scenarioDrill(SCEN[d.mvRun]),{tab:"meetings"}); return; }
  if(d.mvRandom!==undefined){ const all=Object.values(SCEN); if(!all.length) return; const fresh=all.filter(sc=>!S.moves[sc.id]); const sc=rnd(fresh.length?fresh:all); startRunner(scenarioDrill(sc),{tab:"meetings"}); return; }
  // Speeches
  if(d.spSec!==undefined){ spSec=d.spSec; spItem=null; spDraft=null; render(); return; }
  if(d.spItem!==undefined){ spItem=d.spItem; render(); scrollTo(0,0); return; }
  if(d.spBack!==undefined){ spItem=null; spDraft=null; render(); scrollTo(0,0); return; }
  if(d.spDone!==undefined){ S.craft[d.spDone]=!S.craft[d.spDone]; persist(); render(); return; }
  if(d.spEx!==undefined){ const c=CRAFTBY[d.spEx], ex=c.exercise||{}; startRunner({id:"craft-ex-"+c.id,gym:true,type:"impromptu",title:c.title,how:ex.task,items:[ex.task],prep:20,seconds:ex.seconds||60,checks:c.checks||[],onSave:()=>{ S.craft[c.id]=true; }},{tab:"speeches"}); return; }
  if(d.spReadmodel!==undefined){ const c=CRAFTBY[d.spReadmodel]; startRunner({id:"craft-model-"+c.id,gym:true,type:"read",long:true,title:c.title,how:"Read the model aloud at the speed of the room.",items:[c.model],checks:c.checks||[]},{tab:"speeches"}); return; }
  if(d.spReadnote!==undefined){ const n=(S.notes[d.spReadnote]||{}).text; if(!n) return toast("Write something first"); startRunner({id:"craft-note-"+d.spReadnote,gym:true,type:"read",long:true,title:"Your draft",how:"Read it aloud. Mark what you'd cut.",items:[n],checks:CRAFTBY[d.spReadnote].checks||[]},{tab:"speeches"}); return; }
  if(d.spNotes!==undefined){ spNotes=!spNotes; render(); return; }
  if(d.spRehearseType!==undefined){ const t=TYPEBY[d.spRehearseType]; startRunner(speechRehearseDrill(t.model.title||t.name,(t.model.paragraphs||[]).map(p=>p.text).join("\n\n"),t.minutes),{tab:"speeches"}); return; }
  if(d.spNewType!==undefined){ newDraft(d.spNewType); return; }
  if(d.spNew!==undefined){ newDraft(document.getElementById("newtype").value); return; }
  if(d.spOpen!==undefined){ spDraft=d.spOpen; render(); scrollTo(0,0); return; }
  if(d.spRehearse!==undefined){ const dr=S.drafts.find(x=>x.id===d.spRehearse); const txt=draftText(dr); if(plain(txt).length<20) return toast("Write some of it first"); const t=TYPEBY[dr.type]; startRunner(speechRehearseDrill(dr.title||"your speech",txt,t&&t.minutes),{tab:"speeches"}); return; }
  if(d.spPreview!==undefined){ const dr=S.drafts.find(x=>x.id===d.spPreview); const el=document.getElementById("preview"); if(el) el.innerHTML=`<div class="card"><div class="eyebrow">Preview</div><h2>${esc(dr.title||"")}</h2>${dr.idea?`<p class="note">${esc(dr.idea)}</p>`:""}<div class="passage">${paras(draftText(dr))}</div></div>`; return; }
  if(d.spExport!==undefined){ const dr=S.drafts.find(x=>x.id===d.spExport); const md=`# ${dr.title||"Speech"}\n\n*${TYPEBY[dr.type]?TYPEBY[dr.type].name:"Free form"}*\n\n**Controlling idea:** ${dr.idea||""}\n\n${draftText(dr)}\n`; try{ const url=URL.createObjectURL(new Blob([md],{type:"text/markdown"})); const a=document.createElement("a"); a.href=url; a.download=(dr.title||"speech").replace(/[^\w-]+/g,"-")+".md"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),4000); toast("Saved to your downloads"); }catch(e){ toast("Saving isn't available here"); } return; }
  if(d.spDel!==undefined){ S.drafts=S.drafts.filter(x=>x.id!==d.spDel); spDraft=null; persist(); render(); toast("Deleted"); return; }
  if(d.spSay!==undefined){ const o=[...OPENS,...CLOSES].find(x=>x.id===d.spSay); if(o) startRunner({id:"line-"+o.id,gym:true,type:"hold",hold:2,title:o.device,how:"Say it, then hold the silence. Openings need the beat before the next sentence as much as closings need it after.",items:[o.text],checks:["Did the stressed word land?","Did you hold two full seconds?","Did it sound like you?"]},{tab:"speeches"}); return; }
});
let drT=null;
document.addEventListener("input", e=>{
  const t=e.target;
  if(t.id==="lxq"){ lexQuery=t.value; const pos=t.selectionStart; render(); const q=document.getElementById("lxq"); if(q){ q.focus(); q.setSelectionRange(pos,pos); } return; }
  if(t.dataset&&t.dataset.note){ S.notes[t.dataset.note]={text:t.value,t:Date.now()}; clearTimeout(drT); drT=setTimeout(persist,400); return; }
  if(t.dataset&&(t.dataset.dr||t.dataset.drPart)){ const dr=S.drafts.find(x=>x.id===spDraft); if(!dr) return; if(t.dataset.dr) dr[t.dataset.dr]=t.value; else dr.parts[t.dataset.drPart]=t.value; dr.updated=Date.now(); clearTimeout(drT); drT=setTimeout(()=>{ persist(); const w=document.getElementById("drwords"); if(w){ const words=plain(draftText(dr)).split(/\s+/).filter(Boolean).length; const ty=TYPEBY[dr.type]; w.textContent=`${words} words · about ${Math.max(1,Math.round(words/135))} min at 135 wpm${ty&&ty.minutes?` · target ${ty.minutes[0]} to ${ty.minutes[1]}`:""}`; } },400); return; }
});
render();
