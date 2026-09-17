import type { Product, Translated } from '../lib/catalogue';
export const categories:{id:string;name:Translated;description:Translated}[] = [
  {id:'pressure',name:{en:'Pressure measurement',ar:'قياس الضغط'},description:{en:'Explore pressure instruments by model and measurement needs.',ar:'تصفح أدوات الضغط حسب الطراز ومتطلبات القياس.'}},
  {id:'temperature',name:{en:'Temperature measurement',ar:'قياس الحرارة'},description:{en:'Find temperature instruments for your process.',ar:'ابحث عن أدوات قياس الحرارة المناسبة لعمليتك.'}},
  {id:'accessories',name:{en:'Valves & accessories',ar:'الصمامات والملحقات'},description:{en:'Complete your measurement assembly.',ar:'استكمل مجموعة أدوات القياس.'}},
];
// Synthetic preview records. Never seed these into the publishable CMS catalogue.
export const products:Product[] = [
  {id:'demo-p1',model:'DEMO-P1',category:'pressure',name:{en:'Pressure gauge',ar:'مقياس ضغط'},description:{en:'A sample product page for reviewing pressure instrumentation and the quotation journey.',ar:'صفحة منتج تجريبية لمراجعة أدوات الضغط وخطوات طلب عرض السعر.'}},
  {id:'demo-p2',model:'DEMO-P2',category:'pressure',name:{en:'Pressure transmitter',ar:'مرسل ضغط'},description:{en:'A sample transmitter record. Technical selection requires reviewed manufacturer information.',ar:'سجل تجريبي لمرسل ضغط. يتطلب الاختيار الفني معلومات معتمدة من الشركة المصنعة.'}},
  {id:'demo-p3',model:'DEMO-P3',category:'pressure',name:{en:'Pressure switch',ar:'مفتاح ضغط'},description:{en:'A sample pressure-switch record for catalogue layout review.',ar:'سجل تجريبي لمفتاح ضغط لمراجعة تصميم الكتالوج.'}},
  {id:'demo-p4',model:'DEMO-P4',category:'pressure',name:{en:'Differential pressure gauge',ar:'مقياس فرق الضغط'},description:{en:'A sample differential-pressure instrument record.',ar:'سجل تجريبي لأداة قياس فرق الضغط.'}},
  {id:'demo-t1',model:'DEMO-T1',category:'temperature',name:{en:'Resistance thermometer',ar:'ترمومتر مقاومة'},description:{en:'A sample temperature instrument for bilingual layout review.',ar:'أداة حرارة تجريبية لمراجعة التصميم باللغتين.'}},
  {id:'demo-t2',model:'DEMO-T2',category:'temperature',name:{en:'Temperature transmitter',ar:'مرسل حرارة'},description:{en:'A sample temperature transmitter. Configuration is not yet supplied.',ar:'مرسل حرارة تجريبي. لم تُقدم بيانات التكوين بعد.'}},
  {id:'demo-t3',model:'DEMO-T3',category:'temperature',name:{en:'Dial thermometer',ar:'ترمومتر بقرص'},description:{en:'A sample dial thermometer for the catalogue preview.',ar:'ترمومتر بقرص تجريبي لمعاينة الكتالوج.'}},
  {id:'demo-a1',model:'DEMO-A1',category:'accessories',name:{en:'Instrument valve',ar:'صمام أجهزة القياس'},description:{en:'A sample accessory record for an instrument assembly.',ar:'سجل ملحق تجريبي لمجموعة أدوات القياس.'}},
  {id:'demo-a2',model:'DEMO-A2',category:'accessories',name:{en:'Valve manifold',ar:'مجموعة صمامات'},description:{en:'A sample manifold record. Connections require technical confirmation.',ar:'سجل تجريبي لمجموعة صمامات. تحتاج التوصيلات إلى تأكيد فني.'}},
  {id:'demo-a3',model:'DEMO-A3',category:'accessories',name:{en:'Mounting accessory',ar:'ملحق تركيب'},description:{en:'A sample mounting accessory for reviewing the enquiry flow.',ar:'ملحق تركيب تجريبي لمراجعة خطوات الاستفسار.'}},
];
