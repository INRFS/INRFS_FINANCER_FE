import React, { useEffect, useMemo, useState } from 'react';
import {
  Phone,
  AlertCircle,
  FileText,
  X,
  Download,
  CheckCircle2,
} from 'lucide-react';

import './ServiceCharge.css';
import { platformApi, pageItems } from '../../../common/services/platformApi';

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function ServiceCharge() {
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [billing, setBilling] = useState([]);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    platformApi.admin.invoices({ pageSize: 200 }).then((payload) => setBilling(pageItems(payload).map((item) => ({ ...item, month: new Date(`${item.periodStart}T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }), interestCollected: item.interestActivity, chargeRate: item.chargePercentage, amountPayable: item.chargeAmount, amountPaid: item.collectedAmount || 0, outstanding: Number(item.chargeAmount || 0) - Number(item.collectedAmount || 0) })))).catch((error) => setPageError(error.message));
  }, []);

  const currentBilling = billing[0] || { month: 'No billing period', interestCollected: 0, chargeRate: 0, amountPayable: 0, amountPaid: 0, outstanding: 0, status: 'Pending' };

  const _totals = useMemo(() => {
    const totalPayable = billing.reduce(
      (sum, item) => sum + item.amountPayable,
      0
    );

    const totalPaid = billing.reduce(
      (sum, item) => sum + item.amountPaid,
      0
    );

    return {
      totalPayable,
      totalPaid,
      totalOutstanding: totalPayable - totalPaid,
    };
  }, [billing]);

  const handleContactOperations = async () => {
    try { await platformApi.support.create({ subject: 'Service charge assistance', category: 'Billing', priority: 'Medium', description: 'Please contact me regarding the current service charge invoice.' }); }
    catch (error) { setPageError(error.message); }
  };

  const handleDownloadStatement = () => {
    window.print();
  };

  return (
    <div className="service-charge-page">
      {pageError && <p role="alert">{pageError}</p>}
      <div className="service-charge-container">

        {/* PAGE HEADER */}
        <header className="service-charge-page-header">
          <div>
            <h1>INRFS Service Charge</h1>
            <p>
              Your monthly service charge based on interest collected
            </p>
          </div>
        </header>

        {/* CURRENT BILLING PERIOD */}
        <section className="service-charge-current-card">

          <div className="service-charge-card-top">
            <div>
              <span className="service-charge-period-label">
                CURRENT BILLING PERIOD
              </span>

              <h2>{currentBilling.month}</h2>
            </div>

            <span className="service-charge-status pending">
              Pending
            </span>
          </div>

          {/* CALCULATION */}
          <div className="service-charge-calculation">

            <div className="service-charge-calc-box interest-box">
              <span>Interest Collected</span>
              <strong>
                {formatCurrency(currentBilling.interestCollected)}
              </strong>
            </div>

            <span className="service-charge-operator">
              ×
            </span>

            <div className="service-charge-calc-box rate-box">
              <span>Service Charge</span>
              <strong>
                {currentBilling.chargeRate}%
              </strong>
            </div>

            <span className="service-charge-operator">
              =
            </span>

            <div className="service-charge-calc-box payable-box">
              <span>Amount Payable</span>
              <strong>
                {formatCurrency(currentBilling.amountPayable)}
              </strong>
            </div>

          </div>

          {/* WARNING */}
          <div className="service-charge-warning">
            <AlertCircle size={15} />

            <p>
              This charge is collected by our operations team.
              They will contact you shortly to arrange payment.
              Do NOT pay through any other channel.
            </p>
          </div>

          {/* CONTACT */}
          <button
            type="button"
            className="service-charge-contact-btn"
            onClick={handleContactOperations}
          >
            <Phone size={15} />
            Contact Operations
          </button>

        </section>

        {/* HISTORY */}
        <section className="service-charge-history-section">

          <div className="service-charge-history-heading">
            <h2>Service Charge History</h2>
          </div>

          <div className="service-charge-table-card">

            <div className="service-charge-table-wrapper">

              <table className="service-charge-table">

                <thead>
                  <tr>
                    <th>BILLING MONTH</th>
                    <th>INTEREST COLLECTED</th>
                    <th>CHARGE %</th>
                    <th>AMOUNT PAYABLE</th>
                    <th>AMOUNT PAID</th>
                    <th>OUTSTANDING</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>

                  {billing.map((row) => (
                    <tr key={row.month}>

                      <td>
                        <strong>{row.month}</strong>
                      </td>

                      <td>
                        {formatCurrency(row.interestCollected)}
                      </td>

                      <td>
                        <span className="service-charge-rate">
                          {row.chargeRate}%
                        </span>
                      </td>

                      <td>
                        <strong className="service-charge-payable">
                          {formatCurrency(row.amountPayable)}
                        </strong>
                      </td>

                      <td>
                        {row.amountPaid > 0 ? (
                          <strong className="service-charge-paid-amount">
                            {formatCurrency(row.amountPaid)}
                          </strong>
                        ) : (
                          <span className="service-charge-dash">
                            —
                          </span>
                        )}
                      </td>

                      <td>
                        {row.outstanding > 0 ? (
                          <strong className="service-charge-outstanding">
                            {formatCurrency(row.outstanding)}
                          </strong>
                        ) : (
                          <span className="service-charge-dash">
                            —
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`service-charge-status ${
                            row.status.toLowerCase()
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="service-charge-statement-btn"
                          onClick={() =>
                            setSelectedStatement(row)
                          }
                        >
                          <FileText size={13} />
                          Statement
                        </button>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* SUMMARY */}
          {/* <div className="service-charge-summary-strip">

            <div>
              <span>Total Payable</span>

              <strong>
                {formatCurrency(totals.totalPayable)}
              </strong>
            </div>

            <div>
              <span>Total Paid</span>

              <strong className="paid">
                {formatCurrency(totals.totalPaid)}
              </strong>
            </div>

            <div>
              <span>Total Outstanding</span>

              <strong className="outstanding">
                {formatCurrency(totals.totalOutstanding)}
              </strong>
            </div>

          </div> */}

        </section>

      </div>

      {/* STATEMENT MODAL */}
      {selectedStatement && (
        <div
          className="service-charge-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedStatement(null);
            }
          }}
        >

          <div className="service-charge-statement-modal">

            <div className="service-charge-modal-header">

              <div>
                <span>
                  SERVICE CHARGE STATEMENT
                </span>

                <h2>
                  {selectedStatement.month}
                </h2>

                <p>
                  INRFS monthly service charge statement
                </p>
              </div>

              <div className="service-charge-modal-actions">

                <button
                  type="button"
                  className="service-charge-modal-download"
                  onClick={handleDownloadStatement}
                >
                  <Download size={14} />
                  Export PDF
                </button>

                <button
                  type="button"
                  className="service-charge-modal-close"
                  onClick={() =>
                    setSelectedStatement(null)
                  }
                  aria-label="Close"
                >
                  <X size={19} />
                </button>

              </div>

            </div>

            <div className="service-charge-statement-body">

              <div className="service-charge-statement-brand">

                <div>
                  <strong>INRFS</strong>
                  <span>Financer Platform</span>
                </div>

                <CheckCircle2 size={24} />

              </div>

              <div className="service-charge-statement-grid">

                <div>
                  <span>Billing Month</span>
                  <strong>
                    {selectedStatement.month}
                  </strong>
                </div>

                <div>
                  <span>Interest Collected</span>
                  <strong>
                    {formatCurrency(
                      selectedStatement.interestCollected
                    )}
                  </strong>
                </div>

                <div>
                  <span>Service Charge Rate</span>
                  <strong>
                    {selectedStatement.chargeRate}%
                  </strong>
                </div>

                <div>
                  <span>Amount Payable</span>
                  <strong className="payable">
                    {formatCurrency(
                      selectedStatement.amountPayable
                    )}
                  </strong>
                </div>

                <div>
                  <span>Amount Paid</span>
                  <strong className="paid">
                    {formatCurrency(
                      selectedStatement.amountPaid
                    )}
                  </strong>
                </div>

                <div>
                  <span>Outstanding</span>
                  <strong className="outstanding">
                    {formatCurrency(
                      selectedStatement.outstanding
                    )}
                  </strong>
                </div>

              </div>

              <div className="service-charge-statement-note">

                <AlertCircle size={15} />

                <p>
                  Service charges are collected only through
                  the official operations process. Do not make
                  payment through any unauthorized channel.
                </p>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
