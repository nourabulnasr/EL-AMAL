import Image from 'next/image';
import Link from 'next/link';
import type {Locale} from '@/lib/catalogue';
import {PrecisionDepth} from './precision-depth';
import './precision-hero.css';

/** The selected sculpture is brand illustration, never a product specification. */
export function PrecisionHero({locale}: {locale: Locale}) {
  const ar = locale === 'ar';
  return <section className="precision-hero" aria-labelledby="precision-title">
    <PrecisionDepth locale={locale}>
      <div className="precision-image">
        <Image src="/images/precision-revealed.webp" alt="" fill sizes="100vw"
          loading="eager" fetchPriority="high" quality={75} />
      </div>
    </PrecisionDepth>
    <div className="precision-shade" aria-hidden="true" />
    <div className="precision-copy">
      <p className="precision-eyebrow"><span aria-hidden="true" />{ar ? 'الدقة في كل عملية' : 'Precision in every process'}</p>
      <h1 id="precision-title">{ar ? <>الدقة.<br /><em>بكل تفاصيلها.</em></> : <>Precision.<br /><em>Revealed.</em></>}</h1>
      <p className="precision-description">{ar
        ? 'الضغط. الحرارة. التحكم. أجهزة قياس صناعية تساعدك على اتخاذ القرار المناسب لعملياتك.'
        : <>Pressure. Temperature. Control.<br />Industrial instruments for the decisions<br className="precision-desktop-break" /> that keep your operation moving.</>}</p>
      <div className="precision-actions">
        <Link className="button precision-primary" href={`/${locale}/products`}>{ar ? 'اكتشف أجهزة القياس' : 'Explore instruments'}<span aria-hidden="true">↗</span></Link>
        <Link className="precision-secondary" href={`/${locale}/rfq`}>{ar ? 'اطلب عرض سعر' : 'Request a quotation'}<span aria-hidden="true">↗</span></Link>
      </div>
    </div>
    <p className="precision-caption">{ar ? 'تصوّر للدقة' : 'A study in precision'}<span>{ar ? 'رسم تصوّري، وليس مخططاً هندسياً للمنتج' : 'Concept illustration, not a product diagram'}</span></p>
    <div className="precision-footer">
      <span>{ar ? 'الضغط / الحرارة / الملحقات' : 'Pressure / Temperature / Accessories'}</span>
      <a href="#catalogue">{ar ? 'اكتشف المزيد' : 'Explore below'}<span aria-hidden="true">↓</span></a>
    </div>
  </section>;
}
