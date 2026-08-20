import type { Locale } from "@/types/content";

/**
 * The Fraise Studio story.
 *
 * ALL OF THIS IS THE STUDIO'S OWN COPY, taken from their preview site
 * — including, at last, REAL FIGURES. Every earlier version of this
 * page carried three invented numbers with a warning attached; those
 * are now replaced by the four the studio publishes itself:
 *
 *     +1000 projects · 99% satisfaction · +30% sales lift · 3 markets
 *
 * That closes the biggest "must not ship" item in the whole handoff.
 * The English is authored from the same facts, not machine-translated,
 * which is the rule everywhere else in this project.
 *
 * ⚠️ These are still the STUDIO's claims about itself. They are safe to
 * publish because the studio published them; they are not independently
 * verified, and "+30% sales lift" in particular is the kind of number a
 * client may ask to see the basis for.
 */

export interface Figure {
  value: string;
  label: string;
}

export interface Reason {
  title: string;
  body: string;
}

export interface StudioContent {
  h1: string;
  lead: string;
  beginningLabel: string;
  beginningTitle: string;
  body: string[];
  figuresTitle: string;
  figures: Figure[];
  reasonsTitle: string;
  reasons: Reason[];
  marketsTitle: string;
  markets: string;
  btsTitle: string;
  btsLine: string;
  awardsTitle: string;
  awardsNote: string;
}

