// Read-only checks against server HTML. No browser, login, cookies, or secret output.
const decode=value=>value.replace(/&(?:amp|quot|apos|lt|gt|nbsp|#\d+|#x[\da-f]+);/gi,entity=>{
 const named={'&amp;':'&','&quot;':'"','&apos;':"'",'&lt;':'<','&gt;':'>','&nbsp;':' '};
 return named[entity.toLowerCase()]??String.fromCodePoint(Number.parseInt(entity.slice(entity[2]?.toLowerCase()==='x'?3:2,-1),entity[2]?.toLowerCase()==='x'?16:10));
});
const attributes=tag=>Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(match=>[match[1].toLowerCase(),decode(match[2]??match[3])]));
export const extractSitemapUrls=xml=>[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>decode(match[1]));

export function publicAuditUrl(value,origin){
 try{
  const url=new URL(value,origin);
  if(url.origin!==origin||!/^\/(en|ar)(?:\/(?:products(?:\/[^/]+)?|categories\/[^/]+|industries\/(?:oil-gas|general-industry)|about|contact|resources))?$/.test(url.pathname))return null;
  if([...url.searchParams].some(([key])=>key!=='page'))return null;
  for(const [key,value] of [...url.searchParams])if(!value)url.searchParams.delete(key);
  if(url.searchParams.has('page')&&!/^[1-9]\d*$/.test(url.searchParams.get('page')))return null;
  if(url.searchParams.get('page')==='1')url.searchParams.delete('page');
  url.hash='';return url.href;
 }catch{return null;}
}

export function inspectPage({html,url,status,robotsHeader='',expectIndexable=true}){
 const issues=[],parsed=new URL(url),locale=parsed.pathname.split('/')[1];
 const schemas=[];
 for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  if(attributes(match[1]).type!=='application/ld+json')continue;
  try{const schema=JSON.parse(match[2]);schemas.push(...(Array.isArray(schema)?schema:schema['@graph']??[schema]));}catch{issues.push('invalid-jsonld');}
 }
 const markup=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
 const metas=[...markup.matchAll(/<meta\b[^>]*>/gi)].map(match=>attributes(match[0]));
 const links=[...markup.matchAll(/<link\b[^>]*>/gi)].map(match=>attributes(match[0]));
 const meta=name=>metas.filter(item=>(item.name??item.property)?.toLowerCase()===name).map(item=>item.content??'');
 const title=decode(markup.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]??'');
 const description=meta('description')[0]??'';
 const canonical=links.filter(item=>item.rel==='canonical').map(item=>item.href);
 const alternates=Object.fromEntries(links.filter(item=>item.rel==='alternate'&&item.hreflang).map(item=>[item.hreflang,item.href]));
 const robots=[robotsHeader,...meta('robots'),...meta('googlebot')].join(',');
 if(status!==200)issues.push('http-status');
 if(!title.trim())issues.push('title');
 if(!description.trim())issues.push('description');
 if(canonical.length!==1||canonical[0]!==url)issues.push('canonical');
 for(const language of ['en','ar','x-default']){
  const expected=new URL(url);expected.pathname=expected.pathname.replace(/^\/(en|ar)/,`/${language==='x-default'?'en':language}`);
  if(alternates[language]!==expected.href)issues.push(`hreflang-${language}`);
 }
 const htmlAttributes=attributes(markup.match(/<html\b[^>]*>/i)?.[0]??'');
 if(htmlAttributes.lang!==locale)issues.push('html-language');
 if(htmlAttributes.dir!==(locale==='ar'?'rtl':'ltr'))issues.push('html-direction');
 if((markup.match(/<h1(?:\s|>)/gi)??[]).length!==1)issues.push('h1');
 const noindex=/\b(?:noindex|none)\b/i.test(robots);
 if(expectIndexable&&noindex)issues.push('noindex');
 if(!expectIndexable&&!noindex)issues.push('missing-noindex');
 for(const key of ['og:title','og:description','og:image','twitter:card','twitter:image'])if(!meta(key)[0])issues.push(key);
 if(meta('og:url')[0]!==url)issues.push('og:url');
 if(!links.some(link=>link.rel==='icon'))issues.push('favicon-link');
 if(!schemas.length)issues.push('structured-data');
 const product=schemas.find(schema=>schema['@type']==='Product');
 if(/\/products\/[^/]+$/.test(parsed.pathname)){
  if(!product)issues.push('product-schema');
  else{if(!product.image)issues.push('product-image');if(!product.manufacturer?.name)issues.push('product-manufacturer');}
 }
 return {url,status,title,description,canonical:canonical[0]??null,alternates,robots,schemaTypes:schemas.map(schema=>schema['@type']),issues,
  links:[...markup.matchAll(/<a\b[^>]*>/gi)].map(match=>attributes(match[0]).href).filter(Boolean).flatMap(href=>{try{return [new URL(href,url).href];}catch{return [];}}),
  assets:[...meta('og:image'),...meta('twitter:image'),...(product?.image?[product.image]:[]),...links.filter(link=>link.rel==='icon').map(link=>new URL(link.href,url).href)],
 };
}
