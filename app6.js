// The Coach, part six: worked examples on every formula page; worked answers for Pick for the room.
const C6=window.COACH||{};
(C6.more||[]).forEach(m=>{ if(!PK[m.id]) return; const have=new Set((PK[m.id].examples||[]).map(e=>e.title)); (m.examples||[]).forEach(e=>{ if(!have.has(e.title)) PK[m.id].examples.push(e); }); });
const PICK={}; (C6.pick||[]).forEach(p=>{ if(p&&p.scen&&LONGS[p.scen]) PICK[p.scen]=p; });
const PICK_IDS=Object.keys(PICK);
// Study passes after three examples, however many there are.
const _rungCount6=rungCount;
rungCount=function(id,i){ const r=_rungCount6(id,i); if(i===0&&packKind(id)!=="notes"){ return [Math.min(r[0],3),Math.min(r[1],3)]; } return r; };

function exampleCard(e, steps, open, extra){
  const text=(e.parts||[]).map(p=>p.text).join(" ");
  return `<details class="card exd" ${open?"open":""}><summary><div class="eyebrow" style="margin:0">${esc(e.room||"")}</div><div style="font-family:var(--serif);font-size:1.25rem;font-weight:600;line-height:1.2;margin-top:2px">${esc(e.title||"")}</div>${e.prompt?`<div class="note" style="margin-top:3px">${esc(e.prompt)}</div>`:""}</summary>
    ${extra||""}
    ${(e.parts||[]).map(p=>`<div style="margin:12px 0"><span class="slotlabel">${(p.tag|0)+1} · ${esc((steps[p.tag]||{}).slot||"")}</span><div class="model" style="margin:4px 0;font-size:1.1rem">${mark(p.text)}</div>${p.note?`<div class="note" style="padding-left:12px;border-left:2px solid var(--line2);color:var(--ink2)">${esc(p.note)}</div>`:""}</div>`).join("")}
    <div class="row" style="margin-top:6px">${hearBtn(text)}<button class="btn small" data-ex-read="${esc(text)}">${I.mic} Read it aloud</button></div>
    ${e.weak&&e.weak.text?`<details style="margin-top:12px"><summary class="note" style="font-weight:600;color:var(--bad)">The weak version, and what's wrong with it</summary><div class="mistake">${esc(e.weak.text)}</div><ul class="rules">${(e.weak.why||[]).map(w=>`<li style="font-weight:400">${esc(w)}</li>`).join("")}</ul></details>`:""}
  </details>`;
}
function modelAsExample(f){ const m=f.model||{}; return {title:"The model",room:m.room||"",prompt:m.prompt||"",parts:(m.slots||[]).map((t,i)=>({tag:i,text:t,note:""})).filter(p=>p.text)}; }

const _vFormula6=vFormula;
vFormula=function(f){
  let h=_vFormula6(f);
  const exs=[modelAsExample(f),...((PK[f.id]||{}).examples||[])].filter(e=>(e.parts||[]).length);
  const block=`<div class="sectitle"><h3>Worked examples</h3><span class="note">${exs.length}</span></div><p class="note" style="margin:0 0 4px">The same formula in ${exs.length} different rooms. Tap one to open it: each sentence is labelled with its step, with a note on how it works.</p>${exs.map((e,i)=>exampleCard(e,f.steps,i===0)).join("")}`;
  h=h.replace(/<div class="sectitle"><h3>Working, in one of your rooms<\/h3><\/div>[\s\S]*?(?=<div class="sectitle"><h3>Practise it<\/h3>)/, block);
  return h;
};

const _vPick6=vPick;
vPick=function(){
  if(!LONG_SCEN.length) return _vPick6();
  if(!pickSc||!LONGS[pickSc]) pickSc=PICK_IDS.length?rnd(PICK_IDS):rnd(LONG_SCEN).id;
  const sc=LONGS[pickSc], pk=PICK[pickSc];
  const order=[...PICK_IDS,...LONG_SCEN.map(x=>x.id).filter(id=>!PICK[id])];
  const roomSel=`<select class="search" id="pickroom">${order.map(id=>{ const r=LONGS[id].room; return `<option value="${id}" ${id===pickSc?"selected":""}>${PICK[id]?"★ ":""}${esc(r.length>66?r.slice(0,63)+"…":r)}</option>`; }).join("")}</select><p class="note" style="margin:-4px 0 8px">★ rooms have four worked answers.</p>`;
  const ans=pk?pk.answers.map(a=>{ const f=a.formula==="scaffold"?packFormula("scaffold"):FBY[a.formula]; if(!f) return ""; const e={title:f.name,room:f.who,parts:a.parts}; return exampleCard(e,f.steps,false,`<div class="callout" style="margin:10px 0"><div class="eyebrow">Why this formula here</div>${esc(a.fit||"")}</div>${minitrack(f.steps)}<button class="btn small primary" style="margin-top:8px" data-pick-${a.formula==="scaffold"?"jason":"f"}="${a.formula==="scaffold"?"1":esc(a.formula)}">${I.mic} Answer it this way</button>`); }).join(""):"";
  return `<p class="sub">One room, several architectures. Read the situation, open the worked answers to hear how four different formulas carry the same practical substance, then choose one and speak it.</p>
    ${roomSel}
    <div class="card"><div class="eyebrow">${esc(sc.room)}</div><p style="margin:0 0 8px">${esc(sc.briefing)}</p>${(sc.before||[]).map(b=>`<div class="note" style="margin:6px 0"><b>${esc(b.who)}:</b> ${esc(b.said)}</div>`).join("")}
      ${(sc.notes||[]).length?`<div class="eyebrow" style="margin-top:10px">Your notes</div><ul class="rules" style="margin-top:0">${sc.notes.map(n=>`<li style="font-weight:400">${esc(n)}</li>`).join("")}</ul>`:""}
      <p style="margin:8px 0 0"><b>${esc(sc.task||"")}</b></p><div class="row" style="margin-top:8px"><button class="btn small ghost" data-pick-new>${I.shuffle} Another room</button></div></div>
    ${pk?`<div class="sectitle"><h3>Four ways to answer it</h3><span class="note">worked</span></div>${ans}`:""}
    <div class="sectitle"><h3>Choose yours</h3></div>
    <div class="fcard" data-pick-jason><div class="ini">${IC.meet}</div><div style="flex:1"><div class="t">The committee scaffold</div><div class="w">Seven slots</div>${minitrack(SLOTS.map(s=>s[1]))}</div></div>
    ${FORMULAS.map(f=>`<div class="fcard" data-pick-f="${f.id}"><div class="ini">${esc(initials(f.who))}</div><div style="flex:1;min-width:0"><div class="t">${esc(f.name)}</div><div class="w">${esc(f.who)}</div>${minitrack(f.steps)}</div></div>`).join("")}`;
};

document.addEventListener("click",e=>{
  const b=e.target.closest("[data-ex-read],[data-pick-new]"); if(!b) return; const d=b.dataset;
  if(d.exRead!==undefined){ startRunner({id:"ex-read",gym:true,label:"Worked example",type:"read",long:true,title:"Read it as yours",how:"Standing, full voice, at the speed of the room. Feel where each step begins.",items:[d.exRead],targets:{wpm:[115,155]},checks:["Each step sounded like a new beat.","The landed words landed.","The last sentence ended down, and I held it."]},{tab}); return; }
  if(d.pickNew!==undefined&&PICK_IDS.length){ const others=PICK_IDS.filter(x=>x!==pickSc); pickSc=rnd(others.length?others:PICK_IDS); e.stopImmediatePropagation(); render(); return; }
},true);
document.addEventListener("change",e=>{ if(e.target.id==="pickroom"){ pickSc=e.target.value; render(); } });
render();
