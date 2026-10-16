import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {FeaturedKind} from '@/lib/featured-products';

/** Editorial geometry based on the supplied photographs, not a dimensional/CAD model. */
export function sculptProduct(kind:FeaturedKind,face?:THREE.Texture) {
  const group=new THREE.Group();
  const steel=new THREE.MeshStandardMaterial({color:0xcbd3da,metalness:.94,roughness:.25});
  const brushed=new THREE.MeshStandardMaterial({color:0xa5b1bc,metalness:.85,roughness:.38});
  const dark=new THREE.MeshStandardMaterial({color:0x16243c,metalness:.55,roughness:.3});
  const blue=new THREE.MeshStandardMaterial({color:0x2b5d9b,metalness:.42,roughness:.27});
  const red=new THREE.MeshStandardMaterial({color:0xa42732,metalness:.3,roughness:.32});
  // Keep printed markings legible instead of bleaching them with studio lighting.
  const faceMaterial=new THREE.MeshBasicMaterial({color:face?0xffffff:0xf5f4eb,map:face??null,toneMapped:false});
  function mesh(geometry:THREE.BufferGeometry,material:THREE.Material,x=0,y=0,z=0) {
    const part=new THREE.Mesh(geometry,material);part.position.set(x,y,z);group.add(part);return part;
  }
  function cylinder(radius:number,length:number,x:number,y:number,z:number,material=steel,axis:'x'|'y'|'z'='y',segments=48) {
    const part=mesh(new THREE.CylinderGeometry(radius,radius,length,segments),material,x,y,z);
    if(axis==='z')part.rotation.x=Math.PI/2;
    if(axis==='x')part.rotation.z=Math.PI/2;
    return part;
  }
  function ring(radius:number,tube:number,x:number,y:number,z:number,material=steel,axis:'x'|'y'|'z'='z') {
    const part=mesh(new THREE.TorusGeometry(radius,tube,10,64),material,x,y,z);
    if(axis==='y')part.rotation.x=Math.PI/2;
    if(axis==='x')part.rotation.y=Math.PI/2;
    return part;
  }
  function thread(radius:number,length:number,x:number,y:number,z:number,axis:'x'|'y'='y') {
    cylinder(radius,length,x,y,z,brushed,axis);
    for(let i=-3;i<=3;i++)ring(radius,.012,x+(axis==='x'?i*length/8:0),y+(axis==='y'?i*length/8:0),z,steel,axis);
  }
  function dial(radius:number,y:number) {
    cylinder(radius,.29,0,y,0,brushed,'z');
    cylinder(radius*.98,.1,0,y,.14,steel,'z');
    ring(radius*.94,.057,0,y,.21);
    ring(radius*.87,.024,0,y,.224,dark);
    mesh(new THREE.CircleGeometry(radius*.86,64),faceMaterial,0,y,.22);
    // The stationary pointer is decorative; the site makes no live-reading claim.
    const needle=new THREE.Shape();needle.moveTo(-.032,.12);needle.lineTo(.027,.12);needle.lineTo(.012,-radius*.66);needle.closePath();
    const hand=mesh(new THREE.ShapeGeometry(needle),dark,0,y,.239);hand.rotation.z=-.88;
    cylinder(.065,.025,0,y,.25,dark,'z');
    cylinder(radius*.75,.045,0,y,-.165,brushed,'z');
  }
  if(kind==='valve') {
    // IV2: one main pressure block, opposing isolation / bleed handles.
    mesh(new RoundedBoxGeometry(.54,1.32,.52,2,.055),steel,0,.12,0);
    cylinder(.25,.15,0,.84,0,steel,'y',6);
    cylinder(.19,.16,0,-.62,0,steel,'y',6);
    thread(.14,.34,0,-.86,0);
    for(const side of [-1,1]) {
      const y=side===-1?-.24:.44;
      cylinder(.18,.2,side*.35,y,0,steel,'x',6);
      cylinder(.125,.23,side*.56,y,0,brushed,'x');
      cylinder(.11,.12,side*.73,y,0,side===-1?blue:red,'x');
      cylinder(.067,.14,side*.85,y,0,steel,'x');
      cylinder(.047,.67,side*.94,y,0,steel);
      cylinder(.06,.04,side*.94,y-.33,0,brushed);
      cylinder(.06,.04,side*.94,y+.33,0,brushed);
    }
    cylinder(.092,.055,0,.04,.29,brushed,'z',6);
    mesh(new THREE.BoxGeometry(.07,.012,.007),dark,0,.04,.322).rotation.z=.6;
    group.rotation.set(.1,-.4,-.12);
  } else if(kind==='pressure') {
    dial(.91,.28);
    cylinder(.2,.17,0,-.73,0,steel,'y',6);
    thread(.145,.35,0,-.98,0);
    cylinder(.055,.075,0,1.22,0,blue);
    group.rotation.set(-.08,-.3,-.1);
  } else {
    dial(.66,.77);
    // Model 55 silhouette: adjustable head and slender insertion stem.
    cylinder(.16,.3,0,.25,-.12,brushed,'z');
    cylinder(.11,.47,0,-.02,-.21,steel);
    cylinder(.17,.2,0,-.31,-.21,steel,'y',6);
    cylinder(.12,.14,0,-.48,-.21,steel);
    thread(.115,.18,0,-.62,-.21);
    cylinder(.043,.77,0,-1.1,-.21,brushed);
    mesh(new THREE.SphereGeometry(.043,16,8),brushed,0,-1.49,-.21);
    group.rotation.set(.02,-.4,.14);
  }
  // Dispose unused alternatives too, not only materials reached through meshes.
  return {group,materials:[steel,brushed,dark,blue,red,faceMaterial]};
}
