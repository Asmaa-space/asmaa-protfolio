(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const intro = $('#intro');
  window.addEventListener('load', () => setTimeout(() => intro?.classList.add('done'), 950));

  // Musical wand: a gentle C-major pentatonic music-box scale.
  let audioCtx = null, soundEnabled = false, lastNoteAt = 0, lastX = null, lastY = null, noteStep = 0;
  const pentatonic = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]; // C D E G A C
  function ensureAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    soundEnabled = true;
    const button = $('#soundToggle');
    button?.classList.add('active');
    button?.setAttribute('aria-label', 'إيقاف النغمات السحرية');
    button?.setAttribute('aria-pressed', 'true');
    $('#soundHint')?.classList.remove('show');
    return true;
  }
  function musicBox(freq, volume=.026, duration=.24) {
    if (!soundEnabled || !audioCtx) return;
    const t = audioCtx.currentTime;
    const master = audioCtx.createGain();
    master.gain.setValueAtTime(.0001, t);
    master.gain.exponentialRampToValueAtTime(volume, t + .012);
    master.gain.exponentialRampToValueAtTime(.0001, t + duration);
    master.connect(audioCtx.destination);
    // Two clean partials create a delicate celesta / music-box timbre.
    [[1,.78],[2.756,.16],[4.07,.045]].forEach(([ratio, level]) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * ratio, t);
      gain.gain.setValueAtTime(level, t);
      gain.gain.exponentialRampToValueAtTime(.0001, t + duration * (ratio === 1 ? 1 : .62));
      osc.connect(gain).connect(master);
      osc.start(t); osc.stop(t + duration + .02);
    });
  }
  function playWandNote(x, y, dx, dy) {
    if (!soundEnabled || !audioCtx) return;
    const now = performance.now();
    if (now - lastNoteAt < 165) return;
    lastNoteAt = now;
    const xBand = Math.min(5, Math.max(0, Math.floor((x / innerWidth) * 6)));
    const verticalLift = dy < -2 ? 1 : dy > 2 ? -1 : 0;
    const directionLift = dx >= 0 ? 0 : 1;
    const index = (xBand + verticalLift + directionLift + noteStep++) % pentatonic.length;
    musicBox(pentatonic[(index + pentatonic.length) % pentatonic.length]);
  }
  function disableSound() {
    soundEnabled = false;
    $('#soundToggle')?.classList.remove('active');
    $('#soundToggle')?.setAttribute('aria-label', 'تفعيل النغمات السحرية');
    $('#soundToggle')?.setAttribute('aria-pressed', 'false');
  }
  $('#soundToggle')?.addEventListener('click', () => {
    if (soundEnabled) disableSound();
    else if (ensureAudio()) { musicBox(783.99,.035,.42); sparkle(innerWidth*.5, 90, 10); }
  });
  // Browsers block autoplay: arm automatically after the first deliberate mouse or keyboard gesture.
  if (finePointer) window.addEventListener('pointerdown', () => {
    if (!soundEnabled) {
      ensureAudio();
      $('#soundHint')?.classList.add('show');
      setTimeout(() => $('#soundHint')?.classList.remove('show'), 2200);
    }
  }, {once:true, passive:true});
  window.addEventListener('keydown', () => { if (!soundEnabled) ensureAudio(); }, {once:true});

  // Theme and navigation.
  $('#themeToggle')?.addEventListener('click', () => {
    const light = document.documentElement.dataset.theme !== 'light';
    document.documentElement.dataset.theme = light ? 'light' : 'arcana';
    $('#themeToggle').textContent = light ? '☼' : '☾';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#eee9ff' : '#100d2b');
    sparkle(innerWidth*.5, 95, 18);
  });
  $('#menuToggle')?.addEventListener('click', () => $('#mobileMenu')?.classList.toggle('open'));
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => $('#mobileMenu')?.classList.remove('open')));
  const sections = $$('main section[id]'), navLinks = $$('.desktop-nav a');
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) navLinks.forEach(a => a.classList.toggle('current', a.getAttribute('href') === '#' + entry.target.id));
    }), {rootMargin:'-35% 0px -55% 0px'});
    sections.forEach(section => navObserver.observe(section));
  }
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = $('#scrollProgress');
    if (progress) progress.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
  }, {passive:true});

  // Wand trail: only on real mouse/trackpad. Touch gets a tiny visual sparkle, never a note.
  const aura = $('#cursorAura');
  if (finePointer) window.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    if (aura) { aura.style.opacity = '.9'; aura.style.left = e.clientX + 'px'; aura.style.top = e.clientY + 'px'; }
    const dx = lastX == null ? 0 : e.clientX - lastX;
    const dy = lastY == null ? 0 : e.clientY - lastY;
    if (Math.hypot(dx,dy) > 14) {
      playWandNote(e.clientX,e.clientY,dx,dy);
      if (!reduceMotion && Math.random() > .56) sparkle(e.clientX,e.clientY,1);
    }
    lastX = e.clientX; lastY = e.clientY;
  }, {passive:true});
  document.addEventListener('pointerleave', () => { if (aura) aura.style.opacity = '0'; });

  // Lightweight canvas particles.
  const canvas = $('#sparkCanvas'), ctx = canvas?.getContext('2d');
  let particles = [], W = 0, H = 0;
  function resize() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.6);
    W = canvas.width = innerWidth * dpr; H = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize(); window.addEventListener('resize',resize,{passive:true});
  function sparkle(x,y,count=12) {
    if (reduceMotion) count = Math.min(count,3);
    for (let i=0;i<count;i++) {
      const a=Math.random()*Math.PI*2, speed=.5+Math.random()*2.3;
      particles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:1,size:1+Math.random()*2.6,hue:[190,260,285,320,42][Math.floor(Math.random()*5)],rot:Math.random()*6});
    }
    if (particles.length > 150) particles.splice(0,particles.length-150);
  }
  function draw() {
    if (!ctx) return;
    ctx.clearRect(0,0,innerWidth,innerHeight);
    particles = particles.filter(p=>p.life>.02);
    for (const p of particles) {
      p.x+=p.vx; p.y+=p.vy; p.vy+=.012; p.life-=.022; p.rot+=.04;
      ctx.save(); ctx.globalAlpha=p.life; ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle=`hsla(${p.hue},100%,82%,${p.life})`; ctx.shadowBlur=12; ctx.shadowColor=ctx.fillStyle;
      ctx.beginPath(); ctx.moveTo(0,-p.size*2); ctx.lineTo(p.size*.7,0); ctx.lineTo(0,p.size*2); ctx.lineTo(-p.size*.7,0); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  }
  if (!reduceMotion) draw();
  document.addEventListener('pointerdown',e=>{ if (e.pointerType === 'touch') sparkle(e.clientX,e.clientY,5); else sparkle(e.clientX,e.clientY,9); },{passive:true});

  // Witch companion and hidden spell interactions.
  const witch=$('#heroArt'), speech=$('#speechBubble'), toast=$('#toast'), overlay=$('#spellOverlay');
  let taps=0,tapTimer;
  const greetings=['وجدتِ صفحة مخفية… تابعي الاستكشاف ✧','كل مشروع يبدأ بفضول صغير.','هذه اللمعة إشارة إلى فكرة جديدة!','هناك دائمًا أكثر مما تراه العين.'];
  function showToast(msg='+ 10 XP') { if(!toast)return; toast.innerHTML=msg+' <span>✧</span>'; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),1700); }
  function spellChord() { if(!soundEnabled || !audioCtx)return; [523.25,659.25,783.99,1046.5].forEach((n,i)=>setTimeout(()=>musicBox(n,.025,.48),i*85)); }
  function castSpell() { overlay?.classList.add('cast'); spellChord(); sparkle(innerWidth*.5,innerHeight*.45,reduceMotion?10:60); showToast('+ 30 XP · تمّت التعويذة'); setTimeout(()=>overlay?.classList.remove('cast'),950); }
  witch?.addEventListener('click',()=>{
    taps++; if(speech) speech.innerHTML=greetings[Math.floor(Math.random()*greetings.length)]+'<small>جرّبي الضغط مرتين لاكتشاف تعويذة ✧</small>';
    const r=witch.getBoundingClientRect(); sparkle(r.left+r.width*.5,r.top+r.height*.45,18); showToast('+ 10 XP');
    clearTimeout(tapTimer); tapTimer=setTimeout(()=>{taps=0;},420);
    if(taps>=2){castSpell();taps=0;}
  });
  witch?.addEventListener('dblclick',e=>{e.preventDefault();castSpell();});
  let keySeq=''; window.addEventListener('keydown',e=>{if(e.key.length===1){keySeq=(keySeq+e.key.toLowerCase()).slice(-5);if(keySeq.endsWith('magic'))castSpell();}});
  $$('.quest-card').forEach((card,i)=>card.addEventListener('click',()=>{showToast(`تم فتح المهمة ${String(i+1).padStart(2,'0')} · + 15 XP`);const r=card.getBoundingClientRect();sparkle(r.left+r.width/2,r.top+r.height/2,18);}));
  $$('.ability-card').forEach(card=>card.addEventListener('click',()=>{const r=card.getBoundingClientRect();sparkle(r.left+r.width/2,r.top+r.height/2,14);showToast('تم اكتشاف قدرة جديدة · + 5 XP');}));

  // Reveal on scroll, with graceful fallback.
  const revealTargets=$$('.section-heading,.profile-layout,.quest-card,.ability-card,.inventory,.contact-section');
  revealTargets.forEach(el=>el.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:.1});
    revealTargets.forEach(el=>revealObserver.observe(el));
  } else revealTargets.forEach(el=>el.classList.add('visible'));
})();
