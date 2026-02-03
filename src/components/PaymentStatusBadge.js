export default function PaymentStatusBadge({ status }) {
  const map = {
    paid: "🟢 Paid",
    verification_pending: "🟡 Verification Pending",
    refunded: "🔵 Refunded",
    not_initiated: "⚪ Not Initiated",
  };

  return (
    <span className="badge">
      {map[status] || "⚠️ Unknown"}
    </span>
  );
}
