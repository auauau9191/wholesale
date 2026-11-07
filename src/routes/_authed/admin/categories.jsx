import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DataBlock from "@/components/shell/DataBlock";
import PageHead from "@/components/shell/PageHead";
import { secondaryButton } from "@/components/console/FormBits";
import { useAuth } from "@/lib/AuthContext";
import { getCategoryBoard, setCategoryLive } from "@/lib/console-pages-fns";
import { useAdminT } from "@/lib/adminI18n";

const HEAD = "px-3 py-2 text-left text-label font-normal text-app-meta first:pl-5 last:pr-5";
const CELL = "px-3 py-3 align-middle first:pl-5 last:pr-5";

export const Route = createFileRoute("/_authed/admin/categories")({
  head: () => ({ meta: [{ title: "Categories · Wholesale System" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { t } = useAdminT();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["category-board"], queryFn: () => getCategoryBoard() });
  const toggle = useMutation({
    mutationFn: (row) => setCategoryLive({ data: { id: row.id, is_live: !row.is_live } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["category-board"] }),
    onError: (e) => toast(e.message),
  });
  const live = (data ?? []).filter((row) => row.is_live).length;
  const canEdit = user?.role === "admin";

  return (
    <div className="space-y-6">
      <PageHead title={t("page.categories.title")} note={data ? t("page.categories.noteCount", { live, total: data.length }) : t("page.categories.note")} />
      {isLoading ? <DataBlock state="loading" /> : null}
      {error ? <DataBlock state="error" note={error.message} /> : null}
      {data && !data.length ? <DataBlock title={t("page.categories.emptyTitle")} note={t("page.categories.emptyNote")} /> : null}
      {data && data.length ? (
        <section className="overflow-x-auto rounded-card border border-edge bg-sheet">
          <table className="w-full min-w-[560px] text-body">
            <thead>
              <tr>
                <th className={HEAD}>{t("page.categories.headCategory")}</th>
                <th className={HEAD}>{t("page.categories.headRisk")}</th>
                <th className={`${HEAD} text-right`}>{t("page.categories.headSuppliers")}</th>
                <th className={`${HEAD} text-right`}>{t("page.categories.headProducts")}</th>
                <th className={HEAD}>{t("page.categories.headStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-t border-rule">
                  <td className={CELL}>
                    <p className="font-medium">{row.name}</p>
                    <p className="tabular text-label text-app-meta">{row.code}</p>
                  </td>
                  <td className={CELL}>{t(`page.categories.risk.${row.risk_tier}`)}</td>
                  <td className={`${CELL} tabular text-right`}>{row.suppliers}</td>
                  <td className={`${CELL} tabular text-right`}>{row.products}</td>
                  <td className={CELL}>
                    {canEdit ? (
                      <button type="button" className={secondaryButton} disabled={toggle.isPending} onClick={() => toggle.mutate(row)}>
                        {row.is_live ? t("page.categories.live") : t("page.categories.hidden")}
                      </button>
                    ) : row.is_live ? t("page.categories.live") : t("page.categories.hidden")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}
