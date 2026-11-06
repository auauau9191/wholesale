import { statusOf } from "@/lib/orderStatus";

export default function OrderStatusChip({ status }) {
  const { label, tone } = statusOf(status);
  return <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-label ${tone}`}>{label}</span>;
}