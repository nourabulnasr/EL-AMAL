import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

// Uses the Codex bundled package directory supplied by the dependency loader.
const bundle=process.argv[2];
if(!bundle)throw new Error('Pass the bundled Node package directory.');
const {marked}=await import(pathToFileURL(resolve(bundle,'marked/lib/marked.esm.js')).href);
const root=dirname(fileURLToPath(import.meta.url));
const chapterFiles=['overview.md','frontend-chapters.md','admin-chapters.md','backend-chapters.md','remaining-and-reference.md','post-handbook-update.md'];
let content=(await Promise.all(chapterFiles.map(async (x,i)=>{
 let chapter=await readFile(resolve(root,x),'utf8');
 if(i>0 && i<4)chapter=chapter.replace(/^(#{1,5}) (.+)$/gm,(_,hash,title)=>hash+'# '+title);
 return chapter;
}))).join('\n\n');
content=content.replace(/^(#{1,6}) (.+)$/gm,(_,hash,title)=>hash+' '+title.replace(/^(\d+)[.)]\s*/,'$1 ').replace(/^Appendix ([A-Z])\./,'Appendix $1').replace(/[—–]/g,' ').replace(/[:?,]/g,'').replace(/\s+/g,' ').trim());
// Keep one document title. Individual chapter titles become top level chapters.
let firstTitle=true;
content=content.replace(/^# (.+)$/gm,(_,s)=>{if(firstTitle){firstTitle=false;return '# '+s;}return '## '+s;});
await writeFile(resolve(root,'EL-AMAL-Website-Handbook.md'),content);
const tokens=marked.lexer(content);
const intermediate=resolve(root,'../../artifacts/handbook');
await mkdir(intermediate,{recursive:true});
await writeFile(resolve(intermediate,'handbook-tokens.json'),JSON.stringify(tokens,null,2));
const headings=[];let number=0;
const renderer=new marked.Renderer();
renderer.heading=function(token){
 const id='section-'+(++number);if(token.depth<=3)headings.push({text:token.text,id,depth:token.depth});
 return `<h${token.depth} id="${id}">${this.parser.parseInline(token.tokens)}</h${token.depth}>`;
};
renderer.code=function(token){
 if(token.lang==='mermaid')return '<figure aria-label="Application data flow"><svg viewBox="0 0 900 290" role="img" aria-labelledby="flow-title" style="max-width:100%;height:auto"><title id="flow-title">Public and private application paths</title>'+[
 ['Visitors','Public pages','Reviewed catalogue','Neon database'],
 ['Staff','Admin and staff tools','Permission checks','Neon database'],
 ['Customer requests','Guarded intake','Enquiry and queues','Gated until ready'],
 ['Scheduler','Operations runner','Delivery queues','Email adapter gated']
 ].map((row,r)=>row.map((label,c)=>`<rect x="${c*225}" y="${r*70}" width="200" height="48" rx="3" fill="${r===2||c===3&&r===3?'#f1f3f7':'#091540'}"/><text x="${c*225+100}" y="${r*70+29}" fill="${r===2||c===3&&r===3?'#16233b':'white'}" font-family="Arial,sans-serif" font-size="14" text-anchor="middle">${label}</text>${c<3?`<path d="M${c*225+204} ${r*70+24}h16l-4 -4m4 4l-4 4" fill="none" stroke="#a65b00" stroke-width="2"/>`:''}`).join('')).join('')+'</svg><figcaption>Customer submission and email depend on activation. Reading the catalogue and authorized staff tools is already live.</figcaption></figure>';
 return `<pre><code>${token.text.replaceAll('&','&amp;').replaceAll('<','&lt;')}</code></pre>`;
};
let body=marked.parser(tokens,{renderer});
body=body.replace(/<table>/g,'<div class="table-scroll" tabindex="0" role="region" aria-label="Reference table"><table>').replace(/<\/table>/g,'</table></div>');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const links=headings.filter(h=>h.depth>=2).map(h=>`<a style="${h.depth===3?'padding-left:12px;font-size:12px':''}" href="#${h.id}">${esc(h.text)}</a>`).join('');
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>EL AMAL website delivery and administration handbook</title><style>
:root{--navy:#010736;--surface:#091540;--orange:#ffb447;--ink:#17243a;--muted:#4a5b72}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:30px}body{overflow-wrap:anywhere;margin:0;color:var(--ink);background:#f4f6fa;font:17px/1.7 "Segoe UI",Arial,sans-serif}a{color:#174674;text-underline-offset:3px;overflow-wrap:anywhere}a:focus-visible,button:focus-visible,summary:focus-visible,.table-scroll:focus-visible{outline:3px solid #c26a00;outline-offset:4px}.skip{position:fixed;left:1rem;top:-100px;background:white;z-index:9;padding:12px}.skip:focus{top:1rem}aside{position:fixed;inset:0 auto 0 0;width:285px;background:var(--navy);color:white;overflow:auto;padding:32px 24px}.brand{font-size:28px;letter-spacing:.03em;font-weight:650}.version{color:var(--orange);font-size:13px;margin:12px 0 24px}aside a{display:block;color:#e6ebff;text-decoration:none;font-size:13px;line-height:1.45;padding:9px 0;border-bottom:1px solid #ffffff18}aside a:hover{color:var(--orange)}main{margin-left:285px;padding:64px clamp(28px,5vw,82px);max-width:1370px;background:white;min-height:100vh}h1{font-family:Georgia,serif;color:var(--navy);font-weight:400;font-size:clamp(34px,4vw,60px);line-height:1.08;max-width:940px;margin:0 0 32px}h2{font-family:Georgia,serif;font-weight:400;font-size:32px;line-height:1.25;color:var(--navy);margin:58px 0 18px}h3{font-size:22px;line-height:1.3;margin:34px 0 12px}h4{font-size:18px;margin:25px 0 10px}p{max-width:85ch}li{margin:8px 0}table{border-collapse:collapse;width:100%;font-size:14px;line-height:1.55}th{background:var(--surface);color:white;text-align:left}td,th{padding:12px 14px;border:1px solid #d6deea;vertical-align:top}tbody tr:nth-child(even){background:#f2f5f9}.table-scroll{overflow:auto;margin:22px 0;max-width:100%}code{font:14px/1.5 Consolas,monospace;background:#f0f3f7;padding:1px 4px;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f0f3f7;border-left:3px solid #b86700;padding:16px}pre code{padding:0}blockquote{margin:24px 0;padding:10px 22px;border-left:3px solid #b86700;background:#f7f8fb}.tools{display:flex;gap:15px;flex-wrap:wrap;margin:0 0 36px}.tools button,.tools a{background:var(--navy);color:white;border:0;padding:12px 18px;font:inherit;font-size:14px;text-decoration:none;cursor:pointer}summary{cursor:pointer}.mobile-toc{display:none}strong{color:#0f213d}@media(max-width:850px){aside{display:none}main{margin:0;padding:28px 20px}.mobile-toc{display:block;margin:22px 0}.mobile-toc a{display:block;padding:6px 0;font-size:14px}h2{font-size:28px;margin-top:42px}table{min-width:590px}h1{font-size:38px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}@media print{aside,.tools,.mobile-toc,.skip{display:none}body,main{background:white}main{margin:0;padding:0;max-width:none}h1{font-size:30pt}h2{font-size:20pt;break-after:avoid}h3,h4{break-after:avoid}body{font-size:10pt}table{font-size:8pt}thead{display:table-header-group}tr{break-inside:avoid}.table-scroll{overflow:visible}a{color:inherit}pre{white-space:pre-wrap}}
</style></head><body><a class="skip" href="#content">Skip to handbook</a><aside aria-label="Handbook navigation"><div class="brand">EL AMAL</div><div class="version">Website handbook<br>29 September 2026</div><nav>${links}</nav></aside><main id="content"><div class="tools"><a href="EL-AMAL-Website-Handbook.pdf">Download PDF</a><a href="EL-AMAL-Website-Handbook.md">Editable source</a><button onclick="window.print()">Print</button></div><details class="mobile-toc"><summary>Contents</summary><nav aria-label="Mobile handbook navigation">${links}</nav></details>${body}</main></body></html>`;
await writeFile(resolve(root,'EL-AMAL-Website-Handbook.html'),html);
console.log(JSON.stringify({chapters:chapterFiles.length,words:content.split(/\s+/).length,headings:headings.length,htmlBytes:Buffer.byteLength(html)}));
