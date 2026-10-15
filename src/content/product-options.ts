export const instrumentTypes = [
 {id:'pressure-gauge',en:'Pressure gauges',ar:'عدادات الضغط'},
 {id:'pressure-transmitter',en:'Pressure transmitters',ar:'مرسلات الضغط'},
 {id:'pressure-switch',en:'Pressure switches',ar:'مفاتيح الضغط'},
 {id:'temperature-instrument',en:'Temperature instruments',ar:'أجهزة قياس الحرارة'},
 {id:'accessory',en:'Valves & accessories',ar:'الصمامات والملحقات'},
];
export const applications = [
 {id:'oil-gas',en:'Oil & gas',ar:'البترول والغاز'},
 {id:'general-industry',en:'General industry',ar:'الصناعة العامة'},
];

// Public discovery facets include the reviewed manufacturer mapping. Keep the
// legacy CMS select separate: changing its enum needs a database migration.
export const industries = [
 {id:'oil-gas',en:'Petroleum & gas',ar:'شركات البترول والغاز'},
 {id:'pharmaceuticals',en:'Pharmaceuticals',ar:'شركات الأدوية'},
 {id:'food-beverage',en:'Food & beverage',ar:'شركات الأغذية والمشروبات'},
 {id:'general-industry',en:'General industry',ar:'الصناعة العامة'},
];
