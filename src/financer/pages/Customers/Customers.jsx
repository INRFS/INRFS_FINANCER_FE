import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Upload,
  X,
  Check,
  CreditCard,
  Wallet,
  MessageSquare,
  FileText,
  Send,
  ChevronLeft,
  Download,
} from 'lucide-react';

import { formatCurrency } from '../../../common/utils/formatters';
import { platformApi, pageItems } from '../../../common/services/platformApi';
import { customerFromApi, customerToApi, loanFromApi } from '../../../common/utils/domainAdapters';

import './Customers.css';
import { useLocation } from 'react-router-dom';

/* =========================================================
   HELPERS
   ========================================================= */

const todayISO = () => new Date(Date.now() + 330 * 60 * 1000).toISOString().slice(0, 10);

const addLoanDuration = (startDate, value, unit) => {
  if (!startDate || Number(value) <= 0) return '';
  const [year, month, day] = startDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (unit === 'Days') date.setDate(date.getDate() + Number(value));
  else if (unit === 'Weeks') date.setDate(date.getDate() + Number(value) * 7);
  else {
    const targetDay = date.getDate();
    date.setDate(1); date.setMonth(date.getMonth() + Number(value));
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(targetDay, lastDay));
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const dateDays = (from, to) => from && to ? Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 86400000) : 0;
const firstInterestDue = (form, maturity) => {
  const candidate = form.collectionFrequency === 'Daily' ? addLoanDuration(form.startDate, 1, 'Days')
    : form.collectionFrequency === 'Weekly' ? addLoanDuration(form.startDate, 1, 'Weeks')
      : form.collectionFrequency === 'Monthly' ? addLoanDuration(form.startDate, 1, 'Months') : maturity;
  return candidate && maturity && candidate < maturity ? candidate : maturity;
};
const collectionInterestLabel = (frequency) => ({
  Daily: 'Estimated Interest per Day',
  Weekly: 'Estimated Interest per Week',
  Monthly: 'Estimated First Monthly Interest',
  AtMaturity: 'Estimated Interest at Maturity',
}[frequency] || 'Estimated Collection Interest');
const estimatedCollectionInterest = (form) => {
  const maturity = addLoanDuration(form.startDate, form.durationValue, form.durationUnit);
  const dueDate = firstInterestDue(form, maturity);
  const interestDays = dateDays(form.startDate, dueDate);
  return toNumber(form.principal) * toNumber(form.rate) / 100 * 12 * interestDays / 365;
};

const estimatedTotalInterest = (form) => (
  toNumber(form.principal)
  * toNumber(form.rate) / 100
  * 12
  * dateDays(form.startDate, addLoanDuration(form.startDate, form.durationValue, form.durationUnit)) / 365
);

