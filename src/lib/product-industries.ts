import type {Locale, Product} from './catalogue.ts';

export type ProductIndustry = 'oil-gas'|'pharmaceuticals'|'food-beverage'|'general-industry';
type IndustryProduct = Pick<Product,'model'|'applications'|'details'|'datasheetUrl'>;
const industryOrder:readonly ProductIndustry[]=['oil-gas','pharmaceuticals','food-beverage','general-industry'];
const modelKey=(value:string)=>value.normalize('NFKC').toUpperCase().replace(/[^A-Z0-9]/g,'');
const keys=(models:readonly string[])=>new Set(models.map(modelKey));

// Explicit model-family review, 15 October 2026. No keywords from names or
// descriptions classify products. See docs/product-industries-evidence-2026-10-15.md.
const knownModels=keys([
  "DIH10",
  "DIH50, DIH52",
  "TF-LCD",
  "DI10",
  "DI32-1",
  "DI30",
  "DI35",
  "TC10-K",
  "TC12-A",
  "TC10-L",
  "TC12-B",
  "TC12-M",
  "TC10-A",
  "TC10-D",
  "TC10-B",
  "TC10-F",
  "TC10-C",
  "TC10-H",
  "TC59-T",
  "TC59-E",
  "TC59-V",
  "TCC",
  "TC82",
  "TC80",
  "TC83",
  "TC81",
  "TC84",
  "TC90",
  "TC96-O",
  "TC95",
  "TC96-R",
  "TR10-A",
  "TR10-D",
  "TR10-B",
  "TR10-F",
  "TR10-C",
  "TR10-H",
  "TR11-A",
  "TR12-A",
  "TR10-K",
  "TR12-B",
  "TR12-M",
  "TR10-L",
  "TC40",
  "TC50",
  "TC46",
  "TC53",
  "TC47",
  "TR53",
  "TR75",
  "TR55",
  "TR81",
  "TR50",
  "TR60",
  "TR95",
  "TF35",
  "TF-2000",
  "TF37",
  "TF44",
  "TF41",
  "TF45",
  "T15",
  "T32",
  "T16",
  "T91",
  "T38",
  "TIF50, TIF52",
  "TSD-30",
  "TXS, TXA",
  "TFS35",
  "TCS, TCA",
  "TFS135",
  "TWG, TAG",
  "SC15",
  "TGS55",
  "SB15",
  "TGS73",
  "70 with 8xx",
  "CS4R",
  "TND",
  "CS6S, CS6H, CS6L",
  "IR80",
  "PP82",
  "TR36",
  "TR34",
  "TR31",
  "TR40",
  "TFT35",
  "TR33",
  "TR41",
  "O-10",
  "MH-3-HY",
  "MH-4",
  "MG-1",
  "MH-4-CAN",
  "R-1",
  "DPGT43",
  "DPGT40",
  "DPGT43HP",
  "APGT43",
  "PGS21",
  "PGS23.100, PGS23.160",
  "PGS25",
  "PGS23.063",
  "PGS21.100, PGS21.160",
  "PGS43.100, PGS43.160",
  "532.53 with 8xx",
  "DPGS40TA",
  "632.51 with 8xx",
  "DPGS43",
  "432.36, 432.56 with 8xx",
  "DPGS40",
  "DPGS43HP",
  "PGT21",
  "PGT43",
  "PGT23.063",
  "PGT43HP",
  "PGT23.100, PGT23.160",
  "PGT63HP",
  "PSM01",
  "PSM-520",
  "PSM02",
  "PSM-550",
  "PSM-700",
  "PXS, PXA",
  "BWX, BA",
  "PCS, PCA",
  "DW, DA",
  "MW, MA",
  "APW, APA",
  "DSS26M",
  "DSS26T",
  "DSS34M",
  "DSS34T",
  "IV1",
  "IVM",
  "IBM, IBF",
  "IV2",
  "IV3, IV5",
  "910.10, 910.11",
  "BV",
  "910.15",
  "HPNV",
  "HPFA",
  "910.12",
  "A-AI-1, A-IAI-1",
  "904",
  "M12 x 1 cable",
  "PSD-4",
  "A-1200",
  "PSD-4-ECO",
  "111.10, 111.12",
  "212.20",
  "213.40",
  "113.53, 213.53",
  "232.50, 233.50",
  "232.30, 233.30",
  "422.12, 423.12",
  "432.50, 433.50, 432.30, 433.30, 452.50, 453.50, 452.30, 453.30",
  "432.56, 433.56, 432.36, 433.36",
  "700.01, 700.02",
  "711.12, 731.12",
  "DPG40",
  "TG53",
  "55",
]);

