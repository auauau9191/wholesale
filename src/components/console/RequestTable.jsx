import RequestAction from "@/components/console/RequestAction";
import { DueCell, StatusCell } from "@/components/console/RequestCells";
import { formatDate } from "@/lib/format";
import { paidWithLabel } from "@/lib/requestLabels";

const HEAD = "px-3 py-2 text-left text-label font-normal text-app-meta first:pl-5 last:pr-5";
const CELL = "px-3 py-3 align-top first:pl-5 last:pr-5";
const HUB = { BNE: "Brisbane", SYD: "Sydney" };

/** Desktop and tablet: one row per request, on-hold rows in an amber tint. */
export default function RequestTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-body">
        <thead>
          <tr>
            <th className={HEAD}>Request</th>
            <th className={HEAD}>Member</th>
            <th className={HEAD}>Sample unit</th>
            <th className={HEAD}>Requested</th>
            <th className={HEAD}>Due</th>
            <th className={HEAD}>Status and checks</th>
            <th className={HEAD}><span className="sr-only">Action</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={`border-t border-rule ${row.status === "on_hold" ? "bg-pill-amber/50" : ""}`}>
              <td className={CELL}>
                <p className="tabular">{row.request_no}</p>
                <p className="text-label text-app-meta">{HUB[row.hub_code]}</p>
              </td>
              <td className={CELL}>
                <p>{row.member}</p>
                <p className="tabular text-label text-app-meta">{row.abn_masked}</p>
              </td>
              <td className={CELL}>
                <p>{row.product_name}</p>
                <p className="tabular text-label text-app-meta">{row.unit_id}</p>
              </td>
              <td className={CELL}>
                <p className="tabular">{formatDate(row.requested_at)}</p>
                <p className="text-label text-app-meta">{paidWithLabel(row)}</p>
              </td>
              <td className={CELL}><DueCell row={row} /></td>
              <td className={CELL}><StatusCell row={row} /></td>
              <td className={`${CELL} text-right`}><RequestAction row={row} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}