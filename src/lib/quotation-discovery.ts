import type {Locale} from './catalogue.ts';

const formats=[
 {extension:'PDF',label:{en:'Quotation documents',ar:'مستندات عروض السعر'}},
 {extension:'XLSX',label:{en:'Excel requirement lists',ar:'قوائم المتطلبات في Excel'}},
 {extension:'JPEG',label:{en:'Photographed pages',ar:'صور صفحات العرض'}},
 {extension:'PNG',label:{en:'Scanned pages',ar:'صفحات ممسوحة ضوئياً'}},
] as const;

export function quotationDiscovery(locale:Locale){
 const ar=locale==='ar';
 return {
  locked:true as const,
  eyebrow:ar?'رفع خاص وآمن':'Private, secure upload',
  title:ar?'ملفك جاهز للخطوة التالية.':'Your file is ready for the next step.',
  description:ar?'اختر طريقة الملف التي لديك. لا يلزم إعادة كتابة الطرازات أو الكميات.':'Use the file you already have. Models and quantities do not need to be entered again.',
  lockedMessage:ar?'أكد عنوان البريد أولاً. يظهر زر اختيار الملفات الحقيقي فور فتح رابط التأكيد.':'Confirm your email first. The real file picker appears as soon as you open the confirmation link.',
  formats:formats.map(format=>({extension:format.extension,label:format.label[locale]})),
 };
}
