import { describe, expect, it } from "vitest";
import { dateKeyInTimeZone, paymentReceivedAt, statusForDueDate } from "./paymentStatus";

describe("statusForDueDate", () => {
  it("marks an unpaid schedule from yesterday as overdue", () => {
    expect(statusForDueDate("pending", "2026-08-18", "2026-08-19")).toBe("overdue");
  });

  it("marks only today's open schedule as due today", () => {
    expect(statusForDueDate("pending", "2026-08-19", "2026-08-19")).toBe("due-today");
    expect(statusForDueDate("pending", "2026-08-20", "2026-08-19")).toBe("pending");
  });

  it("retains the partial-payment workflow state after the due date", () => {
    expect(statusForDueDate("partial", "2026-08-18", "2026-08-19")).toBe("partial");
  });

  it("uses the India business date at UTC day boundaries", () => {
    expect(dateKeyInTimeZone(new Date("2026-08-18T20:00:00Z"))).toBe("2026-08-19");
  });

  it("uses the current time when recording a payment today", () => {
    const now = new Date("2026-08-19T03:46:19Z");
    expect(paymentReceivedAt("2026-08-19", now)).toBe("2026-08-19T03:46:19.000Z");
  });

  it("uses noon in India for a historical payment date", () => {
    const now = new Date("2026-08-19T03:46:19Z");
    expect(paymentReceivedAt("2026-08-18", now)).toBe("2026-08-18T06:30:00.000Z");
  });
});
