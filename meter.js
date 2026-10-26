// The Coach: live speech meter.
// One microphone stream feeds three things: a recorder (the take), an audio analyser
// (loudness, pauses, end-of-phrase pitch), and, where the browser offers it, speech
// recognition (words per minute, fillers, transcript).
(function(){
  const FILLERS = [
    ["um", /\b(um+|erm+|uh+|er+|ah+|hmm+)\b/gi],
    ["like", /\blike\b(?!\s+(this|that|a|an|the|to|it|him|her|them|you|me|us|my|your|his|our|their)\b)/gi],
    ["you know", /\byou know\b/gi],
    ["sort of", /\bsort of\b/gi],
    ["kind of", /\bkind of\b/gi],
    ["basically", /\bbasically\b/gi],
    ["actually", /\bactually\b/gi],
    ["just", /\bjust\b/gi],
    ["I mean", /\bi mean\b/gi],
    ["I think", /\bi think\b/gi],
    ["maybe", /\bmaybe\b/gi],
    ["so (opening)", /(^|[.?!]\s+)so\b/gi]
  ];
  function countFillers(text){
    const out = {}; let total = 0;
    for(const [k,re] of FILLERS){ const m = String(text||"").match(re); const n = m ? m.length : 0; if(n){ out[k]=n; total+=n; } }
    return {total, by: out};
  }
  // Autocorrelation pitch estimate on a time-domain frame; returns Hz or 0.
  function pitch(buf, sr){
    const n = buf.length; let rms = 0; for(let i=0;i<n;i++) rms += buf[i]*buf[i]; rms = Math.sqrt(rms/n); if(rms < 0.01) return 0;
    const minLag = Math.floor(sr/400), maxLag = Math.floor(sr/70);
    let best = -1, bestLag = 0;
    for(let lag=minLag; lag<=maxLag; lag++){ let s=0; for(let i=0;i<n-lag;i++) s += buf[i]*buf[i+lag]; if(s>best){ best=s; bestLag=lag; } }
    let e=0; for(let i=0;i<n;i++) e+=buf[i]*buf[i];
    if(!bestLag || best/e < 0.3) return 0;
    return sr/bestLag;
  }
  const median = a => { if(!a.length) return 0; const s=a.slice().sort((x,y)=>x-y); return s[Math.floor(s.length/2)]; };
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  class Meter {
    constructor(opts){ this.opts = Object.assign({record:true, transcript:true, onUpdate:()=>{}}, opts||{}); this.reset(); }
    reset(){
      this.t0=0; this.voicedMs=0; this.pauses=[]; this.curSilence=0; this.longest=0; this.rises=0; this.falls=0; this.phrases=0;
      this.level=0; this.tEnd=0; this.final=""; this.interim=""; this.asrError=""; this.asrOn=false; this.blob=null; this.started=false; this.spokeYet=false;
    }
    static get canTranscript(){ return !!SR; }
    static get canRecord(){ return !!(navigator.mediaDevices && window.MediaRecorder); }
    async start(){
      this.reset();
      this.stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false, noiseSuppression:false, autoGainControl:false}});
      const AC = window.AudioContext || window.webkitAudioContext; this.ac = new AC();
      const src = this.ac.createMediaStreamSource(this.stream); this.an = this.ac.createAnalyser(); this.an.fftSize = 2048; src.connect(this.an);
      this.buf = new Float32Array(this.an.fftSize);
      this.noise = 0.012; this.calib = []; this.seg = []; this.prevSeg = []; this.voiced=false; this.silentFor=0;
      if(this.opts.record && Meter.canRecord){
        const mime = ["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg"].find(m=>MediaRecorder.isTypeSupported(m))||"";
        this.chunks=[]; this.rec = new MediaRecorder(this.stream, mime?{mimeType:mime}:{});
        this.rec.ondataavailable = e=>{ if(e.data.size) this.chunks.push(e.data); };
        this.rec.start();
      }
      if(this.opts.transcript && SR) this.startASR();
      this.t0 = performance.now(); this.last = this.t0; this.started = true;
      this.timer = setInterval(()=>this.tick(), 50);
    }
    startASR(){
      try{
        const r = new SR(); r.lang = "en-AU"; r.continuous = true; r.interimResults = true; this.asr = r; this.asrOn = true;
        r.onresult = e => { let interim=""; for(let i=e.resultIndex;i<e.results.length;i++){ const t=e.results[i][0].transcript; if(e.results[i].isFinal) this.final += (this.final?" ":"")+t.trim(); else interim += t; } this.interim = interim; };
        r.onerror = e => { if(e.error!=="no-speech" && e.error!=="aborted") this.asrError = e.error; };
        r.onend = () => { if(this.started && this.asrOn && !this.asrError){ try{ r.start(); }catch(_){} } };
        r.start();
      }catch(err){ this.asrError = "unavailable"; }
    }
    tick(){
      const now = performance.now(), dt = now - this.last; this.last = now;
      this.an.getFloatTimeDomainData(this.buf);
      let rms=0; for(let i=0;i<this.buf.length;i++) rms+=this.buf[i]*this.buf[i]; rms=Math.sqrt(rms/this.buf.length);
      this.level = Math.min(1, rms*8);
      const el = now - this.t0;
      if(el < 400){ this.calib.push(rms); if(this.calib.length>3) this.noise = Math.max(0.008, median(this.calib)*2.2); }
      const on = rms > this.noise*1.6;
      if(on){
        if(!this.voiced && this.spokeYet && this.silentFor >= 250){ this.pauses.push(this.silentFor); if(this.silentFor>this.longest) this.longest=this.silentFor; }
        if(!this.voiced && this.spokeYet && this.silentFor >= 300) this.phraseEnd();
        this.voiced = true; this.spokeYet = true; this.silentFor = 0; this.voicedMs += dt;
        const p = pitch(this.buf, this.ac.sampleRate); if(p) this.seg.push(p);
      } else {
        this.silentFor += dt;
        if(this.voiced && this.silentFor > 120) this.voiced = false;
      }
      this.curSilence = this.spokeYet && !this.voiced ? this.silentFor : 0;
      this.opts.onUpdate(this.snapshot());
    }
    phraseEnd(){
      const s = this.seg; this.seg = [];
      if(s.length < 8) return;
      const tail = s.slice(-Math.max(4, Math.floor(s.length*0.25))), body = s.slice(0, Math.max(4, s.length - tail.length));
      const a = median(body), b = median(tail); if(!a||!b) return;
      const semis = 12*Math.log2(b/a); this.phrases++;
      if(semis > 2) this.rises++; else if(semis < -1) this.falls++;
    }
    snapshot(){
      const el = this.tEnd ? (this.tEnd-this.t0) : this.started ? (performance.now()-this.t0) : 0;
      const text = (this.final+" "+this.interim).trim();
      const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
      const mins = Math.max(el/60000, 1/60);
      const f = countFillers(this.final+" "+this.interim);
      return {
        elapsed: el, level: this.level, words, wpm: text ? Math.round(words/mins) : null,
        fillers: text ? f.total : null, fillerBy: f.by, transcript: text, asr: this.asrOn && !this.asrError, asrError: this.asrError,
        pauses: this.pauses.filter(p=>p>=1000).length, shortPauses: this.pauses.filter(p=>p>=250&&p<1000).length, longest: Math.round(Math.max(this.longest, this.curSilence)), curSilence: Math.round(this.curSilence),
        rises: this.rises, falls: this.falls, phrases: this.phrases, talkPct: el ? Math.round(this.voicedMs/el*100) : 0
      };
    }
    async stop(){
      if(!this.started) return this.snapshot();
      if(this.seg.length) this.phraseEnd();
      this.tEnd = performance.now(); this.started = false; clearInterval(this.timer);
      if(this.asr){ this.asrOn=false; try{ this.asr.stop(); }catch(_){} await new Promise(r=>setTimeout(r,500)); }
      const snap = this.snapshot();
      if(this.rec && this.rec.state==="recording"){ await new Promise(res=>{ this.rec.onstop=res; this.rec.stop(); }); this.blob = new Blob(this.chunks, {type:this.rec.mimeType||"audio/webm"}); }
      try{ this.stream.getTracks().forEach(t=>t.stop()); }catch(_){}
      try{ this.ac.close(); }catch(_){}
      snap.blob = this.blob; return snap;
    }
    cancel(){ this.started=false; clearInterval(this.timer); try{ this.asrOn=false; this.asr&&this.asr.abort(); }catch(_){} try{ this.rec&&this.rec.state==="recording"&&this.rec.stop(); }catch(_){} try{ this.stream&&this.stream.getTracks().forEach(t=>t.stop()); }catch(_){} try{ this.ac&&this.ac.close(); }catch(_){} }
  }
  window.Meter = Meter; window.countFillers = countFillers;
})();
