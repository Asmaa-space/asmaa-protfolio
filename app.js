(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const intro = $('#intro');
  window.addEventListener('load', () => setTimeout(() => intro?.classList.add('done'), 1150));

  // Ambient magic: browsers require a user gesture before audio can start.
  let audioCtx = null, soundEnabled = false, noteIndex = 0, lastSoundAt = 0;
  const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 783.99, 659.25, 587.33, 523.25, 783.99];
  function initAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    soundEnabled = true;
    $('#soundToggle')?.classList.add('active');
    $('#soundToggle').innerHTML = '<span>♫</span>';
    $('#soundToggle').setAttribute('aria-label','إيقاف النغمات السحرية');
    $('#soundHint')?.classList.remove('show');
    return true;
  }
  function playTone(freq, duration=.34, type='sine', volume=.045, delay=0) {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime + delay;
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    const shimmer = audioCtx.createOscillator(), shimmerGain = audioCtx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(volume, now+.025); gain.gain.exponentialRampToValueAtTime(.0001, now+duration);
    shimmer.type='sine'; shimmer.frequency.setValueAtTime(freq*2.01,now);
    shimmerGain.gain.setValueAtTime(.0001,now); shimmerGain.gain.exponentialRampToValueAtTime(volume*.16,now+.04); shimmerGain.gain.exponentialRampToValueAtTime(.0001,now+duration*.8);
    osc.connect(gain).connect(audioCtx.destination); shimmer.connect(shimmerGain).connect(audioCtx.destination);
    osc.start(now); shimmer.start(now); osc.stop(now+duration+.03); shimmer.stop(now+duration+.03);
  }
  function pluckNext() {
    if (!soundEnabled) return;
    const now = performance.now(); if (now-lastSoundAt<95) return; lastSoundAt=now;
    const f = notes[noteIndex++ % notes.length];
    playTone(f,.28,'sine',.04);
    if (noteIndex%4===0) playTone(f*1.5,.22,'triangle',.012,.055);
  }
  function magicChord() { if(!soundEnabled)return; [523.25,659.25,783.99,1046.5].forEach((n,i)=>playTone(n,.72,'sine',.025,i*.065)); }
  $('#soundToggle')?.addEventListener('click', () => {
    if (!soundEnabled) { initAudio(); magicChord(); }
    else { soundEnabled=false; $('#soundToggle').classList.remove('active'); $('#soundToggle').setAttribute('aria-label','تفعيل النغمات السحرية'); }
  });
  // First intentional interaction arms sound automatically; no intrusive autoplay attempt.
  const arm = () => { if (!soundEnabled) { initAudio(); $('#soundHint')?.classList.add('show'); setTimeout(()=>$('#soundHint')?.classList.remove('show'),2600); } };
  window.addEventListener('pointerdown', arm, {once:true, passive:true});
  window.addEventListener('keydown', arm, {once:true});
  const interactive = 'a,button,.quest-card,.ability-card,.chips span,.tool-list span,.witch-wrap,.profile-sigil';
  document.addEventListener('pointerover', e => { if(e.target.closest(interactive)) pluckNext(); }, {passive:true});
  document.addEventListener('focusin', e => { if(e.target.closest(interactive)) pluckNext(); });

  // Theme and navigation
  $('#themeToggle')?.addEventListener('click', () => {
    const light = document.documentElement.dataset.theme !== 'light';
    document.documentElement.dataset.theme = light ? 'light' : 'arcana';
    $('#themeToggle').textContent = light ? '☼' : '☾';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#eee9ff' : '#100d2b');
    sparkle(window.innerWidth*.5, 95, 18);
  });
  $('#menuToggle')?.addEventListener('click', () => $('#mobileMenu')?.classList.toggle('open'));
  $$('.mobile-menu a').forEach(a=>a.addEventListener('click',()=>$('#mobileMenu')?.classList.remove('open')));
  const sections = $$('main section[id]');
  const navLinks = $$('.desktop-nav a');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting) navLinks.forEach(a=>a.classList.toggle('current',a.getAttribute('href')==='#'+entry.target.id));
  }),{rootMargin:'-35% 0px -55% 0px'});
  sections.forEach(s=>observer.observe(s));
  window.addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;$('#scrollProgress').style.width=(max>0?scrollY/max*100:0)+'%';},{passive:true});

  // Pointer aura
  const aura=$('#cursorAura');
  window.addEventListener('pointermove',e=>{if(matchMedia('(pointer:fine)').matches){aura.style.opacity='.9';aura.style.left=e.clientX+'px';aura.style.top=e.clientY+'px';}},{passive:true});
  document.addEventListener('pointerleave',()=>aura.style.opacity='0');

  // Spark particles canvas
  const canvas=$('#sparkCanvas'), ctx=canvas.getContext('2d'); let W=0,H=0,particles=[];
  function resize(){W=canvas.width=innerWidth*devicePixelRatio;H=canvas.height=innerHeight*devicePixelRatio;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);}
  resize();addEventListener('resize',resize,{passive:true});
  function sparkle(x,y,count=14){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*3;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,size:1+Math.random()*2.8,rot:Math.random()*6.2,hue:[42,190,260,315][Math.floor(Math.random()*4)]});}}
  function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);particles=particles.filter(p=>p.life>0);for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.018;p.life-=.018;p.rot+=.06;ctx.save();ctx.globalAlpha=p.life;ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=`hsla(${p.hue},100%,82%,${p.life})`;ctx.shadowBlur=14;ctx.shadowColor=ctx.fillStyle;ctx.beginPath();ctx.moveTo(0,-p.size*2);ctx.lineTo(p.size*.55,0);ctx.lineTo(0,p.size*2);ctx.lineTo(-p.size*.55,0);ctx.closePath();ctx.fill();ctx.restore();}requestAnimationFrame(draw);}draw();
  document.addEventListener('pointerdown',e=>{sparkle(e.clientX,e.clientY,9);});

  // Character secrets: click for a greeting, double-click to cast a spell.
  const witch=$('#heroArt'), speech=$('#speechBubble'), toast=$('#toast'), overlay=$('#spellOverlay'); let taps=0,tapTimer;
  const greetings=['وجدتِ صفحة مخفية… تابعي الاستكشاف ✧','كل مشروع يبدأ بفضول صغير.','هل سمعتِ النغمة؟ إنها أثر تعويذة!','هناك دائمًا أكثر مما تراه العين.'];
  function showToast(msg='+ 10 XP'){toast.innerHTML=msg+' <span>✧</span>';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1700);}
  function castSpell(){overlay.classList.add('cast');magicChord();sparkle(innerWidth*.5,innerHeight*.45,70);showToast('+ 30 XP · SPELL CAST');setTimeout(()=>overlay.classList.remove('cast'),950);}
  witch?.addEventListener('click',()=>{taps++;speech.innerHTML=greetings[Math.floor(Math.random()*greetings.length)]+'<small>جرّبي الضغط مرتين لاكتشاف تعويذة ✧</small>';sparkle(witch.getBoundingClientRect().left+witch.clientWidth*.5,witch.getBoundingClientRect().top+witch.clientHeight*.45,20);showToast('+ 10 XP');clearTimeout(tapTimer);tapTimer=setTimeout(()=>{taps=0;},360);if(taps>=2){castSpell();taps=0;}});
  witch?.addEventListener('dblclick',e=>{e.preventDefault();castSpell();});
  let keySeq='';window.addEventListener('keydown',e=>{if(e.key.length===1){keySeq=(keySeq+e.key.toLowerCase()).slice(-5);if(keySeq.endsWith('magic'))castSpell();}});
  $$('.quest-card').forEach((card,i)=>card.addEventListener('click',()=>{showToast(`OPENING QUEST ${String(i+1).padStart(2,'0')} · + 15 XP`);sparkle(card.getBoundingClientRect().left+card.clientWidth/2,card.getBoundingClientRect().top+card.clientHeight/2,22);}));
  $$('.ability-card').forEach(card=>card.addEventListener('click',()=>{sparkle(card.getBoundingClientRect().left+card.clientWidth/2,card.getBoundingClientRect().top+card.clientHeight/2,16);showToast('ABILITY DISCOVERED · + 5 XP');}));

  // Reveal sections with subtle motion
  const revealTargets=$$('.section-heading,.profile-layout,.quest-card,.ability-card,.inventory,.contact-section');
  revealTargets.forEach(el=>el.classList.add('reveal'));
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:.12});
  revealTargets.forEach(el=>revealObserver.observe(el));
})();
