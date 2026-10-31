(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],root=document.documentElement;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const loader=$('#loader');addEventListener('load',()=>setTimeout(()=>loader?.classList.add('done'),450));setTimeout(()=>loader?.classList.add('done'),2200);
if(!$('#home'))return;
const progress=$('#progress');function scrollFX(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%'}addEventListener('scroll',scrollFX,{passive:true});scrollFX();
// Theme + navigation
const themeBtn=$('#themeBtn');let theme=localStorage.getItem('asmaa-theme')||'night';function setTheme(t){theme=t;root.dataset.theme=t;themeBtn.textContent=t==='night'?'☼':'☾';localStorage.setItem('asmaa-theme',t)}setTheme(theme);themeBtn.addEventListener('click',()=>{setTheme(theme==='night'?'day':'night');spellBurst(innerWidth*.5,90,'theme')});
const menuBtn=$('#menuBtn'),nav=$('.topbar nav');menuBtn.addEventListener('click',()=>{nav.classList.toggle('open');menuBtn.textContent=nav.classList.contains('open')?'×':'☰';play('tap')});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuBtn.textContent='☰'}));
// Procedural sound effects. Audio starts only after the visitor opts in.
let audioCtx=null,soundOn=localStorage.getItem('asmaa-sound')==='on';const soundBtn=$('#soundBtn');
function audio(){audioCtx??=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}
function note(freq=660,duration=.12,wave='sine',volume=.035,delay=0){if(!soundOn)return;try{const c=audio(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;o.type=wave;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.018);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+duration+.03)}catch(_){}}
// Hover notes form a short, recognizable Sunshine-inspired motif.
// Each hovered control advances the melody instead of firing a generic beep.
const sunshineMotif=[523.25,523.25,659.25,587.33,523.25,440.00,392.00,440.00,523.25,587.33,659.25,587.33];
let sunshineStep=0;
function play(kind='hover'){
 if(kind==='hover'){
   const freq=sunshineMotif[sunshineStep%sunshineMotif.length];
   sunshineStep++;
   note(freq,.19,'sine',.028,0);
   // A soft golden overtone gives each note a tiny magical shimmer.
   note(freq*2,.11,'triangle',.008,.025);
   return;
 }
 const sets={tap:[[523.25,.09,'triangle',.028,0],[659.25,.12,'sine',.018,.055]],spell:[[523.25,.18,'sine',.04,0],[659.25,.2,'sine',.035,.09],[783.99,.25,'sine',.03,.18],[1046.5,.38,'sine',.025,.29]],secret:[[392,.16,'triangle',.03,0],[587.33,.18,'triangle',.03,.08],[783.99,.28,'sine',.035,.16],[1174.66,.42,'sine',.025,.28]]};
 (sets[kind]||sets.tap).forEach(n=>note(...n));
}
soundBtn.textContent=soundOn?'♫':'♪';soundBtn.setAttribute('aria-pressed',String(soundOn));soundBtn.title=soundOn?'إيقاف المؤثرات الصوتية':'تشغيل المؤثرات الصوتية';soundBtn.addEventListener('click',()=>{soundOn=!soundOn;localStorage.setItem('asmaa-sound',soundOn?'on':'off');soundBtn.textContent=soundOn?'♫':'♪';soundBtn.setAttribute('aria-pressed',String(soundOn));if(soundOn)play('spell')});
// Magic feedback: pointer hover, touch, keyboard and delightful surprises.
const stage=$('#witchStage'),speech=$('#speech'),toast=$('#toast');let xp=0,lastTap=0,tapCount=0,secretCount=0;
const witchLines=['أهلًا بكِ في عالمي! مستعدة للاستكشاف؟','كل تفصيلة هنا صُممت لتُكتشف.','جرّبي الضغط مرتين… قد يحدث شيء سحري.','وراء كل مشروع حكاية تستحق أن تُروى.','الفضول مهارتي المفضلة.','وجدتِ طريقك إلى هنا… والباقي مغامرة!'];
function say(message){speech.innerHTML=`${message}<span>جرّبي التفاعل معي ✦</span>`}
function award(points=10,label='نقاط خبرة'){xp+=points;toast.innerHTML=`+${points} XP <span>✧ ${label}</span>`;toast.classList.add('show');clearTimeout(award.timer);award.timer=setTimeout(()=>toast.classList.remove('show'),1450)}
function particle(x,y,char='✦',count=9){if(reduceMotion)return;for(let i=0;i<count;i++){const p=document.createElement('i');p.className='magic-particle';p.textContent=char;const a=Math.PI*2*i/count,d=35+Math.random()*85;p.style.setProperty('--dx',`${Math.cos(a)*d}px`);p.style.setProperty('--dy',`${Math.sin(a)*d}px`);p.style.left=x+'px';p.style.top=y+'px';document.body.append(p);setTimeout(()=>p.remove(),950)}}
function spellBurst(x,y,type='spell'){particle(x,y,type==='secret'?'✧':'✦',type==='secret'?18:12);play(type==='secret'?'secret':'spell');document.body.classList.remove('spell-flash');void document.body.offsetWidth;document.body.classList.add('spell-flash');setTimeout(()=>document.body.classList.remove('spell-flash'),650)}
function surprise(){const events=[()=>{say('وجدتِ نجمة أمنيات! تذكّري أن الأفكار الكبيرة تبدأ بخطوة.');spellBurst(innerWidth*.5,innerHeight*.4);award(25,'نجمة أمنيات')},()=>{document.body.classList.add('golden-hour');setTimeout(()=>document.body.classList.remove('golden-hour'),1800);say('لحظة ذهبية… خذي وقتك في الاستكشاف.');award(15,'لحظة سحرية')},()=>{const glyph=document.createElement('div');glyph.className='floating-rune';glyph.textContent='✺';glyph.setAttribute('aria-hidden','true');document.body.append(glyph);setTimeout(()=>glyph.remove(),1900);say('تعويذة عابرة! هل لمحتيها؟');award(20,'تعويذة')},()=>{say('سر صغير: جرّبي النقر ثلاث مرات على الساحرة.');spellBurst(innerWidth*.5,innerHeight*.35);award(10,'اكتشاف')}];events[Math.floor(Math.random()*events.length)]()}
function stageTap(e){const now=Date.now(),x=e.clientX||innerWidth*.5,y=e.clientY||innerHeight*.45;tapCount=now-lastTap<520?tapCount+1:1;lastTap=now;secretCount++;say(witchLines[Math.floor(Math.random()*witchLines.length)]);award(10,'تفاعل');if(tapCount>=2){tapCount=0;spellBurst(x,y);say('✨ تعويذة مزدوجة! فتحتِ بوابة من الضوء.');award(30,'تعويذة مزدوجة')}else if(secretCount%3===0){spellBurst(x,y,'secret');say('وجدتِ التعويذة السرية! الساحرة تلوّح لكِ ✨');award(40,'سر مكتشف')}else{play('tap');particle(x,y,'✦',7);if(!reduceMotion)stage.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(-8px) scale(1.025) rotate(1deg)'},{transform:'translateY(0) scale(1)'}],{duration:480,easing:'cubic-bezier(.2,.8,.2,1)'})}}
stage.addEventListener('pointerup',stageTap);stage.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();stageTap({clientX:innerWidth*.5,clientY:innerHeight*.45})}});stage.setAttribute('tabindex','0');stage.setAttribute('role','button');stage.setAttribute('aria-label','تفاعل مع ساحرة الشمس لاكتشاف المفاجآت');
// Ambient sound on interactive elements; touch gets a sound on first tap (not hover-only).
$$('a,button,.quest-card,.skill-tree article,.tools-panel div').forEach(el=>{el.addEventListener('pointerenter',()=>{if(matchMedia('(hover:hover)').matches)play('hover')});el.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')play('hover')},{passive:true});el.addEventListener('click',e=>{if(el!==soundBtn&&el!==themeBtn&&el!==menuBtn)play('tap')})});
// Click anywhere in the magical world for a tiny sparkle; every so often, surprise the visitor.
let worldClicks=0;document.addEventListener('click',e=>{if(e.target.closest('a,button,input,textarea,select'))return;worldClicks++;if(worldClicks%7===0)surprise();else if(!reduceMotion)particle(e.clientX,e.clientY,'✧',5)});
// Double-click / double-tap on the background creates a brief constellation.
document.addEventListener('dblclick',e=>{if(e.target.closest('a,button'))return;spellBurst(e.clientX,e.clientY);say('رسمتِ كوكبة جديدة في سمائي!');award(20,'كوكبة')});
// Cursor glow follows mouse; custom star cursor trail is intentionally subtle.
const glow=$('.cursor-glow');if(matchMedia('(pointer:fine)').matches){let last=0;addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';if(!reduceMotion&&Date.now()-last>95){last=Date.now();const p=document.createElement('i');p.className='cursor-spark';p.style.left=e.clientX+'px';p.style.top=e.clientY+'px';document.body.append(p);setTimeout(()=>p.remove(),520)}})}
// Scroll reveal
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('seen');observer.unobserve(e.target)}}),{threshold:.12});$$('.section,.quest-card,.skill-tree article,.profile-card').forEach(el=>observer.observe(el));
const sections=$$('main section[id]'),navLinks=$$('.topbar nav a');const activeObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-35% 0px -55% 0px'});sections.forEach(s=>activeObserver.observe(s));
// Easter egg: type SUN anywhere to summon a golden shower of stars.
let typed='';addEventListener('keydown',e=>{if(e.key.length===1){typed=(typed+e.key.toLowerCase()).slice(-3);if(typed==='sun'){spellBurst(innerWidth*.5,innerHeight*.35,'secret');say('لقد استدعيتِ شمس العالم! ☀️');award(50,'سحر الشمس')}}});
})();
