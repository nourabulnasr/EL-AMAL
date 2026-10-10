import {notFound} from 'next/navigation';
import {Manrope,Newsreader,Noto_Sans_Arabic} from 'next/font/google';
import {isLocale} from '@/lib/catalogue';
import {loadCatalogue} from '@/lib/load-catalogue';
import {copy} from '@/content/copy';
import {BusinessContact} from '@/components/business-contact';
import {SiteSchema} from '@/components/site-schema';
import {indexingEnabled,siteOrigin} from '@/lib/site-policy.mjs';
import {SiteIntro} from '@/components/site-intro';
import {SiteFooter} from '@/components/site-footer';
import {Header} from '@/components/header';
import {customerSettings} from '@/lib/customer-readiness';
import {interestSettings} from '@/lib/product-interest-runtime';
import {BasketProvider} from '@/components/basket-provider';
import './styles.css';
import './refinement.css';
const sans=Manrope({subsets:['latin'],variable:'--font-sans',display:'swap'});
// Headings and the entrance wordmark use the regular cut throughout the site.
const display=Newsreader({subsets:['latin'],variable:'--font-display',display:'swap',weight:'400'});
// Arabic is used only by the Arabic document. CSS loads it there on demand;
// preloading it in this shared layout also downloads 166 KB on English pages.
// One variable face preserves every used weight without repeated declarations.
const arabic=Noto_Sans_Arabic({subsets:['arabic'],variable:'--font-arabic',display:'swap',weight:'variable',preload:false});
export const metadata={metadataBase:new URL(siteOrigin()),robots:{index:indexingEnabled(),follow:indexingEnabled()},title:{default:'EL AMAL | Industrial instrumentation',template:'%s | EL AMAL'},...(process.env.GOOGLE_SITE_VERIFICATION?{verification:{google:process.env.GOOGLE_SITE_VERIFICATION}}:{})};
export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){
 const {locale}=await params;if(!isLocale(locale))notFound();const t=copy[locale];const catalogue=await loadCatalogue();
 // The basket needs identities and names; keep all technical tables server-rendered.
 const basketCatalogue={source:catalogue.source,products:catalogue.products.map(({id,model,name})=>({id,model,name}))};
 return <html lang={locale} dir={locale==='ar'?'rtl':'ltr'} className={`${sans.variable} ${display.variable} ${arabic.variable}`}><body><SiteIntro locale={locale}/><SiteSchema locale={locale}/><a className="skip-link" href="#main-content">{t.skip}</a><BasketProvider key={catalogue.source} catalogue={basketCatalogue} publicEnquiries={!!customerSettings()}><Header locale={locale}/><BusinessContact locale={locale}/><main id="main-content">{children}</main><SiteFooter locale={locale} analyticsEnabled={!!interestSettings()}/></BasketProvider></body></html>;
}
