import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,sep,extname} from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png'};
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    const pathname=decodeURIComponent(url.pathname);
    const file=resolve(root,`.${pathname==='/'?'/index.html':pathname}`);
    if(!file.startsWith(resolve(root)+sep)||!types[extname(file)]){res.writeHead(404);res.end();return;}
    const content=await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'});res.end(content);
  }catch{res.writeHead(404);res.end();}
}).listen(3012,'127.0.0.1',()=>console.log('EL AMAL design review: http://127.0.0.1:3012'));