export const STUDIO: Record<Locale, StudioContent> = {
  ar: {
    h1: "حكاية استوديو فريز في عالم تصوير الأطعمة.",
    lead: "بدأت الحكاية من عمّان، برغبة في تغيير الطريقة التي تُرى بها الأطعمة والمنتجات في العالم العربي.",
    beginningLabel: "البداية",
    beginningTitle: "مش مجرد وكالة تصوير وإنتاج فيديوهات عادية.",
    body: [
      "إحنا فريق شغوف بالطهي والفنون البصرية، ومؤمن إن كل طبق وراه قصة مميزة تستحق إنها تُوثَّق بأسلوب استثنائي. بدأنا استوديو فريز كأول وكالة تصوير متخصصة في إنتاج فيديوهات الأطعمة في العالم العربي، عشان نغيّر مفهوم تصوير الأكل والمشروبات. هدفنا الأساسي هو نقل التصوير من الأسلوب التقليدي إلى تجربة بصرية فريدة تجذب العين وتفتح الشهية.",
      "فريقنا المتكامل يجمع بين خبرة المخرجين، وإبداع المصورين، وشغف الطهاة، ولمسات مصممي الأطعمة — عشان نكون أول استوديو تصوير في الشرق الأوسط متخصص في تصوير الأطعمة وإنتاج الفيديوهات باستخدام أحدث التقنيات.",
    ],
    figuresTitle: "ليه تختار استوديو فريز شريكاً في النجاح؟",
    figures: [
      { value: "+1000", label: "مشروع منجز" },
      { value: "99%", label: "نسبة رضا العملاء" },
      { value: "+30%", label: "زيادة في مبيعات العملاء بعد حملاتنا" },
      { value: "03", label: "أسواق: الأردن، الإمارات، السعودية" },
    ],
    reasonsTitle: "أنواع الأعمال اللي نقدمها في استوديو فريز.",
    reasons: [
      {
        title: "فن سرد القصص البصرية",
        body: "إحنا نلتقط نكهات أطباقكم عشان ننسج منها حكايات بصرية تعكس جوهر علامتكم التجارية. كل لقطة هي لوحة فنية مُتقَنة، تُبرز تميزكم في سوق شديد التنافس.",
      },
      {
        title: "خبرة عالمية",
        body: "مع حضور قوي في الأردن والإمارات والسعودية، صار عندنا فهم عميق للسوق في الشرق الأوسط وتوجهاته. خبرتنا العالمية تساعدنا نتواصل بشكل سلس مع جمهورنا.",
      },
      {
        title: "تقنيات تصوير حديثة ومتطورة",
        body: "نستخدم أحدث التقنيات والمعدات، مثل الذراع الروبوتية عالية التقنية، عشان نلتقط زوايا ومشاهد ما تقدر تلتقطها أدوات التصوير التقليدية. هذا يعطينا القدرة على تقديم محتوى مبتكر يفوق توقعاتكم.",
      },
      {
        title: "فريق متعدد التخصصات",
        body: "فريقنا مكوّن من مخرجين، ومصورين محترفين، وطهاة بارعين، ومصممي أطعمة، يجمعنا شغف الإبداع والتميز. هذا التنوع في الخبرات يساعدنا نقدم خدمات شاملة تلبي احتياجاتكم بأعلى مستوى من الاحترافية.",
      },
      {
        title: "حلول مخصصة ومبتكرة",
        body: "نحن نعرف إن كل علامة تجارية لها هويتها الخاصة، ومع خبرتنا الواسعة في قطاع الضيافة والأغذية نقدر نفهم احتياجاتكم وتحدياتكم، ونعمل على تقديم حلول بصرية فعّالة. سواء كنت تدير مطعماً فاخراً أو علامة تجارية ناشئة، إحنا هنا عشان نساعدك تبرز وتتميز في السوق.",
      },
    ],
    marketsTitle: "إيش هي الدول اللي نستهدفها حالياً ومستقبلاً؟",
    markets: "الأردن · الإمارات · السعودية",
    btsTitle: "خلف الكواليس",
    btsLine:
      "الفريلانسر لا ينشر عمليته. هذه أيام تصوير حقيقية، بأدواتها وطاقمها.",
    awardsTitle: "الجوائز",
    awardsNote:
      "⚠️ مؤقت: الجوائز مؤكدة كملفات شعارات على الموقع الحالي، لكن العمل الفائز بكل جائزة وسنته لم يُؤكَّدا بعد.",
  },
  en: {
    h1: "The Fraise Studio story, in the world of food imagery.",
    lead: "It started in Amman, with a wish to change the way food and products are seen across the Arab world.",
    beginningLabel: "The Beginning",
    beginningTitle: "Not just another film and photography agency.",
    body: [
      "We are a team obsessed with cooking and with the visual arts, and we believe every plate carries a story worth telling properly. Fraise Studio began as the first agency in the Arab world built specifically around food film — to move food and beverage imagery out of the conventional and into something that catches the eye and opens the appetite.",
      "The crew brings together directors, photographers, chefs and food stylists, which is what makes it the first studio in the Middle East built for food imagery and film production on current technology.",
    ],
    figuresTitle: "Why choose Fraise Studio as a partner?",
    figures: [
      { value: "+1000", label: "Projects delivered" },
      { value: "99%", label: "Client satisfaction" },
      { value: "+30%", label: "Average sales lift after a campaign" },
      { value: "03", label: "Markets: Jordan, UAE, Saudi Arabia" },
    ],
    reasonsTitle: "What we make at Fraise Studio.",
    reasons: [
      {
        title: "Visual storytelling",
        body: "We photograph the flavour of a dish in order to build a visual story around your brand. Every frame is composed work, made to stand out in a market where everyone is shooting.",
      },
      {
        title: "Regional experience",
        body: "A strong presence in Jordan, the UAE and Saudi Arabia has given us a working understanding of the Middle Eastern market and where it is heading — which is what lets the work speak to its audience.",
      },
      {
        title: "Current technology",
        body: "We shoot on current kit, including a high-precision robotic arm, which gets angles and moves conventional camera work cannot reach. That is what makes a genuinely different frame possible.",
      },
      {
        title: "A multi-discipline crew",
        body: "Directors, professional photographers, working chefs and food stylists, in one team. The range is what lets us deliver a whole campaign rather than one part of one.",
      },
      {
        title: "Work built for the brand",
        body: "Every brand has its own identity, and long experience across hospitality and food means we start from your constraints rather than a template. A fine-dining room and a new product line do not need the same film.",
      },
    ],
    marketsTitle: "Where we work, now and next.",
    markets: "Jordan · UAE · Saudi Arabia",
    btsTitle: "Behind The Scenes",
    btsLine:
      "Freelancers do not publish their process. These are real shoot days, with the kit and the crew that made them.",
    awardsTitle: "Awards",
    awardsNote:
      "⚠️ Placeholder: the awards are confirmed as logo files on the live site, but the winning work and year behind each one are not yet confirmed.",
  },
};
