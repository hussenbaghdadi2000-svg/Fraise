import {
  parseAwards,
  parseBts,
  parseClients,
  parseProjects,
  parseTeam,
} from "@/lib/content-schema";
import {
  PILLARS,
  PILLAR_KIND,
  PILLAR_RATIO,
  type Locale,
  type Ratio,
} from "@/types/content";

/**
 * WHAT THE DASHBOARD IS, IN ONE FILE.
 *
 * There are five collections and they need the same six screens each:
 * list, create, edit, save, delete, reorder. Writing those thirty
 * screens by hand would guarantee that the projects form and the team
 * form drifted apart within a week — the same failure the token work
 * exists to stop, one layer up.
 *
 * So the screens are generic and THIS is the only bespoke part. A
 * collection is a file, a list of fields, and a few display choices;
 * app/studio/[collection]/ renders whatever it finds here. Adding a
 * sixth collection is an entry in this array, not a new route.
 *
 * ⚠️ `validate` IS THE PUBLIC SITE'S OWN PARSER, not a copy of it. The
 * dashboard cannot write a file that `next build` would reject, because
 * "valid" has exactly one definition and both of them read it from
 * lib/content-schema.ts.
 */

/** A row as it exists on disk, before a parser has vouched for it. */
export type Row = Record<string, unknown>;

type Label = Record<Locale, string>;

/**
 * What an uploaded file is supposed to be.
 *
 * `ratio: "pillar"` means "read it off this row's pillar" — the whole
 * taxonomy is that a 9:16 piece is a Reel, so a 16:9 file on a reels
 * row is a data error the moment it lands, not something to discover in
 * a screenshot later.
 *
 * A mismatch WARNS, it does not block. The frames are cropped with
 * object-cover, so a wrong ratio is ugly rather than broken, and the
 * person holding the file knows more about it than this check does.
 */
export interface AssetExpect {
  ratio?: Ratio | "pillar";
  /** Below this, the asset is an upscale waiting to happen. */
  minWidth: number;
}

export interface AssetField {
  kind: "asset";
  name: string;
  label: Label;
  /**
   * Where an uploaded file lands. `{id}` is the row id, `{ext}` the
   * extension. Existing rows keep whatever path they already have —
   * this only names the destination for a NEW file, which is how the
   * inherited filenames (`Four-Seasones.png`) get normalised as they
   * are replaced rather than in one risky sweep.
   */
  template: string;
  /** Accepted extensions. The first is the default. */
  ext: string[];
  /**
   * Is the resolved path written into the row?
   *
   * ⚠️ FALSE FOR DERIVED ASSETS. BtsCard builds `/media/{id}.jpg` and
   * the team page builds `/media/team-{id}.jpg` — the path is computed
   * by the component, so storing a second copy would let the two
   * disagree. For those, `ext` has exactly ONE entry and an upload in
   * any other format is refused: the component's derived path says
   * `.jpg`, so a PNG would 404 with nothing on screen to explain why.
   */
  stored: boolean;
  optional?: boolean;
  expect: AssetExpect;
  help?: Label;
}

export type Field =
  | { kind: "id"; name: string; label: Label; help?: Label }
  /**
   * A public URL segment.
   *
   * Rendered like an id — mono, Latin, kebab-checked — but EDITABLE,
   * which is the whole distinction types/content.ts draws between the
   * two. An id is how the codebase refers to a piece and must never
   * move; a slug is a promise to the outside world that may have to.
   */
  | { kind: "slug"; name: string; label: Label; help?: Label }
  | { kind: "text"; name: string; label: Label; help?: Label; optional?: boolean }
  | { kind: "bilingual"; name: string; label: Label; help?: Label }
  | { kind: "prose"; name: string; label: Label; help?: Label }
  | { kind: "number"; name: string; label: Label; min: number; max: number; help?: Label }
  | {
      kind: "select";
      name: string;
      label: Label;
      options: { value: string; label: Label }[];
      help?: Label;
    }
  | { kind: "url"; name: string; label: Label; help?: Label }
  | AssetField;

