import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import type {FeaturedKind} from '@/lib/featured-products';
import {sculptProduct} from './product-3d-model';

export type ProductScene={rotate:(horizontal:number,vertical:number)=>void;reset:()=>void;dispose:()=>void};

function dialTexture(kind:FeaturedKind) {
  if(kind==='valve')return undefined;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
  const ctx=canvas.getContext('2d');if(!ctx)return undefined;
  ctx.fillStyle='#f5f4eb';ctx.fillRect(0,0,512,512);ctx.strokeStyle='#16243c';
  for(let i=0;i<=60;i++) {
    const angle=(135+i*4.5)*Math.PI/180;
    const inner=i%5===0?180:195;
    ctx.lineWidth=i%5===0?3:1.5;ctx.beginPath();
    ctx.moveTo(256+Math.cos(angle)*inner,256+Math.sin(angle)*inner);
    ctx.lineTo(256+Math.cos(angle)*214,256+Math.sin(angle)*214);ctx.stroke();
  }
  ctx.fillStyle='#16243c';ctx.textAlign='center';
  ctx.font='500 22px sans-serif';ctx.fillText(kind==='pressure'?'PRESSURE':'TEMPERATURE',256,170);
  ctx.font='18px sans-serif';ctx.fillText(kind==='pressure'?'232.50 / 233.50':'55',256,330);
  ctx.font='13px sans-serif';ctx.fillText('ILLUSTRATIVE MODEL',256,365);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

/** One canvas, no autoplay, bounded resolution and no frames while idle/offscreen. */
export function createProductScene(host:HTMLDivElement,kind:FeaturedKind,onFailure:()=>void):ProductScene {
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.setClearColor(0x010736,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(33,1,.1,30);
  camera.position.set(0,0,5.8);
  let environment:THREE.WebGLRenderTarget|undefined,texture:THREE.Texture|undefined;
  let sculpture:ReturnType<typeof sculptProduct>|undefined;
  try {
    const room=new RoomEnvironment(),generator=new THREE.PMREMGenerator(renderer);
    try{environment=generator.fromScene(room,.04);scene.environment=environment.texture;}
    finally{room.dispose();generator.dispose();}
    texture=dialTexture(kind);sculpture=sculptProduct(kind,texture);scene.add(sculpture.group);
    scene.add(new THREE.HemisphereLight(0xc4dfff,0x17234d,1));
    const key=new THREE.DirectionalLight(0xffffff,1.8);key.position.set(-3,4,5);scene.add(key);
    const edge=new THREE.DirectionalLight(0x7faef5,1.6);edge.position.set(4,1,-3);scene.add(edge);
  } catch(error) {environment?.dispose();texture?.dispose();renderer.dispose();renderer.forceContextLoss();throw error;}
  const object=sculpture.group,origin=object.rotation.clone();
  host.appendChild(renderer.domElement);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let disposed=false,frame=0,visible=true,last=0;
  let yaw=origin.y,pitch=origin.x,targetYaw=yaw,targetPitch=pitch,vx=0,vy=0;
  const clampPitch=(value:number)=>Math.max(-1.1,Math.min(1.1,value));
  function invalidate(){if(!disposed&&!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
  function render(now:number){
    frame=0;if(disposed||!visible||document.hidden)return;
    const dt=Math.min((now-last)/1000||1/60,1/30);last=now;
    if(reduced.matches){yaw=targetYaw;pitch=targetPitch;vx=vy=0;}
    else {
      vx+=(targetYaw-yaw)*140*dt;vy+=(targetPitch-pitch)*140*dt;
      vx*=Math.exp(-23*dt);vy*=Math.exp(-23*dt);yaw+=vx*dt;pitch+=vy*dt;
    }
    object.rotation.set(pitch,yaw,origin.z);
    renderer.render(scene,camera);
    if(Math.abs(targetYaw-yaw)+Math.abs(targetPitch-pitch)+Math.abs(vx)+Math.abs(vy)>.0003)invalidate();
  }
  function rotate(horizontal:number,vertical:number){targetYaw+=horizontal;targetPitch=clampPitch(targetPitch+vertical);invalidate();}
  function reset(){targetYaw=origin.y;targetPitch=origin.x;invalidate();}
  function resize(){
    const {width,height}=host.getBoundingClientRect();if(!width||!height)return;
    renderer.setSize(width,height,false);camera.aspect=width/height;
    // Fit tall thermometer and wide valve even in the narrower editorial column.
    const box=new THREE.Box3().setFromObject(object),size=box.getSize(new THREE.Vector3());
    const halfFov=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
    camera.position.z=Math.max(size.y/2/halfFov,size.x/2/halfFov/camera.aspect)*1.35+size.z/2;
    camera.updateProjectionMatrix();invalidate();
  }
  const sizing=new ResizeObserver(resize);sizing.observe(host);
  const intersection=new IntersectionObserver(entries=>{visible=!!entries[0]?.isIntersecting;if(visible){last=0;invalidate();}else{cancelAnimationFrame(frame);frame=0;} });intersection.observe(host);
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{last=0;invalidate();}};
  document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',invalidate);
  let pointer:number|null=null,startX=0,startY=0;
  function down(event:PointerEvent){if(event.button!==0||pointer!==null)return;pointer=event.pointerId;startX=event.clientX;startY=event.clientY;host.setPointerCapture(pointer);}
  function move(event:PointerEvent){
    if(pointer!==event.pointerId)return;
    const dx=event.clientX-startX,dy=event.clientY-startY;startX=event.clientX;startY=event.clientY;
    rotate(dx*.009,event.pointerType==='touch'?0:dy*.007);
  }
  function up(event:PointerEvent){if(pointer!==event.pointerId)return;pointer=null;if(host.hasPointerCapture(event.pointerId))host.releasePointerCapture(event.pointerId);}
  host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);host.addEventListener('lostpointercapture',up);
  const lost=(event:Event)=>{event.preventDefault();dispose();onFailure();};
  renderer.domElement.addEventListener('webglcontextlost',lost);
  function dispose(){
    if(disposed)return;disposed=true;cancelAnimationFrame(frame);
    sizing.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',invalidate);
    host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',up);host.removeEventListener('lostpointercapture',up);
    renderer.domElement.removeEventListener('webglcontextlost',lost);
    const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(sculpture!.materials);
    object.traverse(part=>{if(part instanceof THREE.Mesh||part instanceof THREE.LineSegments){geometries.add(part.geometry);for(const material of Array.isArray(part.material)?part.material:[part.material])materials.add(material);}});
    geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());texture?.dispose();environment?.dispose();
    renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
  }
  resize();return {rotate,reset,dispose};
}
