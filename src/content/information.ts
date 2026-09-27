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
      eyebrow: "EL AMAL / Our approach",
      headline: "The right conversation starts with the details.",
      intro:
        "Pressure. Temperature. Connections. This is a place to turn your measurement requirements into a clear, structured enquiry.",
      sectionTitle: "A considered route to your next instrument.",
      sections: [
        {
          title: "Start with the application",
          body: "A model reference is useful. The process around it matters just as much. Bring the medium, operating conditions, measurement range and connection requirements into the enquiry.",
        },
        {
          title: "Keep the specification together",
          body: "Explore by model or application, collect the quantities you need, and record the details in one request. For a replacement or a model outside the catalogue, use the direct RFQ form.",
        },
        {
          title: "Confirm before committing",
          body: "Final configuration, suitability, availability and commercial terms need confirmation. A catalogue entry or enquiry is not a guarantee of stock, certification or an accepted order.",
        },
      ],
      closing: "Have a model in mind? Start there.",
    },
    ar: {
      title: "عن الأمل",
      eyebrow: "الأمل / منهجنا",
      headline: "تبدأ الخطوة الصحيحة بتفاصيل واضحة.",
      intro:
        "الضغط. الحرارة. التوصيلات. مساحة لتحويل متطلبات القياس إلى طلب واضح ومنظم.",
      sectionTitle: "طريق واضح إلى أداة القياس التالية.",
      sections: [
        {
          title: "ابدأ بالتطبيق",
          body: "مرجع الطراز مهم، وكذلك العملية التي سيعمل فيها. أضف الوسط وظروف التشغيل ونطاق القياس ومتطلبات التوصيل إلى طلبك.",
        },
        {
          title: "اجمع المواصفات في مكان واحد",
          body: "تصفح بالطراز أو التطبيق، وحدد الكميات وسجل التفاصيل في طلب واحد. لاستبدال أداة أو طلب طراز خارج الكتالوج، استخدم نموذج طلب عرض السعر المباشر.",
        },
        {
          title: "أكد التفاصيل قبل الاتفاق",
          body: "يحتاج التكوين النهائي والملاءمة والتوفر والشروط التجارية إلى تأكيد. وجود منتج في الكتالوج أو إعداد طلب لا يضمن المخزون أو الشهادات ولا يمثل طلب شراء مقبولاً.",
        },
      ],
      closing: "تعرف الطراز المطلوب؟ ابدأ به.",
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