export interface Collection {
  name: string;
  /**
   * The JSON seed file. Kept after the move to Postgres because it is
   * still the seed, the offline backup and the record of what the site
   * shipped with — `npm run db:seed` reloads it.
   */
  file: string;
  /** The Postgres table these rows actually live in now. */
  table: string;
  label: Label;
  singular: Label;
  /** Shown above the list. The caveats the handoff insists on keeping. */
  note?: Label;
  fields: Field[];
  /** Field names to show as table columns, in order. */
  columns: string[];
  /** Which field names the row in a heading. */
  titleField: string;
  /** Which asset field, if any, gives the row its thumbnail. */
  thumbField?: string;
  /**
   * Is the array's ORDER meaningful?
   *
   * For clients it is: content/projects.ts derives the logo rail from
   * this array in sequence, so moving a row moves a mark on the
   * homepage. For projects it is not — /our-work/ derives its own
   * editorial cadence from lib/cadence.ts.
   */
  ordered: boolean;
  /** The site's own parser. Throws ContentError on a bad row. */
  validate: (raw: unknown) => void;
}

const YEAR_CEILING = new Date().getFullYear() + 1;

/** Latin-in-both-locales, which is the rule for every production credit. */
const LATIN_HELP: Label = {
  ar: "بالحروف اللاتينية في اللغتين — يظهر على الـ slate مثل أي اعتماد إنتاجي.",
  en: "Latin in both locales — it appears on the slate, like every production credit.",
};