const formatDate = (value) => {
  if (!value || value === '-') return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const toNumber = (value) => {
  const number = Number(String(value ?? '').replace(/[₹,\s]/g, ''));
  return Number.isFinite(number) ? number : 0;
};

const getInitial = (name) => name?.trim()?.charAt(0)?.toUpperCase() || 'C';

const buildCustomerDetails = (customer, index) => {
  const sourceLoans = Array.isArray(customer.loans) ? customer.loans : [];

  const loans =
    sourceLoans.length > 0
      ? sourceLoans.map((loan, loanIndex) => ({
          id: loan.id || `LN${String(index + 1).padStart(3, '0')}${String(loanIndex + 1).padStart(2, '0')}`,
          principal: toNumber(loan.principal),
          rate: loan.rate ?? 10,
          frequency: loan.frequency || 'Monthly',
          interest: toNumber(loan.interest),
          status: loan.status || customer.status || 'Active',
          startDate: loan.startDate || customer.loanStartDate || todayISO(),
          nextDue: loan.nextDue || customer.nextDue || '-',
        }))
      : [];

  const sourcePayments = Array.isArray(customer.payments)
    ? customer.payments
    : [];

  const payments =
    sourcePayments.length > 0
      ? sourcePayments.map((payment, paymentIndex) => ({
          id: payment.id || `PAY${String(index + 1).padStart(3, '0')}${String(paymentIndex + 1).padStart(3, '0')}`,
          date: payment.date || todayISO(),
          amount: toNumber(payment.amount),
          type: payment.type || 'Interest',
          method: payment.method || 'Cash',
          reference: payment.reference || '',
          notes: payment.notes || '',
          status: payment.status || 'Success',
        }))
      : [];

  const sourceNotes = Array.isArray(customer.notes) ? customer.notes : [];
  const sourceSms = Array.isArray(customer.smsHistory)
    ? customer.smsHistory
    : [];

  return {
    ...customer,
    email: customer.email || '',
    dob: customer.dob || '',
    gender: customer.gender || '',
    houseNumber: customer.houseNumber || '',
    street: customer.street || '',
    area: customer.area || '',
    state: customer.state || '',
    pinCode: customer.pinCode || '',
    aadhaar: customer.aadhaar || '',
    pan: customer.pan || '',
    loans,
    payments,
    notes: sourceNotes,
    smsHistory: sourceSms,
  };
};

const emptyCustomerForm = {
  name: '',
  mobile: '',
  email: '',
  dob: '',
  gender: '',
  houseNumber: '',
  street: '',
  area: '',
  city: '',
  state: '',
  pinCode: '',
  aadhaar: '',
  pan: '',
  aadhaarDocument: null,
  panDocument: null,
  addressProof: null,
  photograph: null,
  otherDocuments: null,
};

const emptyLoanForm = {
  principal: '',
  rate: '18',
  durationUnit: 'Days',
  durationValue: '13',
  collectionFrequency: 'Daily',
  startDate: todayISO(),
};

const emptyPaymentForm = {
  loanId: '',
  date: todayISO(),
  amount: '',
  type: 'Interest',
  method: 'PhonePe',
  reference: '',
  notes: '',
};

const tabList = [
  { key: 'overview', label: 'Overview' },
  { key: 'loans', label: 'Loans' },
  { key: 'payments', label: 'Payments' },
  { key: 'schedule', label: 'Interest Schedule' },
  { key: 'ledger', label: 'Ledger' },
  { key: 'documents', label: 'Documents' },
  // { key: 'notes', label: 'Notes' },
  // { key: 'sms', label: 'SMS History' },
];

/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function Customers() {
  const location = useLocation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [loanError, setLoanError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loanProducts, setLoanProducts] = useState([]);

  const loadCustomers = React.useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const [payload, loanPayload, paymentPayload, productPayload, schedulePayload] = await Promise.all([platformApi.customers.all(), platformApi.loans.all(), platformApi.payments.all(), platformApi.loans.products(), platformApi.payments.allSchedules()]);
      const products = pageItems(productPayload);
      setLoanProducts(products);
      const loanGroups = new Map();
      const loanCustomer = new Map();
      const schedulesByLoan = new Map();
      pageItems(schedulePayload).forEach((schedule) => { const group = schedulesByLoan.get(schedule.loanId) || []; group.push(schedule); schedulesByLoan.set(schedule.loanId, group); });
      pageItems(loanPayload).forEach((loan) => { loanCustomer.set(loan.id, loan.customerId); const group = loanGroups.get(loan.customerId) || []; group.push({ ...loanFromApi(loan), schedules: schedulesByLoan.get(loan.id) || [] }); loanGroups.set(loan.customerId, group); });
      const paymentGroups = new Map();
      pageItems(paymentPayload).forEach((payment) => { const customerId = loanCustomer.get(payment.loanId); if (!customerId) return; const group = paymentGroups.get(customerId) || []; group.push({ ...payment, date: payment.receivedAt, method: payment.mode, reference: payment.externalReference, type: 'Payment' }); paymentGroups.set(customerId, group); });
      setCustomers(pageItems(payload).map((item, index) => {
        const loans = loanGroups.get(item.id) || [];
        const nextDue = loans
          .filter((loan) => loan.status === 'Active' && loan.nextDue && loan.nextDue !== '-')
          .map((loan) => loan.nextDue)
          .sort()[0] || '-';
        return buildCustomerDetails({ ...customerFromApi(item), loans, payments: paymentGroups.get(item.id) || [], activeLoans: loans.filter((loan) => loan.status === 'Active').length, outstanding: loans.reduce((sum, loan) => sum + Number(loan.outstanding || 0), 0), nextDue }, index);
      }));
    } catch (error) {
      setPageError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const [search, setSearch] = useState(location.state?.search || '');
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSmsOpen, setIsSmsOpen] = useState(false);

  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [loanForm, setLoanForm] = useState(emptyLoanForm);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [smsMessage, setSmsMessage] = useState('');

  const [currentStep, setCurrentStep] = useState(1);
  const [noteText, setNoteText] = useState('');

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) || null,
    [customers, selectedCustomerId]
  );

  const filteredCustomers = customers.filter((customer) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      !searchValue ||
      customer.name?.toLowerCase().includes(searchValue) ||
      customer.mobile?.toLowerCase().includes(searchValue) ||
      customer.id?.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === 'All' || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (customer) => customer.status === 'Active'
  ).length;
  const overdueCustomers = customers.filter(
    (customer) => customer.status === 'Overdue'
  ).length;

  const openCustomer = (customerId, tab = 'overview') => {
    setSelectedCustomerId(customerId);
    setActiveTab(tab);
  };

  const closeCustomer = () => {
    setSelectedCustomerId(null);
    setActiveTab('overview');
  };

  const updateCustomerById = (customerId, updater) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId ? updater(customer) : customer
      )
    );
  };

  /* =======================================================
     CUSTOMER WIZARD
     ======================================================= */

  const openAddCustomer = () => {
    setPageError('');
    setCustomerForm({ ...emptyCustomerForm });
    setCurrentStep(1);
    setIsAddCustomerOpen(true);
  };

  const closeAddCustomer = () => {
    setPageError('');
    setIsAddCustomerOpen(false);
    setCurrentStep(1);
  };

  const updateCustomerForm = (field, value) => {
    setCustomerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCustomerFile = (field, event) => {
    updateCustomerForm(field, event.target.files?.[0] || null);
  };

  const handleCustomerWizardNext = async (event) => {
    event?.preventDefault();

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    setSaving(true);
    setPageError('');
    try {
      const created = await platformApi.customers.create(customerToApi(customerForm));
      const uploads = [
        ['aadhaarDocument', 'Aadhaar'], ['panDocument', 'Pan'], ['addressProof', 'AddressProof'], ['photograph', 'Photograph'], ['otherDocuments', 'Other'],
      ].filter(([field]) => customerForm[field]);
      await Promise.all(uploads.map(([field, category]) => platformApi.documents.upload(customerForm[field], category, created.id)));
      const newCustomer = buildCustomerDetails(customerFromApi(created), customers.length);
      setCustomers((prev) => [newCustomer, ...prev]);
      closeAddCustomer();
      setSelectedCustomerId(newCustomer.id);
      setActiveTab('overview');
    } catch (error) {
      setPageError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleWizardBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  /* =======================================================
     EDIT CUSTOMER
     ======================================================= */

  const openEditCustomer = (customer = selectedCustomer) => {
    if (!customer) return;

    setCustomerForm({
      ...emptyCustomerForm,
      name: customer.name || '',
      mobile: customer.mobile || '',
      email: customer.email || '',
      dob: customer.dob || '',
      gender: customer.gender || '',
      houseNumber: customer.houseNumber || '',
      street: customer.street || '',
      area: customer.area || '',
      city: customer.city || '',
      state: customer.state || '',
      pinCode: customer.pinCode || '',
      aadhaar: customer.aadhaar || '',
      pan: customer.pan || '',
    });

    setIsEditCustomerOpen(true);
  };

  const saveCustomerEdit = async (event) => {
    event?.preventDefault();

    if (!selectedCustomer) return;

    setSaving(true);
    try {
      const updated = await platformApi.customers.update(selectedCustomer.id, customerToApi({ ...customerForm, status: selectedCustomer.status }, true));
      updateCustomerById(selectedCustomer.id, (customer) => buildCustomerDetails({ ...customer, ...customerFromApi(updated) }, 0));
      setIsEditCustomerOpen(false);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     ADD LOAN
     ======================================================= */

  const openAddLoan = (customer = selectedCustomer) => {
    if (!customer) return;
    const product = loanProducts.find((item) => item.isActive !== false) || loanProducts[0];
    const startDate = todayISO();
    setLoanError('');
    setLoanForm({
      ...emptyLoanForm,
      rate: String(product?.annualInterestRate ?? emptyLoanForm.rate),
      startDate,
    });

    setIsAddLoanOpen(true);
  };

  const updateLoanForm = (field, value) => {
    setLoanError('');
    setLoanForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveLoan = async (event) => {
    event?.preventDefault();

    if (!selectedCustomer) return;

    const principal = toNumber(loanForm.principal);
    if (principal <= 0) { setLoanError('Enter a valid principal amount.'); return; }
    if (toNumber(loanForm.durationValue) <= 0) { setLoanError('Enter a valid number of periods.'); return; }
    setSaving(true);
    setLoanError('');
    try {
      const product = loanProducts.find((item) => item.isActive !== false) || loanProducts[0];
      if (!product) throw new Error('No active loan product is configured.');
      if (principal < Number(product.minimumPrincipal) || principal > Number(product.maximumPrincipal)) throw new Error(`Principal must be between ${formatCurrency(product.minimumPrincipal)} and ${formatCurrency(product.maximumPrincipal)}.`);
      const monthlyInterestRate = toNumber(loanForm.rate);
      await platformApi.loans.create({ customerId: selectedCustomer.id, loanProductId: product.id, principal, annualInterestRate: monthlyInterestRate, tenureMonths: Math.max(product.minimumTenureMonths || 1, 1), startDate: loanForm.startDate, durationValue: toNumber(loanForm.durationValue), durationUnit: loanForm.durationUnit, interestRate: monthlyInterestRate, interestRateBasis: 'PerMonth', interestCollectionFrequency: loanForm.collectionFrequency });
      setIsAddLoanOpen(false); setLoanForm({ ...emptyLoanForm }); setActiveTab('loans'); await loadCustomers();
    } catch (error) { setLoanError(error.message); }
    finally { setSaving(false); }
  };

  /* =======================================================
     PAYMENT
     ======================================================= */

  const openPayment = (customer = selectedCustomer) => {
    if (!customer) return;

    setPaymentForm({
      ...emptyPaymentForm,
      loanId: customer.loans?.find((loan) => loan.status !== 'Closed')?.id || '',
      date: todayISO(),
    });

    setIsPaymentOpen(true);
  };

  const updatePaymentForm = (field, value) => {
    setPaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const savePayment = async (event) => {
    event?.preventDefault();

    if (!selectedCustomer) return;

    const amount = toNumber(paymentForm.amount);

    if (amount <= 0) return;

    if (!paymentForm.loanId) return setPageError('Select a loan for this payment.');
    const modeMap = { PhonePe: 'Upi', 'Google Pay': 'Upi', UPI: 'Upi', 'Bank Transfer': 'BankTransfer' };
    setSaving(true);
    try {
      await platformApi.payments.record({ loanId: paymentForm.loanId, paymentScheduleId: null, amount, receivedAt: new Date(`${paymentForm.date || todayISO()}T12:00:00`).toISOString(), mode: modeMap[paymentForm.method] || paymentForm.method, externalReference: paymentForm.reference || null, notes: paymentForm.notes || null });
      setIsPaymentOpen(false); setPaymentForm({ ...emptyPaymentForm }); setActiveTab('payments'); await loadCustomers();
    } catch (error) { setPageError(error.message); }
    finally { setSaving(false); }
  };

  /* =======================================================
     NOTES
     ======================================================= */

  const addNote = async () => {
    const text = noteText.trim();

    if (!selectedCustomer || !text) return;

    await platformApi.customers.addNote(selectedCustomer.id, { text });
    updateCustomerById(selectedCustomer.id, (customer) => ({
      ...customer,
      notes: [
        {
          id: `NOTE-${Date.now()}`,
          text,
          date: todayISO(),
        },
        ...(customer.notes || []),
      ],
    }));

    setNoteText('');
  };

  /* =======================================================
     SMS
     ======================================================= */

  const sendSms = (event) => {
    event?.preventDefault();

    const message = smsMessage.trim();

    if (!selectedCustomer || !message) return;

    updateCustomerById(selectedCustomer.id, (customer) => ({
      ...customer,
      smsHistory: [
        {
          id: `SMS-${Date.now()}`,
          date: todayISO(),
          message,
          status: 'Sent',
        },
        ...(customer.smsHistory || []),
      ],
    }));

    setSmsMessage('');
    setIsSmsOpen(false);
    setActiveTab('sms');
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="fin-customer-module">
      {pageError && (
        <div role="alert" className="fin-customer-inline-alert">
          {pageError} <button type="button" onClick={loadCustomers}>Retry</button>
        </div>
      )}
      {loading && <p aria-live="polite">Loading customers...</p>}
      {saving && <p aria-live="polite">Saving changes...</p>}
      <div className="fin-customer-page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage your customers and their loan accounts.</p>
        </div>

        <button
          type="button"
          className="fin-customer-primary-btn"
          onClick={openAddCustomer}
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      <div className="fin-customer-stats-grid">
        <StatCard
          icon={<Users size={19} />}
          iconClass="navy"
          label="Total Customers"
          value={totalCustomers}
        />

        <StatCard
          icon={<UserCheck size={19} />}
          iconClass="green"
          label="Active Customers"
          value={activeCustomers}
        />

        <StatCard
          icon={<UserPlus size={19} />}
          iconClass="cyan"
          label="New This Month"
          value={12}
        />

        <StatCard
          icon={<AlertCircle size={19} />}
          iconClass="red"
          label="Customers With Overdue"
          value={overdueCustomers}
          valueClass="red"
        />
      </div>

      <div className="fin-customer-toolbar">
        <div className="fin-customer-search-wrap">
          <span className="fin-customer-search-icon">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer name, phone or ID..."
          />
        </div>

        <div className="fin-customer-status-filter">
          <label htmlFor="customer-status-filter">Status:</label>
          <select
            id="customer-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Due">Due</option>
            <option value="Overdue">Overdue</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="fin-customer-table-card">
        <div className="fin-customer-table-scroll">
          <table className="fin-customer-table">
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>MOBILE</th>
                <th>CITY</th>
                <th className="center">ACTIVE LOANS</th>
                <th>OUTSTANDING</th>
                <th>NEXT DUE</th>
                <th>STATUS</th>
                <th className="actions-head">ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="fin-customer-name-cell">
                      <div className="fin-customer-avatar">
                        {getInitial(customer.name)}
                      </div>

                      <div>
                        <strong>{customer.name}</strong>
                        <span>{customer.id}</span>
                      </div>
                    </div>
                  </td>

                  <td>{customer.mobile}</td>
                  <td>{customer.city}</td>

                  <td className="center">
                    <strong>{customer.activeLoans || 0}</strong>
                  </td>

                  <td>
                    <strong className="fin-customer-outstanding">
                      {formatCurrency(toNumber(customer.outstanding))}
                    </strong>
                  </td>

                  <td>{customer.nextDue || '-'}</td>

                  <td>
                    <CustomerStatus status={customer.status} />
                  </td>

                  <td className="actions-cell">
                    <div className="fin-customer-row-actions">
                      <button
                        type="button"
                        className="fin-customer-icon-btn"
                        title={`View ${customer.name}`}
                        onClick={() => openCustomer(customer.id)}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        className="fin-customer-icon-btn"
                        title={`Edit ${customer.name}`}
                        onClick={() => {
                          setSelectedCustomerId(customer.id);
                          openEditCustomer(customer);
                        }}
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="8" className="fin-customer-empty">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddCustomerOpen && (
        <CustomerWizard
          form={customerForm}
          updateForm={updateCustomerForm}
          currentStep={currentStep}
          onNext={handleCustomerWizardNext}
          onBack={handleWizardBack}
          onClose={closeAddCustomer}
          onFileChange={handleCustomerFile}
          error={pageError}
          saving={saving}
        />
      )}

      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={closeCustomer}
          onEdit={() => openEditCustomer(selectedCustomer)}
          onAddLoan={() => openAddLoan(selectedCustomer)}
          onRecordPayment={() => openPayment(selectedCustomer)}
          onSendSms={() => setIsSmsOpen(true)}
          noteText={noteText}
          setNoteText={setNoteText}
          onAddNote={addNote}
        />
      )}

      {isEditCustomerOpen && selectedCustomer && (
        <FormModal
          title="Edit Customer"
          subtitle={`${selectedCustomer.id} · Update only this customer's information`}
          onClose={() => setIsEditCustomerOpen(false)}
        >
          <form onSubmit={saveCustomerEdit}>
            <CustomerFields
              form={customerForm}
              updateForm={updateCustomerForm}
              compact
            />

            <div className="fin-customer-form-actions">
              <button
                type="button"
                className="fin-customer-secondary-btn"
                onClick={() => setIsEditCustomerOpen(false)}
              >
                Cancel
              </button>

              <button type="submit" className="fin-customer-primary-btn">
                <Check size={17} />
                Save Changes
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {isAddLoanOpen && selectedCustomer && (
        <FormModal
          title="Add Loan"
          subtitle={`${selectedCustomer.name} · ${selectedCustomer.id}`}
          onClose={() => setIsAddLoanOpen(false)}
        >
          <form onSubmit={saveLoan}>
            <div className="fin-customer-form-grid">
              <FormField label="Principal Amount (₹)" required>
                <input
                  type="number"
                  min="1"
                  value={loanForm.principal}
                  onChange={(event) =>
                    updateLoanForm('principal', event.target.value)
                  }
                  placeholder="10000"
                  required
                />
              </FormField>

              <FormField label="Monthly Interest Rate (%)" required>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={loanForm.rate}
                  onChange={(event) =>
                    updateLoanForm('rate', event.target.value)
                  }
                  required
                />
              </FormField>

              <FormField label="Loan Period Unit" required>
                <select value={loanForm.durationUnit} onChange={(event) => updateLoanForm('durationUnit', event.target.value)}>
                  <option>Days</option><option>Weeks</option><option>Months</option>
                </select>
              </FormField>

              <FormField label={`Number of ${loanForm.durationUnit}`} required>
                <input
                  type="number"
                  min="1"
                  value={loanForm.durationValue}
                  onChange={(event) => updateLoanForm('durationValue', event.target.value)}
                  required
                />
              </FormField>

              <FormField label="Interest Collection" required>
                <select value={loanForm.collectionFrequency} onChange={(event) => updateLoanForm('collectionFrequency', event.target.value)}>
                  <option>Daily</option><option>Weekly</option><option>Monthly</option><option value="AtMaturity">At Maturity</option>
                </select>
              </FormField>

              <FormField label="Start Date" required>
                <input
                  type="date"
                  value={loanForm.startDate}
                  onChange={(event) =>
                    updateLoanForm('startDate', event.target.value)
                  }
                  required
                />
              </FormField>

              <FormField label="Maturity Date">
                <input
                  type="date"
                  value={addLoanDuration(loanForm.startDate, loanForm.durationValue, loanForm.durationUnit)}
                  readOnly
                />
              </FormField>

              <FormField label="First Interest Due">
                <input type="date" value={firstInterestDue(loanForm, addLoanDuration(loanForm.startDate, loanForm.durationValue, loanForm.durationUnit))} readOnly />
              </FormField>

              <FormField label={collectionInterestLabel(loanForm.collectionFrequency)}>
                <input type="text" value={formatCurrency(estimatedCollectionInterest(loanForm))} readOnly />
              </FormField>

              <FormField label="Estimated Total Interest">
                <input type="text" value={formatCurrency(estimatedTotalInterest(loanForm))} readOnly />
              </FormField>
            </div>

            {loanError && <div className="fin-customer-modal-error" role="alert">{loanError}</div>}

            <div className="fin-customer-preview-box">
              <span>New outstanding</span>
              <strong>
                {formatCurrency(
                  toNumber(selectedCustomer.outstanding) +
                    toNumber(loanForm.principal)
                )}
              </strong>
            </div>

            <div className="fin-customer-form-actions">
              <button
                type="button"
                className="fin-customer-secondary-btn"
                onClick={() => { setLoanError(''); setIsAddLoanOpen(false); }}
                disabled={saving}
              >
                Cancel
              </button>

              <button type="submit" className="fin-customer-primary-btn" disabled={saving}>
                <Plus size={17} />
                {saving ? 'Adding...' : 'Add Loan'}
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {isPaymentOpen && selectedCustomer && (
        <FormModal
          title="Record Payment"
          subtitle={`${selectedCustomer.name} · ${selectedCustomer.id}`}
          onClose={() => setIsPaymentOpen(false)}
          wide
        >
          <form onSubmit={savePayment}>
            <div className="fin-customer-form-grid">
              <FormField label="Loan" required>
                <select value={paymentForm.loanId} onChange={(event) => updatePaymentForm('loanId', event.target.value)} required>
                  <option value="">Select loan</option>
                  {selectedCustomer.loans.filter((loan) => loan.status !== 'Closed').map((loan) => <option key={loan.id} value={loan.id}>{loan.displayId || loan.loanNumber || loan.id}</option>)}
                </select>
              </FormField>
              <FormField label="Payment Date" required>
                <input
                  type="date"
                  value={paymentForm.date}
                  onChange={(event) =>
                    updatePaymentForm('date', event.target.value)
                  }
                  required
                />
              </FormField>

              <FormField label="Amount Received (₹)" required>
                <input
                  type="number"
                  min="1"
                  value={paymentForm.amount}
                  onChange={(event) =>
                    updatePaymentForm('amount', event.target.value)
                  }
                  placeholder="Enter amount"
                  required
                />
              </FormField>
            </div>

            <FormField label="Payment Type" required>
              <div className="fin-customer-choice-row">
                {['Interest', 'Principal', 'Principal + Interest'].map((type) => (
                  <button
                    type="button"
                    key={type}
                    className={
                      paymentForm.type === type
                        ? 'fin-customer-choice active'
                        : 'fin-customer-choice'
                    }
                    onClick={() => updatePaymentForm('type', type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </FormField>

            <div className="fin-customer-form-grid">
              <FormField label="Payment Method" required>
                <select
                  value={paymentForm.method}
                  onChange={(event) =>
                    updatePaymentForm('method', event.target.value)
                  }
                >
                  <option>PhonePe</option>
                  <option>Google Pay</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Cheque</option>
                </select>
              </FormField>

              <FormField label="Transaction Reference">
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(event) =>
                    updatePaymentForm('reference', event.target.value)
                  }
                  placeholder="Optional"
                />
              </FormField>
            </div>

            <FormField label="Notes">
              <textarea
                value={paymentForm.notes}
                onChange={(event) =>
                  updatePaymentForm('notes', event.target.value)
                }
                placeholder="Optional notes..."
                rows="3"
              />
            </FormField>

            <div className="fin-customer-payment-summary">
              <div>
                <span>Amount Due</span>
                <strong>
                  {formatCurrency(toNumber(selectedCustomer.outstanding))}
                </strong>
              </div>

              <div>
                <span>Amount Received</span>
                <strong className="green-text">
                  {formatCurrency(toNumber(paymentForm.amount))}
                </strong>
              </div>

              <div>
                <span>Outstanding After Payment</span>
                <strong className="orange-text">
                  {formatCurrency(
                    Math.max(
                      0,
                      toNumber(selectedCustomer.outstanding) -
                        toNumber(paymentForm.amount)
                    )
                  )}
                </strong>
              </div>
            </div>

            <div className="fin-customer-form-actions">
              <button
                type="button"
                className="fin-customer-secondary-btn"
                onClick={() => setIsPaymentOpen(false)}
              >
                Cancel
              </button>

              <button type="submit" className="fin-customer-primary-btn">
                <Wallet size={17} />
                Save Payment
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {isSmsOpen && selectedCustomer && (
        <FormModal
          title="Send SMS"
          subtitle={`${selectedCustomer.name} · ${selectedCustomer.mobile}`}
          onClose={() => setIsSmsOpen(false)}
        >
          <form onSubmit={sendSms}>
            <div className="fin-customer-sms-recipient">
              <MessageSquare size={18} />
              <div>
                <strong>{selectedCustomer.name}</strong>
                <span>{selectedCustomer.mobile}</span>
              </div>
            </div>

            <FormField label="Message" required>
              <textarea
                rows="6"
                value={smsMessage}
                onChange={(event) => setSmsMessage(event.target.value)}
                placeholder="Type the SMS message..."
                maxLength="320"
                required
              />
            </FormField>

            <div className="fin-customer-character-count">
              {smsMessage.length}/320
            </div>

            <div className="fin-customer-form-actions">
              <button
                type="button"
                className="fin-customer-secondary-btn"
                onClick={() => setIsSmsOpen(false)}
              >
                Cancel
              </button>

              <button type="submit" className="fin-customer-primary-btn">
                <Send size={17} />
                Send SMS
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
}

/* =========================================================
   CUSTOMER DETAILS MODAL
   ========================================================= */

function CustomerDetailsModal({
  customer,
  activeTab,
  setActiveTab,
  onClose,
  onEdit,
  onAddLoan,
  noteText,
  setNoteText,
  onAddNote,
}) {
  const ledger = customer.ledger || buildLedgerFromCustomer(customer);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState('');

  useEffect(() => {
    if (activeTab !== 'documents') return;
    setDocumentsLoading(true);
    setDocumentsError('');
    platformApi.documents.listForCustomer(customer.id)
      .then((result) => setDocuments(pageItems(result)))
      .catch((reason) => setDocumentsError(reason.message))
      .finally(() => setDocumentsLoading(false));
  }, [activeTab, customer.id]);

  return (
    <div className="fin-customer-overlay" onMouseDown={onClose}>
      <div
        className="fin-customer-details-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="fin-customer-details-header">
          <div className="fin-customer-profile">
            <div className="fin-customer-profile-avatar">
              {getInitial(customer.name)}
            </div>

            <div>
              <h2>{customer.name}</h2>

              <div className="fin-customer-profile-meta">
                <span>{customer.id}</span>
                <span>·</span>
                <span>{customer.mobile}</span>
                <span>·</span>
                <CustomerStatus status={customer.status} />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="fin-customer-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="fin-customer-detail-actions">
          <button
            type="button"
            className="fin-customer-detail-btn"
            onClick={onEdit}
          >
            <Edit size={16} />
            Edit
          </button>

          <button
            type="button"
            className="fin-customer-detail-btn primary"
            onClick={onAddLoan}
          >
            <Plus size={17} />
            Add Loan
          </button>

          {/* <button
            type="button"
            className="fin-customer-detail-btn"
            onClick={onRecordPayment}
          >
            <Wallet size={16} />
            Record Payment
          </button> */}

          {/* <button
            type="button"
            className="fin-customer-detail-btn"
            onClick={onSendSms}
          >
            <MessageSquare size={16} />
            Send SMS
          </button> */}
        </div>

        <div className="fin-customer-tabs" role="tablist">
          {tabList.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={
                activeTab === tab.key
                  ? 'fin-customer-tab active'
                  : 'fin-customer-tab'
              }
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="fin-customer-detail-content">
          {activeTab === 'overview' && (
            <OverviewTab customer={customer} />
          )}

          {activeTab === 'loans' && (
            <LoansTab loans={customer.loans || []} />
          )}

          {activeTab === 'payments' && (
            <PaymentsTab payments={customer.payments || []} />
          )}

          {activeTab === 'schedule' && <ScheduleTab loans={customer.loans || []} />}

          {activeTab === 'ledger' && <LedgerTab ledger={ledger} />}

          {activeTab === 'documents' && <DocumentsTab documents={documents} loading={documentsLoading} error={documentsError} />}

          {activeTab === 'notes' && (
            <NotesTab
              notes={customer.notes || []}
              noteText={noteText}
              setNoteText={setNoteText}
              onAddNote={onAddNote}
            />
          )}

          {activeTab === 'sms' && (
            <SmsHistoryTab history={customer.smsHistory || []} />
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TABS
   ========================================================= */

function OverviewTab({ customer }) {
  return (
    <div className="fin-customer-overview">
      <div className="fin-customer-overview-grid">
        <InfoItem label="Email" value={customer.email || '-'} />
        <InfoItem label="Date of Birth" value={customer.dob || '-'} />
        <InfoItem label="City" value={customer.city || '-'} />
        <InfoItem label="State" value={customer.state || '-'} />
        <InfoItem label="Aadhaar" value={customer.aadhaar || '-'} />
        <InfoItem label="PAN" value={customer.pan || '-'} />
        <InfoItem
          label="Active Loans"
          value={customer.activeLoans ?? customer.loans?.length ?? 0}
        />
        <InfoItem
          label="Outstanding"
          value={formatCurrency(toNumber(customer.outstanding))}
        />
      </div>

      <div className="fin-customer-overview-summary">
        <SummaryMiniCard
          icon={<CreditCard size={18} />}
          label="Loan Accounts"
          value={customer.loans?.length || 0}
        />
        <SummaryMiniCard
          icon={<Wallet size={18} />}
          label="Payments"
          value={customer.payments?.length || 0}
        />
        <SummaryMiniCard
          icon={<FileText size={18} />}
          label="Notes"
          value={customer.notes?.length || 0}
        />
        <SummaryMiniCard
          icon={<MessageSquare size={18} />}
          label="SMS Sent"
          value={customer.smsHistory?.length || 0}
        />
      </div>
    </div>
  );
}

function LoansTab({ loans }) {
  if (!loans.length) {
    return <EmptyState text="No loan accounts for this customer." />;
  }

  return (
    <div className="fin-customer-loan-list">
      {loans.map((loan) => (
        <div className="fin-customer-loan-card" key={loan.id}>
          <div className="fin-customer-loan-top">
            <strong>{loan.displayId || loan.loanNumber || loan.id}</strong>
            <CustomerStatus status={loan.status} />
          </div>

          <div className="fin-customer-loan-grid">
            <MetricItem label="Principal" value={formatCurrency(loan.principal)} />
            <MetricItem label="Rate" value={`${loan.rate}%`} />
            <MetricItem label="Frequency" value={loan.frequency} />
            <MetricItem label="Interest" value={formatCurrency(loan.interest)} />
            <MetricItem label="Start Date" value={formatDate(loan.startDate)} />
            <MetricItem label="Next Due" value={loan.nextDue || '-'} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ScheduleTab({ loans }) {
  const rows = loans.flatMap((loan) => (loan.schedules || []).map((schedule) => ({ ...schedule, loanNumber: loan.displayId || loan.id })));
  if (!rows.length) return <EmptyState text="No scheduled dues. Generated interest and principal dues will appear here." />;
  return <div className="fin-customer-table-list">{rows.map((row) => (
    <div className="fin-customer-table-row" key={row.id}>
      <div><strong>{row.loanNumber}</strong><span>{formatDate(row.dueDate)} · {row.interestDays || 0} interest days</span></div>
      <div><strong>{formatCurrency(row.interestDue)}</strong><span>Interest</span></div>
      <div><strong>{formatCurrency(row.principalDue)}</strong><span>Principal</span></div>
      <div><strong>{formatCurrency(row.remainingAmount ?? row.balance ?? row.totalDue)}</strong><span>{String(row.status).replace('PartiallyPaid', 'Partially paid')}</span></div>
    </div>
  ))}</div>;
}

function PaymentsTab({ payments }) {
  if (!payments.length) {
    return <EmptyState text="No payments recorded for this customer." />;
  }

  return (
    <div className="fin-customer-inner-table-wrap">
      <table className="fin-customer-inner-table">
        <thead>
          <tr>
            <th>DATE</th>
            <th>AMOUNT</th>
            <th>TYPE</th>
            <th>METHOD</th>
            <th>REFERENCE</th>
            <th>STATUS</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>{formatDate(payment.date)}</td>
              <td>
                <strong>{formatCurrency(payment.amount)}</strong>
              </td>
              <td>{payment.type}</td>
              <td>{payment.method}</td>
              <td>{payment.reference || '-'}</td>
              <td>
                <CustomerStatus status={payment.status || 'Success'} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LedgerTab({ ledger }) {
  if (!ledger.length) {
    return <EmptyState text="No ledger entries for this customer." />;
  }

  return (
    <div className="fin-customer-inner-table-wrap">
      <table className="fin-customer-inner-table ledger">
        <thead>
          <tr>
            <th>DATE</th>
            <th>DESCRIPTION</th>
            <th>DEBIT</th>
            <th>CREDIT</th>
            <th>BALANCE</th>
            <th>STATUS</th>
          </tr>
        </thead>

        <tbody>
          {ledger.map((entry) => (
            <tr key={entry.id}>
              <td>{formatDate(entry.date)}</td>
              <td>{entry.description}</td>
              <td className="ledger-debit">
                {entry.debit ? formatCurrency(entry.debit) : '—'}
              </td>
              <td className="ledger-credit">
                {entry.credit ? formatCurrency(entry.credit) : '—'}
              </td>
              <td>
                <strong>{formatCurrency(entry.balance)}</strong>
              </td>
              <td>
                <CustomerStatus status={entry.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NotesTab({ notes, noteText, setNoteText, onAddNote }) {
  return (
    <div className="fin-customer-notes">
      <div className="fin-customer-note-compose">
        <textarea
          rows="3"
          value={noteText}
          onChange={(event) => setNoteText(event.target.value)}
          placeholder="Add a note about this customer..."
        />

        <button
          type="button"
          className="fin-customer-primary-btn"
          onClick={onAddNote}
          disabled={!noteText.trim()}
        >
          <Plus size={17} />
          Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <EmptyState text="No notes added for this customer." />
      ) : (
        <div className="fin-customer-note-list">
          {notes.map((note) => (
            <div className="fin-customer-note-card" key={note.id}>
              <FileText size={17} />
              <div>
                <p>{note.text || note.message}</p>
                <span>{formatDate(note.date)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SmsHistoryTab({ history }) {
  if (!history.length) {
    return <EmptyState text="No SMS history for this customer." />;
  }

  return (
    <div className="fin-customer-sms-list">
      {history.map((sms) => (
        <div className="fin-customer-sms-card" key={sms.id}>
          <div className="fin-customer-sms-icon">
            <MessageSquare size={17} />
          </div>

          <div className="fin-customer-sms-content">
            <div>
              <strong>{formatDate(sms.date)}</strong>
              <CustomerStatus status={sms.status || 'Sent'} />
            </div>
            <p>{sms.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   CUSTOMER WIZARD
   ========================================================= */

function CustomerWizard({
  form,
  updateForm,
  currentStep,
  onNext,
  onBack,
  onClose,
  onFileChange,
  error,
  saving,
}) {
  const labels = ['Personal Info', 'Address', 'KYC', 'Documents'];

  return (
    <div className="fin-customer-overlay" onMouseDown={onClose}>
      <div
        className="fin-customer-wizard-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="fin-customer-modal-heading">
          <div>
            <h2>Add New Customer</h2>
            <p>
              Step {currentStep} of 4 · {labels[currentStep - 1]}
            </p>
          </div>

          <button
            type="button"
            className="fin-customer-modal-close"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>

        <div className="fin-customer-progress">
          {labels.map((label, index) => {
            const step = index + 1;
            const state =
              currentStep > step
                ? 'completed'
                : currentStep === step
                  ? 'current'
                  : '';

            return (
              <div className="fin-customer-progress-item" key={label}>
                <div className={`progress-dot ${state}`}>{step}</div>
                <span className={state}>{label}</span>
              </div>
            );
          })}
        </div>

        {error && <div className="fin-customer-modal-error" role="alert">{error}</div>}

        <div className="fin-customer-wizard-content">
          {currentStep === 1 && (
            <form onSubmit={onNext}>
              <CustomerFields form={form} updateForm={updateForm} />
              <WizardActions onClose={onClose} />
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={onNext}>
              <div className="fin-customer-form-grid">
                <FormField label="House / Flat Number">
                  <input
                    value={form.houseNumber}
                    onChange={(event) =>
                      updateForm('houseNumber', event.target.value)
                    }
                    placeholder="12, MG Road"
                  />
                </FormField>

                <FormField label="Street">
                  <input
                    value={form.street}
                    onChange={(event) =>
                      updateForm('street', event.target.value)
                    }
                    placeholder="Andheri West"
                  />
                </FormField>

                <FormField label="Area">
                  <input
                    value={form.area}
                    onChange={(event) =>
                      updateForm('area', event.target.value)
                    }
                    placeholder="Andheri"
                  />
                </FormField>

                <FormField label="City" required>
                  <input
                    value={form.city}
                    onChange={(event) =>
                      updateForm('city', event.target.value)
                    }
                    placeholder="Mumbai"
                    required
                  />
                </FormField>

                <FormField label="State" required>
                  <input
                    value={form.state}
                    onChange={(event) =>
                      updateForm('state', event.target.value)
                    }
                    placeholder="Maharashtra"
                    required
                  />
                </FormField>

                <FormField label="PIN Code" required>
                  <input
                    value={form.pinCode}
                    onChange={(event) =>
                      updateForm('pinCode', event.target.value)
                    }
                    placeholder="400001"
                    required
                  />
                </FormField>
              </div>

              <WizardNavigation onBack={onBack} />
              <button type="submit" className="fin-customer-primary-btn wizard-next">
                Continue <ChevronLeft size={17} className="rotate-180" />
              </button>
            </form>
          )}

          {currentStep === 3 && (
            <form onSubmit={onNext}>
              <div className="fin-customer-single-form">
                <FormField label="Aadhaar Number">
                  <input
                    value={form.aadhaar}
                    onChange={(event) =>
                      updateForm('aadhaar', event.target.value)
                    }
                    placeholder="1234 5678 9012"
                  />
                </FormField>

                <FormField label="PAN Number">
                  <input
                    value={form.pan}
                    onChange={(event) =>
                      updateForm('pan', event.target.value.toUpperCase())
                    }
                    placeholder="ABCDE1234F"
                  />
                </FormField>
              </div>

              <WizardNavigation onBack={onBack} />
              <button type="submit" className="fin-customer-primary-btn wizard-next">
                Continue <ChevronLeft size={17} className="rotate-180" />
              </button>
            </form>
          )}

          {currentStep === 4 && (
            <form onSubmit={onNext}>
              <div className="fin-customer-document-grid">
                <DocumentUpload
                  label="Upload Aadhaar Card"
                  file={form.aadhaarDocument}
                  onChange={(event) =>
                    onFileChange('aadhaarDocument', event)
                  }
                />

                <DocumentUpload
                  label="Upload PAN Card"
                  file={form.panDocument}
                  onChange={(event) =>
                    onFileChange('panDocument', event)
                  }
                />

                <DocumentUpload
                  label="Upload Address Proof"
                  file={form.addressProof}
                  onChange={(event) =>
                    onFileChange('addressProof', event)
                  }
                />

                <DocumentUpload
                  label="Upload Photograph"
                  file={form.photograph}
                  onChange={(event) =>
                    onFileChange('photograph', event)
                  }
                />

                <DocumentUpload
                  label="Upload Other Documents"
                  file={form.otherDocuments}
                  onChange={(event) =>
                    onFileChange('otherDocuments', event)
                  }
                />
              </div>

              <div className="fin-customer-form-actions">
                <button
                  type="button"
                  className="fin-customer-secondary-btn"
                  onClick={onBack}
                >
                  ← Back
                </button>

                <button type="submit" className="fin-customer-primary-btn" disabled={saving}>
                  <Check size={17} />
                  {saving ? 'Saving…' : 'Save Customer'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REUSABLE UI
   ========================================================= */

function CustomerFields({ form, updateForm, compact = false }) {
  return (
    <div className="fin-customer-form-grid">
      <FormField label="Full Name" required full={compact ? false : true}>
        <input
          value={form.name}
          onChange={(event) => updateForm('name', event.target.value)}
          placeholder="Ramesh Kumar"
          required
        />
      </FormField>

      <FormField label="Mobile Number" required>
        <input
          value={form.mobile}
          onChange={(event) => updateForm('mobile', event.target.value)}
          placeholder="+91 98001 11111"
          required
        />
      </FormField>

      <FormField label="Email Address">
        <input
          type="email"
          value={form.email}
          onChange={(event) => updateForm('email', event.target.value)}
          placeholder="ramesh@gmail.com"
        />
      </FormField>

      <FormField label="Date of Birth">
        <input
          type="date"
          value={form.dob}
          onChange={(event) => updateForm('dob', event.target.value)}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().slice(0, 10)}
          required
        />
      </FormField>

      <FormField label="Gender">
        <select
          value={form.gender}
          onChange={(event) => updateForm('gender', event.target.value)}
        >
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </FormField>

      {compact && (
        <>
          <FormField label="House / Flat Number">
            <input
              value={form.houseNumber}
              onChange={(event) =>
                updateForm('houseNumber', event.target.value)
              }
            />
          </FormField>

          <FormField label="Street">
            <input
              value={form.street}
              onChange={(event) => updateForm('street', event.target.value)}
            />
          </FormField>

          <FormField label="Area">
            <input
              value={form.area}
              onChange={(event) => updateForm('area', event.target.value)}
            />
          </FormField>

          <FormField label="City">
            <input
              value={form.city}
              onChange={(event) => updateForm('city', event.target.value)}
            />
          </FormField>

          <FormField label="State">
            <input
              value={form.state}
              onChange={(event) => updateForm('state', event.target.value)}
            />
          </FormField>

          <FormField label="PIN Code">
            <input
              value={form.pinCode}
              onChange={(event) => updateForm('pinCode', event.target.value)}
            />
          </FormField>

          <FormField label="Aadhaar">
            <input
              value={form.aadhaar}
              onChange={(event) => updateForm('aadhaar', event.target.value)}
            />
          </FormField>

          <FormField label="PAN">
            <input
              value={form.pan}
              onChange={(event) =>
                updateForm('pan', event.target.value.toUpperCase())
              }
            />
          </FormField>
        </>
      )}
    </div>
  );
}

function FormField({ label, required = false, full = false, children }) {
  const generatedId = React.useId();
  const controlId = React.isValidElement(children) ? (children.props.id || generatedId) : generatedId;
  return (
    <div className={`fin-customer-form-field ${full ? 'full' : ''}`}>
      <label htmlFor={controlId}>
        {label}
        {required && <span aria-hidden="true">*</span>}
      </label>
      {React.isValidElement(children) ? React.cloneElement(children, { id: controlId }) : children}
    </div>
  );
}

function DocumentsTab({ documents, loading, error }) {
  const openDocument = async (document) => {
    const preview = window.open('', '_blank');
    try {
      const blob = await platformApi.documents.download(document.id);
      const url = URL.createObjectURL(blob);
      if (preview) preview.location.href = url;
      else {
        const link = window.document.createElement('a');
        link.href = url;
        link.download = document.originalFileName;
        link.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (reason) {
      preview?.close();
      window.alert(reason.message);
    }
  };

  if (loading) return <div className="fin-customer-documents-state">Loading documents…</div>;
  if (error) return <div className="fin-customer-modal-error" role="alert">{error}</div>;
  if (!documents.length) return <EmptyState text="No documents uploaded for this customer." />;

  return (
    <div className="fin-customer-documents-grid">
      {documents.map((document) => (
        <article className="fin-customer-document-card" key={document.id}>
          <div className="fin-customer-document-icon"><FileText size={22} /></div>
          <div className="fin-customer-document-info">
            <div className="fin-customer-document-heading"><strong>{document.category}</strong><CustomerStatus status={document.status} /></div>
            <span title={document.originalFileName}>{document.originalFileName}</span>
            <small>{(Number(document.size || 0) / 1024).toFixed(1)} KB · Uploaded {formatDate(document.createdAt)}</small>
          </div>
          <button type="button" className="fin-customer-document-action" onClick={() => openDocument(document)} title={`Open ${document.originalFileName}`}>
            <Download size={17} /> View
          </button>
        </article>
      ))}
    </div>
  );
}

function CustomerLoanModal({ customer, products, form, updateForm, error, saving, onClose, onSubmit }) {
  const frequencies = [['Daily', Clock3, 1, 'Day'], ['Weekly', CalendarDays, 7, 'Week'], ['Monthly', List, monthlyPeriodDays(form.startDate), 'Month']];

  return (
    <div className="fin-create-loan-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="fin-create-loan-modal">
        <div className="fin-create-loan-header">
          <div><h2>Create New Loan</h2><p>Add a new loan account for {customer.name}</p></div>
          <button type="button" className="fin-create-loan-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        <form onSubmit={onSubmit} className="fin-create-loan-form">
          <div className="fin-create-loan-field"><label>Selected Customer<span>*</span></label><input value={`${customer.name} (${customer.id})`} readOnly /></div>

          <div className="fin-create-loan-two-column">
            <div className="fin-create-loan-field"><label>Loan Product<span>*</span></label><select value={form.productId} onChange={(event) => updateForm('productId', event.target.value)} required><option value="">Select product</option>{products.filter((product) => product.isActive !== false).map((product) => <option key={product.id} value={product.id}>{product.name} · {product.annualInterestRate}%</option>)}</select></div>
            <div className="fin-create-loan-field"><label>Tenure (months)<span>*</span></label><input type="number" min="1" value={form.tenureMonths} onChange={(event) => updateForm('tenureMonths', event.target.value)} required /></div>
            <div className="fin-create-loan-field"><label>Purpose<span>*</span></label><input value={form.purpose} onChange={(event) => updateForm('purpose', event.target.value)} required /></div>
            <div className="fin-create-loan-field"><label>Monthly Income<span>*</span></label><input type="number" min="0" value={form.monthlyIncome} onChange={(event) => updateForm('monthlyIncome', event.target.value)} required /></div>
            <div className="fin-create-loan-field"><label>Monthly Obligations</label><input type="number" min="0" value={form.monthlyObligations} onChange={(event) => updateForm('monthlyObligations', event.target.value)} /></div>
            <div className="fin-create-loan-field"><label>Amount Given (₹)<span>*</span></label><div className="fin-input-with-icon"><span>₹</span><input type="number" min="1" value={form.principal} onChange={(event) => updateForm('principal', event.target.value)} required /></div></div>
            <div className="fin-create-loan-field"><label>Date Given<span>*</span></label><input type="date" value={form.startDate} onChange={(event) => updateForm('startDate', event.target.value)} required /></div>
          </div>

          <div className="fin-create-loan-field"><label>Payment Method<span>*</span></label><div className="fin-payment-method-grid">{paymentMethods.map((method) => <button key={method} type="button" className={`fin-payment-method-btn ${form.paymentMethod === method ? 'active' : ''}`} onClick={() => updateForm('paymentMethod', method)}>{method}</button>)}</div></div>

          <div className="fin-create-loan-field"><label>Interest Frequency<span>*</span></label><div className="fin-interest-frequency-grid">{frequencies.map(([frequency, Icon]) => <button key={frequency} type="button" className={`fin-interest-frequency-card ${form.collectionFrequency === frequency ? 'active' : ''}`} onClick={() => updateForm('collectionFrequency', frequency)}><Icon size={18} /><span>{frequency}</span></button>)}</div></div>

          <div className="fin-create-loan-field"><label>Interest Rate (%)</label><div className="fin-interest-rate-input"><input type="number" min="0" step="0.1" value={form.rate} onChange={(event) => updateForm('rate', event.target.value)} /><span>%</span></div></div>

          <div className="fin-interest-preview-grid">{frequencies.map(([frequency, , days, suffix]) => { const periodRate = rateForDays(form.rate, days); return <div key={frequency} className={`fin-interest-preview-card ${form.collectionFrequency === frequency ? 'selected' : ''}`}><span>{frequency} @ {periodRate % 1 === 0 ? periodRate : periodRate.toFixed(2)}%</span><strong>{formatInterestAmount(interestForDays(form.principal, form.rate, days))}<small>/{suffix}</small></strong></div>; })}</div>

          {error && <div className="fin-customer-modal-error" role="alert">{error}</div>}
          <div className="fin-create-loan-actions"><button type="button" className="fin-create-loan-cancel" onClick={onClose} disabled={saving}>Cancel</button><button type="submit" className="fin-create-loan-submit" disabled={saving}><Check size={17} />{saving ? 'Creating...' : 'Create Loan'}</button></div>
        </form>
      </div>
    </div>
  );
}

void CustomerLoanModal;

function FormModal({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div className="fin-customer-overlay top-layer" onMouseDown={onClose}>
      <div
        className={`fin-customer-form-modal ${wide ? 'wide' : ''}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="fin-customer-modal-heading">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          <button
            type="button"
            className="fin-customer-modal-close"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>

        <div className="fin-customer-form-modal-content">{children}</div>
      </div>
    </div>
  );
}

function WizardActions({ onClose }) {
  return (
    <div className="fin-customer-form-actions wizard-actions">
      <button
        type="button"
        className="fin-customer-secondary-btn"
        onClick={onClose}
      >
        Cancel
      </button>

      <button type="submit" className="fin-customer-primary-btn">
        Continue <ChevronLeft size={17} className="rotate-180" />
      </button>
    </div>
  );
}

function WizardNavigation({ onBack }) {
  return (
    <div className="fin-customer-wizard-back-row">
      <button
        type="button"
        className="fin-customer-secondary-btn"
        onClick={onBack}
      >
        ← Back
      </button>
    </div>
  );
}

function DocumentUpload({ label, file, onChange }) {
  return (
    <label className="fin-customer-document-upload">
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={onChange}
      />

      <div className="document-upload-left">
        <Upload size={19} />
        <span>{file ? file.name : label}</span>
      </div>

      <strong>{file ? 'Selected' : 'Browse'}</strong>
    </label>
  );
}

function StatCard({ icon, iconClass, label, value, valueClass = '' }) {
  return (
    <div className="fin-customer-stat-card">
      <div className={`fin-customer-stat-icon ${iconClass}`}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong className={valueClass}>{value}</strong>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="fin-customer-info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SummaryMiniCard({ icon, label, value }) {
  return (
    <div className="fin-customer-summary-mini">
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MetricItem({ label, value }) {
  return (
    <div className="fin-customer-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CustomerStatus({ status }) {
  const normalized = String(status || 'Active').toLowerCase();

  let className = 'active';

  if (
    normalized.includes('overdue') ||
    normalized.includes('failed') ||
    normalized.includes('red')
  ) {
    className = 'overdue';
  } else if (
    normalized.includes('due') ||
    normalized.includes('pending')
  ) {
    className = 'due';
  } else if (
    normalized.includes('closed') ||
    normalized.includes('inactive')
  ) {
    className = 'closed';
  }

  return (
    <span className={`fin-customer-status ${className}`}>
      {status || 'Active'}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div className="fin-customer-empty-state">
      <FileText size={23} />
      <p>{text}</p>
    </div>
  );
}

function buildLedgerFromCustomer(customer) {
  const entries = [];
  let balance = 0;

  (customer.loans || []).forEach((loan, index) => {
    const principal = toNumber(loan.principal);
    balance += principal;

    entries.push({
      id: `LED-INITIAL-${index}`,
      date: loan.startDate || todayISO(),
      description: 'Loan Disbursed',
      debit: principal,
      credit: 0,
      balance,
      status: 'Given',
    });
  });

  (customer.payments || []).forEach((payment, index) => {
    const amount = toNumber(payment.amount);
    balance = Math.max(0, balance - amount);

    entries.push({
      id: payment.id || `LED-PAY-${index}`,
      date: payment.date || todayISO(),
      description:
        payment.type === 'Principal'
          ? 'Principal Received'
          : payment.type === 'Principal + Interest'
            ? 'Principal + Interest Received'
            : 'Interest Received',
      debit: 0,
      credit: amount,
      balance,
      status: payment.status === 'Success' ? 'Received' : payment.status || 'Received',
    });
  });

  return entries;
}
