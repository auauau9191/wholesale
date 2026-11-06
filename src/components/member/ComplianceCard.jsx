import DataBlock from "@/components/shell/DataBlock";
import { formatDate } from "@/lib/format";

function Row({ label, children }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-2.5">
      <span className="text-body text-app-soft">{label}</span>
      <span className="text-right text-body text-app-ink">{children}</span>
    </div>
  );
}

/** HS code, duty, GST, flags and test reports for one product. */
export default function ComplianceCard({ product, settings }) {
  if (!settings) return <DataBlock state="loading" />;

  const dutyRate = product.has_chafta_origin_cert
    ? 0
    : Number(settings?.default_duty_rate_no_origin_cert) || 0;
  const gstRate = Number(settings?.gst_rate) || 0;
  const reports = product.test_reports ?? [];

  return (
    <section className="rounded-card border border-edge bg-sheet p-5">
      <h2 className="text-lead font-medium">Compliance</h2>
      <div className="mt-2 divide-y divide-rule">
        <Row label="HS code (indicative)">
          <span className="tabular">{product.hs_code_indicative || "—"}</span>
        </Row>
        <Row label="Duty">
          {dutyRate === 0
            ? "0% with a ChAFTA certificate of origin"
            : `${Math.round(dutyRate * 100)}% — no ChAFTA certificate on file`}
        </Row>
        <Row label="GST">
          <span className="tabular">{Math.round(gstRate * 100)}%</span>
        </Row>
        <Row label="Safety flags">
          {product.safety_flags?.length ? product.safety_flags.join(" · ") : "None flagged"}
        </Row>
        <Row label="Biosecurity">
          {product.biosecurity_flags?.length
            ? product.biosecurity_flags.join(" · ")
            : "None flagged"}
        </Row>
        <Row label="Test reports">
          {reports.length ? (
            <span className="block space-y-1">
              {reports.map((report) => (
                <span key={report.name} className="block">
                  {report.name}
                  {report.expires_on ? (
                    <span className="text-app-meta"> · expires {formatDate(report.expires_on)}</span>
                  ) : null}
                </span>
              ))}
            </span>
          ) : (
            "No test reports on file"
          )}
        </Row>
      </div>
    </section>
  );
}