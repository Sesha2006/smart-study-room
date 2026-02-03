export default function RefundStatusBadge({ status }) {
  const map = {
    not_initiated: "⏳ Not Initiated",
    initiated: "🔁 Initiated",
    refunded: "✅ Refunded",
    failed: "❌ Failed",
  };

  return <span className="badge">{map[status] || status}</span>;
}
