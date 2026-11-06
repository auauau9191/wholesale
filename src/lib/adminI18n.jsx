import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import en from "@/i18n/admin.en.json";
import tr from "@/i18n/admin.tr.json";

/** The console's two languages. The buyer app is never wrapped in this provider. */
export const ADMIN_LANGS = ["en", "tr"];
const DICTS = { en, tr };

export const adminLocaleOf = (user) => (ADMIN_LANGS.includes(user?.admin_locale) ? user.admin_locale : "en");

const pick = (dict, path) =>
  String(path)
    .split(".")
    .reduce((node, key) => (node == null ? node : node[key]), dict);

const fill = (text, vars) =>
  vars ? String(text).replace(/\{(\w+)\}/g, (_, name) => (vars[name] ?? "")) : text;

const AdminLangContext = createContext(null);

/**
 * The console's language. The choice is saved on the user (admin_locale) so it
 * follows them between devices; English is the fallback for every missing key.
 */
export function AdminLangProvider({ children }) {
  const { user, refresh } = useAuth();
  const saved = adminLocaleOf(user);
  const [lang, setLang] = useState(saved);

  useEffect(() => setLang(saved), [saved]);

  const change = useCallback(
    (next) => {
      if (!ADMIN_LANGS.includes(next)) return;
      setLang(next);
      base44.auth.updateMe({ admin_locale: next }).then(refresh).catch(() => {});
    },
    [refresh],
  );

  const t = useCallback(
    (key, vars) => fill(pick(DICTS[lang], key) ?? pick(en, key) ?? key, vars),
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang: change, t }), [lang, change, t]);

  return <AdminLangContext.Provider value={value}>{children}</AdminLangContext.Provider>;
}

export function useAdminT() {
  const ctx = useContext(AdminLangContext);
  if (!ctx) throw new Error("useAdminT must be used within <AdminLangProvider>");
  return ctx;
}