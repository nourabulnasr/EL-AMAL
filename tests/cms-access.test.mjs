import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Staff, Products, SKUs} from '../src/cms/collections.ts';

const context = role => ({req:{user:role?{id:42,role}:null}});

test('only owners create staff or change supplied SKU definitions',()=>{
  for(const role of [null,'catalogue-editor','sales','warehouse','unknown']) {
    assert.equal(Staff.access.create(context(role)),false);
    assert.equal(Staff.access.update(context(role)),false);
    assert.equal(SKUs.access.create(context(role)),false);
    assert.equal(SKUs.access.update(context(role)),false);
  }
  assert.equal(Staff.access.create(context('owner')),true);
  assert.equal(SKUs.access.create(context('owner')),true);
});

test('anonymous catalogue reads are restricted to published products',()=>{
  assert.deepEqual(Products.access.read(context(null)),{_status:{equals:'published'}});
  assert.equal(SKUs.access.read(context(null)),false);
});

test('catalogue editors cannot forge review metadata when creating or updating products',()=>{
  for(const name of ['reviewedBy','reviewedAt','rightsConfirmed']) {
    const field=Products.fields.find(field=>field.name===name);
    for(const operation of ['create','update']) {
      assert.equal(field.access?.[operation]?.(context('catalogue-editor'))??true,false,`${name} ${operation}`);
      assert.equal(field.access?.[operation]?.(context('owner'))??true,true);
    }
  }
});

test('publication hook rejects editor publishing and owner publishing without review',()=>{
  const hook=Products.hooks.beforeChange[0];
  assert.throws(()=>hook({...context('catalogue-editor'),data:{_status:'published'}}));
  assert.throws(()=>hook({...context('owner'),data:{_status:'published'}}));
  const data={_status:'published',name:{en:'Gauge',ar:'مقياس'},description:{en:'Reviewed',ar:'تمت المراجعة'},sourceRef:'catalogue:1',reviewedBy:42,reviewedAt:'2026-09-17T10:00:00Z',rightsConfirmed:true};
  assert.equal(hook({...context('owner'),data}),data);
});
