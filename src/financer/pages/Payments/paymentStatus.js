export const BUSINESS_TIME_ZONE = "Asia/Kolkata";

export function dateKeyInTimeZone(value = new Date(), timeZone = BUSINESS_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value instanceof Date ? value : new Date(value));
  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function statusForDueDate(status, dueDate, today = dateKeyInTimeZone()) {
  // Paid, partially-paid and explicitly rescheduled schedules retain their
  // workflow state. Open schedules are classified from their calendar date so
  // stale backend transitions cannot make yesterday's due appear due today.
  if (["success", "overdue", "rescheduled", "partial"].includes(status) || !dueDate) {
    return status;
  }
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "due-today";
  return status;
}

export function paymentReceivedAt(paymentDate, now = new Date()) {
  const today = dateKeyInTimeZone(now);
  if (paymentDate === today) return now.toISOString();
  return new Date(`${paymentDate}T12:00:00+05:30`).toISOString();
}
