import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Payments from "./Payments";

describe("Payments", () => {
  it("opens the record-payment dialog without crashing", () => {
    render(
      <Payments
        initialData={[{
          id: "schedule-1",
          loanId: "loan-1",
          loanNumber: "LN-001",
          customerId: "customer-1",
          customer: "Kim",
          dueDate: "2026-08-18",
          interestDue: 9.86,
          totalDue: 9.86,
          balance: 9.86,
          status: "Due",
        }]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /record/i }));

    expect(screen.getByRole("heading", { name: /payment due/i })).toBeInTheDocument();
    expect(screen.getAllByText("LN-001")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByRole("button", { name: "Record ₹9.86" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/amount received/i), { target: { value: "5" } });
    expect(screen.getByText("₹4.86 will remain outstanding.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record ₹5" })).toBeInTheDocument();
  });

  it("hides zero-value schedules and closed-loan future dues while retaining paid history", () => {
    const { container } = render(
      <Payments
        initialData={[
          { id: "zero", loanId: "loan-1", loanNumber: "LN-001", customer: "Kim", dueDate: "2026-08-25", totalDue: 0, amountPaid: 0, status: "Paid" },
          { id: "closed-future", loanId: "loan-2", loanNumber: "LN-002", customer: "Manikanta", dueDate: "2026-08-27", totalDue: 100, balance: 100, status: "Upcoming", loanStatus: "Closed" },
          { id: "paid-history", loanId: "loan-3", loanNumber: "LN-003", customer: "Kim", dueDate: "2026-08-24", totalDue: 9.86, amountPaid: 9.86, status: "Paid", loanStatus: "Closed" },
        ]}
      />
    );

    const result = within(container);
    expect(result.queryByText("LN-001")).not.toBeInTheDocument();
    expect(result.queryByText("LN-002")).not.toBeInTheDocument();
    expect(result.getByText("LN-003")).toBeInTheDocument();
    expect(result.getByText("1 records")).toBeInTheDocument();
  });
});