const petroleumModels=keys([
  "DIH10",
  "DIH50, DIH52",
  "TC10-K",
  "TC12-A",
  "TC10-L",
  "TC12-B",
  "TC12-M",
  "TC10-F",
  "TC59-T",
  "TC59-E",
  "TC59-V",
  "TC82",
  "TC83",
  "TC84",
  "TC96-O",
  "TC95",
  "TC96-R",
  "TR10-F",
  "TR12-A",
  "TR10-K",
  "TR12-B",
  "TR12-M",
  "TR10-L",
  "TR95",
  "TIF50, TIF52",
  "TXS, TXA",
  "TCS, TCA",
  "TWG, TAG",
  "TGS55",
  "IR80",
  "PP82",
  "PGS23.100, PGS23.160",
  "PGS23.063",
  "PGS43.100, PGS43.160",
  "632.51 with 8xx",
  "432.36, 432.56 with 8xx",
  "PGT23.100, PGT23.160",
  "PXS, PXA",
  "BWX, BA",
  "PCS, PCA",
  "DW, DA",
  "MW, MA",
  "APW, APA",
  "DSS34M",
  "DSS34T",
  "IV1",
  "IVM",
  "IBM, IBF",
  "IV2",
  "IV3, IV5",
  "910.10, 910.11",
  "BV",
  "HPNV",
  "HPFA",
  "910.12",
  "904",
  "232.50, 233.50",
  "232.30, 233.30",
  "432.50, 433.50, 432.30, 433.30, 452.50, 453.50, 452.30, 453.30",
  "432.56, 433.56, 432.36, 433.36",
  "TG53",
  "55",
]);

const foodProcessModels=keys([
  "TC10-B",
  "TC10-F",
  "TC10-C",
  "TR10-B",
  "TR10-F",
  "TR10-C",
  "TR75",
  "SC15",
  "TGS55",
  "TGS73",
  "70 with 8xx",
  "PSD-4",
]);

const refrigerationModels=keys([
  "TF-LCD",
  "TC10-D",
  "TR10-D",
  "TR60",
  "TF35",
  "TF-2000",
  "TF37",
  "TF44",
  "TF41",
  "TF45",
  "T91",
  "R-1",
]);

function isWika(product:IndustryProduct):boolean {
  if(product.details?.manufacturer==='WIKA')return true;
  if(!product.datasheetUrl)return false;
  try {
    const url=new URL(product.datasheetUrl);
    return url.protocol==='https:'&&!url.username&&!url.password&&(url.hostname==='wika.com'||url.hostname.endsWith('.wika.com'));
  } catch {return false;}
}

/** Industry discovery, never a guarantee of a particular supplied configuration. */
export function getProductIndustries(product:IndustryProduct):ProductIndustry[] {
  const model=modelKey(product.model);
  if(!isWika(product)||!knownModels.has(model)){
    // Retain only recognised, explicitly reviewed CMS values for future products.
    return industryOrder.filter(industry=>product.applications?.includes(industry));
  }
  // Medical-gas distribution is a distinct application, not pharmaceutical
  // manufacturing. It remains visible under All products and its instrument type.
  if(model===modelKey('MG-1'))return [];
  const industries=new Set<ProductIndustry>(['general-industry']);
  if(petroleumModels.has(model))industries.add('oil-gas');
  if(foodProcessModels.has(model))industries.add('food-beverage');
  if(model===modelKey('PSD-4'))industries.add('pharmaceuticals');
  if(refrigerationModels.has(model)){
    industries.add('pharmaceuticals');
    industries.add('food-beverage');
  }
  return industryOrder.filter(industry=>industries.has(industry));
}

/** Keep the scope beside an industry recommendation, especially for utilities. */
export function getIndustryUseNote(product:IndustryProduct,industry:string,locale:Locale):string|undefined {
  if(!getProductIndustries(product).includes(industry as ProductIndustry))return;
  const model=modelKey(product.model);
  const known=isWika(product)&&knownModels.has(model);
  if((industry==='pharmaceuticals'||industry==='food-beverage')&&known&&refrigerationModels.has(model)){
    return locale==='ar'
      ?'لأنظمة التبريد ومرافق المصنع، وليس كتوصية للملامسة المباشرة للمنتج. يلزم تأكيد نطاق الحرارة والوسط وطريقة التركيب.'
      :'For refrigeration and plant utilities, not direct product contact. Confirm the temperature range, medium and installation.';
  }
  if((industry==='pharmaceuticals'||industry==='food-beverage')&&known&&model===modelKey('PSD-4')){
    return locale==='ar'
      ?'تذكر WIKA الصناعات الغذائية والدوائية ضمن التطبيقات. يجب اختيار وصلة العملية والمواد والمتطلبات الصحية المناسبة للتجهيز المطلوب.'
      :'WIKA lists food and pharmaceutical applications. Select the process connection, materials and hygiene requirements for the required configuration.';
  }
  if(industry==='food-beverage'&&known&&foodProcessModels.has(model)){
    return locale==='ar'
      ?'تطبيق غذائي موثق من الشركة المصنعة. أكّد تجهيز المسبار والغلاف الواقي ومتطلبات التنظيف والملامسة قبل الاختيار.'
      :'Manufacturer-documented food application. Confirm the probe, thermowell, cleaning and contact requirements before selection.';
  }
  if(industry==='oil-gas'){
    return locale==='ar'
      ?'أكّد توافق الوسط وحدود الضغط والحرارة وأي اعتماد للمناطق الخطرة للتجهيز المطلوب. القطع البديلة تتطلب مطابقة الجهاز الأصلي.'
      :'Confirm media compatibility, pressure and temperature limits, and any hazardous-area approval for the required configuration. Replacement parts must match the original instrument.';
  }
  if(industry==='pharmaceuticals'||industry==='food-beverage'){
    return locale==='ar'
      ?'أكّد التطبيق وتجهيز الجهاز ومتطلبات النظافة والملامسة المباشرة قبل الاختيار.'
      :'Confirm the application, instrument configuration, hygiene and direct-contact requirements before selection.';
  }
}
