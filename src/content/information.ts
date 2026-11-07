import type { Locale } from "../lib/catalogue";
type InformationCopy = {
  title: string;
  eyebrow: string;
  headline: string;
  intro: string;
  sectionTitle: string;
  sections: { title: string; body: string; items?: string[] }[];
  closing: string;
};
export type InformationPage = "about" | "contact" | "resources";
export const informationPages: Record<
  InformationPage,
  Record<Locale, InformationCopy>
> = {
  about: {
    en: {
      title: "About EL AMAL",
      eyebrow: "Serving Egypt since 1992",
      headline: "Three decades of experience.\nA lasting commitment.",
      intro:
        "Established in 1992, EL AMAL has proudly served as the main distributor of WIKA in Egypt, maintaining a strong and long-standing partnership to this day.",
      sectionTitle: "Our history.\nYour next chapter.",
      sections: [
        {
          title: "Long-standing relationships across Egyptian industry",
          body: "With over three decades of experience, EL AMAL has built strong business relationships with leading companies in oil and gas, lubricants, food and beverage, pharmaceuticals and other industrial sectors, as well as the Suez Canal Authority.",
        },
        {
          title: "Quality instruments. Reliable service.",
          body: "Throughout the years, we have remained committed to providing high-quality industrial measurement instruments, reliable solutions and professional service to meet the diverse needs of our customers.",
        },
        {
          title: "Ready for the needs of tomorrow",
          body: "Looking ahead, EL AMAL will continue to offer high-quality pressure, temperature and measurement instruments from WIKA, the globally renowned German manufacturer. Our comprehensive range of industrial measurement solutions is designed to meet the evolving needs of industries across Egypt.",
        },
      ],
      closing: "Experience you can build on.\nPrecision you can work with.",
    },
    ar: {
      title: "من نحن — الأمل",
      eyebrow: "نخدم الصناعة في مصر منذ 1992",
      headline: "خبرة تمتد لعقود.\nوالتزام يتجدد.",
      intro:
        "تأسست الأمل عام 1992، وتفخر بكونها الموزع الرئيسي لشركة ويكا (WIKA) في مصر، في شراكة قوية وراسخة مستمرة حتى اليوم.",
      sectionTitle: "تاريخنا.\nوشراكتك القادمة.",
      sections: [
        {
          title: "علاقات راسخة في مختلف قطاعات الصناعة المصرية",
          body: "بخبرة تتجاوز ثلاثة عقود، بنت الأمل علاقات عمل قوية مع شركات رائدة في قطاعات البترول والغاز وزيوت التشحيم والأغذية والمشروبات والأدوية وغيرها من القطاعات الصناعية، إلى جانب هيئة قناة السويس.",
        },
        {
          title: "أجهزة عالية الجودة. وخدمة موثوقة.",
          body: "على مدار السنوات، حافظنا على التزامنا بتوفير أجهزة قياس صناعية عالية الجودة وحلول موثوقة وخدمة احترافية تلبي الاحتياجات المتنوعة لعملائنا.",
        },
        {
          title: "مستعدون لاحتياجات الغد",
          body: "تواصل الأمل تقديم أجهزة قياس الضغط ودرجة الحرارة وغيرها من أجهزة القياس عالية الجودة من شركة ويكا (WIKA)، المصنّع الألماني المعروف عالمياً. ونوفر مجموعة شاملة من حلول القياس الصناعية المصممة لمواكبة الاحتياجات المتطورة لمختلف الصناعات في مصر.",
        },
      ],
      closing: "خبرة تبني عليها.\nودقة تعتمد عليها.",
    },
  },
  contact: {
    en: {
      title: "Contact & quotations",
      eyebrow: "EL AMAL / Get in touch",
      headline: "Bring us your requirement.",
      intro:
        "An exact model. A replacement instrument. A list for your next project. Start with the information you have and make the next conversation more useful.",
      sectionTitle: "Choose where to begin.",
      sections: [
        {
          title: "I know the model",
          body: "Use the direct RFQ form with your model reference, quantity and measurement range. Add the process or replacement details in your notes.",
        },
        {
          title: "I need to compare instruments",
          body: "Browse by measurement category, instrument type or application. Add selected models to your quote basket and review the list together.",
        },
        {
          title: "I have a project requirement",
          body: "Include the application, quantities, delivery location and required date. Mark any specification or certification that needs a technical review. A response time and delivery date must be agreed separately.",
        },
      ],
      closing: "Clear details make the next step easier.",
    },
    ar: {
      title: "التواصل وعروض الأسعار",
      eyebrow: "الأمل / تواصل معنا",
      headline: "ابدأ بمتطلباتك.",
      intro:
        "طراز محدد. أداة بديلة. قائمة لمشروعك القادم. ابدأ بالمعلومات المتاحة لديك لتكون الخطوة التالية أوضح.",
      sectionTitle: "اختر نقطة البداية.",
      sections: [
        {
          title: "أعرف الطراز المطلوب",
          body: "استخدم نموذج طلب عرض السعر المباشر وحدد الطراز والكمية ونطاق القياس. أضف تفاصيل العملية أو الأداة المطلوب استبدالها في الملاحظات.",
        },
        {
          title: "أحتاج إلى مقارنة الأدوات",
          body: "تصفح حسب فئة القياس أو نوع الأداة أو التطبيق. أضف الطرازات المختارة إلى سلة عرض السعر وراجع القائمة كاملة.",
        },
        {
          title: "لدي متطلبات مشروع",
          body: "أضف التطبيق والكميات ومكان التسليم والموعد المطلوب. وضح المواصفات أو الشهادات التي تحتاج إلى مراجعة فنية. يُتفق على وقت الرد وموعد التسليم بصورة منفصلة.",
        },
      ],
      closing: "تفاصيل واضحة لخطوة تالية أسهل.",
    },
  },
  resources: {
    en: {
      title: "Technical enquiry resources",
      eyebrow: "EL AMAL / Resources",
      headline: "A better brief. A clearer quotation.",
      intro:
        "Prepare the information needed for a useful technical enquiry. These checklists help you describe the requirement; final selection belongs with the relevant manufacturer documentation and technical reviewer.",
      sectionTitle: "Before you request a quotation.",
      sections: [
        {
          title: "Identify the instrument",
          body: "Record the full reference from the existing instrument or project specification.",
          items: [
            "Manufacturer and exact model / part number",
            "Quantity and whether this is a replacement or a new installation",
            "Existing label details and any configuration suffixes",
          ],
        },
        {
          title: "Describe the duty",
          body: "Share the operating conditions rather than selecting a product from its appearance.",
          items: [
            "Medium, normal and maximum operating pressure and temperature",
            "Measurement range and unit, connection type and size",
            "Wetted materials, output signal, mounting and environmental conditions",
          ],
        },
        {
          title: "Bring the documents",
          body: "On reviewed product pages, the datasheet link opens the supplied manufacturer document. Where no document is listed, request confirmation of the correct revision.",
          items: [
            "Project specification and required inspection / certification documents",
            "A clear model label or drawing to discuss with the team",
            "Required delivery location and date",
          ],
        },
      ],
      closing: "Put the information into one enquiry.",
    },
    ar: {
      title: "موارد الاستفسار الفني",
      eyebrow: "الأمل / الموارد",
      headline: "متطلبات أدق. وعرض سعر أوضح.",
      intro:
        "جهز المعلومات اللازمة لاستفسار فني مفيد. تساعدك هذه القوائم على وصف متطلباتك؛ أما الاختيار النهائي فيرجع إلى وثائق الشركة المصنعة والمراجع الفني.",
      sectionTitle: "قبل طلب عرض السعر.",
      sections: [
        {
          title: "حدد أداة القياس",
          body: "سجل المرجع الكامل من الأداة الموجودة أو مواصفات المشروع.",
          items: [
            "الشركة المصنعة والطراز الدقيق أو رقم الجزء",
            "الكمية وهل الطلب لاستبدال أداة أم لتركيب جديد",
            "بيانات اللوحة التعريفية ورموز التكوين الإضافية",
          ],
        },
        {
          title: "وضح ظروف التشغيل",
          body: "شارك ظروف العملية بدلاً من اختيار المنتج اعتماداً على شكله.",
          items: [
            "الوسط وضغط التشغيل والضغط الأقصى ودرجات الحرارة",
            "نطاق القياس ووحدته ونوع التوصيل ومقاسه",
            "المواد الملامسة للوسط وإشارة الخرج والتركيب والظروف المحيطة",
          ],
        },
        {
          title: "جهز المستندات",
          body: "يفتح رابط ورقة البيانات في صفحات المنتجات المراجعة المستند المقدم من الشركة المصنعة. إذا لم يوجد مستند، اطلب تأكيد الإصدار الصحيح.",
          items: [
            "مواصفات المشروع ومستندات الفحص أو الشهادات المطلوبة",
            "صورة واضحة للوحة الطراز أو رسم لمناقشته مع الفريق",
            "مكان التسليم والموعد المطلوب",
          ],
        },
      ],
      closing: "اجمع المعلومات في طلب واحد.",
    },
  },
};
export function isInformationPage(value: string): value is InformationPage {
  return Object.hasOwn(informationPages, value);
}
