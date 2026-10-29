import {test} from 'node:test';
import assert from 'node:assert/strict';
import {canAccessStaffWorkspace,staffWorkspaceSections} from '../src/lib/staff-workspace.ts';

test('owner workspace is limited to owner and sales staff records',()=>{
 for(const role of ['owner','sales'])assert.equal(canAccessStaffWorkspace({id:1,collection:'staff',role}),true);
 for(const user of [null,{id:1,collection:'staff',role:'warehouse'},{id:1,collection:'customers',role:'owner'},{id:0,collection:'staff',role:'owner'}])assert.equal(canAccessStaffWorkspace(user),false);
});

test('workspace routes every operational question to its authoritative protected screen',()=>{
 const sections=staffWorkspaceSections();
 const links=sections.flatMap(section=>section.actions.map(action=>action.href));
 for(const href of ['/admin/collections/enquiries','/admin/collections/enquiry-attachments','/admin/collections/verification-emails','/admin/collections/notifications','/staff/inventory','/staff/reports','/staff/products'])assert.ok(links.includes(href),href);
 assert.equal(new Set(links).size,links.length);
 const enquiry=sections.find(section=>section.id==='enquiries');
 assert.match(enquiry.guidance,/immutable/i);assert.match(enquiry.guidance,/files/i);
 const email=sections.find(section=>section.id==='delivery');
 assert.match(email.guidance,/provider accepted/i);assert.match(email.guidance,/Inbox/i);
});
