import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3,Mesh} from 'three';
import {sculptProduct} from '../src/components/product-3d-model.ts';

for(const kind of ['pressure','valve','temperature'])test(`${kind} sculpture has finite geometry within the interactive viewer budget`,()=>{
 const {group,materials}=sculptProduct(kind);
 let triangles=0,meshes=0;
 group.traverse(part=>{
  if(!(part instanceof Mesh))return;
  meshes++;
  const positions=part.geometry.getAttribute('position');
  assert.ok([...positions.array].every(Number.isFinite),'Every vertex must be finite');
  triangles+=(part.geometry.index?.count??positions.count)/3;
 });
 const size=new Box3().setFromObject(group).getSize(new Vector3());
 assert.ok(meshes>5,'A volumetric assembly is required');
 assert.ok(size.x>.5&&size.y>1&&size.z>.2,'The object must have real depth');
 assert.ok(Math.max(size.x,size.y,size.z)<4,'The model fits the bounded camera range');
 assert.ok(triangles<60000,`Triangle budget exceeded: ${triangles}`);
 group.traverse(part=>{if(part instanceof Mesh)part.geometry.dispose();});
 materials.forEach(material=>material.dispose());
});