export const COLLECTIONS: Collection[] = [
  {
    name: "projects",
    file: "projects.json",
    table: "projects",
    label: { ar: "الأعمال", en: "Projects" },
    singular: { ar: "عمل", en: "Project" },
    note: {
      ar: "⚠️ سنوات معرض الصور هي سنة الرفع على ووردبريس، لا سنة تصوير مؤكدة — اعتبرها حداً أعلى. والـ pillar في تلك الصفوف قُرئ من الكادر ولم يُبلَّغ به.",
      en: "⚠️ Gallery years are the WordPress upload year, not a confirmed shoot year — treat each as a ceiling. Pillar on those rows was read off the frame, not told to us.",
    },
    fields: [
      {
        kind: "id",
        name: "id",
        label: { ar: "المعرّف", en: "Id" },
        help: {
          ar: "أحرف صغيرة ووصلات. هو أيضاً اسم ملف الصورة والفيديو.",
          en: "Lowercase and hyphens. It is also the poster and preview filename.",
        },
      },
      {
        kind: "slug",
        name: "slug",
        label: { ar: "الرابط", en: "Slug" },
        help: {
          ar: "عنوان الصفحة تحت /our-work/. لاتيني في اللغتين — العمل يُسمّى باسم العميل، والاسم لا يُترجَم. تغييره ينقل صفحة منشورة، فأضف تحويلة في content/redirects.ts.",
          en: "The page address under /our-work/. Latin in both locales — a piece is named after its client, and that is not translated. Changing it MOVES a published page: add a redirect in content/redirects.ts.",
        },
      },
      {
        kind: "text",
        name: "client",
        label: { ar: "العميل", en: "Client" },
        help: LATIN_HELP,
      },
      {
        kind: "bilingual",
        name: "title",
        label: { ar: "العنوان", en: "Title" },
        help: {
          ar: "العربية مكتوبة لا مترجمة. الحقلان مطلوبان معاً.",
          en: "Arabic is authored, not translated. Both are required.",
        },
      },
      {
        kind: "select",
        name: "pillar",
        label: { ar: "الخدمة", en: "Pillar" },
        options: PILLARS.map((pillar) => ({
          value: pillar,
          label: {
            ar: `${PILLAR_KIND[pillar]} · ${PILLAR_RATIO[pillar]}`,
            en: `${PILLAR_KIND[pillar]} · ${PILLAR_RATIO[pillar]}`,
          },
        })),
        help: {
          ar: "الخدمة تحدد نسبة الكادر، والنسبة هي ما يعرّف الزائر بنوع العمل.",
          en: "The pillar sets the aspect ratio, and the ratio is how a visitor learns the taxonomy.",
        },
      },
      {
        kind: "number",
        name: "year",
        label: { ar: "السنة", en: "Year" },
        min: 1990,
        max: YEAR_CEILING,
      },
      {
        kind: "asset",
        name: "poster",
        label: { ar: "الصورة الثابتة", en: "Poster" },
        template: "/media/{id}{ext}",
        ext: [".jpg"],
        stored: true,
        /* 1000, not 1280. Measured against the studio's own exports:
           a 4:5 still ships at 1280×1600 and a 9:16 at 608×1080, so a
           flat 1280 would report a correctly-sized vertical frame as
           too small. 1000 catches the ones that are genuinely
           WordPress thumbnails — which is the failure that already
           cost Al Wadi its place on the page. */
        expect: { ratio: "pillar", minWidth: 1000 },
        help: {
          ar: "يجب أن تُقتطع بنسبة الخدمة. الكادر يحجز مساحته قبل التحميل — هذه هي خطة CLS.",
          en: "Crop to the pillar's ratio. The box reserves its space before the file loads — that is the CLS strategy.",
        },
      },
      {
        kind: "asset",
        name: "preview",
        label: { ar: "اللقطة المتحركة", en: "Preview loop" },
        template: "/media/{id}{ext}",
        ext: [".mp4"],
        stored: true,
        /* A loop is displayed at card size and never full-bleed, so it
           is held to less than the poster on purpose. */
        expect: { ratio: "pillar", minWidth: 480 },
        help: {
          ar: "لقطة صامتة قصيرة من نفس التايمكود الذي أُخذت منه الصورة الثابتة.",
          en: "A short silent loop, grabbed from the same timecode as the poster.",
        },
      },
      {
        kind: "text",
        name: "vimeoId",
        label: { ar: "معرّف Vimeo", en: "Vimeo id" },
        optional: true,
        help: {
          ar: "⚠️ فارغ في كل الأعمال الـ29. صفحة العمل تعرض رابط المشاهدة فقط عند تعبئته — فهذه هي الخطوة الوحيدة المتبقية لتشغيل الفيلم كاملاً. الرقم وحده، لا الرابط.",
          en: "⚠️ Empty on all 29 pieces. The project page renders its watch link only when this is set, so filling it in is the entire remaining step for full-film playback. The bare number, not the URL.",
        },
      },
    ],
    columns: ["client", "title", "pillar", "year"],
    titleField: "title",
    thumbField: "poster",
    ordered: false,
    validate: (raw) => {
      parseProjects(raw);
    },
  },

  {
    name: "clients",
    file: "clients.json",
    table: "clients",
    label: { ar: "العملاء", en: "Clients" },
    singular: { ar: "عميل", en: "Client" },
    note: {
      ar: "الترتيب هنا هو ترتيب شريط الشعارات على الصفحة الرئيسية. العميل بلا شعار أمر طبيعي — عشرة من أصل اثنين وعشرين كذلك.",
      en: "This order is the homepage logo rail's order. A client with no mark is normal — ten of the twenty-two are.",
    },
    fields: [
      { kind: "id", name: "id", label: { ar: "المعرّف", en: "Id" } },
      {
        kind: "text",
        name: "name",
        label: { ar: "الاسم", en: "Name" },
        help: {
          ar: "اسم العلامة كما تكتبه هي. لا يُعكَس ولا يُترجَم.",
          en: "The brand's own spelling. Never mirrored, never translated.",
        },
      },
      {
        kind: "asset",
        name: "logo",
        label: { ar: "الشعار", en: "Mark" },
        template: "/media/logos/{id}{ext}",
        ext: [".png", ".webp", ".jpg"],
        stored: true,
        optional: true,
        expect: { minWidth: 200 },
        help: {
          ar: "لوحات الشعارات هي الاستثناء الوحيد لقاعدة «لا أرضيات فاتحة» — الخلفية بيضاء كي تظهر العلامات.",
          en: "The logo plates are the one standing exception to 'no light grounds' — white so the marks read.",
        },
      },
    ],
    columns: ["name"],
    titleField: "name",
    thumbField: "logo",
    ordered: true,
    validate: (raw) => {
      parseClients(raw);
    },
  },

  {
    name: "bts",
    file: "bts.json",
    table: "bts_films",
    label: { ar: "خلف الكواليس", en: "Behind the scenes" },
    singular: { ar: "فيلم كواليس", en: "BTS film" },
    note: {
      ar: "كل بطاقة تخرج إلى Vimeo أو YouTube. الأفلام مستضافة هناك أصلاً، وإعادة استضافتها تعني دفع ثمن نطاق ترددي مرتين.",
      en: "Every card links out to Vimeo or YouTube. The films are already hosted there; re-hosting them would mean paying for the same bandwidth twice.",
    },
    fields: [
      {
        kind: "id",
        name: "id",
        label: { ar: "المعرّف", en: "Id" },
        help: {
          ar: "هو أيضاً اسم ملف الصورة: /media/{id}.jpg",
          en: "It is also the poster filename: /media/{id}.jpg",
        },
      },
      { kind: "bilingual", name: "title", label: { ar: "العنوان", en: "Title" } },
      {
        kind: "text",
        name: "client",
        label: { ar: "العميل", en: "Client" },
        help: LATIN_HELP,
      },
      {
        kind: "number",
        name: "year",
        label: { ar: "السنة", en: "Year" },
        min: 1990,
        max: YEAR_CEILING,
      },
      {
        kind: "url",
        name: "href",
        label: { ar: "رابط الفيلم", en: "Film URL" },
        help: {
          ar: "رابط خارجي كامل. يُفتح في تبويب جديد.",
          en: "A full external URL. It opens in a new tab.",
        },
      },
      {
        kind: "asset",
        name: "poster",
        label: { ar: "الصورة الثابتة", en: "Poster" },
        template: "/media/{id}{ext}",
        ext: [".jpg"],
        stored: false,
        expect: { ratio: "16:9", minWidth: 1280 },
        help: {
          ar: "لا يُحفظ كحقل — الكود يبنيه من المعرّف. لذلك JPEG فقط.",
          en: "Not stored as a field — the component builds it from the id. JPEG only, for that reason.",
        },
      },
    ],
    columns: ["title", "client", "year"],
    titleField: "title",
    thumbField: "poster",
    ordered: true,
    validate: (raw) => {
      parseBts(raw);
    },
  },

  {
    name: "team",
    file: "team.json",
    table: "team",
    label: { ar: "الفريق", en: "Crew" },
    singular: { ar: "عضو", en: "Member" },
    note: {
      ar: "العنوان يعدّ التخصصات لا الأشخاص. الصور الحالية مصادرها 600×480 — أي تكبير 1.25×، وهو سقف ما نشره الموقع.",
      en: "The heading counts disciplines, not people. The current portraits come from 600×480 sources — a 1.25× upscale, and the ceiling of what the preview site published.",
    },
    fields: [
      {
        kind: "id",
        name: "id",
        label: { ar: "المعرّف", en: "Id" },
        help: {
          ar: "هو أيضاً اسم ملف الصورة: /media/team-{id}.jpg",
          en: "It is also the portrait filename: /media/team-{id}.jpg",
        },
      },
      { kind: "bilingual", name: "name", label: { ar: "الاسم", en: "Name" } },
      {
        kind: "text",
        name: "role",
        label: { ar: "الدور", en: "Role" },
        help: LATIN_HELP,
      },
      {
        kind: "prose",
        name: "bio",
        label: { ar: "النبذة", en: "Bio" },
        help: {
          ar: "العربية هي الأصل، والإنجليزية مكتوبة من الوقائع نفسها لا مترجمة آلياً.",
          en: "Arabic is the source; the English is authored from the same facts, not machine-translated.",
        },
      },
      {
        kind: "asset",
        name: "portrait",
        label: { ar: "الصورة الشخصية", en: "Portrait" },
        template: "/media/team-{id}{ext}",
        ext: [".jpg"],
        stored: false,
        expect: { ratio: "4:5", minWidth: 1280 },
        help: {
          ar: "المواصفة 1600×2000 بنسبة 4:5. أي ملف أضيق من 1280 يظهر كتنبيه.",
          en: "The spec is 1600×2000 at 4:5. Anything under 1280 wide is flagged.",
        },
      },
    ],
    columns: ["name", "role"],
    titleField: "name",
    thumbField: "portrait",
    ordered: true,
    validate: (raw) => {
      parseTeam(raw);
    },
  },

  {
    name: "awards",
    file: "awards.json",
    table: "awards",
    label: { ar: "الجوائز", en: "Awards" },
    singular: { ar: "جائزة", en: "Award" },
    note: {
      ar: "⚠️ الجوائز مؤكدة كملفات شعارات على الموقع الحالي، لكن العمل الفائز بكل جائزة وسنته غير مؤكدين — لذلك هي أسماء وليست علاقة بالأعمال.",
      en: "⚠️ Confirmed as logo files on the live site, but the winning work and year behind each are not — which is why these are names and not a relation to Projects yet.",
    },
    fields: [
      { kind: "id", name: "id", label: { ar: "المعرّف", en: "Id" } },
      {
        kind: "text",
        name: "name",
        label: { ar: "الاسم", en: "Name" },
        help: {
          ar: "يظهر كنص في الصفحة وفي JSON-LD — وهذا ما يجعله قابلاً للفهرسة، بعكس ملف الشعار.",
          en: "Rendered as text on the page and in the JSON-LD — which is what makes it indexable, unlike a logo file.",
        },
      },
    ],
    columns: ["name"],
    titleField: "name",
    ordered: true,
    validate: (raw) => {
      parseAwards(raw);
    },
  },
];

