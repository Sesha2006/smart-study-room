export const canRefund = (booking) => {
  return (
    booking.paymentStatus === "paid" ||
    booking.paymentStatus === "verification_pending"
  );
};
