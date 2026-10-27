// The Coach, part four: new navigation and home, the formulas of the greats, and notes that become a contribution.
const C4 = window.COACH || {};
const FORMULAS = (C4.formulas||[]).filter(f=>f&&f.id&&(f.steps||[]).length); const FBY={}; FORMULAS.forEach(f=>FBY[f.id]=f);
const NT_LESSONS = (C4.notesLessons||[]); const NTL={}; NT_LESSONS.forEach(x=>NTL[x.id]=x);
const NSIMS = (C4.notesSims||[]); const NSBY={}; NSIMS.forEach(x=>NSBY[x.id]=x);
for(const k of ["formulas","fRead","ntRead","nSims"]) if(!S[k]||typeof S[k]!=="object") S[k]={};
if(!Array.isArray(S.pads)) S.pads=[];
if(!S.spot||typeof S.spot!=="object") S.spot={n:0,right:0};
if(!S.catchS||typeof S.catchS!=="object") S.catchS={n:0,hit:0};

/* ---------------- illustrations ---------------- */
const ART={
  meet:`<svg class="art" viewBox="0 0 120 90"><ellipse class="f s" cx="60" cy="58" rx="38" ry="15"/><circle class="f s" cx="15" cy="52" r="6"/><circle class="f s" cx="27" cy="38" r="6"/><circle class="f s" cx="47" cy="32" r="6"/><circle class="f s" cx="73" cy="32" r="6"/><circle class="f s" cx="93" cy="38" r="6"/><circle class="f s" cx="105" cy="52" r="6"/><circle class="f s" cx="38" cy="81" r="6"/><circle class="f s" cx="82" cy="81" r="6"/><path class="s" d="M51 55V46h18v9M47 57h26"/><path class="f s" d="M84 4h26a4 4 0 0 1 4 4v11a4 4 0 0 1-4 4H95l-6 6v-6h-5a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z"/><path class="s" d="M88 11h18M88 16h12"/></svg>`,
  notes:`<svg class="art" viewBox="0 0 120 90"><rect class="f s" x="20" y="8" width="62" height="76" rx="5"/><path class="s o" d="M40 8v76"/><path class="s" d="M46 24h28M46 36h24M46 48h28M46 60h18M46 72h24"/><text class="t" x="25" y="40" font-size="12">★</text><text class="t" x="25" y="64" font-size="12">→</text><path class="f s" d="M98 14l10 10-32 32-13 3 3-13z"/><path class="s" d="M92 20l10 10"/></svg>`,
  greats:`<svg class="art" viewBox="0 0 120 90"><path class="s" d="M36 16h48"/><path class="f s" d="M38 18h44l-5 9H43z"/><rect class="f s" x="45" y="27" width="30" height="45"/><path class="s" d="M52 30v39M60 30v39M68 30v39"/><path class="f s" d="M40 72h40l4 9H36z"/><path class="s" d="M24 80C12 64 12 40 26 24"/><path class="f s" d="M16 66c-6-2-8-7-7-11 5 1 8 5 7 11zM14 50c-5-3-6-8-4-12 5 2 7 6 4 12zM18 36c-4-4-4-9-1-12 4 3 5 8 1 12z"/><path class="s" d="M96 80c12-16 12-40-2-56"/><path class="f s" d="M104 66c6-2 8-7 7-11-5 1-8 5-7 11zM106 50c5-3 6-8 4-12-5 2-7 6-4 12zM102 36c4-4 4-9 1-12-4 3-5 8-1 12z"/></svg>`,
  speech:`<svg class="art" viewBox="0 0 120 90"><path class="f s" d="M38 44h44l-8 40H46z"/><path class="s" d="M32 44h56"/><path class="s" d="M60 44V26"/><rect class="f s" x="54" y="10" width="12" height="18" rx="6"/><path class="s" d="M76 12a14 14 0 0 1 0 16M83 7a21 21 0 0 1 0 26M44 12a14 14 0 0 0 0 16M37 7a21 21 0 0 0 0 26"/><path class="s" d="M50 60h20"/></svg>`,
  words:`<svg class="art" viewBox="0 0 120 90"><path class="f s" d="M60 26c-10-8-26-10-42-8v54c16-2 32 0 42 8 10-8 26-10 42-8V18c-16-2-32 0-42 8z"/><path class="s" d="M60 26v54"/><text class="t" x="27" y="54" font-size="20">Aa</text><path class="s" d="M70 38h22M70 48h18M70 58h22"/></svg>`,
  course:`<svg class="art" viewBox="0 0 120 90"><path class="f" d="M14 82h22V68h22V54h22V40h24v42z"/><path class="s" d="M14 82h22V68h22V54h22V40h24"/><path class="s" d="M96 40V12"/><path class="f s" d="M96 12h18l-5 6 5 6H96"/><circle class="k" cx="25" cy="62" r="4"/><path class="s" d="M25 66v8M21 70h8"/></svg>`,
  gym:`<svg class="art" viewBox="0 0 120 90"><rect class="f s" x="50" y="8" width="20" height="38" rx="10"/><path class="s" d="M40 34a20 20 0 0 0 40 0M60 54v14M48 70h24"/><path class="s" d="M18 40v10M26 32v26M34 38v14M86 38v14M94 30v30M102 40v10"/></svg>`,
  prog:`<svg class="art" viewBox="0 0 120 90"><path class="s" d="M16 80h92M16 80V12"/><rect class="f s" x="26" y="58" width="12" height="22" rx="2"/><rect class="f s" x="46" y="48" width="12" height="32" rx="2"/><rect class="f s" x="66" y="40" width="12" height="40" rx="2"/><rect class="f s" x="86" y="26" width="12" height="54" rx="2"/><path class="s" d="M24 50l20-10 20-6 22-16"/><circle class="k" cx="86" cy="18" r="4"/></svg>`,
  debrief:`<svg class="art" viewBox="0 0 120 90"><path class="f s" d="M12 12h56a5 5 0 0 1 5 5v26a5 5 0 0 1-5 5H34l-10 10V48H12a5 5 0 0 1-5-5V17a5 5 0 0 1 5-5z"/><path class="s" d="M18 24h40M18 34h28"/><path class="f s" d="M108 40H58a5 5 0 0 0-5 5v24a5 5 0 0 0 5 5h34l10 10V74h6a5 5 0 0 0 5-5V45a5 5 0 0 0-5-5z"/><path class="s" d="M70 57l7 7 14-14"/></svg>`
};
const IC={
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  meet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="14" rx="7" ry="3.2"/><circle cx="4" cy="9" r="1.8"/><circle cx="20" cy="9" r="1.8"/><circle cx="9" cy="6.5" r="1.8"/><circle cx="15" cy="6.5" r="1.8"/></svg>',
  greats:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 5h14M6 5l1 2h10l1-2M8 7v11M12 7v11M16 7v11M6 18h12l1 2H5z"/></svg>',
  speech:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M7 11h10l-2 10H9zM5 11h14M12 11V7"/><rect x="10" y="2" width="4" height="6" rx="2"/></svg>',
  words:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 6c-2-1.6-5-2-8-1.6v13C7 17 10 17.4 12 19c2-1.6 5-2 8-1.6v-13C17 4 14 4.4 12 6zM12 6v13"/></svg>',
  notes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="4" y="3" width="13" height="18" rx="2"/><path d="M8 3v18M11 8h3M11 12h3M11 16h2M21 6l-5 9-1 3 2.5-2L22 7z"/></svg>',
  breath:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 9h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 17h6"/></svg>',
  course:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 20h5v-4h5v-4h5V8h3M18 8V3l3 2-3 2"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
};
const ACC={today:"--c-meet",meetings:"--c-meet",notes:"--c-notes",greats:"--c-greats",speeches:"--c-speech",lexicon:"--c-words",course:"--c-course",gym:"--c-gym",progress:"--c-prog",settings:"--c-prog"};
const NAMES={today:"Home",meetings:"Meetings",notes:"Notes",greats:"The greats",speeches:"Speeches",lexicon:"Words",course:"Foundations",gym:"Gym",progress:"Progress",settings:"Settings"};
function hero(title, line, art, chips){ return `<div class="hero"><div class="art">${ART[art]||""}</div><div class="txt"><h1>${esc(title)}</h1>${line?`<p>${esc(line)}</p>`:""}</div>${chips&&chips.length?`<div class="chips">${chips.map(c=>`<span class="chip">${c}</span>`).join("")}</div>`:""}</div>`; }
function ring(frac, label, val){ const c=2*Math.PI*36, f=Math.max(0,Math.min(1,frac)); return `<div class="ring"><svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="36" fill="none" stroke="var(--bg2)" stroke-width="8"/><circle cx="42" cy="42" r="36" fill="none" stroke="var(--acc)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(c*f).toFixed(1)} ${c.toFixed(1)}"/></svg><div class="v">${val}<small>${esc(label)}</small></div></div>`; }
const initials = s => String(s||"").replace(/\(.*?\)/g,"").split(/[\s,]+/).filter(w=>/^[A-Z]/.test(w)&&!/^(The|And|Of|As|Jr)$/.test(w)).slice(0,2).map(w=>w[0]).join("")||"·";
function track(steps, withCue){ return `<div class="track">${steps.map((s,i)=>`<div class="node"><div class="dot">${i+1}</div><div><div class="lbl">${esc(s.slot)}</div><div class="job">${esc(s.job)}</div>${withCue&&s.cue?`<div class="cuel">${esc(s.cue)}</div>`:""}</div></div>`).join("")}</div>`; }
function minitrack(steps){ return `<div class="minitrack">${steps.map((s,i)=>`${i?"<i></i>":""}<span>${esc(s.slot||s)}</span>`).join("")}</div>`; }

