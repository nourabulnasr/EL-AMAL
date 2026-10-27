import {siteOrigin} from '@/lib/site-policy.mjs';
import type {Locale} from '@/lib/catalogue';
import {businessContact} from '@/lib/business-contact';
import {buildSiteSchema} from '@/lib/site-schema';
export function SiteSchema({locale}:{locale:Locale}){
 const origin=siteOrigin(),contact=businessContact();
 const schema=buildSiteSchema({locale,origin,contact});
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>;
}
