import Image from '../(site)/[locale]/opengraph-image';

// A stable URL for nested-page metadata; Next's file-convention URL includes a generated suffix.
export const dynamic='force-static';
export function GET(){return Image();}
