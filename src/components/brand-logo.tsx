import Image from 'next/image';

/** Keep the supplied artwork intact and reserve its space before it loads. */
export function BrandLogo({placement}: {placement: 'header' | 'footer' | 'intro'}) {
  const sizes = placement === 'intro'
    ? '(min-width: 768px) 560px, 76vw'
    : placement === 'footer' ? '224px' : '(min-width: 1024px) 176px, 144px';

  return <Image className={`brand-logo brand-logo-${placement}`}
    src="/brand/el-amal-logo.png" alt="EL AMAL" width={756} height={181}
    sizes={sizes} loading={placement === 'footer' ? 'lazy' : 'eager'}/>;
}
