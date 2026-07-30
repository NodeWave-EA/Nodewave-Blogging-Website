import { ref } from "vue";

export type LanguageOption = {
  code: string;
  label: string;
  icon: string;
};

// list of Google Translate supported languages
export const DEFAULT_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", icon: "i-heroicons-language" },
  { code: "sw", label: "Kiswahili (Swahili)", icon: "i-heroicons-globe-alt" },
  { code: "es", label: "Español (Spanish)", icon: "i-heroicons-globe-alt" },
  { code: "fr", label: "Français (French)", icon: "i-heroicons-globe-alt" },
  { code: "de", label: "Deutsch (German)", icon: "i-heroicons-globe-alt" },
  { code: "it", label: "Italiano (Italian)", icon: "i-heroicons-globe-alt" },
  { code: "pt", label: "Português (Portuguese)", icon: "i-heroicons-globe-alt" },
  { code: "ar", label: "العربية (Arabic)", icon: "i-heroicons-globe-alt" },
  { code: "hi", label: "हिन्दी (Hindi)", icon: "i-heroicons-globe-alt" },
  { code: "ja", label: "日本語 (Japanese)", icon: "i-heroicons-globe-alt" },
  { code: "zh-CN", label: "中文 (简体) (Chinese Simplified)", icon: "i-heroicons-globe-alt" },
  { code: "zh-TW", label: "中文 (繁體) (Chinese Traditional)", icon: "i-heroicons-globe-alt" },
  { code: "nl", label: "Nederlands (Dutch)", icon: "i-heroicons-globe-alt" },
  { code: "ru", label: "Русский (Russian)", icon: "i-heroicons-globe-alt" },
  { code: "ko", label: "한국어 (Korean)", icon: "i-heroicons-globe-alt" },
  { code: "af", label: "Afrikaans", icon: "i-heroicons-globe-alt" },
  { code: "sq", label: "Shqip (Albanian)", icon: "i-heroicons-globe-alt" },
  { code: "am", label: "አማርኛ (Amharic)", icon: "i-heroicons-globe-alt" },
  { code: "hy", label: "Հայերեն (Armenian)", icon: "i-heroicons-globe-alt" },
  { code: "az", label: "Azərbaycan (Azerbaijani)", icon: "i-heroicons-globe-alt" },
  { code: "eu", label: "Euskara (Basque)", icon: "i-heroicons-globe-alt" },
  { code: "be", label: "Беларуская (Belarusian)", icon: "i-heroicons-globe-alt" },
  { code: "bn", label: "বাংলা (Bengali)", icon: "i-heroicons-globe-alt" },
  { code: "bs", label: "Bosanski (Bosnian)", icon: "i-heroicons-globe-alt" },
  { code: "bg", label: "Български (Bulgarian)", icon: "i-heroicons-globe-alt" },
  { code: "ca", label: "Català (Catalan)", icon: "i-heroicons-globe-alt" },
  { code: "ceb", label: "Cebuano", icon: "i-heroicons-globe-alt" },
  { code: "ny", label: "Chichewa", icon: "i-heroicons-globe-alt" },
  { code: "co", label: "Corsu (Corsican)", icon: "i-heroicons-globe-alt" },
  { code: "hr", label: "Hrvatski (Croatian)", icon: "i-heroicons-globe-alt" },
  { code: "cs", label: "Čeština (Czech)", icon: "i-heroicons-globe-alt" },
  { code: "da", label: "Dansk (Danish)", icon: "i-heroicons-globe-alt" },
  { code: "eo", label: "Esperanto", icon: "i-heroicons-globe-alt" },
  { code: "et", label: "Eesti (Estonian)", icon: "i-heroicons-globe-alt" },
  { code: "tl", label: "Filipino", icon: "i-heroicons-globe-alt" },
  { code: "fi", label: "Suomi (Finnish)", icon: "i-heroicons-globe-alt" },
  { code: "fy", label: "Frysk (Frisian)", icon: "i-heroicons-globe-alt" },
  { code: "gl", label: "Galego (Galician)", icon: "i-heroicons-globe-alt" },
  { code: "ka", label: "ქართული (Georgian)", icon: "i-heroicons-globe-alt" },
  { code: "el", label: "Ελληνικά (Greek)", icon: "i-heroicons-globe-alt" },
  { code: "gu", label: "ગુજરાતી (Gujarati)", icon: "i-heroicons-globe-alt" },
  { code: "ht", label: "Kreyòl Ayisyen (Haitian Creole)", icon: "i-heroicons-globe-alt" },
  { code: "ha", label: "Hausa", icon: "i-heroicons-globe-alt" },
  { code: "haw", label: "ʻŌlelo Hawaiʻi (Hawaiian)", icon: "i-heroicons-globe-alt" },
  { code: "he", label: "עברית (Hebrew)", icon: "i-heroicons-globe-alt" },
  { code: "hmn", label: "Hmoob (Hmong)", icon: "i-heroicons-globe-alt" },
  { code: "hu", label: "Magyar (Hungarian)", icon: "i-heroicons-globe-alt" },
  { code: "is", label: "Íslenska (Icelandic)", icon: "i-heroicons-globe-alt" },
  { code: "ig", label: "Asụsụ Igbo", icon: "i-heroicons-globe-alt" },
  { code: "id", label: "Bahasa Indonesia", icon: "i-heroicons-globe-alt" },
  { code: "ga", label: "Gaeilge (Irish)", icon: "i-heroicons-globe-alt" },
  { code: "jw", label: "Basa Jawa (Javanese)", icon: "i-heroicons-globe-alt" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)", icon: "i-heroicons-globe-alt" },
  { code: "kk", label: "Қазақ тілі (Kazakh)", icon: "i-heroicons-globe-alt" },
  { code: "km", label: "ភាសាខ្មែរ (Khmer)", icon: "i-heroicons-globe-alt" },
  { code: "rw", label: "Kinyarwanda", icon: "i-heroicons-globe-alt" },
  { code: "ku", label: "Kurdî (Kurdish)", icon: "i-heroicons-globe-alt" },
  { code: "ky", label: "Кыргызча (Kyrgyz)", icon: "i-heroicons-globe-alt" },
  { code: "lo", label: "ພາສາລາວ (Lao)", icon: "i-heroicons-globe-alt" },
  { code: "la", label: "Latina (Latin)", icon: "i-heroicons-globe-alt" },
  { code: "lv", label: "Latviešu (Latvian)", icon: "i-heroicons-globe-alt" },
  { code: "lt", label: "Lietuvių (Lithuanian)", icon: "i-heroicons-globe-alt" },
  { code: "lb", label: "Lëtzebuergesch (Luxembourgish)", icon: "i-heroicons-globe-alt" },
  { code: "mk", label: "Македонски (Macedonian)", icon: "i-heroicons-globe-alt" },
  { code: "mg", label: "Malagasy", icon: "i-heroicons-globe-alt" },
  { code: "ms", label: "Bahasa Melayu (Malay)", icon: "i-heroicons-globe-alt" },
  { code: "ml", label: "മലയാളം (Malayalam)", icon: "i-heroicons-globe-alt" },
  { code: "mt", label: "Malti (Maltese)", icon: "i-heroicons-globe-alt" },
  { code: "mi", label: "Te Reo Māori", icon: "i-heroicons-globe-alt" },
  { code: "mr", label: "मराठी (Marathi)", icon: "i-heroicons-globe-alt" },
  { code: "mn", label: "Монгол (Mongolian)", icon: "i-heroicons-globe-alt" },
  { code: "my", label: "မြန်မာဘာသာ (Burmese)", icon: "i-heroicons-globe-alt" },
  { code: "ne", label: "नेपाली (Nepali)", icon: "i-heroicons-globe-alt" },
  { code: "no", label: "Norsk (Norwegian)", icon: "i-heroicons-globe-alt" },
  { code: "or", label: "ଓଡ଼ିଆ (Odia)", icon: "i-heroicons-globe-alt" },
  { code: "ps", label: "پښتو (Pashto)", icon: "i-heroicons-globe-alt" },
  { code: "fa", label: "فارسی (Persian)", icon: "i-heroicons-globe-alt" },
  { code: "pl", label: "Polski (Polish)", icon: "i-heroicons-globe-alt" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)", icon: "i-heroicons-globe-alt" },
  { code: "ro", label: "Română (Romanian)", icon: "i-heroicons-globe-alt" },
  { code: "sm", label: "Gagana Samoa", icon: "i-heroicons-globe-alt" },
  { code: "gd", label: "Gàidhlig (Scots Gaelic)", icon: "i-heroicons-globe-alt" },
  { code: "sr", label: "Српски (Serbian)", icon: "i-heroicons-globe-alt" },
  { code: "st", label: "Sesotho", icon: "i-heroicons-globe-alt" },
  { code: "sn", label: "Chishona", icon: "i-heroicons-globe-alt" },
  { code: "sd", label: "سنڌي (Sindhi)", icon: "i-heroicons-globe-alt" },
  { code: "si", label: "සිංහල (Sinhala)", icon: "i-heroicons-globe-alt" },
  { code: "sk", label: "Slovenčina (Slovak)", icon: "i-heroicons-globe-alt" },
  { code: "sl", label: "Slovenščina (Slovenian)", icon: "i-heroicons-globe-alt" },
  { code: "so", label: "Soomaali (Somali)", icon: "i-heroicons-globe-alt" },
  { code: "su", label: "Basa Sunda", icon: "i-heroicons-globe-alt" },
  { code: "sv", label: "Svenska (Swedish)", icon: "i-heroicons-globe-alt" },
  { code: "tg", label: "Тоҷикӣ (Tajik)", icon: "i-heroicons-globe-alt" },
  { code: "ta", label: "தமிழ் (Tamil)", icon: "i-heroicons-globe-alt" },
  { code: "tt", label: "Татар (Tatar)", icon: "i-heroicons-globe-alt" },
  { code: "te", label: "తెలుగు (Telugu)", icon: "i-heroicons-globe-alt" },
  { code: "th", label: "ไทย (Thai)", icon: "i-heroicons-globe-alt" },
  { code: "tr", label: "Türkçe (Turkish)", icon: "i-heroicons-globe-alt" },
  { code: "tk", label: "Türkmen (Turkmen)", icon: "i-heroicons-globe-alt" },
  { code: "uk", label: "Українська (Ukrainian)", icon: "i-heroicons-globe-alt" },
  { code: "ur", label: "اردو (Urdu)", icon: "i-heroicons-globe-alt" },
  { code: "ug", label: "ئۇيغۇرچە (Uyghur)", icon: "i-heroicons-globe-alt" },
  { code: "uz", label: "Oʻzbekcha (Uzbek)", icon: "i-heroicons-globe-alt" },
  { code: "vi", label: "Tiếng Việt (Vietnamese)", icon: "i-heroicons-globe-alt" },
  { code: "cy", label: "Cymraeg (Welsh)", icon: "i-heroicons-globe-alt" },
  { code: "xh", label: "isiXhosa", icon: "i-heroicons-globe-alt" },
  { code: "yi", label: "ייִדיש (Yiddish)", icon: "i-heroicons-globe-alt" },
  { code: "yo", label: "Yorùbá", icon: "i-heroicons-globe-alt" },
  { code: "zu", label: "isiZulu", icon: "i-heroicons-globe-alt" },
];

