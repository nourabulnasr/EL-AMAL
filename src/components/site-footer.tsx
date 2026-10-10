import Link from 'next/link';
import type {Locale} from '@/lib/catalogue';
import {copy} from '@/content/copy';
import {businessEmail} from '@/lib/business-contact';
import {IntroReplay} from './site-intro';
import {ProductAnalyticsChoice} from './product-analytics-choice';

export function SiteFooter({locale,analyticsEnabled}:{locale:Locale;analyticsEnabled:boolean}) {
  const ar=locale==='ar',t=copy[locale];
  return <footer className="site-footer">
    <div><Link className="footer-brand" href={`/${locale}`}>EL AMAL</Link><p>{t.footer}</p></div>
    <div className="footer-links">
      <Link href={`/${locale}/products`}>{t.catalogue}</Link>
      <Link href={`/${locale}/quote`}>{t.quote}</Link>
      <Link href={`/${locale}/about`}>{ar?'من نحن':'About us'}</Link>
      <Link href={`/${locale}/resources`}>{ar?'الموارد':'Resources'}</Link>
      <Link href={`/${locale}/contact`}>{ar?'تواصل معنا':'Contact'}</Link>
    </div>
    <div className="footer-contact">
      <p>{ar?'لنتحدث عن متطلباتك.':'Let’s talk about your requirements.'}</p>
      <a className="footer-email" href={`mailto:${businessEmail}`}><bdi>{businessEmail}</bdi><span aria-hidden="true">↗</span></a>
    </div>
    <IntroReplay locale={locale}/>
    {analyticsEnabled&&<ProductAnalyticsChoice locale={locale}/>}
    <div className="footer-bottom"><span>© {new Date().getFullYear()} EL AMAL</span><span>{ar?'العربية والإنجليزية':'English & Arabic'}</span></div>
  </footer>;
}