/* ---------------- formulas: drills ---------------- */
const fDone = f => (f.prompts||[]).filter((p,i)=>S.formulas[f.id+"#"+i]).length;
function formulaDrill(f, p, i){
  return {id:f.id+"-"+(i==null?"x":i), gym:true, label:"The greats · "+f.who, type:"impromptu", formula:f, title:f.name, how:"", room:p.room, setup:p.setup||"", context:p.context||"", items:[p.prompt], prep:p.prep||45, seconds:p.seconds||120,
    targets:{wpm:[115,155],fillers:2,pauses:3},
    checks:f.steps.map(s=>`${s.slot}: ${s.job}`),
    onSave:()=>{ if(i!=null) S.formulas[f.id+"#"+i]=(S.formulas[f.id+"#"+i]||0)+1; S.formulas[f.id]=(S.formulas[f.id]||0)+1; }};
}
function formulaModelText(f){ return ((f.model||{}).slots||[]).join(" "); }

/* ---------------- notes: helpers ---------------- */
const SYMS=[["→","so"],["✓","agree"],["✗","object"],["?","ask"],["★","speak"],["≈","builds"],["Δ","change"],["∴","therefore"],["!","key"],["\"\"","quote"],["@","action"],["#","figure"],["⟲","returns"]];
const SYMKEY=[["→","leads to, so"],["✓","agree"],["✗","object"],["?","question to raise"],["★","my moment: speak here"],["≈","same as, builds on"],["Δ","change proposed"],["∴","therefore"],["!","important"],["\"…\"","exact words to credit"],["@","action and owner"],["#","number or figure"],["⟲","back to an earlier point"]];
function padHtml(np, ctx){
  np=np||{};
  return `<div class="pad" data-padctx="${esc(ctx)}"><div class="pq"><b>Q</b><input data-np="q" placeholder="The question the room actually has to decide" value="${esc(np.q||"")}"></div>
    <div class="cols"><div class="col"><div class="h">The room</div><textarea data-np="room" placeholder="JS ✓ readiness not quality&#10;HO ? &quot;one teacher, three years&quot;">${esc(np.room||"")}</textarea></div><div class="col"><div class="h">Me</div><textarea data-np="me" placeholder="★ matrix&#10;Δ 7 tasks → 4">${esc(np.me||"")}</textarea></div></div>
    <div class="pq" style="border-top:1px solid var(--line);border-bottom:0"><b>GAP</b><input data-np="gap" placeholder="What nobody has said" value="${esc(np.gap||"")}"></div>
    <div class="symbar">${SYMS.map(([s,l])=>`<button data-sym="${esc(s==="\"\""?"\"\"":s)}">${esc(s)}<small>${esc(l)}</small></button>`).join("")}</div></div>`;
}
const padText = np => np?[np.q?"Q: "+np.q:"", (np.room||"").split("\n").filter(Boolean).map(l=>"ROOM: "+l).join("\n"), (np.me||"").split("\n").filter(Boolean).map(l=>"ME: "+l).join("\n"), np.gap?"GAP: "+np.gap:""].filter(Boolean).join("\n"):"";
function padView(np){ np=np||{}; return `<div class="padmini"><div class="q">Q · ${esc(np.q||"")}</div><div class="c"><b>THE ROOM</b>${esc(np.room||"").replace(/\n/g,"<br>")||"<span class='note'>nothing</span>"}</div><div class="c"><b>ME</b>${esc(np.me||"").replace(/\n/g,"<br>")||"<span class='note'>nothing</span>"}</div><div class="g">GAP · ${esc(np.gap||"")}</div></div>`; }
function noteSimDrill(sim){
  return {id:sim.id, gym:true, label:"Notes", type:"impromptu", noteSim:sim, title:sim.item||"The meeting", how:"", items:[sim.task||"The chair turns to you."], prep:20, seconds:sim.seconds||120,
    targets:{wpm:[115,155],fillers:2,pauses:3},
    checks:[...(sim.keyPoints||[]).map(k=>`My notes caught ${k.who}: "${k.phrase}"`),"I named the question the room actually has to decide.","I credited at least two speakers by name, in their words.","I filled the gap with a numbered, practical proposal.","I closed with wording for the minutes, or an action with an owner and a date."],
    onSave:R=>{ S.nSims[sim.id]={n:((S.nSims[sim.id]||{}).n||0)+1, np:Object.assign({},R.np||{}), t:Date.now()}; }};
}
// meeting player (speech synthesis)
let MT=null;
function voicesFor(){ if(!canSpeak) return {f:[],m:[]}; const v=speechSynthesis.getVoices().filter(x=>/^en/i.test(x.lang)); const fem=/female|karen|catherine|samantha|serena|victoria|zira|hazel|susan|libby|natasha|sonia|kate|moira|tessa|fiona|allison|ava|joanna|kendra|salli|amy|emma|olivia/i, mal=/male|daniel|george|james|lee|david|mark|oliver|ryan|william|arthur|fred|alex|tom|rishi|guy|brian|russell|matthew/i; const pref=x=>/en-AU/i.test(x.lang)?0:/en-GB/i.test(x.lang)?1:2; const s=a=>a.sort((x,y)=>pref(x)-pref(y)); return {f:s(v.filter(x=>fem.test(x.name)&&!/\bmale\b/i.test(x.name.replace(/female/i,"")))), m:s(v.filter(x=>mal.test(x.name)&&!/female/i.test(x.name))), all:v}; }
function speakerVoice(sp, i){ const V=voicesFor(); const list=(sp.voice==="m"?V.m:V.f); const base=list.length?list[i%list.length]:(V.all&&V.all.length?V.all[i%V.all.length]:null); const pitch=[1,.9,1.1,.85,1.15,.95][i%6]*(sp.voice==="m"?.92:1.05); return {voice:base,pitch}; }
function mtPaint(){ if(!MT) return; document.querySelectorAll("[data-spk]").forEach(el=>{ const i=+el.dataset.spk; el.classList.toggle("now",MT.playing&&i===MT.i); el.classList.toggle("past",i<MT.i); }); const b=document.getElementById("mtbtn"); if(b) b.innerHTML=MT.playing?`${I.stop} Pause`:MT.i>=MT.n?`${I.play} Play again`:MT.i>0?`${I.play} Resume`:`${I.play} Play the meeting`; const st=document.getElementById("mtstat"); if(st) st.textContent=MT.i>=MT.n?"The meeting has finished. Tidy your notes, then start your prep.":MT.playing?`Speaker ${MT.i+1} of ${MT.n}`:""; }
function mtPlay(){
  if(!R||!R.drill.noteSim) return; const sim=R.drill.noteSim; const sps=sim.speakers||[];
  if(!MT||MT.sim!==sim.id) MT={sim:sim.id,i:0,n:sps.length,playing:false,gen:0};
  if(MT.i>=MT.n) MT.i=0;
  if(!canSpeak){ R.showText=true; render(); return; }
  speechSynthesis.cancel(); MT.playing=true; const gen=++MT.gen;
  const sayOne=()=>{ if(!MT||gen!==MT.gen||!MT.playing) return; if(MT.i>=MT.n){ MT.playing=false; mtPaint(); return; } mtPaint();
    const sp=sps[MT.i]; const {voice,pitch}=speakerVoice(sp,MT.i); const parts=String(sp.said||"").match(/[^.!?]+[.!?]+["')]*|[^.!?]+$/g)||[sp.said];
    parts.forEach((t,k)=>{ const u=new SpeechSynthesisUtterance(t.trim()); if(voice) u.voice=voice; u.lang=voice?voice.lang:"en-AU"; u.pitch=pitch; u.rate=S.mtRate||1; if(k===parts.length-1) u.onend=()=>{ if(!MT||gen!==MT.gen) return; MT.i++; setTimeout(sayOne,700); }; speechSynthesis.speak(u); });
  };
  sayOne();
}
function mtPause(){ if(!MT) return; MT.playing=false; MT.gen++; if(canSpeak) speechSynthesis.cancel(); mtPaint(); }
const AVC=["#7a2232","#2f6470","#a6772e","#5d3f70","#3f6141","#2f4c70"];
function playerHtml(sim){
  const show=R.showText||!canSpeak; if(!MT||MT.sim!==sim.id) MT={sim:sim.id,i:0,n:(sim.speakers||[]).length,playing:false,gen:0};
  return `<div class="card flat" style="padding:12px 14px"><p class="sub" style="margin:0">${esc(sim.context||"")}</p></div>
    <div class="row" style="margin:6px 0"><button class="btn primary" id="mtbtn" data-mt-play>${I.play} Play the meeting</button><button class="btn small ghost" data-mt-next>Next speaker</button><button class="btn small ghost" data-mt-text>${show?"Hide the words":"Show the words"}</button><button class="btn small ghost" data-mt-rate>${(S.mtRate||1)===1?"Normal pace":(S.mtRate||1)>1?"Brisk pace":"Slower"}</button></div>
    <p class="note" id="mtstat" style="margin:2px 0 6px">${canSpeak?"Listen as you would in the room. Notes in keywords and symbols, not sentences.":"No synthetic voices on this browser: read each speaker once, then take your notes."}</p>
    ${(sim.speakers||[]).map((sp,i)=>`<div class="speaker" data-spk="${i}"><div class="av" style="background:${AVC[i%AVC.length]}">${esc(initials(sp.who))}</div><div style="flex:1"><div class="who">${esc(sp.who)}</div>${show?`<div class="said">${esc(sp.said)}</div>`:""}</div></div>`).join("")}`;
}

/* ---------------- runner hooks ---------------- */
const _runTop3=runTop, _runPrep3=runPrep, _runLive3=runLive, _runReview3=runReview;
runTop=function(d,phase){
  if(d.formula){ let h=_runTop3(d,phase); if(phase!=="review") h+=`<div class="card flat" style="padding:12px 14px"><div class="slotlabel">${esc(d.formula.name)} · ${esc(d.formula.who)}</div>${minitrack(d.formula.steps)}</div>`; return h; }
  if(d.noteSim){ const sim=d.noteSim; let h=`<div class="eyebrow" style="margin-top:8px;color:var(--c-notes)">${esc(sim.room||"")}</div>`;
    if(phase==="ready"){ h+=playerHtml(sim); R.np=R.np||{}; h+=`<div class="eyebrow" style="margin-top:14px;color:var(--c-notes)">Your page</div>${padHtml(R.np,"run")}`; }
    return h; }
  if(d.padNotes&&phase!=="review") return `<div class="eyebrow" style="margin-top:8px">${esc(d.padNotes.title||"Your notes")}</div>`;
  return _runTop3(d,phase);
};
runPrep=function(d){
  if(d.formula){ R.kw=R.kw||{}; return `<div class="card"><div class="eyebrow">A keyword or two per step</div>${d.formula.steps.map((s,i)=>`<div class="kwrow"><div class="row spread"><span style="font-weight:600"><b style="color:var(--acc)">${i+1}</b> ${esc(s.slot)}</span><span class="note">${esc(s.job.length>60?s.job.slice(0,57)+"…":s.job)}</span></div><input class="search" data-kw="s${i}" value="${esc(R.kw["s"+i]||"")}" placeholder="${esc((s.cue||"").slice(0,70))}"></div>`).join("")}</div>`; }
  if(d.noteSim){ mtPause(); return `<p class="note">Circle what you'll use: put a slot number beside each line (1 thanks, 4 common ground, 6 proposal…) and star where you'll come in.</p>${padHtml(R.np||{},"run")}`; }
  if(d.padNotes) return padView(d.padNotes);
  return _runPrep3(d);
};
runLive=function(d){
  if(d.formula){ const kw=R.kw||{}; return `<div class="card" style="padding:10px 16px">${d.formula.steps.map((s,i)=>`<div class="livekw"><b>${i+1}</b><span class="l">${esc(s.slot)}</span><span class="k">${esc(kw["s"+i]||"")}</span></div>`).join("")}</div>`; }
  if(d.noteSim) return padView(R.np);
  if(d.padNotes) return padView(d.padNotes);
  return _runLive3(d);
};
runReview=function(d){
  if(d.formula){ const f=d.formula, m=(f.model||{}).slots||[], kw=R.kw||{};
    return `<div class="card"><div class="eyebrow">How the formula sounds in another room</div><p class="note" style="margin:0 0 6px">${esc((f.model||{}).room||"")}${(f.model||{}).prompt?": "+esc(f.model.prompt):""}</p>${f.steps.map((s,i)=>m[i]?`<div style="margin:10px 0"><div class="row spread"><span class="slotlabel">${i+1} · ${esc(s.slot)}</span>${kw["s"+i]?`<span class="note">you: ${esc(kw["s"+i])}</span>`:""}</div><div class="model" style="margin:4px 0;font-size:1.1rem">${mark(m[i])}</div></div>`:"").join("")}<div class="row">${hearBtn(formulaModelText(f))}</div></div>`; }
  if(d.noteSim){ const sim=d.noteSim;
    return `<div class="card"><div class="eyebrow" style="color:var(--c-notes)">The question and the gap</div><p style="margin:0 0 6px"><b>Q.</b> ${esc(sim.question||"")}</p><p style="margin:0"><b>Gap.</b> ${esc(sim.gap||"")}</p></div>
      <div class="card"><div class="eyebrow" style="color:var(--c-notes)">What was worth catching</div>${(sim.keyPoints||[]).map(k=>`<div style="padding:8px 0;border-bottom:1px solid var(--line)"><div style="font-weight:600">${esc(k.who)}</div><div class="note">${esc(k.point)}</div><div style="font-family:var(--serif);font-size:1.12rem;font-style:italic">"${esc(k.phrase)}"</div></div>`).join("")}</div>
      <div class="eyebrow" style="color:var(--c-notes);margin-top:14px">Your page</div>${padView(R.np)}<div class="eyebrow" style="color:var(--c-notes);margin-top:12px">A model page</div><div class="notesview">${esc(sim.modelNotes||"")}</div>
      <div class="card"><div class="eyebrow">A contribution built from those notes</div><div class="model">${mark(sim.model||"")}</div><div class="row">${hearBtn(sim.model||"")}</div></div>`; }
  return _runReview3(d);
};

/* ---------------- daily session ---------------- */
const _plan3=sessionPlan2;
sessionPlan2=function(){
  const steps=_plan3(); const day=dayNum();
  if(NSIMS.length&&day%3===1){ const i=steps.findIndex(s=>s.key==="meet"||s.key==="long"); const r=seeded(day*31); const fresh=NSIMS.filter(x=>!S.nSims[x.id]); const pool=fresh.length?fresh:NSIMS; const sim=pool[Math.floor(r()*pool.length)]; const st={key:"notes",title:"Notes: "+(sim.item||"a meeting"),sub:sim.room,nsim:sim.id}; if(i>=0) steps[i]=st; else steps.push(st); }
  if(FORMULAS.length){ const r=seeded(day*37); const order=FORMULAS.slice().sort((a,b)=>fDone(a)-fDone(b)); const lo=fDone(order[0]); const pool=order.filter(f=>fDone(f)===lo); const f=pool[Math.floor(r()*pool.length)]; const pi=(f.prompts||[]).findIndex((p,k)=>!S.formulas[f.id+"#"+k]); const k=pi<0?Math.floor(r()*(f.prompts||[1]).length):pi;
    const st={key:"greats",title:"The greats: "+f.name,sub:f.who+" · "+((f.prompts||[])[k]||{}).room,fid:f.id,fp:k}; const si=steps.findIndex(s=>s.key==="speech"); if(si>=0&&day%2===1) steps[si]=st; else steps.push(st); }
  return steps;
};
const _runStep3=runStep2;
runStep2=function(key){
  const s=sessionPlan2().find(x=>x.key===key); if(!s) return;
  if(key==="notes"){ startRunner(noteSimDrill(NSBY[s.nsim]),{tab:"today",session:"notes"}); return; }
  if(key==="greats"){ const f=FBY[s.fid]; startRunner(formulaDrill(f,f.prompts[s.fp],s.fp),{tab:"today",session:"greats"}); return; }
  return _runStep3(key);
};
const STEPIC={warm:IC.breath,course:IC.course,lex:IC.words,meet:IC.meet,long:IC.meet,notes:IC.notes,greats:IC.greats,speech:IC.speech};
const STEPC={warm:"--c-gym",course:"--c-course",lex:"--c-words",meet:"--c-meet",long:"--c-meet",notes:"--c-notes",greats:"--c-greats",speech:"--c-speech"};

/* ---------------- home ---------------- */
const MODS=()=>[
  {k:"meetings",t:"Meetings",art:"meet",c:"--c-meet",n:`The long contribution, ${MOVES.length} moves, ${LONG_SCEN.length+Object.keys(SCEN).length} rooms`,p:(LONG_SCEN.filter(x=>S.long[x.id]).length+Object.keys(S.moves).length)/Math.max(1,LONG_SCEN.length+Object.keys(SCEN).length)},
  {k:"notes",t:"Notes",art:"notes",c:"--c-notes",n:`Notes that become a contribution · ${NSIMS.length} meetings to sit in`,p:NSIMS.filter(x=>S.nSims[x.id]).length/Math.max(1,NSIMS.length)},
  {k:"greats",t:"The greats",art:"greats",c:"--c-greats",n:`${FORMULAS.length} formulas of great speakers and chairs`,p:FORMULAS.filter(f=>fDone(f)).length/Math.max(1,FORMULAS.length)},
  {k:"speeches",t:"Speeches",art:"speech",c:"--c-speech",n:`Craft, ${TYPES.length} occasions, your drafts`,p:Object.keys(S.craft).length/Math.max(1,CRAFT.length)},
  {k:"lexicon",t:"Words",art:"words",c:"--c-words",n:`${LEX.length} terms in ${LEXF.length} fields`,p:Object.keys(S.lex).length/Math.max(1,LEX.length)},
  {k:"course",t:"Foundations",art:"course",c:"--c-course",n:`Voice, thought, words, body, tone · ${ORDER.length} units`,p:ORDER.filter(unitDone).length/Math.max(1,ORDER.length)},
  {k:"debrief",t:"Debrief",art:"debrief",c:"--c-meet",n:`After a real meeting · ${S.debriefs.length} written`,p:null},
  {k:"gym",t:"Gym",art:"gym",c:"--c-gym",n:"Free practice on any material",p:null},
  {k:"progress",t:"Progress",art:"prog",c:"--c-prog",n:`${A.length} takes · ${S.days.length} days`,p:null}
];
vToday=function(){
  const plan=sessionPlan2(); const ss=S.sessions[dayNum()]||{}; const done=plan.filter(s=>ss[s.key]).length;
  const hour=new Date().getHours(); const greet=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const mins=Math.round(A.reduce((s,a)=>s+(a.metrics&&a.metrics.secs||0),0)/60);
  const next=plan.find(s=>!ss[s.key]);
  return `${hero(greet+".", new Date().toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"}), "speech", [`<b>${S.days.length}</b> days`,`<b>${mins}</b> min spoken`,`<b>${Object.keys(S.lex).length}</b> terms`])}
    <div class="card"><div class="session">${ring(done/Math.max(1,plan.length),"done",`${done}/${plan.length}`)}<div style="flex:1"><div class="eyebrow">Today's session</div><h2 style="font-size:1.45rem">${done===plan.length?"Done for today":next?esc(next.title):"Today"}</h2><p class="note" style="margin:4px 0 0">${done===plan.length?"Anything further is extra.":"About twenty minutes, out loud, standing if you can."}</p></div></div>
      ${next?`<button class="btn primary wide" style="margin-top:12px" data-step2="${next.key}">${I.mic} ${done?"Continue":"Start"}: ${esc(next.title.length>34?next.title.slice(0,32)+"…":next.title)}</button>`:""}
      <div class="plan" style="margin-top:8px">${plan.map(s=>`<div class="step ${ss[s.key]?"done":""}" data-step2="${s.key}" style="--sc:var(${STEPC[s.key]||"--acc"})"><div class="ico">${ss[s.key]?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12l5 5 9-10"/></svg>':STEPIC[s.key]||IC.arrow}</div><div style="flex:1;min-width:0"><div class="t" style="font-size:1.08rem">${esc(s.title)}</div><div class="m">${esc(s.sub||"")}</div></div></div>`).join("")}</div></div>
    <div class="sectitle"><h3>Everything</h3><span class="note">Tap to open</span></div>
    <div class="modgrid">${MODS().map(m=>`<div class="mod${m.k==="progress"?" wide":""}" data-mod="${m.k}" style="--mc:var(${m.c})">${ART[m.art]}<div style="flex:1"><div class="t">${esc(m.t)}</div><div class="n">${esc(m.n)}</div>${m.p!=null?`<div class="bar"><i style="width:${Math.round(m.p*100)}%"></i></div>`:""}</div></div>`).join("")}</div>
    <div class="sectitle"><h3>Quick starts</h3></div>
    <div class="row"><button class="btn" data-lg-random>${IC.meet} A committee room</button><button class="btn" data-nt-random>${IC.notes} Sit in a meeting</button><button class="btn" data-gf-random>${IC.greats} A great's formula</button><button class="btn" data-lg-sprint>${I.mic} Scaffold sprint</button></div>`;
};

/* ---------------- greats view ---------------- */
let gSec="speech", gItem=null, spotQ=null, pickSc=null;
function vGreats(){
  if(gItem&&FBY[gItem]) return vFormula(FBY[gItem]);
  const sp=FORMULAS.filter(f=>f.family==="speech"), mt=FORMULAS.filter(f=>f.family!=="speech");
  const secs=[["speech","Speeches"],["meeting","Meetings"],["spot","Spot it"],["pick","Pick for the room"]];
  const seg=`<div class="seg">${secs.map(([k,l])=>`<button class="${gSec===k?"on":""}" data-g-sec="${k}">${l}</button>`).join("")}</div>`;
  const practised=FORMULAS.filter(f=>fDone(f)).length;
  let body="";
  const cards=list=>list.map(f=>`<div class="fcard ${fDone(f)?"done":""}" data-g-item="${f.id}"><div class="ini">${esc(initials(f.who))}</div><div style="flex:1;min-width:0"><div class="t">${esc(f.name)}</div><div class="w">${esc(f.who)} · ${esc(f.source||"")}</div>${minitrack(f.steps)}</div></div>`).join("");
  if(gSec==="speech") body=`<p class="sub">How the great speakers built a speech. Each formula is taught, shown working in one of your rooms, then practised on four of your own situations with a keyword plan per step.</p>${cards(sp)}
    <div class="fcard" data-go="speeches" data-g-analysed="1"><div class="ini">${IC.speech}</div><div><div class="t">${GREAT.length} great speeches, taken apart</div><div class="w">The architecture of each, and what to borrow</div></div></div>`;
  if(gSec==="meeting") body=`<p class="sub">The formulas of great chairs, advocates, negotiators and debaters, for the live meeting.</p>
    <div class="fcard" data-mod="meetings"><div class="ini">${IC.meet}</div><div style="flex:1"><div class="t">The committee scaffold</div><div class="w">Jason's seven slots, with your substance inside</div>${minitrack(SLOTS.map(s=>s[1]))}</div></div>${cards(mt)}`;
  if(gSec==="spot") body=vSpot();
  if(gSec==="pick") body=vPick();
  return `${hero("The greats","The formulas behind the speakers and chairs a room remembers.","greats",[`<b>${FORMULAS.length}</b> formulas`,`<b>${practised}</b> practised`,`<b>${S.spot.right}/${S.spot.n}</b> spotted`])}${seg}${body}`;
}
function vFormula(f){
  const m=f.model||{}; const ps=f.prompts||[];
  return `<button class="back" data-g-back>${I.back} The greats</button>
    <div class="eyebrow">${f.family==="speech"?"Speech formula":"Meeting formula"}</div><h1 style="font-size:2.1rem">${esc(f.name)}</h1><p class="note" style="margin:4px 0 8px">${esc(f.who)} · ${esc(f.source||"")}</p>
    <div class="card ox"><p style="font-family:var(--serif);font-size:1.25rem;line-height:1.35;margin:0 0 4px">${esc(f.gist||"")}</p>${track(f.steps,true)}</div>
    <div class="lesson" style="margin-top:14px">${paras(f.teach)}</div>
    <div class="two" style="margin:12px 0"><div class="callout"><div class="eyebrow">Reach for it</div>${esc(f.when||"")}</div><div class="callout"><div class="eyebrow" style="color:var(--bad)">How it fails</div>${esc(f.risk||"")}</div></div>
    ${(m.slots||[]).length?`<div class="sectitle"><h3>Working, in one of your rooms</h3></div><div class="card"><div class="note" style="margin-bottom:6px"><b>${esc(m.room||"")}</b>${m.prompt?". "+esc(m.prompt):""}</div>${f.steps.map((s,i)=>m.slots[i]?`<div style="margin:10px 0"><span class="slotlabel">${i+1} · ${esc(s.slot)}</span><div class="model" style="margin:4px 0;font-size:1.1rem">${mark(m.slots[i])}</div></div>`:"").join("")}<div class="row">${hearBtn(formulaModelText(f))}<button class="btn small" data-g-readmodel="${f.id}">${I.mic} Read it aloud</button></div></div>`:""}
    <div class="sectitle"><h3>Practise it</h3><span class="note">${fDone(f)} of ${ps.length}</span></div>
    <p class="note">Forty-five seconds to jot a keyword per step. Then speak with your plan on screen. Then compare with the model.</p>
    ${ps.map((p,i)=>`<div class="step ${S.formulas[f.id+"#"+i]?"done":""}" data-g-run="${f.id}" data-g-p="${i}"><div class="num">${S.formulas[f.id+"#"+i]?"✓":i+1}</div><div style="flex:1"><div class="t" style="font-size:1.05rem">${esc(p.room||"")}</div><div class="m">${esc((p.prompt||"").slice(0,130))}${(p.prompt||"").length>130?"…":""} · ${Math.round((p.seconds||120)/60*10)/10} min</div></div></div>`).join("")}
    <div class="row" style="margin:16px 0 20px"><button class="btn ${S.fRead[f.id]?"on":"brass"}" data-g-done="${f.id}">${S.fRead[f.id]?"Lesson done":"Mark lesson done"}</button></div>`;
}
function newSpot(){ if(FORMULAS.length<4) return null; const f=rnd(FORMULAS.filter(x=>(x.model||{}).slots)); const others=FORMULAS.filter(x=>x.id!==f.id).sort(()=>Math.random()-.5).slice(0,3); return {fid:f.id, opts:[f,...others].sort(()=>Math.random()-.5).map(x=>x.id), ans:null}; }
function vSpot(){
  if(!spotQ) spotQ=newSpot(); if(!spotQ) return `<div class="empty"><strong>Not enough formulas yet</strong></div>`;
  const f=FBY[spotQ.fid]; const m=(f.model||{}).slots||[];
  return `<p class="sub">Read or hear a contribution. Which formula is it built on? Recognising the architecture in other people's speech is how you start hearing it in your own.</p>
    <div class="card"><div class="note" style="margin-bottom:6px">${esc((f.model||{}).room||"")}</div><div class="model" style="margin:0">${mark(m.join(" "))}</div><div class="row" style="margin-top:8px">${hearBtn(m.join(" "))}</div></div>
    <div class="quiz">${spotQ.opts.map(id=>{ const o=FBY[id]; const cls=spotQ.ans?(id===spotQ.fid?"right":id===spotQ.ans?"wrong":""):""; return `<button class="opt ${cls}" data-spot="${id}">${esc(o.name)} <span class="note" style="font-weight:500">· ${esc(o.who)}</span></button>`; }).join("")}</div>
    ${spotQ.ans?`<div class="card ox"><div class="eyebrow">${spotQ.ans===spotQ.fid?"Yes":"It was this one"}</div><h3>${esc(f.name)}</h3>${track(f.steps,false)}<div class="row"><button class="btn primary" data-spot-next>Next</button><button class="btn" data-g-item="${f.id}">Open the formula</button></div></div>`:""}`;
}
function vPick(){
  if(!LONG_SCEN.length) return `<div class="empty"><strong>No rooms yet</strong></div>`;
  if(!pickSc||!LONGS[pickSc]) pickSc=rnd(LONG_SCEN).id; const sc=LONGS[pickSc];
  return `<p class="sub">One room, many architectures. Read the situation, choose the formula you'd use, and speak it. Try the same room with two different formulas and hear which carries your proposal better.</p>
    <div class="card"><div class="eyebrow">${esc(sc.room)}</div><p style="margin:0 0 8px">${esc(sc.briefing)}</p>${(sc.before||[]).map(b=>`<div class="note" style="margin:6px 0"><b>${esc(b.who)}:</b> ${esc(b.said.length>220?b.said.slice(0,217)+"…":b.said)}</div>`).join("")}<p style="margin:8px 0 0"><b>${esc(sc.task||"")}</b></p><div class="row" style="margin-top:8px"><button class="btn small ghost" data-pick-new>${I.shuffle} Another room</button></div></div>
    <div class="fcard" data-pick-jason><div class="ini">${IC.meet}</div><div style="flex:1"><div class="t">The committee scaffold</div><div class="w">Seven slots</div>${minitrack(SLOTS.map(s=>s[1]))}</div></div>
    ${FORMULAS.map(f=>`<div class="fcard" data-pick-f="${f.id}"><div class="ini">${esc(initials(f.who))}</div><div style="flex:1;min-width:0"><div class="t">${esc(f.name)}</div><div class="w">${esc(f.who)}</div>${minitrack(f.steps)}</div></div>`).join("")}`;
}

/* ---------------- notes view ---------------- */
let ntItem=null, catchQ=null;
function vNotes(seg){
  if(ntItem&&NTL[ntItem]) return vNtLesson(NTL[ntItem]);
  if(ntItem==="catch") return vCatch();
  if(ntItem&&ntItem.startsWith("pad:")){ const p=S.pads.find(x=>x.id===ntItem.slice(4)); if(p) return vPad(p); ntItem=null; }
  const done=NSIMS.filter(x=>S.nSims[x.id]).length;
  return `${hero("Notes","Notes for speaking, not for the minutes. The page that turns into your contribution.","notes",[`<b>${NT_LESSONS.length}</b> lessons`,`<b>${done}/${NSIMS.length}</b> meetings`,`<b>${S.catchS.hit}/${S.catchS.n}</b> phrases caught`])}${seg}
    <div class="card"><div class="eyebrow" style="color:var(--c-notes)">The page</div>
      <div class="padmini"><div class="q">Q · what the room actually has to decide</div><div class="c"><b>THE ROOM</b>HO ✓ "readiness, not quality"<br>JS ≈ other states, 20 yrs<br>KP ✗ one teacher, three years<br>Chair → resubmit?</div><div class="c"><b>ME</b>★ after KP<br>Δ 7 tasks → 4<br>④ pilot: 4 to 6 schools<br>@ working group, next mtg</div><div class="g">GAP · nobody has named who redrafts, or when</div></div>
      <div class="symkey">${SYMKEY.map(([s,l])=>`<div><b>${esc(s)}</b>${esc(l)}</div>`).join("")}</div></div>
    <div class="row" style="margin:8px 0 4px"><button class="btn primary" data-nt-random>${I.play} Sit in a meeting</button><button class="btn" data-nt-catch>Catch the phrase</button><button class="btn" data-nt-newpad>${IC.notes} A real meeting pad</button></div>
    <div class="sectitle"><h3>Learn it</h3><span class="note">${NT_LESSONS.filter(x=>S.ntRead[x.id]).length} of ${NT_LESSONS.length}</span></div>
    <div class="list">${NT_LESSONS.map((x,i)=>`<div class="item" data-nt-item="${x.id}"><div class="row" style="gap:12px;flex-wrap:nowrap"><div class="tick ${S.ntRead[x.id]?"done":""}">${S.ntRead[x.id]?"✓":i+1}</div><div class="t">${esc(x.title)}</div></div><span class="arrow">›</span></div>`).join("")}</div>
    <div class="sectitle"><h3>Sit in a meeting</h3><span class="note">${done} of ${NSIMS.length}</span></div>
    <p class="note">The speakers are read aloud. You take notes on the page. Then twenty seconds to number your slots, and you speak from your notes. Then compare your page with a model page.</p>
    <div class="list">${NSIMS.map(x=>`<div class="item" data-nt-run="${x.id}"><div class="row" style="gap:12px;flex-wrap:nowrap"><div class="tick ${S.nSims[x.id]?"done":""}">${S.nSims[x.id]?"✓":(x.speakers||[]).length}</div><div><div class="t" style="font-size:1.08rem">${esc(x.item||"")}</div><div class="m">${esc(x.room||"")}</div></div></div><span class="arrow">›</span></div>`).join("")}</div>
    ${S.pads.length?`<div class="sectitle"><h3>Your meeting pads</h3></div><div class="list">${S.pads.slice().sort((a,b)=>b.t-a.t).map(p=>`<div class="item" data-nt-pad="${p.id}"><div><div class="t" style="font-size:1.08rem">${esc(p.title||"Untitled meeting")}</div><div class="m">${new Date(p.t).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}</div></div><span class="arrow">›</span></div>`).join("")}</div>`:""}`;
}
function vNtLesson(x){
  const ex=x.exercise||{};
  return `<button class="back" data-nt-back>${I.back} Notes</button><div class="eyebrow" style="color:var(--c-notes)">Notes · lesson ${NT_LESSONS.indexOf(x)+1}</div><h1 style="font-size:2rem">${esc(x.title)}</h1>
    <div class="lesson" style="margin-top:12px">${paras(x.teach)}</div>
    ${x.model?`<div class="eyebrow" style="margin-top:14px;color:var(--c-notes)">Example</div><div class="notesview">${esc(x.model)}</div>`:""}
    <hr class="sep"><div class="eyebrow" style="color:var(--c-notes)">Exercise</div><p>${esc(ex.task||"")}</p>
    ${ex.kind==="speak"?`<button class="btn primary" data-nt-ex="${x.id}">${I.mic} Do it (${ex.seconds||60}s)</button>`:`<textarea class="search" data-note="${x.id}" placeholder="Write it here." style="min-height:180px">${esc((S.notes[x.id]||{}).text||"")}</textarea>`}
    ${(x.checks||[]).length?`<div class="eyebrow" style="margin-top:14px;color:var(--c-notes)">Check</div><ul class="rules">${x.checks.map(c=>`<li>${esc(c)}</li>`).join("")}</ul>`:""}
    <div class="row" style="margin:16px 0 20px"><button class="btn ${S.ntRead[x.id]?"on":"brass"}" data-nt-done="${x.id}">${S.ntRead[x.id]?"Lesson done":"Mark lesson done"}</button></div>`;
}
function newCatch(){ const sims=NSIMS.filter(s=>(s.keyPoints||[]).length&&(s.speakers||[]).length); if(!sims.length) return null; const sim=rnd(sims); const k=Math.floor(Math.random()*sim.speakers.length); return {sim:sim.id,k,phase:"listen",guess:"",point:""}; }
function catchKP(q){ const sim=NSBY[q.sim]; const sp=sim.speakers[q.k]; const surname=String(sp.who).split(",")[0].trim().split(/\s+/).pop().toLowerCase(); return (sim.keyPoints||[]).find(k=>String(k.who).toLowerCase().includes(surname)) || (sim.keyPoints||[]).find(k=>String(sp.said).includes(k.phrase)) || (sim.keyPoints||[])[q.k]; }
function overlap(a,b){ const w=s=>String(s).toLowerCase().replace(/[^a-z0-9\s']/g," ").split(/\s+/).filter(x=>x.length>2); const A1=w(a), B1=new Set(w(b)); if(!B1.size) return 0; return A1.filter(x=>B1.has(x)).length/B1.size; }
function vCatch(){
  if(!catchQ) catchQ=newCatch(); if(!catchQ) return `<button class="back" data-nt-back>${I.back} Notes</button><div class="empty"><strong>No meetings loaded</strong></div>`;
  const sim=NSBY[catchQ.sim], sp=sim.speakers[catchQ.k], kp=catchKP(catchQ);
  const show=catchQ.phase!=="listen"||!canSpeak||catchQ.read;
  return `<button class="back" data-nt-back>${I.back} Notes</button><h1 style="font-size:2rem">Catch the phrase</h1><p class="sub">One speaker, once. Catch the exact short phrase you'd credit them with, and their point in a few words.</p>
    <div class="speaker"><div class="av" style="background:${AVC[catchQ.k%AVC.length]}">${esc(initials(sp.who))}</div><div style="flex:1"><div class="who">${esc(sp.who)}</div><div class="note">${esc(sim.room)}</div>${catchQ.phase==="reveal"?`<div class="said">${esc(sp.said)}</div>`:show&&catchQ.read?`<div class="said">${esc(sp.said)}</div>`:""}</div></div>
    ${catchQ.phase==="listen"?`<div class="row"><button class="btn primary" data-catch-play>${I.play} Hear them</button>${canSpeak?`<button class="btn small ghost" data-catch-read>Read instead</button>`:""}</div>`:""}
    <input class="search" id="cg" placeholder='The exact phrase, e.g. "readiness, not quality"' value="${esc(catchQ.guess)}">
    <input class="search" id="cp" placeholder="Their point, in five words" value="${esc(catchQ.point)}">
    ${catchQ.phase!=="reveal"?`<button class="btn primary wide" data-catch-check>Check</button>`:`<div class="card ox"><div class="eyebrow" style="color:var(--c-notes)">${catchQ.hit?"Caught":"Worth catching"}</div><div style="font-family:var(--serif);font-size:1.3rem;font-style:italic">"${esc(kp?kp.phrase:"")}"</div><p class="note" style="margin:4px 0 0">${esc(kp?kp.point:"")}</p></div><div class="row"><button class="btn primary" data-catch-next>Next speaker</button></div>`}`;
}
function vPad(p){
  return `<button class="back" data-nt-back>${I.back} Notes</button><input class="search" data-padtitle="${p.id}" placeholder="Meeting, e.g. SCSA CAC, 4 November" value="${esc(p.title||"")}" style="font-family:var(--serif);font-size:1.35rem;font-weight:600">
    <p class="note">Use this in the meeting itself. It saves as you type and stays on this phone.</p>
    ${padHtml(p,"pad:"+p.id)}
    <div class="row" style="margin:10px 0"><button class="btn primary" data-pad-speak="${p.id}">${I.mic} Speak from these notes</button><button class="btn" data-pad-debrief="${p.id}">Start a debrief from this</button><button class="btn ghost" data-pad-export="${p.id}">${I.down} Export</button><button class="btn ghost" data-pad-del="${p.id}">Delete</button></div>`;
}

/* ---------------- meetings: wrap app3 with the notes section and a hero ---------------- */
const _vMeetings3=vMeetings;
vMeetings=function(){
  const secs=[["long","Contribution"],["notes","Notes"],["moves","Moves"],["debrief","Debrief"]];
  const seg=`<div class="seg">${secs.map(([k,l])=>`<button class="${mtSec===k?"on":""}" data-mt-sec="${k}">${l}</button>`).join("")}</div>`;
  if(mtSec==="notes") return vNotes(seg);
  let h=_vMeetings3();
  h=h.replace(/<div class="seg">[\s\S]*?<\/div>/, seg);
  const line=mtSec==="moves"?"":mtSec==="debrief"?"":"";
  h=h.replace("<h1>Meetings</h1>", hero("Meetings", mtSec==="debrief"?"After a real meeting.":mtSec==="moves"?"The moves that shape a committee.":"Your practical solutions, delivered so the room hears them.", mtSec==="debrief"?"debrief":"meet", mtSec==="long"?[`<b>${LONG_SCEN.filter(x=>S.long[x.id]).length}/${LONG_SCEN.length}</b> rooms`,`<b>${Object.keys(S.longRead).length}/${LONG_LESSONS.length}</b> lessons`,`<b>${S.myPhrases.length}</b> of your phrases`]:null));
  return h;
};
const _vSpeeches3=vSpeeches; vSpeeches=function(){ return _vSpeeches3().replace("<h1>Speeches</h1>", hero("Speeches","Craft, occasions, the great speeches and your own drafts.","speech",[`<b>${S.drafts.length}</b> drafts`,`<b>${Object.keys(S.craft).length}/${CRAFT.length}</b> craft lessons`])); };
const _vLex3=vLexicon; vLexicon=function(){ return _vLex3().replace(/<h1>Lexicon<\/h1><p class="sub">[\s\S]*?<\/p>/, hero("Words",`${LEX.length} terms in ${LEXF.length} fields, each with the sentence you'd say.`,"words")); };
const _vCourse3=vCourse; vCourse=function(){ return _vCourse3().replace(/<h1>Course<\/h1><p class="sub">[\s\S]*?<\/p>/, hero("Foundations","Voice, train of thought, words, body and tone: thirty units, taught then drilled.","course",[`<b>${ORDER.filter(unitDone).length}/${ORDER.length}</b> units`])); };
const _vGym3=vGym; vGym=function(){ return _vGym3().replace(/<h1>Gym<\/h1>/, hero("Gym","Free practice outside the course.","gym")).replace(/<p class="sub">Free practice outside the course\. /,'<p class="sub">'); };
const _vProg3=vProgress; vProgress=function(){ return _vProg3().replace("<h1>Progress</h1>", hero("Progress","What you've spoken, and how it sounded.","prog")); };

/* ---------------- render ---------------- */
function curSection(){ if(tab==="run"&&R){ if(R.drill.noteSim) return "notes"; if(R.drill.formula) return "greats"; return (R.from&&R.from.tab)||"today"; } if(tab==="meetings"&&mtSec==="notes") return "notes"; return tab; }
renderInner=function(){
  const sec=curSection(); const acc=ACC[sec]||"--c-meet"; document.documentElement.style.setProperty("--acc",`var(${acc})`);
  const hdr=document.querySelector("header.top");
  if(hdr&&!hdr.dataset.v4){ hdr.dataset.v4="1"; hdr.innerHTML=`<div class="brand"><span class="mark">C</span><span>The Coach<div class="crumb" id="crumb"></div></span></div><div class="right"><span id="hdrDate" style="display:none"></span><button data-go="progress" aria-label="Progress">${I.progress}</button><button data-go="settings" aria-label="Settings">${IC.gear}</button></div>`; }
  const cr=document.getElementById("crumb"); if(cr) cr.textContent=NAMES[sec]||"";
  const tabs=[["today","Home",IC.home,"--c-meet"],["meetings","Meetings",IC.meet,"--c-meet"],["greats","Greats",IC.greats,"--c-greats"],["speeches","Speeches",IC.speech,"--c-speech"],["lexicon","Words",IC.words,"--c-words"]];
  const active = tab==="run"&&R&&R.from ? (R.drill.formula&&R.from.tab!=="today"?"greats":R.from.tab) : (["gym","progress","settings","course"].includes(tab)) ? "today" : tab;
  document.getElementById("tabs").innerHTML=tabs.map(([k,l,ic,c])=>`<button class="${k===active?"on":""}" data-go="${k}" style="--tc:var(${c})"><span class="ic">${ic}</span>${l}</button>`).join("");
  const v=document.getElementById("view");
  v.innerHTML = tab==="run"?vRun(): tab==="course"?vCourse(): tab==="gym"?vGym(): tab==="progress"?vProgress(): tab==="settings"?vSettings(): tab==="lexicon"?vLexicon(): tab==="meetings"?vMeetings(): tab==="speeches"?vSpeeches(): tab==="greats"?vGreats(): vToday();
  if(tab==="run"&&R&&R.phase==="live"&&R.drill.type==="mirror"&&camStream){ const c=document.getElementById("cam"); if(c){ c.srcObject=camStream; c.play().catch(()=>{}); } }
  if(MT&&tab==="run"&&R&&R.drill.noteSim) mtPaint();
};
addEventListener("scroll",()=>{ const h=document.querySelector("header.top"); if(h) h.classList.toggle("scrolled",scrollY>6); },{passive:true});
if(canSpeak) try{ speechSynthesis.onvoiceschanged=()=>{}; speechSynthesis.getVoices(); }catch(e){}

/* ---------------- events ---------------- */
let lastField=null;
document.addEventListener("focusin",e=>{ if(e.target.closest&&e.target.closest(".pad")&&(e.target.tagName==="TEXTAREA"||e.target.tagName==="INPUT")) lastField=e.target; });
document.addEventListener("pointerdown",e=>{ if(e.target.closest("[data-sym]")) e.preventDefault(); });
function padObj(ctx){ if(ctx==="run") return R?(R.np=R.np||{}):null; if(ctx&&ctx.startsWith("pad:")) return S.pads.find(p=>p.id===ctx.slice(4))||null; return null; }
let p4T=null;
function padSaved(ctx){ if(ctx&&ctx.startsWith("pad:")){ clearTimeout(p4T); p4T=setTimeout(persist,400); } }
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-mod],[data-g-sec],[data-g-item],[data-g-back],[data-g-run],[data-g-done],[data-g-readmodel],[data-gf-random],[data-spot],[data-spot-next],[data-pick-new],[data-pick-f],[data-pick-jason],[data-mt-play],[data-mt-next],[data-mt-text],[data-mt-rate],[data-sym],[data-nt-item],[data-nt-back],[data-nt-run],[data-nt-random],[data-nt-ex],[data-nt-done],[data-nt-catch],[data-catch-play],[data-catch-read],[data-catch-check],[data-catch-next],[data-nt-newpad],[data-nt-pad],[data-pad-speak],[data-pad-debrief],[data-pad-export],[data-pad-del],[data-g-analysed],[data-go]");
  if(!b) return; const d=b.dataset;
  if(d.gAnalysed!==undefined){ spSec="great"; spItem=null; spDraft=null; return; } // data-go does the navigation
  if(d.go!==undefined){ if(d.go==="greats"&&tab==="greats"&&gItem){ gItem=null; render(); scrollTo(0,0); } if(d.go==="meetings"&&ntItem){ ntItem=null; if(tab==="meetings") render(); } return; }
  if(d.mod!==undefined){ const k=d.mod; if(R) { stopAll(); R=null; }
    if(k==="meetings"){ tab="meetings"; mtSec="long"; longItem=null; mvMove=null; }
    else if(k==="notes"){ tab="meetings"; mtSec="notes"; ntItem=null; }
    else if(k==="debrief"){ tab="meetings"; mtSec="debrief"; dbOpen=null; }
    else if(k==="greats"){ tab="greats"; gItem=null; }
    else if(k==="speeches"){ tab="speeches"; spItem=null; spDraft=null; }
    else if(k==="lexicon"){ tab="lexicon"; lexReview=null; lexEntry=null; lexField=null; }
    else { tab=k; view=null; }
    render(); scrollTo(0,0); return; }
  // greats
  if(d.gSec!==undefined){ gSec=d.gSec; gItem=null; render(); return; }
  if(d.gItem!==undefined){ gItem=d.gItem; tab="greats"; render(); scrollTo(0,0); return; }
  if(d.gBack!==undefined){ gItem=null; render(); scrollTo(0,0); return; }
  if(d.gRun!==undefined){ const f=FBY[d.gRun], i=+d.gP; startRunner(formulaDrill(f,f.prompts[i],i),{tab:"greats"}); return; }
  if(d.gDone!==undefined){ S.fRead[d.gDone]=!S.fRead[d.gDone]; persist(); render(); return; }
  if(d.gReadmodel!==undefined){ const f=FBY[d.gReadmodel]; startRunner({id:"gf-model-"+f.id,gym:true,label:"The greats",type:"read",long:true,title:f.name,how:"Read the model aloud at the speed of the room. Feel where each step begins.",items:[(f.model.slots||[]).join("\n\n")],checks:["Did each step sound like a new beat?","Did the key words land?","Did it end down, with a held silence?"]},{tab:"greats"}); return; }
  if(d.gfRandom!==undefined){ if(!FORMULAS.length) return toast("Formulas are still loading"); const f=rnd(FORMULAS); const i=Math.floor(Math.random()*(f.prompts||[1]).length); startRunner(formulaDrill(f,f.prompts[i],i),{tab:tab==="today"?"today":"greats"}); return; }
  if(d.spot!==undefined){ if(spotQ.ans) return; spotQ.ans=d.spot; S.spot.n++; if(d.spot===spotQ.fid) S.spot.right++; persist(); render(); return; }
  if(d.spotNext!==undefined){ spotQ=newSpot(); render(); scrollTo(0,0); return; }
  if(d.pickNew!==undefined){ pickSc=rnd(LONG_SCEN).id; render(); return; }
  if(d.pickJason!==undefined){ startRunner(longDrill(LONGS[pickSc]),{tab:"greats"}); return; }
  if(d.pickF!==undefined){ const f=FBY[d.pickF], sc=LONGS[pickSc]; startRunner(formulaDrill(f,{room:sc.room,setup:sc.briefing,context:(sc.notes||[]).length?"Your notes: "+sc.notes.join(" · "):"",prompt:sc.task,seconds:sc.seconds||180,prep:60},null),{tab:"greats"}); return; }
  // meeting player
  if(d.mtPlay!==undefined){ if(MT&&MT.playing) mtPause(); else mtPlay(); return; }
  if(d.mtNext!==undefined){ if(!MT) return; const was=MT.playing; mtPause(); MT.i=Math.min(MT.n,MT.i+1); if(was&&MT.i<MT.n) mtPlay(); else mtPaint(); return; }
  if(d.mtText!==undefined){ R.showText=!R.showText; render(); return; }
  if(d.mtRate!==undefined){ const r=S.mtRate||1; S.mtRate=r===1?1.15:r>1?0.9:1; persist(); render(); return; }
  if(d.sym!==undefined){ let el=lastField; const pad=b.closest(".pad"); if(!el||!pad||!pad.contains(el)) el=pad&&pad.querySelector('[data-np="room"]'); if(!el) return; const s=d.sym==='""'?'""':d.sym+" "; const a=el.selectionStart??el.value.length, z=el.selectionEnd??a; el.value=el.value.slice(0,a)+s+el.value.slice(z); const pos=a+(d.sym==='""'?1:s.length); el.focus(); try{ el.setSelectionRange(pos,pos); }catch(_){} el.dispatchEvent(new Event("input",{bubbles:true})); return; }
  // notes
  if(d.ntItem!==undefined){ ntItem=d.ntItem; render(); scrollTo(0,0); return; }
  if(d.ntBack!==undefined){ ntItem=null; catchQ=null; render(); scrollTo(0,0); return; }
  if(d.ntRun!==undefined){ MT=null; startRunner(noteSimDrill(NSBY[d.ntRun]),{tab:"meetings"}); return; }
  if(d.ntRandom!==undefined){ if(!NSIMS.length) return toast("Meetings are still loading"); MT=null; const fresh=NSIMS.filter(x=>!S.nSims[x.id]); startRunner(noteSimDrill(rnd(fresh.length?fresh:NSIMS)),{tab:tab==="today"?"today":"meetings"}); if(R.from.tab==="meetings") mtSec="notes"; return; }
  if(d.ntEx!==undefined){ const x=NTL[d.ntEx], ex=x.exercise||{}; startRunner({id:"nt-ex-"+x.id,gym:true,label:"Notes",type:"impromptu",title:x.title,how:ex.task,items:[ex.task],prep:20,seconds:ex.seconds||60,checks:x.checks||[],onSave:()=>{ S.ntRead[x.id]=true; }},{tab:"meetings"}); return; }
  if(d.ntDone!==undefined){ S.ntRead[d.ntDone]=!S.ntRead[d.ntDone]; persist(); render(); return; }
  if(d.ntCatch!==undefined){ catchQ=newCatch(); ntItem="catch"; render(); scrollTo(0,0); return; }
  if(d.catchPlay!==undefined){ const sp=NSBY[catchQ.sim].speakers[catchQ.k]; const {voice,pitch}=speakerVoice(sp,catchQ.k); speechSynthesis.cancel(); (String(sp.said).match(/[^.!?]+[.!?]+["')]*|[^.!?]+$/g)||[sp.said]).forEach(t=>{ const u=new SpeechSynthesisUtterance(t.trim()); if(voice) u.voice=voice; u.pitch=pitch; u.rate=S.mtRate||1; speechSynthesis.speak(u); }); catchQ.played=true; return; }
  if(d.catchRead!==undefined){ catchQ.read=true; render(); setTimeout(()=>{ if(catchQ&&catchQ.read&&catchQ.phase==="listen"){ catchQ.read=false; catchQ.phase="write"; render(); } },Math.max(8000,String(NSBY[catchQ.sim].speakers[catchQ.k].said).split(/\s+/).length*260)); return; }
  if(d.catchCheck!==undefined){ catchQ.guess=(document.getElementById("cg")||{}).value||""; catchQ.point=(document.getElementById("cp")||{}).value||""; const kp=catchKP(catchQ); catchQ.hit=!!kp&&overlap(catchQ.guess,kp.phrase)>=.6; catchQ.phase="reveal"; S.catchS.n++; if(catchQ.hit) S.catchS.hit++; persist(); if(canSpeak) speechSynthesis.cancel(); render(); return; }
  if(d.catchNext!==undefined){ catchQ=newCatch(); render(); scrollTo(0,0); return; }
  if(d.ntNewpad!==undefined){ const p={id:"pad"+Date.now(),t:Date.now(),title:"",q:"",room:"",me:"",gap:""}; S.pads.push(p); persist(); tab="meetings"; mtSec="notes"; ntItem="pad:"+p.id; render(); scrollTo(0,0); return; }
  if(d.ntPad!==undefined){ ntItem="pad:"+d.ntPad; render(); scrollTo(0,0); return; }
  if(d.padSpeak!==undefined){ const p=S.pads.find(x=>x.id===d.padSpeak); startRunner({id:"pad-"+p.id,gym:true,label:"From your notes",type:"impromptu",padNotes:p,title:"Speak from your notes",how:"Twenty seconds to number your slots. Then speak, from the page.",items:[p.q?"The question: "+p.q:"Make your contribution."],prep:20,seconds:180,checks:SLOTS.map(([k,l,h])=>`${l}: ${h}`)},{tab:"meetings"}); return; }
  if(d.padDebrief!==undefined){ const p=S.pads.find(x=>x.id===d.padDebrief); const x={id:"db"+Date.now(),t:Date.now(),meeting:p.title||"",happened:[p.q?"Q: "+p.q:"",p.room||"",p.gap?"Gap: "+p.gap:""].filter(Boolean).join("\n"),said:p.me||"",slots:{}}; S.debriefs.push(x); persist(); mtSec="debrief"; dbOpen=x.id; ntItem=null; render(); scrollTo(0,0); return; }
  if(d.padExport!==undefined){ const p=S.pads.find(x=>x.id===d.padExport); const md=`# ${p.title||"Meeting notes"}\n\n*${new Date(p.t).toLocaleDateString("en-AU")}*\n\n${padText(p)}\n`; try{ const url=URL.createObjectURL(new Blob([md],{type:"text/markdown"})); const a=document.createElement("a"); a.href=url; a.download="notes-"+new Date(p.t).toISOString().slice(0,10)+".md"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),4000); toast("Saved to your downloads"); }catch(err){ toast("Saving isn't available here"); } return; }
  if(d.padDel!==undefined){ S.pads=S.pads.filter(x=>x.id!==d.padDel); ntItem=null; persist(); render(); return; }
});
document.addEventListener("input",e=>{
  const t=e.target; if(!t.dataset) return;
  if(t.dataset.np){ const pad=t.closest(".pad"); const ctx=pad&&pad.dataset.padctx; const o=padObj(ctx); if(!o) return; o[t.dataset.np]=t.value; padSaved(ctx); return; }
  if(t.dataset.padtitle){ const p=S.pads.find(x=>x.id===t.dataset.padtitle); if(p){ p.title=t.value; clearTimeout(p4T); p4T=setTimeout(persist,400); } return; }
});
render();
