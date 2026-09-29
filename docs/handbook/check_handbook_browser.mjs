import {writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const {chromium}=await import(pathToFileURL(resolve(process.argv[2],'playwright/index.mjs')).href);
const browser=await chromium.launch({headless:true,channel:'msedge'});
const errors=[];const checks=[];
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(resolve(root,'EL-AMAL-Website-Handbook.html')).href);
  await page.screenshot({path:resolve(root,`../../artifacts/handbook/browser-${width}.png`)});
  checks.push({width,headings:await page.locator('h2,h3').count(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  if(checks.at(-1).overflow)checks.at(-1).overflowElements=await page.evaluate(()=>[...document.querySelectorAll('main *')].filter(el=>el.getBoundingClientRect().right>innerWidth&&!el.closest('.table-scroll')).map(el=>({tag:el.tagName,text:el.textContent.slice(0,120),right:Math.round(el.getBoundingClientRect().right)})).slice(0,12));
  if(width===390){await page.locator('summary').click();await page.locator('.mobile-toc a').nth(8).click();}
  else await page.locator('aside a').nth(8).click();
  checks.at(-1).navigation=await page.evaluate(()=>location.hash.length>1);
  await page.close();
 }
}finally{await browser.close();}
await writeFile(resolve(root,'../../artifacts/handbook/browser-check.json'),JSON.stringify({checks,errors},null,2));
console.log(JSON.stringify({checks,errors}));
if(errors.length||checks.some(x=>x.overflow||!x.navigation))process.exitCode=1;
