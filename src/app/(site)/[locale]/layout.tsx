import {notFound} from 'next/navigation';
import Link from 'next/link';
import {Manrope,Newsreader,Noto_Sans_Arabic} from 'next/font/google';
import {isLocale} from '@/lib/catalogue';
import {loadCatalogue} from '@/lib/load-catalogue';
import {copy} from '@/content/copy';
import {BusinessContact} from '@/components/business-contact';
import {SiteSchema} from '@/components/site-schema';
import {indexingEnabled,siteOrigin} from '@/lib/site-policy.mjs';
import {Header} from '@/components/header';
import {BasketProvider} from '@/components/basket-provider';
import './styles.css';
const sans=Manrope({subsets:['latin'],variable:'--font-sans',display:'swap'});
const display=Newsreader({subsets:['latin'],variable:'--font-display',display:'swap'});
const arabic=Noto_Sans_Arabic({subsets:['arabic'],variable:'--font-arabic',display:'swap',weight:['400','500','600','700']});
export const metadata={metadataBase:new URL(siteOrigin()),robots:{index:indexingEnabled(),follow:indexingEnabled()},title:{default:'EL AMAL | Industrial instrumentation',template:'%s | EL AMAL'}};
export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){
 const {locale}=await params;if(!isLocale(locale))notFound();const t=copy[locale];const catalogue=await loadCatalogue();
 return <html lang={locale} dir={locale==='ar'?'rtl':'ltr'} className={`${sans.variable} ${display.variable} ${arabic.variable}`}><body><SiteSchema locale={locale}/><a className="skip-link" href="#main-content">{t.skip}</a><BasketProvider key={catalogue.source} catalogue={catalogue}><Header locale={locale}/><BusinessContact locale={locale}/><main id="main-content">{children}</main><footer className="site-footer"><div><Link className="footer-brand" href={`/${locale}`}>EL AMAL</Link><p>{t.footer}</p></div><div className="footer-links"><Link href={`/${locale}/products`}>{t.catalogue}</Link><Link href={`/${locale}/quote`}>{t.quote}</Link><Link href={`/${locale}#approach`}>{t.about}</Link></div><div className="footer-bottom"><span>© {new Date().getFullYear()} EL AMAL</span><span>{locale==='en'?'English & Arabic':'العربية والإنجليزية'}</span></div></footer></BasketProvider></body></html>;
}
