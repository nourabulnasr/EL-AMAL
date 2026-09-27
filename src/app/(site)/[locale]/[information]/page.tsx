import Link from "next/link";
import { notFound } from "next/navigation";
import { informationPages, isInformationPage } from "@/content/information";
import { isLocale } from "@/lib/catalogue";
import { pageMetadata } from "@/lib/page-metadata";
import { siteOrigin } from "@/lib/site-policy.mjs";
import { businessContact } from "@/lib/business-contact";
import { customerSettings } from "@/lib/customer-readiness";
import { WikaEvidence } from "@/components/wika-evidence";
type Props = { params: Promise<{ locale: string; information: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale, information } = await params;
  if (!isLocale(locale) || !isInformationPage(information)) notFound();
  const t = informationPages[information][locale];
  return pageMetadata(locale, `/${information}`, t.title, t.intro);
}
export default async function Page({ params }: Props) {
  const { locale, information } = await params;
  if (!isLocale(locale) || !isInformationPage(information)) notFound();
  const ar = locale === "ar",
    t = informationPages[information][locale],
    contact = businessContact(),
    origin = siteOrigin();
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type":
          information === "about"
            ? "AboutPage"
            : information === "contact"
              ? "ContactPage"
              : "WebPage",
        "@id": `${origin}/${locale}/${information}#page`,
        url: `${origin}/${locale}/${information}`,
        name: t.title,
        description: t.intro,
        inLanguage: ar ? "ar-EG" : "en",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: ar ? "الرئيسية" : "Home",
            item: `${origin}/${locale}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: t.title,
            item: `${origin}/${locale}/${information}`,
          },
        ],
      },
    ],
  };
  return (
    <>
      <section className="information-hero">
        <nav
          className="breadcrumb"
          aria-label={ar ? "مسار الصفحة" : "Breadcrumb"}
        >
          <Link href={`/${locale}`}>{ar ? "الرئيسية" : "Home"}</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{t.title}</span>
        </nav>
        <p className="section-kicker">{t.eyebrow}</p>
        <div className="information-lead">
          <h1>{t.headline}</h1>
          <div>
            <p>{t.intro}</p>
            <Link className="text-link" href={`/${locale}/rfq`}>
              {ar ? "إعداد طلب عرض سعر" : "Prepare an RFQ"}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
      <section
        className="section information-body"
        aria-labelledby="information-heading"
      >
        <div className="information-aside">
          <p className="section-kicker">
            {ar ? "التفاصيل أولاً" : "Details first"}
          </p>
          <h2 id="information-heading">{t.sectionTitle}</h2>
          <span className="information-rule" aria-hidden="true" />
        </div>
        <ol className="information-steps" role="list">
          {t.sections.map((section, i) => (
            <li role="listitem" key={section.title}>
              <span className="information-number" aria-hidden="true">
                0{i + 1}
              </span>
              <div>
                <h3>{section.title}</h3>
                <p>{section.body}</p>
                {section.items && (
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
      {information === "about" && <WikaEvidence locale={locale} />}
      {information === "contact" && (
        <section
          className="section information-contact"
          aria-labelledby="contact-options"
        >
          <h2 id="contact-options">
            {ar ? "خطوتك التالية" : "Your next step"}
          </h2>
          <p>
            {customerSettings()
              ? ar
                ? "يمكنك إرسال طلبك من نموذج عرض السعر وتأكيد بريدك الإلكتروني."
                : "You can submit your requirement through the RFQ form and confirm your email."
              : ar
                ? "الموقع حالياً للمعاينة. يمكنك تجهيز التفاصيل ومراجعة النموذج؛ إرسال الطلبات للزوار غير مفعّل بعد."
                : "The website is currently a preview. You can prepare your details and review the form; visitor submission is not enabled yet."}
          </p>
          <div className="information-actions">
            <Link className="button button-dark" href={`/${locale}/rfq`}>
              {ar ? "فتح نموذج عرض السعر" : "Open RFQ form"}
              <span aria-hidden="true">↗</span>
            </Link>
            {contact.phone && (
              <a className="button button-dark" href={`tel:${contact.phone}`}>
                {ar ? "اتصل بنا" : "Call us"} <bdi>{contact.phone}</bdi>
              </a>
            )}
            {contact.whatsapp && (
              <a
                className="button button-dark"
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ar ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </section>
      )}
      <section className="information-closing section">
        <h2>{t.closing}</h2>
        <div className="information-actions">
          <Link className="button button-dark" href={`/${locale}/products`}>
            {ar ? "تصفح الكتالوج" : "Explore the catalogue"}
            <span aria-hidden="true">↗</span>
          </Link>
          <Link
            className="text-link"
            href={`/${locale}/${information === "resources" ? "rfq" : "resources"}`}
          >
            {information === "resources"
              ? ar
                ? "إعداد طلب عرض سعر"
                : "Prepare an RFQ"
              : ar
                ? "قائمة تجهيز الاستفسار"
                : "Enquiry checklist"}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\u003c"),
        }}
      />
    </>
  );
}
