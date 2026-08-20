import type { Locale, Pillar } from "@/types/content";

/**
 * Per-pillar page content.
 *
 * `tags` is the load-bearing field. The old site had NINE separate
 * service pages; this site has five pillars. Those nine service names
 * are real search terms with real history, and consolidating the pages
 * would throw the terms away — so every one of them reappears here as
 * crawlable text on the pillar that absorbed it.
 *
 * They are text, not links. Nine more navigation items would rebuild
 * the exact problem the consolidation solves; nine keyword-bearing
 * phrases in the copy keep the ranking without the menu.
 */
export interface PillarContent {
  h1: Record<Locale, string>;
  line: Record<Locale, string>;
  tags: Record<Locale, string[]>;
}

export const PILLAR_CONTENT: Record<Pillar, PillarContent> = {
  tvc: {
    h1: { ar: "إعلانات وتصوير سينمائي", en: "TVC & Cinematography" },
    line: {
      ar: "إعلان يُبثّ على التلفزيون ويصمد على الشاشة الصغيرة.",
      en: "A commercial that holds up on broadcast and on a phone.",
    },
    tags: {
      ar: [
        "تصوير إعلانات تلفزيونية",
        "تصوير إعلانات تجارية",
        "إنتاج الأفلام القصيرة",
        "إخراج وتصوير سينمائي",
      ],
      en: [
        "TV commercial production",
        "Commercial advertising film",
        "Short film production",
        "Direction and cinematography",
      ],
    },
  },
  recipes: {
    h1: { ar: "أفلام الوصفات", en: "Recipe Films" },
    line: {
      ar: "الوصفة تُصوَّر لتُشتهى، لا لتُشرح فقط.",
      en: "A recipe shot to be wanted, not only understood.",
    },
    tags: {
      ar: [
        "تصوير فيديوهات الطبخ",
        "إنتاج وتصوير فيديو للطعام والمشروبات",
        "أفلام وصفات للعلامات الغذائية",
      ],
      en: [
        "Cooking video production",
        "Food and beverage video production",
        "Recipe films for food brands",
      ],
    },
  },
  reels: {
    h1: { ar: "إنشاء مقاطع ريلز", en: "Reels" },
    line: {
      ar: "محتوى عمودي مصوَّر عمودياً، لا مقصوصاً من إعلان.",
      en: "Vertical content shot vertical, not cropped from an ad.",
    },
    tags: {
      ar: [
        "إنشاء مقاطع ريلز احترافية",
        "محتوى سوشال ميديا للمطاعم",
        "فيديو عمودي 9:16",
      ],
      en: [
        "Professional reels production",
        "Social content for restaurants",
        "Vertical 9:16 video",
      ],
    },
  },
  stills: {
    h1: { ar: "تصوير ثابت", en: "Stills" },
    line: {
      ar: "صورة واحدة تحمل الحملة كلها حين لا يوجد وقت لفيلم.",
      en: "One frame that carries the campaign when there is no time for a film.",
    },
    tags: {
      ar: [
        "تصوير الطعام",
        "تصوير المنتجات",
        "تصوير تجاري للعلامات",
      ],
      en: [
        "Food photography",
        "Product photography",
        "Commercial brand photography",
      ],
    },
  },
  menu: {
    h1: { ar: "تصميم أطباق المنيو", en: "Menu Plate Design" },
    line: {
      ar: "الطبق يُنسَّق للكاميرا قبل أن يُنسَّق للطاولة.",
      en: "The plate is styled for the camera before it is styled for the table.",
    },
    tags: {
      ar: [
        "تزيين الأطعمة والوجبات",
        "تنسيق الطعام للتصوير",
        "تصوير أطباق المنيو",
      ],
      en: [
        "Food styling and decoration",
        "Food styling for camera",
        "Menu plate photography",
      ],
    },
  },
};

/**
 * The process strip — SHARED across all five pillars, on purpose.
 *
 * A production process does not change because the output ratio does.
 * Writing five near-identical versions would be padding, and padding is
 * what the client complained about. This is the studio-not-freelancer
 * proof: freelancers do not publish their process.
 */
export const PROCESS: Record<Locale, { step: string; body: string }[]> = {
  ar: [
    {
      step: "التحضير",
      body: "لوح مزاجي، ولوحة تخزين، وقائمة لقطات مُعتمدة قبل أن تدور الكاميرا. لا يبدأ يوم التصوير باجتماع.",
    },
    {
      step: "تنسيق الطعام",
      body: "منسّق طعام على البلاتوه طوال اليوم. الطبق الذي يصمد أمام العدسة ليس الطبق الذي يُقدَّم للأكل.",
    },
    {
      step: "التصوير",
      body: "إضاءة وحركة كاميرا وفريق كامل. الصيغة تُحدَّد قبل التصوير، فلا يُقصّ الإعلان لاحقاً ليصير ريلز.",
    },
    {
      step: "المونتاج والتلوين",
      body: "المونتاج والتلوين داخل الستوديو. لهذا يخرج يوم التصوير بحملة كاملة لا بمجلد مقاطع.",
    },
  ],
  en: [
    {
      step: "Pre-production",
      body: "Mood board, storyboard and an approved shot list before the camera turns over. A shoot day does not open with a meeting.",
    },
    {
      step: "Food styling",
      body: "A food stylist on set all day. The plate that survives a lens is not the plate you would serve to eat.",
    },
    {
      step: "The shoot",
      body: "Lighting, camera movement, full crew. The format is decided before the shoot, so an ad is never cropped into a reel afterwards.",
    },
    {
      step: "Edit and grade",
      body: "Both in-house. That is why a shoot day produces a campaign rather than a folder of clips.",
    },
  ],
};
