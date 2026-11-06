import { useAdminT } from "@/lib/adminI18n";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "tr", label: "TR" },
];

/** The console's language switch, at the foot of the sidebar. */
export default function LangSwitch() {
  const { lang, setLang, t } = useAdminT();

  return (
    <div className="flex items-center gap-2">
      <span className="text-label text-app-meta">{t("common.language")}</span>
      <div className="flex items-center gap-0.5" role="group" aria-label={t("common.language")}>
        {LANGS.map((item) => {
          const active = lang === item.code;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setLang(item.code)}
              aria-pressed={active}
              className={[
                "min-h-[32px] rounded-control px-2 text-label transition-colors",
                active
                  ? "bg-pill-grey font-medium text-pill-grey-ink"
                  : "text-app-meta hover:text-app-ink",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}