export function findCollection(name: string): Collection | undefined {
  return COLLECTIONS.find((collection) => collection.name === name);
}

/** Every asset field on a collection, derived and stored alike. */
export function assetFields(collection: Collection): AssetField[] {
  return collection.fields.filter(
    (field): field is AssetField => field.kind === "asset",
  );
}

/**
 * The path an asset field resolves to for a given row.
 *
 * For a stored field that is whatever the row says, because a row may
 * carry an inherited filename that the template would not produce. For
 * a derived field it is the template, which is the only source there is.
 */
export function assetPath(field: AssetField, row: Row): string {
  if (field.stored) {
    const value = row[field.name];
    return typeof value === "string" ? value : "";
  }
  const id = typeof row["id"] === "string" ? row["id"] : "";
  return field.template.replace("{id}", id).replace("{ext}", field.ext[0]);
}

/* ---------- reading a row for display ------------------------------ */

/**
 * One field of one row, as a string a table cell can hold.
 *
 * Rows are `Record<string, unknown>` because they come off disk before
 * a parser has vouched for them — so every read has to cope with the
 * value being absent or the wrong type. That is not defensive
 * programming for its own sake: a row mid-edit, or a file someone
 * hand-edited, is exactly the state the dashboard exists to show you.
 */
export function displayValue(
  collection: Collection,
  name: string,
  row: Row,
  locale: Locale,
): string {
  const field = collection.fields.find((candidate) => candidate.name === name);
  const value = row[name];

  if (field?.kind === "select") {
    const option = field.options.find((candidate) => candidate.value === value);
    return option ? option.label[locale] : String(value ?? "");
  }

  if (field?.kind === "bilingual" || field?.kind === "prose") {
    if (typeof value !== "object" || value === null) return "";
    const pair = value as Record<string, unknown>;
    const text = pair[locale];
    return typeof text === "string" ? text : "";
  }

  if (value === undefined || value === null) return "";
  return String(value);
}

/** What a row is called, in a heading or a breadcrumb. */
export function rowTitle(
  collection: Collection,
  row: Row,
  locale: Locale,
): string {
  const title = displayValue(collection, collection.titleField, row, locale);
  return title !== "" ? title : String(row["id"] ?? "");
}

/**
 * Should this field be rendered as Latin, regardless of the dashboard's
 * language?
 *
 * A client name, a role and a URL are Latin in BOTH locales — that is
 * the site's rule for production credits, and it has to hold in the
 * input too. Typing "Al Sayad" into a field that inherited RTL from the
 * page puts the cursor and the punctuation on the wrong side.
 */
export function isLatinField(field: Field): boolean {
  /* Every `text` field in the registry is a Latin one — client, brand
     name, crew role. Anything that is genuinely bilingual is declared
     `bilingual` or `prose`, and those render one input PER LANGUAGE
     with its own dir, so they never come through here. */
  return (
    field.kind === "id" ||
    field.kind === "slug" ||
    field.kind === "url" ||
    field.kind === "number" ||
    field.kind === "text" ||
    field.kind === "asset"
  );
}
