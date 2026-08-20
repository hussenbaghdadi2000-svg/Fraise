import type { Locale } from "@/types/content";

/**
 * The dashboard's own dictionary.
 *
 * ⚠️ NOT content/copy/. That file types the PUBLIC site's strings, and
 * every key added to the `Copy` interface has to be authored in both
 * languages by someone thinking about the visitor. Tool chrome is not
 * that — it is UI for one person with the repo open, and mixing the two
 * would mean a rename in the dashboard could fail the site's build.
 *
 * Arabic is still first, and still authored rather than translated: the
 * developer reads both, and the site's own rule is that Arabic is the
 * primary language, not the localised one.
 */
export interface StudioCopy {
  brand: string;
  subtitle: string;
  local: string;
  overview: string;
  health: string;
  openSite: string;
  signOut: string;
  signIn: string;
  password: string;
  wrongPassword: string;
  locked: string;
  /* actions */
  create: string;
  save: string;
  saving: string;
  remove: string;
  cancel: string;
  back: string;
  up: string;
  down: string;
  edit: string;
  /* form */
  required: string;
  optionalField: string;
  currentFile: string;
  noFile: string;
  chooseFile: string;
  keepFile: string;
  tooLarge: string;
  idLocked: string;
  /* results */
  savedRow: string;
  removedRow: string;
  movedRow: string;
  emptyCollection: string;
  confirmRemove: string;
  /* health */
  allClear: string;
  problemCount: string;
  warningCount: string;
  errorLabel: string;
  warnLabel: string;
  rowCount: string;
  /* footer */
  commitNote: string;
  writesTo: string;
}

const ar: StudioCopy = {
  brand: "لوحة المحتوى",
  /* ⚠️ LATIN IN BOTH LOCALES, and it was Arabic for one build.
     The rail sets this line in `.u-caps` — uppercase plus 0.14em of
     tracking — which is Latin-only treatment. Arabic has no case and is
     a CONNECTED script, so tracking breaks the joins and reads as a
     rendering fault. `.u-caps:lang(ar)` would normally strip it, but
     the element is marked lang="en" so that the English build keeps its
     caps, and that marking is what let Arabic through the gate.
     A Latin brand name is also simply the site's own rule: logos,
     slates and Latin brand names never mirror and never translate. */
  subtitle: "Fraise Studio",
  local: "لوحة الاستوديو",
  overview: "نظرة عامة",
  health: "سلامة البيانات",
  openSite: "فتح الموقع",
  signOut: "تسجيل الخروج",
  signIn: "دخول",
  password: "كلمة المرور",
  wrongPassword: "كلمة المرور غير صحيحة.",
  locked: "هذه اللوحة للاستوديو وحده.",
  create: "إضافة",
  save: "حفظ",
  saving: "جارٍ الحفظ…",
  remove: "حذف",
  cancel: "إلغاء",
  back: "رجوع",
  up: "لأعلى",
  down: "لأسفل",
  edit: "تحرير",
  required: "مطلوب",
  optionalField: "اختياري",
  currentFile: "الملف الحالي",
  noFile: "لا يوجد ملف",
  chooseFile: "اختيار ملف",
  keepFile: "اترك الحقل فارغاً للإبقاء على الملف الحالي.",
  tooLarge: "الملفات المختارة تتجاوز حد الرفع",
  idLocked: "المعرّف ثابت بعد الإنشاء — فهو اسم الملف على القرص.",
  savedRow: "تم الحفظ",
  removedRow: "تم الحذف",
  movedRow: "تم تغيير الترتيب",
  emptyCollection: "لا توجد عناصر بعد.",
  confirmRemove: "حذف هذا العنصر نهائياً؟",
  allClear: "كل شيء سليم.",
  problemCount: "خطأ",
  warningCount: "تنبيه",
  errorLabel: "خطأ",
  warnLabel: "تنبيه",
  rowCount: "عنصر",
  commitNote:
    "التعديلات تُحفظ في قاعدة البيانات وتظهر على الموقع خلال ثوانٍ. لا حاجة لنشر جديد.",
  writesTo: "الجدول",
};

const en: StudioCopy = {
  brand: "Content Studio",
  subtitle: "Fraise Studio",
  local: "Studio only",
  overview: "Overview",
  health: "Data health",
  openSite: "Open the site",
  signOut: "Sign out",
  signIn: "Sign in",
  password: "Password",
  wrongPassword: "That password is not right.",
  locked: "This dashboard is for the studio only.",
  create: "New",
  save: "Save",
  saving: "Saving…",
  remove: "Delete",
  cancel: "Cancel",
  back: "Back",
  up: "Up",
  down: "Down",
  edit: "Edit",
  required: "Required",
  optionalField: "Optional",
  currentFile: "Current file",
  noFile: "No file",
  chooseFile: "Choose a file",
  keepFile: "Leave empty to keep the current file.",
  tooLarge: "The selected files are past the upload limit",
  idLocked: "The id is fixed after creation — it is the filename on disk.",
  savedRow: "Saved",
  removedRow: "Deleted",
  movedRow: "Reordered",
  emptyCollection: "Nothing here yet.",
  confirmRemove: "Delete this entry permanently?",
  allClear: "All clear.",
  problemCount: "error",
  warningCount: "warning",
  errorLabel: "Error",
  warnLabel: "Warning",
  rowCount: "entry",
  commitNote:
    "Edits are saved to the database and appear on the site within seconds. No redeploy needed.",
  writesTo: "Table",
};

export const STUDIO_COPY: Record<Locale, StudioCopy> = { ar, en };
