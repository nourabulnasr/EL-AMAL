const entities: Record<string, string> = {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'};
const escape = (value: string) => value.replace(/[&<>"']/g, character => entities[character]);

export function rfqEmail(input: {
 locale: 'en' | 'ar';
 heading: string;
 paragraphs: string[];
 action: {label: string; url: string};
 reference?: string;
 details?: {label: string; value: string}[];
 products?: {name: string; model: string; quantity: number; configuration?: string}[];
 nextStep?: string;
}) {
 const {locale, heading, paragraphs, action, reference, details, products, nextStep} = input;
 const direction = locale === 'ar' ? 'rtl' : 'ltr';
 const alignment = locale === 'ar' ? 'right' : 'left';
 const text = [heading, reference, ...paragraphs,
  ...(details??[]).map(row=>`${row.label}: ${row.value}`),
  ...(products??[]).map(row=>`${row.name}\n${row.model} | Quantity: ${row.quantity}\n${row.configuration??''}`),
  nextStep, `${action.label}\n${action.url}`, 'EL AMAL', 'elamal4supplies@gmail.com', '+20 101 731 4349'
 ].filter(Boolean).join('\n\n');
 const paragraph=(value:string)=>escape(value).replace(/\n/g,'<br>');
 const html = `<!doctype html><html lang="${locale}" dir="${direction}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
 <body style="margin:0;padding:0;background:#eaf0f8;color:#091540;font:16px/1.6 Arial,Helvetica,sans-serif">
 <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:20px 12px">
 <table role="presentation" width="100%" cellspacing="0" cellpadding="0" dir="${direction}" style="max-width:640px;background:#fff;border:1px solid #d5dfed">
 <tr><td align="${alignment}" bgcolor="#010736" style="padding:28px 28px 24px;color:#fff;border-top:4px solid #ed983c">
 <a href="https://www.al-amaleg.com/${locale}" style="color:#fff;text-decoration:none;font-size:25px;font-weight:bold;letter-spacing:1px">EL AMAL</a>
 <p style="margin:4px 0 0;font-size:13px;color:#c4d6f4">${locale==='ar'?'أجهزة القياس الصناعية منذ 1992':'Industrial measurement since 1992'}</p>
 </td></tr>
 <tr><td align="${alignment}" style="padding:30px 28px 10px;overflow-wrap:anywhere">
 <h1 style="margin:0 0 18px;font:normal 32px/1.2 Georgia,'Times New Roman',serif;color:#091540">${escape(heading)}</h1>
 ${paragraphs.map(value => `<p dir="auto" style="margin:0 0 18px;color:#334563">${paragraph(value)}</p>`).join('')}
 ${reference?`<p style="margin:0 0 22px;font-size:12px;color:#526480">${locale==='ar'?'رقم الطلب':'Request reference'}<br><span dir="ltr" style="font-size:12px;word-break:break-all">${escape(reference)}</span></p>`:''}
 ${details?.length?`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:2px solid #446ba0;margin-bottom:26px">${details.map(row=>`<tr><td style="padding:12px 0;border-bottom:1px solid #e3e9f2;color:#526480;font-size:13px;vertical-align:top;width:32%">${escape(row.label)}</td><td dir="auto" style="padding:12px 0;border-bottom:1px solid #e3e9f2;color:#091540;font-weight:bold;overflow-wrap:anywhere">${paragraph(row.value)}</td></tr>`).join('')}</table>`:''}
 ${products?.length?`<h2 style="font-size:18px;margin:0 0 14px">${locale==='ar'?'المنتجات المطلوبة':'Requested instruments'}</h2>${products.map(row=>`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:14px;border:1px solid #d8e2ef"><tr><td bgcolor="#edf3fb" style="padding:16px 18px;border-left:3px solid #446ba0"><p dir="auto" style="font-size:17px;font-weight:bold;margin:0;color:#091540">${escape(row.name)}</p><p dir="auto" style="margin:4px 0 0;font-size:14px;color:#334563">${escape(row.model)}</p></td></tr><tr><td style="padding:16px 18px"><p style="margin:0 0 6px;font-weight:bold;font-size:14px">${locale==='ar'?'الكمية':'Quantity'} · ${row.quantity}</p>${row.configuration?`<p dir="auto" style="margin:0;font-size:14px;color:#334563">${paragraph(row.configuration)}</p>`:''}</td></tr></table>`).join('')}`:''}
 <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0"><tr><td bgcolor="#091540" style="border:1px solid #091540"><a href="${escape(action.url)}" style="display:inline-block;color:#fff;padding:14px 22px;text-decoration:none;font-size:15px;font-weight:bold">${escape(action.label)}</a></td></tr></table>
 ${nextStep?`<p dir="auto" style="padding:16px 18px;border-left:3px solid #ed983c;background:#f4f7fb;font-size:14px;color:#334563">${paragraph(nextStep)}</p>`:''}
 </td></tr>
 <tr><td align="${alignment}" bgcolor="#091540" style="padding:24px 28px;color:#fff">
 <p style="margin:0 0 10px;font-size:16px;font-weight:bold">${locale==='ar'?'فريق الأمل في خدمتك':'Your EL AMAL team'}</p>
 <p style="margin:0;font-size:13px;line-height:1.8"><a href="mailto:elamal4supplies@gmail.com" style="color:#fff;text-decoration:underline">elamal4supplies@gmail.com</a><br><a href="tel:+201017314349" dir="ltr" style="color:#fff;text-decoration:none">+20 101 731 4349</a><br><a href="https://www.al-amaleg.com/${locale}" style="color:#c4d6f4;text-decoration:underline">www.al-amaleg.com</a></p>
 </td></tr></table></td></tr></table></body></html>`;
 return {text, html};
}
