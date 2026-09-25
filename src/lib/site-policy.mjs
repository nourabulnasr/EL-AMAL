/** @param {Record<string,string|undefined>} env */
export function indexingEnabled(env=process.env){
 return env.SITE_INDEXING_ENABLED==='true'&&env.CATALOGUE_SOURCE==='cms'&&env.VERCEL_ENV==='production';
}
/** @param {Record<string,string|undefined>} env */
export function siteOrigin(env=process.env){
 try{const url=new URL(env.SITE_URL||'https://el-amal-sigma.vercel.app');if(url.protocol==='https:'&&!url.username&&!url.password)return url.origin;}catch{}
 return 'https://el-amal-sigma.vercel.app';
}
