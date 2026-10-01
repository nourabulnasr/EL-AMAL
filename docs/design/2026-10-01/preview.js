(() => {
  const main = document.querySelector('main');
  const hero = document.querySelector('.hero');
  const scene = document.querySelector('.scene');
  const pause = document.querySelector('#pause');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let paused = false;
  const concepts = {
    film: {
      number:'01 / 03', title:'Built for<br>the <em>critical.</em>', name:'Industry in motion',
      label:'CINEMATIC FILM DIRECTION<br>ILLUSTRATIVE STILL + CAMERA MOTION',
      description:'A restrained industrial film behind an oversized editorial headline. Slow camera movement brings the engineering into focus; the whole frame gently compresses as the lighter-blue next chapter arrives.',
      note:'This preview animates an AI-generated still. A finished video would need a separately produced or licensed film. It does not show EL AMAL premises.'
    },
    sculpture: {
      number:'02 / 03', title:'Precision.<br><em>Revealed.</em>', name:'Precision, revealed',
      label:'SCULPTURAL 3D DIRECTION<br>CONCEPT ASSEMBLY · MOVE YOUR POINTER',
      description:'A monumental, exploded sensor assembly takes the place of the gauge. It responds subtly to the pointer, then would assemble into a compact instrument as you scroll. Strong material detail, generous space and a clear path into the catalogue.',
      note:'The preview uses an AI-generated concept render with pointer parallax, not a live 3D model. A production version would need an accurate optimized model and a static mobile fallback; the sculpture is not a manufacturer specification.'
    },
    flow: {
      number:'03 / 03', title:'Keep industry<br><em>in flow.</em>', name:'The flow of precision',
      label:'ANIMATED FLOW FIELD<br>ORIGINAL VECTOR MOTION · LIGHTWEIGHT',
      description:'An original field of pale-blue process lines moves around the headline. An amber signal traces the route through it. The composition becomes a recognizable brand motif across industry pages, dividers and loading transitions.',
      note:'This option uses real lightweight SVG/CSS animation in the preview. It requires no video or 3D asset. The line field is a brand illustration, not a live data reading.'
    }
  };
  document.querySelectorAll('[data-concept]').forEach(button => {
    if(button.tagName !== 'BUTTON')return;
    button.addEventListener('click', () => {
      const key = button.dataset.concept;
      const data = concepts[key];
      main.dataset.concept = key;
      document.querySelectorAll('.concept-tabs button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.querySelector('#hero-title').innerHTML = data.title;
      document.querySelector('#art-label').innerHTML = data.label;
      document.querySelector('#scene-number').textContent = data.number;
      document.querySelector('#notes-title').textContent = data.name;
      document.querySelector('#concept-description').textContent = data.description;
      document.querySelector('#build-note').textContent = data.note;
      history.replaceState(null,'',`#${key}`);
      window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});
    });
  });
  const lineGroup = document.querySelector('.flow-lines');
  for(let i=0;i<34;i++){
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',`M ${1470-i*3} ${780-i*12} C ${1000-i*7} ${930-i*7}, ${1370-i*5} ${40+i*6}, ${986-i*7} ${105+i*7} S ${597+i*7} ${690-i*4}, ${1270+i*6} ${490-i*5}`);
    path.setAttribute('opacity',String(.23 + i/48));
    lineGroup.appendChild(path);
  }
  const updateScene = () => {
    const progress = Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
    scene.style.setProperty('--scene-scale', String(reduced.matches||paused ? 1 : 1-progress*.055));
    scene.style.setProperty('--scene-radius', reduced.matches||paused ? '0px' : `${progress*28}px`);
  };
  let scheduled = false;
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{updateScene();scheduled=false;});}},{passive:true});
  pause.addEventListener('click',()=>{paused=!paused;document.body.classList.toggle('paused',paused);pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Resume motion':'Pause motion';updateScene();});
  hero.addEventListener('pointermove', event => {
    if(!finePointer.matches || reduced.matches || paused || main.dataset.concept!=='sculpture')return;
    const rect=hero.getBoundingClientRect();
    scene.style.setProperty('--mx',`${((event.clientX-rect.left)/rect.width-.5)*14}px`);
    scene.style.setProperty('--my',`${((event.clientY-rect.top)/rect.height-.5)*10}px`);
  });
  hero.addEventListener('pointerleave',()=>{scene.style.setProperty('--mx','0px');scene.style.setProperty('--my','0px');});
  reduced.addEventListener('change',updateScene);
  const initial = location.hash.slice(1);
  if(concepts[initial])document.querySelector(`button[data-concept="${initial}"]`).click();
})();
