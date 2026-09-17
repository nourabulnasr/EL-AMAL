import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hasRole,canPublish} from '../src/lib/access.ts';
test('anonymous and unknown roles never gain staff privileges',()=>{
 for(const user of [null,undefined,{}, {role:'administrator'},{role:'catalogue-editor'}]) assert.equal(hasRole(user,['owner','warehouse']),false);
 assert.equal(hasRole({role:'owner'},['owner']),true);
});
test('publication requires a reviewer, both languages and source evidence',()=>{
 const reviewed={name:{en:'Pressure',ar:'ضغط'},description:{en:'Instrument',ar:'أداة'},sourceRef:'page-1',reviewedBy:1,reviewedAt:'2026-09-17T10:00:00Z',rightsConfirmed:true};
 assert.equal(canPublish(reviewed),true);
 assert.equal(canPublish({...reviewed,name:{en:'Pressure',ar:''}}),false);
 assert.equal(canPublish({...reviewed,reviewedBy:null}),false);
 assert.equal(canPublish({...reviewed,sourceRef:''}),false);
 assert.equal(canPublish({...reviewed,rightsConfirmed:false}),false);
});
