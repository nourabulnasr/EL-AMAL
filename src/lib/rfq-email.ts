const entities: Record<string, string> = {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'};
const escape = (value: string) => value.replace(/[&<>"']/g, character => entities[character]);

export function rfqEmail(input: {
 locale: 'en' | 'ar';
 heading: string;
 paragraphs: string[];
 action: {label: string; url: string};
}) {
 const {locale, heading, paragraphs, action} = input;
 const direction = locale === 'ar' ? 'rtl' : 'ltr';
 const alignment = locale === 'ar' ? 'right' : 'left';
 const text = [heading, ...paragraphs, `${action.label}\n${action.url}`, 'EL AMAL'].join('\n\n');
 const html = `<!doctype html><html lang="${locale}" dir="${direction}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
 <body style="margin:0;background:#eef2f8;color:#091540;font:16px/1.55 Arial,sans-serif">
 <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:20px 12px">
 <table role="presentation" width="100%" cellspacing="0" cellpadding="0" dir="${direction}" style="max-width:600px;background:#fff;border:1px solid #dae2ef">
 <tr><td align="${alignment}" style="padding:18px 24px;background:#091540;color:#fff;font-size:20px;font-weight:bold">EL AMAL</td></tr>
 <tr><td align="${alignment}" style="padding:24px;overflow-wrap:anywhere">
 <h1 style="margin:0 0 18px;font-size:25px;line-height:1.3">${escape(heading)}</h1>
 ${paragraphs.map(paragraph => `<p dir="auto" style="margin:0 0 16px">${escape(paragraph).replace(/\n/g, '<br>')}</p>`).join('')}
 <a href="${escape(action.url)}" style="display:inline-block;background:#091540;color:#fff;padding:12px 18px;text-decoration:underline;font-weight:bold">${escape(action.label)}</a>
 </td></tr></table></td></tr></table></body></html>`;
 return {text, html};
}
