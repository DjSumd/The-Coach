// The Coach, part eight: fixes from the second audit.
// Rooms grouped and collapsed, moves collapsed by family, blind mode for the long contribution,
// skip-ahead on the ladders, plurals, and the Foundations back button.

/* ---------- 1. the committee rooms, grouped ---------- */
if(typeof S.blind!=="boolean") S.blind=false;
function roomGroup(sc){
  const r=String(sc.room||"");
  if(/^SCSA/i.test(r)) return "SCSA committees";
  if(/university|academic (board|council)|dean/i.test(r)) return "University boards and committees";
  if(/school council|principal'?s? |leadership meeting|executive meeting/i.test(r)) return "School council and leadership";
  if(/board of|association board|boards/i.test(r)) return "Boards and associations";
  if(/funding|peak body|ministerial|department of education|consultation/i.test(r)) return "Funding bodies, peak bodies and government";
  return "Networks, panels and conferences";
}
const ROOM_GROUP_ORDER=["SCSA committees","University boards and committees","Boards and associations","School council and leadership","Funding bodies, peak bodies and government","Networks, panels and conferences"];
function roomItem(sc){
  const has1=LONGS[sc.id]&&LONGS[sc.id].model&&LONGS[sc.id].model.short;
  return `<div class="item"><div style="flex:1" data-lg-run="${sc.id}"><div class="t" style="font-size:1.08rem">${esc(sc.room)}</div><div class="m">${esc((sc.task||"").slice(0,110))}${S.long[sc.id]?" · done":""}</div></div><div class="row" style="flex-direction:column;gap:4px;flex:none">${has1?`<button class="btn small" data-lg-short="${sc.id}">1 min</button>`:""}<button class="btn small ghost" data-lg-summ="${sc.id}" title="Summarise the room">Summarise</button></div></div>`;
}
function roomsHtml(){
  const done=LONG_SCEN.filter(sc=>S.long[sc.id]).length;
  const groups={}; LONG_SCEN.forEach(sc=>{ (groups[roomGroup(sc)]=groups[roomGroup(sc)]||[]).push(sc); });
  const order=ROOM_GROUP_ORDER.filter(g=>groups[g]).concat(Object.keys(groups).filter(g=>!ROOM_GROUP_ORDER.includes(g)));
  const next=LONG_SCEN.find(sc=>!S.long[sc.id]);
  return `<div class="eyebrow" style="margin-top:16px">Practise it · ${done} of ${LONG_SCEN.length}</div>
    <p class="note">Read the briefing and what the others said. Ninety seconds to jot keywords into the slots. Then speak, with your keywords on screen. Then compare with a version that would be heard.</p>
    <label class="toggle card" style="margin:8px 0;padding:12px 14px"><span><b>Blind mode</b><br><span class="note">Hide the notes that hand you the proposal. You build it from the briefing alone, then see the notes and the model afterwards.</span></span><input type="checkbox" data-blind-toggle ${S.blind?"checked":""}></label>
    ${next?`<div class="card flat" style="padding:12px 14px"><div class="eyebrow" style="margin:0 0 4px">Next room</div>${roomItem(next)}</div>`:""}
    ${order.map((g,i)=>{ const xs=groups[g]; const d=xs.filter(sc=>S.long[sc.id]).length; return `<details class="card exd" ${i===0&&!next?"open":""}><summary><div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><div style="font-family:var(--serif);font-size:1.2rem;font-weight:600">${esc(g)}</div><span class="note" style="flex:none">${d}/${xs.length}</span></div></summary><div class="list" style="margin-top:8px">${xs.map(roomItem).join("")}</div></details>`; }).join("")}`;
}

/* ---------- 2. the moves, collapsed by family ---------- */
function collapseMoves(h){
  return h.replace(/<hr class="sep"><div class="eyebrow">([^<]+)<\/div><div class="list">([\s\S]*?)<\/div>(?=<hr class="sep">|$)/g,(m,fam,inner)=>{
    const ms=MOVES.filter(x=>x.family===fam); const n=ms.reduce((s,x)=>s+(x.scenarios||[]).length,0); const k=ms.reduce((s,x)=>s+(x.scenarios||[]).filter(sc=>S.moves[sc.id]).length,0);
    return `<details class="card exd"><summary><div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><div style="font-family:var(--serif);font-size:1.2rem;font-weight:600">${esc(fam)}</div><span class="note" style="flex:none">${ms.length} moves · ${k}/${n}</span></div></summary><div class="list" style="margin-top:8px">${inner}</div></details>`;
  });
}

const _vMeetings8=vMeetings;
vMeetings=function(){
  let h=_vMeetings8();
  if(tab!=="meetings"||(LAD&&LAD.pack)) return h;
  if(mtSec==="long"&&!longItem){ const i=h.indexOf('<div class="eyebrow" style="margin-top:16px">Practise it'); if(i>0) h=h.slice(0,i)+roomsHtml(); }
  if(mtSec==="moves"&&!mvMove) h=collapseMoves(h);
  return h;
};

/* ---------- 3. blind mode in the runner ---------- */
const NOTES_RE=/<div class="card" style="padding:14px;border-color:rgba\(195,154,85,\.5\)"><div class="eyebrow">Your notes<\/div>[\s\S]*?<\/ul><\/div>/;
const blindOn=d=>S.blind&&d&&d.longScen&&!d.sprint&&(d.longScen.notes||[]).length;
const _runTop8=runTop;
runTop=function(d,phase){
  let h=_runTop8(d,phase);
  if(blindOn(d)&&(phase==="ready"||phase==="prep")) h=h.replace(NOTES_RE,phase==="ready"?`<div class="card" style="padding:14px;border-color:rgba(195,154,85,.5)"><div class="eyebrow">Blind mode</div><p style="margin:0">No notes this time. Work out what you would propose from the briefing and what the others said. The notes and the model appear afterwards.</p></div>`:"");
  return h;
};
const _runReview8=runReview;
runReview=function(d){
  let h=_runReview8(d);
  if(blindOn(d)) h=`<div class="card" style="border-color:rgba(195,154,85,.5)"><div class="eyebrow">The notes you weren't given</div><ul class="rules" style="margin-top:4px">${d.longScen.notes.map(n=>`<li style="font-weight:400">${esc(n)}</li>`).join("")}</ul><p class="note">Compare what you proposed with what the room's own notes pointed to. Then the model below.</p></div>`+h;
  return h;
};

/* ---------- 4. skip ahead on a ladder ---------- */
const _vLadder8=vLadder;
vLadder=function(){
  let h=_vLadder8();
  if(!LAD||!LAD.pack||LAD.rung!=null||!PK[LAD.pack]) return h;
  const id=LAD.pack, k=packKind(id), x=lad(id), to=k==="notes"?1:2;
  if(x.lv<to) h+=`<button class="btn ghost wide" style="margin-top:10px" data-lad-skip="${id}">I know this one: skip to Spot</button>`;
  return h;
};

/* ---------- 5. the Foundations back button ---------- */
const _vUnit8=vUnit;
vUnit=function(u){ return _vUnit8(u).replace(/(<button class="back" data-back>[\s\S]*?) Course<\/button>/," Foundations</button>"); };

/* ---------- 6. plurals ---------- */
function singularise(h){
  return h.replace(/<b>1<\/b> (days|takes|drafts|attempts|debriefs|pads|terms)\b/g,(m,w)=>`<b>1</b> ${w.slice(0,-1)}`)
          .replace(/(>|\s)1 (days|takes|drafts|attempts|debriefs|pads)\b/g,(m,p,w)=>`${p}1 ${w.slice(0,-1)}`)
          .replace(/<b>1<\/b><span>(days|attempts|minutes)<\/span>/g,(m,w)=>`<b>1</b><span>${w.slice(0,-1)}</span>`);
}
const _render8=renderInner;
renderInner=function(){
  _render8();
  if(tab==="run") return;
  const v=document.getElementById("view"); if(!v) return; const h=v.innerHTML, h2=singularise(h); if(h2!==h) v.innerHTML=h2;
};

/* ---------- events ---------- */
document.addEventListener("change",e=>{ const t=e.target; if(t&&t.dataset&&t.dataset.blindToggle!==undefined){ S.blind=!!t.checked; persist(); toast(S.blind?"Blind mode on. No notes until the review.":"Blind mode off."); } });
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-lad-skip]"); if(!b) return;
  const id=b.dataset.ladSkip, k=packKind(id), to=k==="notes"?1:2, x=lad(id);
  if(x.lv<to){ x.lv=to; x.t=Date.now(); persist(); }
  LAD.rung=to; render(); scrollTo(0,0); toast("Spot is open. Study and Say stay available below it.");
});
render();