const supportedLanguages = ref<LanguageOption[]>(DEFAULT_LANGUAGES);

export function useTranslation() {
  const userLang = useCookie<string>("user-locale", {
    default: () => "en",
    maxAge: 60 * 60 * 24 * 365,
  });

  const googTransCookie = useCookie<string>("googtrans", {
    path: "/",
  });

  const updateGoogTransCookie = (lang: string) => {
    if (!import.meta.client)
      return;
    const cookieVal = `/en/${lang}`;
    googTransCookie.value = cookieVal;

    document.cookie = `googtrans=${cookieVal}; path=/;`;
    if (window.location.hostname !== "localhost") {
      document.cookie = `googtrans=${cookieVal}; path=/; domain=.${window.location.hostname};`;
    }
  };

  // Dynamic sync to read options if Google loads any new options
  const syncWithGoogleDOM = () => {
    if (!import.meta.client)
      return;
    const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (!selectEl || !selectEl.options || selectEl.options.length <= 1)
      return;

    const parsedLangs: LanguageOption[] = [];
    for (let i = 0; i < selectEl.options.length; i++) {
      const opt = selectEl.options[i];
      if (opt && opt.value) {
        const existing = DEFAULT_LANGUAGES.find(l => l.code === opt.value);
        parsedLangs.push({
          code: opt.value,
          label: existing?.label || opt.text.trim(),
          icon: opt.value === "en" ? "i-heroicons-language" : "i-heroicons-globe-alt",
        });
      }
    }

    if (parsedLangs.length > 10) {
      supportedLanguages.value = parsedLangs;
    }
  };

  if (import.meta.client) {
    if (userLang.value && userLang.value !== "en" && !googTransCookie.value) {
      updateGoogTransCookie(userLang.value);
    }

    window.googleTranslateElementInit = () => {
      if (window.google?.translate && document.getElementById("google_translate_element")) {
        // eslint-disable-next-line no-new
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element",
        );

        // Periodically check in case Google populates options late
        setTimeout(syncWithGoogleDOM, 1000);
        setTimeout(syncWithGoogleDOM, 3000);
      }
    };
  }

  const { status } = useScript(
    {
      key: "google-translate",
      src: "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit",
      crossorigin: false,
      referrerpolicy: false,
    },
    {
      trigger: "client",
      bundle: false,
    },
  );

  const setLanguage = (lang: string) => {
    userLang.value = lang;

    if (import.meta.client) {
      updateGoogTransCookie(lang);

      const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
      if (selectEl) {
        selectEl.value = lang;
        selectEl.dispatchEvent(new Event("change"));
      }
      else {
        window.location.reload();
      }
    }
  };

  return {
    currentLang: userLang,
    supportedLanguages,
    status,
    setLanguage,
  };
}
