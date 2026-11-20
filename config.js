/**
 * تنظیمات اصلی PsPs (نسخهٔ توسعه و انتشار)
 * پس از ساخت پروژهٔ رایگان در Supabase، فقط دو مقدار زیر را جایگزین کنید:
 *  - SUPABASE_URL: آدرس پروژه (Settings -> API -> Project URL)
 *  - SUPABASE_ANON_KEY: کلید عمومی (Settings -> API -> anon public key)
 *
 * تا زمانی که این دو مقدار جایگزین نشوند، اپ به صورت خودکار در «حالت نمایشی (Demo)»
 * اجرا می‌شود تا بتوانید ظاهر و امکانات را بدون سرور هم بررسی کنید.
 */
window.PSPS_CONFIG = {
  SUPABASE_URL: "https://mggbgusgyfcnqlkzbehw.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_NHYoFnBpnu952tkH5jsuWQ_wJ1EJo-9",
  STORAGE_BUCKET: "cat-photos",

  // تنظیمات مرحله‌بندی امکانات (Feature Flags)
  FEATURES: {
    // وقتی تعداد کاربران به حد مطلوب رسید، این مقدار را true کنید تا بخش دامپزشکی و پت‌شاپ فعال شود
    PARTNERS_ENABLED: false,
    // اگر در حالت آزمایشی می‌خواهید پیش‌نمایش کارت‌های دامپزشکی/پت‌شاپ را ببینید true بگذارید
    PARTNERS_DEMO_PREVIEW: false,
    // حداقل فاصلهٔ زمانی بین ثبت دو گزارش توسط یک کاربر (به ثانیه) برای جلوگیری از اسپم
    REPORT_COOLDOWN_SECONDS: 45,
    // حداکثر ابعاد تصویر قبل از آپلود (پیکسل) — فشرده‌سازی در مرورگر برای صرفه‌جویی در حجم رایگان
    PHOTO_MAX_DIMENSION: 1080,
    PHOTO_QUALITY: 0.78
  },

  // لینک یا ایمیل ثبت همکاری دامپزشکی‌ها و پت‌شاپ‌ها
  PARTNER_CONTACT_URL: "mailto:hello@psps.example?subject=همکاری%20دامپزشکی%20یا%20پت‌شاپ%20در%20PsPs",

  // شهرهای آماده برای پایلوت چندشهری و انتشار سراسری
  CITIES: [
    { id: "همه شهرها", label: "همهٔ شهرها", lat: 33.5, lng: 53.0, zoom: 6 },
    { id: "تهران", label: "تهران", lat: 35.706, lng: 51.399, zoom: 13 },
    { id: "کرج", label: "کرج", lat: 35.8327, lng: 50.9915, zoom: 13 },
    { id: "اصفهان", label: "اصفهان", lat: 32.6546, lng: 51.6680, zoom: 13 },
    { id: "شیراز", label: "شیراز", lat: 29.5918, lng: 52.5837, zoom: 13 },
    { id: "مشهد", label: "مشهد", lat: 36.2605, lng: 59.6168, zoom: 13 },
    { id: "تبریز", label: "تبریز", lat: 38.0962, lng: 46.2738, zoom: 13 },
    { id: "رشت", label: "رشت", lat: 37.2808, lng: 49.5832, zoom: 13 }
  ]
};
