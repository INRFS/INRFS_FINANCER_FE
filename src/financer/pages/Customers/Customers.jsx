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
  Camera,
  RotateCw,
  Trash2,
} from 'lucide-react';

import { formatCurrency, formatCustomerNumber, formatLoanNumber } from '../../../common/utils/formatters';
import { platformApi, pageItems } from '../../../common/services/platformApi';
import { customerFromApi, customerToApi, isCreatedThisMonth, loanFromApi } from '../../../common/utils/domainAdapters';
import {
  validateCustomerStep,
  validateCustomerField,
} from '../../../common/utils/formValidation';
import { autoFetchPincode, lookupByPin } from '../../../common/utils/addressLookup';

import './Customers.css';
import { useLocation } from 'react-router-dom';

/* =========================================================
   HELPERS
   ========================================================= */

const todayISO = () => new Date(Date.now() + 330 * 60 * 1000).toISOString().slice(0, 10);

const addLoanDuration = (startDate, value, unit) => {
  if (!startDate || !value || Number(value) <= 0 || !unit) return '';
  const [year, month, day] = startDate.split('-').map(Number);
  if (!year || !month || !day) return '';
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return '';
  if (unit === 'Days') date.setDate(date.getDate() + Number(value));
  else if (unit === 'Weeks') date.setDate(date.getDate() + Number(value) * 7);
  else if (unit === 'Months') {
    const targetDay = date.getDate();
    date.setDate(1); date.setMonth(date.getMonth() + Number(value));
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(targetDay, lastDay));
  } else {
    return '';
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const dateDays = (from, to) => from && to ? Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 86400000) : 0;
const firstInterestDue = (form, maturity) => {
  if (!form.startDate || !maturity || !form.collectionFrequency) return '';
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
  if (!form.principal || !form.rate || !form.startDate || !form.durationValue || !form.durationUnit || !form.collectionFrequency) return null;
  const maturity = addLoanDuration(form.startDate, form.durationValue, form.durationUnit);
  if (!maturity) return null;
  const dueDate = firstInterestDue(form, maturity);
  if (!dueDate) return null;
  const interestDays = dateDays(form.startDate, dueDate);
  return toNumber(form.principal) * toNumber(form.rate) / 100 * 12 * interestDays / 365;
};

const estimatedTotalInterest = (form) => {
  if (!form.principal || !form.rate || !form.startDate || !form.durationValue || !form.durationUnit) return null;
  const maturity = addLoanDuration(form.startDate, form.durationValue, form.durationUnit);
  if (!maturity) return null;
  return (
    toNumber(form.principal)
    * toNumber(form.rate) / 100
    * 12
    * dateDays(form.startDate, maturity) / 365
  );
};

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
  rate: '',
  durationUnit: '',
  durationValue: '',
  collectionFrequency: '',
  startDate: '',
  collectionConcern: false,
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

  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

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
  const newCustomersThisMonth = customers.filter(
    (customer) => isCreatedThisMonth(customer.createdAt ?? customer.created_at ?? customer.createdDate)
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
    setFormErrors({});
    setTouchedFields({});
    setCustomerForm({ ...emptyCustomerForm });
    setCurrentStep(1);
    setIsAddCustomerOpen(true);
  };

  const closeAddCustomer = () => {
    setPageError('');
    setFormErrors({});
    setTouchedFields({});
    setIsAddCustomerOpen(false);
    setCurrentStep(1);
  };

  const updateCustomerForm = async (field, value) => {
    setPageError('');
    const nextForm = {
      ...customerForm,
      [field]: value,
    };
    setCustomerForm(nextForm);
    setTouchedFields((prev) => ({ ...prev, [field]: true }));

    // Instant field validation
    const err = validateCustomerField(
      field,
      value,
      nextForm,
      customers,
      isEditCustomerOpen ? selectedCustomer?.id : null
    );
    setFormErrors((prev) => ({ ...prev, [field]: err }));

    // Address to Pincode auto-fetch
    if (field === 'city' || field === 'area' || field === 'street' || field === 'state') {
      const autoPin = await autoFetchPincode(nextForm);
      if (autoPin && autoPin !== nextForm.pinCode) {
        setCustomerForm((current) => ({ ...current, pinCode: autoPin }));
        setFormErrors((prev) => ({ ...prev, pinCode: '' }));
      }
    }

    // Reverse lookup by PIN
    if (field === 'pinCode' && String(value).length === 6) {
      const rev = lookupByPin(value);
      if (rev) {
        setCustomerForm((current) => ({
          ...current,
          city: current.city || rev.city,
          state: current.state || rev.state,
        }));
        setFormErrors((prev) => ({
          ...prev,
          city: '',
          state: '',
          pinCode: '',
        }));
      }
    }
  };

  const handleCustomerFile = (field, fileOrEvent) => {
    const file = fileOrEvent?.target?.files ? fileOrEvent.target.files[0] || null : fileOrEvent || null;
    updateCustomerForm(field, file);
  };

  const handleCustomerWizardNext = async (event) => {
    event?.preventDefault();

    const stepValidation = validateCustomerStep(
      currentStep,
      customerForm,
      customers,
      isEditCustomerOpen ? selectedCustomer?.id : null
    );

    if (!stepValidation.isValid) {
      setFormErrors((prev) => ({ ...prev, ...stepValidation.errors }));
      setTouchedFields((prev) => ({
        ...prev,
        ...Object.keys(stepValidation.errors).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
      }));
      setPageError(stepValidation.firstError);
      return;
    }

    if (currentStep < 4) {
      setPageError('');
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // Final Submission at step 4
    setSaving(true);
    setPageError('');
    try {
      const created = await platformApi.customers.create(customerToApi(customerForm));
      const uploads = [
        ['aadhaarDocument', 'Aadhaar'],
        ['panDocument', 'Pan'],
        ['addressProof', 'AddressProof'],
        ['photograph', 'Photograph'],
        ['otherDocuments', 'Other'],
      ].filter(([field]) => customerForm[field]);

      if (uploads.length > 0) {
        await Promise.all(
          uploads.map(([field, category]) =>
            platformApi.documents.upload(customerForm[field], category, created.id)
          )
        );
      }

      const newCustomer = buildCustomerDetails(
        customerFromApi({
          ...created,
          createdAt: created.createdAt || created.created_at || new Date().toISOString(),
        }),
        customers.length
      );
      setCustomers((prev) => [newCustomer, ...prev]);
      closeAddCustomer();
      setSelectedCustomerId(newCustomer.id);
      setActiveTab('overview');
    } catch (error) {
      setPageError(error.message || 'Failed to create customer.');
    } finally {
      setSaving(false);
    }
  };

  const handleWizardBack = () => {
    if (currentStep > 1) {
      setPageError('');
      setCurrentStep((prev) => prev - 1);
    }
  };

  /* =======================================================
     EDIT CUSTOMER
     ======================================================= */

  const openEditCustomer = (customer = selectedCustomer) => {
    if (!customer) return;

    setPageError('');
    setFormErrors({});
    setTouchedFields({});
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

    for (const step of [1, 2, 3]) {
      const stepVal = validateCustomerStep(step, customerForm, customers, selectedCustomer.id);
      if (!stepVal.isValid) {
        setFormErrors((prev) => ({ ...prev, ...stepVal.errors }));
        setTouchedFields((prev) => ({
          ...prev,
          ...Object.keys(stepVal.errors).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
        }));
        setPageError(stepVal.firstError);
        return;
      }
    }

    setSaving(true);
    setPageError('');
    try {
      const updated = await platformApi.customers.update(
        selectedCustomer.id,
        customerToApi({ ...customerForm, status: selectedCustomer.status }, true)
      );
      updateCustomerById(selectedCustomer.id, (customer) =>
        buildCustomerDetails({ ...customer, ...customerFromApi(updated) }, 0)
      );
      setIsEditCustomerOpen(false);
    } catch (error) {
      setPageError(error.message || 'Failed to update customer.');
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     ADD LOAN
     ======================================================= */

  const openAddLoan = (customer = selectedCustomer) => {
    if (!customer) return;
    setLoanError('');
    setLoanForm({ ...emptyLoanForm });
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
    if (!loanForm.principal || principal <= 0) { setLoanError('Enter a valid principal amount.'); return; }
    const monthlyInterestRate = toNumber(loanForm.rate);
    if (!loanForm.rate || monthlyInterestRate <= 0) { setLoanError('Enter a valid interest rate.'); return; }
    if (!loanForm.durationUnit) { setLoanError('Please select a loan period unit.'); return; }
    if (!loanForm.durationValue || toNumber(loanForm.durationValue) <= 0) { setLoanError('Enter a valid number of periods.'); return; }
    if (!loanForm.collectionFrequency) { setLoanError('Please select an interest collection frequency.'); return; }
    if (!loanForm.startDate) { setLoanError('Please enter a start date.'); return; }

    setSaving(true);
    setLoanError('');
    try {
      const product = loanProducts.find((item) => item.isActive !== false) || loanProducts[0];
      if (!product) throw new Error('No active loan product is configured.');
      if (principal < Number(product.minimumPrincipal) || principal > Number(product.maximumPrincipal)) {
        throw new Error(`Principal must be between ${formatCurrency(product.minimumPrincipal)} and ${formatCurrency(product.maximumPrincipal)}.`);
      }
      await platformApi.loans.create({
        customerId: selectedCustomer.id,
        loanProductId: product.id,
        principal,
        annualInterestRate: monthlyInterestRate,
        tenureMonths: Math.max(product.minimumTenureMonths || 1, 1),
        startDate: loanForm.startDate,
        durationValue: toNumber(loanForm.durationValue),
        durationUnit: loanForm.durationUnit,
        interestRate: monthlyInterestRate,
        interestRateBasis: 'PerMonth',
        interestCollectionFrequency: loanForm.collectionFrequency,
        collectionConcern: Boolean(loanForm.collectionConcern),
      });
      setIsAddLoanOpen(false);
      setLoanForm({ ...emptyLoanForm });
      setActiveTab('loans');
      await loadCustomers();
    } catch (error) {
      setLoanError(error.message || 'Failed to create loan.');
    } finally {
      setSaving(false);
    }
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

    if (!paymentForm.loanId) {
      setPageError('Please select a loan for this payment.');
      return;
    }

    if (!paymentForm.date) {
      setPageError('Please enter the payment date.');
      return;
    }

    if (amount <= 0) {
      setPageError('Payment amount must be greater than zero.');
      return;
    }
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
          value={newCustomersThisMonth}
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
                        <span title={customer.id}>{formatCustomerNumber(customer)}</span>
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
          errors={formErrors}
          touched={touchedFields}
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
          subtitle={`${formatCustomerNumber(selectedCustomer)} · Update only this customer's information`}
          onClose={() => setIsEditCustomerOpen(false)}
        >
          <form onSubmit={saveCustomerEdit}>
            <CustomerFields
              form={customerForm}
              updateForm={updateCustomerForm}
              errors={formErrors}
              touched={touchedFields}
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
          subtitle={`${selectedCustomer.name} · ${formatCustomerNumber(selectedCustomer)}`}
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
                  placeholder="Enter principal amount"
                  required
                />
              </FormField>

              <FormField label="Monthly Interest Rate (%)" required>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={loanForm.rate}
                  onChange={(event) =>
                    updateLoanForm('rate', event.target.value)
                  }
                  required
                />
              </FormField>

              <FormField label="Loan Period Unit" required>
                <select value={loanForm.durationUnit} onChange={(event) => updateLoanForm('durationUnit', event.target.value)} required>
                  <option value="" disabled>Select period unit</option>
                  <option value="Days">Days</option>
                  <option value="Weeks">Weeks</option>
                  <option value="Months">Months</option>
                </select>
              </FormField>

              <FormField label={`Number of ${loanForm.durationUnit || 'Days'}`} required>
                <input
                  type="number"
                  min="1"
                  value={loanForm.durationValue}
                  onChange={(event) => updateLoanForm('durationValue', event.target.value)}
                  required
                />
              </FormField>

              <FormField label="Interest Collection" required>
                <select value={loanForm.collectionFrequency} onChange={(event) => updateLoanForm('collectionFrequency', event.target.value)} required>
                  <option value="" disabled>Select collection frequency</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="AtMaturity">At Maturity</option>
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
                <input type="text" value={estimatedCollectionInterest(loanForm) !== null ? formatCurrency(estimatedCollectionInterest(loanForm)) : ''} readOnly />
              </FormField>

              <FormField label="Estimated Total Interest">
                <input type="text" value={estimatedTotalInterest(loanForm) !== null ? formatCurrency(estimatedTotalInterest(loanForm)) : ''} readOnly />
              </FormField>
            </div>

            <div className="fin-create-loan-concern-section">
              <label className="fin-create-loan-concern-checkbox-container" htmlFor="customerCollectionConcern">
                <input
                  type="checkbox"
                  id="customerCollectionConcern"
                  name="customerCollectionConcern"
                  checked={Boolean(loanForm.collectionConcern)}
                  onChange={(event) => updateLoanForm('collectionConcern', event.target.checked)}
                  className="fin-create-loan-concern-checkbox"
                />
                <div className="fin-create-loan-concern-text">
                  <span className="fin-create-loan-concern-title">Customer Collection Concern</span>
                  <span className="fin-create-loan-concern-subtitle">Flag this customer if you expect difficulty collecting repayments.</span>
                </div>
              </label>
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
          subtitle={`${selectedCustomer.name} · ${formatCustomerNumber(selectedCustomer)}`}
          onClose={() => setIsPaymentOpen(false)}
          wide
        >
          <form onSubmit={savePayment}>
            <div className="fin-customer-form-grid">
              <FormField label="Loan" required>
                <select value={paymentForm.loanId} onChange={(event) => updatePaymentForm('loanId', event.target.value)} required>
                  <option value="">Select loan</option>
                  {selectedCustomer.loans.filter((loan) => loan.status !== 'Closed').map((loan) => <option key={loan.id} value={loan.id}>{formatLoanNumber(loan)}</option>)}
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
                <span title={customer.id}>{formatCustomerNumber(customer)}</span>
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
            <strong>{formatLoanNumber(loan)}</strong>
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
  const rows = loans.flatMap((loan) => (loan.schedules || []).map((schedule) => ({ ...schedule, loanNumber: formatLoanNumber(loan) })));
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
  errors = {},
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
              <CustomerFields form={form} updateForm={updateForm} errors={errors} />
              <div className="fin-customer-form-actions">
                <button type="button" className="fin-customer-secondary-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="fin-customer-primary-btn wizard-next">
                  Continue <ChevronLeft size={17} className="rotate-180" />
                </button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={onNext}>
              <div className="fin-customer-form-grid">
                <FormField label="House / Flat Number" error={errors?.houseNumber}>
                  <input
                    value={form.houseNumber}
                    onChange={(event) =>
                      updateForm('houseNumber', event.target.value)
                    }
                    placeholder="12"
                  />
                </FormField>

                <FormField label="Street" error={errors?.street}>
                  <input
                    value={form.street}
                    onChange={(event) =>
                      updateForm('street', event.target.value)
                    }
                    placeholder="MG Road"
                  />
                </FormField>

                <FormField label="Area" error={errors?.area}>
                  <input
                    value={form.area}
                    onChange={(event) =>
                      updateForm('area', event.target.value)
                    }
                    placeholder="Andheri"
                  />
                </FormField>

                <FormField label="City" required error={errors?.city}>
                  <input
                    value={form.city}
                    onChange={(event) =>
                      updateForm(
                        'city',
                        sanitizeCustomerField('city', event.target.value),
                      )
                    }
                    placeholder="Mumbai"
                    maxLength={100}
                    pattern="[A-Za-z\s.'-]+"
                    title="City can contain only letters, spaces, apostrophe, dot and hyphen"
                    required
                  />
                </FormField>

                <FormField label="State" required error={errors?.state}>
                  <input
                    value={form.state}
                    onChange={(event) =>
                      updateForm(
                        'state',
                        sanitizeCustomerField('state', event.target.value),
                      )
                    }
                    placeholder="Maharashtra"
                    maxLength={100}
                    pattern="[A-Za-z\s.'-]+"
                    title="State can contain only letters, spaces, apostrophe, dot and hyphen"
                    required
                  />
                </FormField>

                <FormField label="PIN Code" required error={errors?.pinCode}>
                  <input
                    value={form.pinCode}
                    onChange={(event) =>
                      updateForm(
                        'pinCode',
                        sanitizeCustomerField('pinCode', event.target.value),
                      )
                    }
                    inputMode="numeric"
                    placeholder="400001"
                    pattern="[1-9][0-9]{5}"
                    maxLength={6}
                    title="Enter a valid 6-digit Indian PIN code"
                    required
                  />
                </FormField>
              </div>

              <div className="fin-customer-form-actions">
                <button type="button" className="fin-customer-secondary-btn" onClick={onBack}>
                  ← Back
                </button>
                <button type="submit" className="fin-customer-primary-btn wizard-next">
                  Continue <ChevronLeft size={17} className="rotate-180" />
                </button>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <form onSubmit={onNext}>
              <div className="fin-customer-single-form">
                <FormField label="Aadhaar Number" error={errors?.aadhaar}>
                  <input
                    type="text"
                    value={formatAadhaar(form.aadhaar)}
                    onChange={(event) =>
                      updateForm(
                        'aadhaar',
                        sanitizeCustomerField('aadhaar', event.target.value)
                      )
                    }
                    inputMode="numeric"
                    maxLength={14}
                    placeholder="2345 6789 0123"
                    title="Aadhaar must contain exactly 12 digits"
                  />
                </FormField>

                <FormField label="PAN Number" error={errors?.pan}>
                  <input
                    value={form.pan}
                    onChange={(event) =>
                      updateForm(
                        'pan',
                        sanitizeCustomerField(
                          'pan',
                          event.target.value,
                        ),
                      )
                    }
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    title="Use PAN format ABCDE1234F"
                  />
                </FormField>
              </div>

              <div className="fin-customer-form-actions">
                <button type="button" className="fin-customer-secondary-btn" onClick={onBack}>
                  ← Back
                </button>
                <button type="submit" className="fin-customer-primary-btn wizard-next">
                  Continue <ChevronLeft size={17} className="rotate-180" />
                </button>
              </div>
            </form>
          )}

          {currentStep === 4 && (
            <form onSubmit={onNext}>
              <div className="fin-customer-document-grid">
                <DocumentUpload
                  label="Upload Aadhaar Card (Optional)"
                  documentName="Aadhaar Card"
                  fileNamePrefix="aadhaar"
                  file={form.aadhaarDocument}
                  onChange={(fileOrEvent) =>
                    onFileChange('aadhaarDocument', fileOrEvent)
                  }
                />

                <DocumentUpload
                  label="Upload PAN Card (Optional)"
                  documentName="PAN Card"
                  fileNamePrefix="pan"
                  file={form.panDocument}
                  onChange={(fileOrEvent) =>
                    onFileChange('panDocument', fileOrEvent)
                  }
                />

                <DocumentUpload
                  label="Upload Address Proof (Optional)"
                  documentName="Address Proof"
                  fileNamePrefix="address-proof"
                  file={form.addressProof}
                  onChange={(fileOrEvent) =>
                    onFileChange('addressProof', fileOrEvent)
                  }
                />

                <DocumentUpload
                  label="Upload Photograph (Optional)"
                  documentName="Photograph"
                  fileNamePrefix="photograph"
                  file={form.photograph}
                  onChange={(fileOrEvent) =>
                    onFileChange('photograph', fileOrEvent)
                  }
                />

                <DocumentUpload
                  label="Upload Other Documents (Optional)"
                  documentName="Other Documents"
                  fileNamePrefix="other-documents"
                  file={form.otherDocuments}
                  onChange={(fileOrEvent) =>
                    onFileChange('otherDocuments', fileOrEvent)
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
const formatAadhaar = (value) => {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, 12)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
};
const sanitizeCustomerField = (field, value) => {
  switch (field) {
    case 'name':
      // Name: letters, spaces, apostrophe, dot and hyphen only
      return value.replace(/[^a-zA-Z\s.'-]/g, '');

    case 'mobile':
      // Mobile: numbers only, maximum 10 digits
      return value.replace(/\D/g, '').slice(0, 10);

    case 'email':
      // Email: don't remove valid email characters.
      return value;

    case 'city':
    case 'state':
    case 'area':
      // City / State / Area: letters, spaces, apostrophe, dot and hyphen only
      return value.replace(/[^a-zA-Z\s.'-]/g, '');

    case 'pinCode':
      // PIN: numbers only, maximum 6 digits
      return value.replace(/\D/g, '').slice(0, 6);

    case 'aadhaar':
      // Aadhaar: numbers only, maximum 12 digits
      return value.replace(/\D/g, '').slice(0, 12);

    case 'pan':
      // PAN: uppercase letters and numbers only, maximum 10 characters
      return value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 10);

    default:
      return value;
  }
};
function CustomerFields({ form, updateForm, errors = {}, compact = false }) {
  const handleChange = (field, value) => {
    updateForm(field, sanitizeCustomerField(field, value));
  };

  return (
    <div className="fin-customer-form-grid">
      {/* Full Name */}
      <FormField label="Full Name" required full={compact ? false : true} error={errors?.name}>
        <input
          value={form.name}
          onChange={(event) =>
            handleChange('name', event.target.value)
          }
          placeholder="Ramesh Kumar"
          maxLength={100}
          pattern="[A-Za-z\s.'-]+"
          title="Name can contain only letters, spaces, apostrophe, dot and hyphen"
          required
        />
      </FormField>

      {/* Mobile */}
      <FormField label="Mobile Number" required error={errors?.mobile}>
        <input
          type="tel"
          value={form.mobile}
          onChange={(event) =>
            handleChange('mobile', event.target.value)
          }
          placeholder="+91 98001 11111"
          inputMode="numeric"
          pattern="[6-9][0-9]{9}"
          maxLength={10}
          title="Enter a valid 10-digit Indian mobile number"
          required
        />
      </FormField>

      {/* Email */}
      <FormField label="Email Address" error={errors?.email}>
        <input
          type="email"
          value={form.email}
          onChange={(event) =>
            handleChange('email', event.target.value)
          }
          placeholder="ramesh@gmail.com"
          autoComplete="email"
          maxLength={254}
          title="Enter a valid email address"
        />
      </FormField>

      {/* Date of Birth */}
      <FormField label="Date of Birth" required error={errors?.dob}>
        <input
          type="date"
          value={form.dob}
          onChange={(event) =>
            updateForm('dob', event.target.value)
          }
          max={
            new Date(
              new Date().setFullYear(
                new Date().getFullYear() - 18,
              ),
            )
              .toISOString()
              .slice(0, 10)
          }
          required
        />
      </FormField>

      {/* Gender */}
      <FormField label="Gender" required error={errors?.gender}>
        <select
          value={form.gender}
          onChange={(event) =>
            updateForm('gender', event.target.value)
          }
          required
        >
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </FormField>

      {compact && (
        <>
          {/* House / Flat Number */}
          <FormField label="House / Flat Number" error={errors?.houseNumber}>
            <input
              value={form.houseNumber}
              onChange={(event) =>
                updateForm(
                  'houseNumber',
                  event.target.value,
                )
              }
              placeholder="12"
              maxLength={100}
            />
          </FormField>

          {/* Street */}
          <FormField label="Street" error={errors?.street}>
            <input
              value={form.street}
              onChange={(event) =>
                updateForm('street', event.target.value)
              }
              placeholder="MG Road"
              maxLength={150}
            />
          </FormField>

          {/* Area */}
          <FormField label="Area" error={errors?.area}>
            <input
              value={form.area}
              onChange={(event) =>
                updateForm(
                  'area',
                  sanitizeCustomerField('area', event.target.value)
                )
              }
              placeholder="Andheri"
              maxLength={100}
              pattern="[A-Za-z\s.'-]+"
              title="Area can contain only letters, spaces, apostrophe, dot and hyphen"
            />
          </FormField>

          {/* City */}
          <FormField label="City" required error={errors?.city}>
            <input
              value={form.city}
              onChange={(event) =>
                handleChange('city', event.target.value)
              }
              placeholder="Mumbai"
              maxLength={100}
              pattern="[A-Za-z\s.'-]+"
              title="City can contain only letters, spaces, apostrophe, dot and hyphen"
              required
            />
          </FormField>

          {/* State */}
          <FormField label="State" required error={errors?.state}>
            <input
              value={form.state}
              onChange={(event) =>
                handleChange('state', event.target.value)
              }
              placeholder="Maharashtra"
              maxLength={100}
              pattern="[A-Za-z\s.'-]+"
              title="State can contain only letters, spaces, apostrophe, dot and hyphen"
              required
            />
          </FormField>

          {/* PIN Code */}
          <FormField label="PIN Code" required error={errors?.pinCode}>
            <input
              value={form.pinCode}
              onChange={(event) =>
                handleChange(
                  'pinCode',
                  event.target.value,
                )
              }
              inputMode="numeric"
              placeholder="400001"
              pattern="[1-9][0-9]{5}"
              maxLength={6}
              title="Enter a valid 6-digit Indian PIN code"
              required
            />
          </FormField>

          {/* Aadhaar */}
          <FormField label="Aadhaar" error={errors?.aadhaar}>
            <input
              value={form.aadhaar}
              onChange={(event) =>
                handleChange(
                  'aadhaar',
                  event.target.value,
                )
              }
              placeholder="2345 6789 0123"
              inputMode="numeric"
              maxLength={12}
              pattern="[2-9][0-9]{11}"
              title="Enter a valid 12-digit Aadhaar number starting with 2-9"
            />
          </FormField>

          {/* PAN */}
          <FormField label="PAN" error={errors?.pan}>
            <input
              value={form.pan}
              onChange={(event) =>
                handleChange(
                  'pan',
                  event.target.value,
                )
              }
              placeholder="ABCDE1234F"
              pattern="[A-Z]{5}[0-9]{4}[A-Z]"
              maxLength={10}
              title="Use PAN format ABCDE1234F"
            />
          </FormField>
        </>
      )}
    </div>
  );
}

function FormField({ label, required = false, full = false, error = '', children }) {
  const generatedId = React.useId();
  const controlId = React.isValidElement(children) ? (children.props.id || generatedId) : generatedId;
  return (
    <div className={`fin-customer-form-field ${full ? 'full' : ''}`}>
      <label htmlFor={controlId}>
        {label}
        {required && <span aria-hidden="true">*</span>}
      </label>
      {React.isValidElement(children)
        ? React.cloneElement(children, {
            id: controlId,
            className: `${children.props.className || ''} ${error ? 'fin-input-error' : ''}`.trim(),
            'aria-invalid': Boolean(error),
          })
        : children}
      {error && (
        <span className="fin-customer-field-error" role="alert">
          {error}
        </span>
      )}
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
          <div className="fin-create-loan-field"><label>Selected Customer<span>*</span></label><input value={`${customer.name} (${formatCustomerNumber(customer)})`} readOnly /></div>

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

function DocumentCameraModal({ title = 'Capture Document', onCapture, onClose }) {
  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const [capturedBlob, setCapturedBlob] = React.useState(null);
  const [capturedDataUrl, setCapturedDataUrl] = React.useState('');
  const [error, setError] = React.useState('');
  const [isInitializing, setIsInitializing] = React.useState(true);

  const stopStream = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
  }, []);

  const startCamera = React.useCallback(async () => {
    setError('');
    setIsInitializing(true);
    setCapturedBlob(null);
    setCapturedDataUrl('');
    stopStream();

    if (!navigator?.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported in this browser. Please use Upload from Device.');
      setIsInitializing(false);
      return;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission was denied. Please allow camera access in your browser or use Upload from Device.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera device found. Please use Upload from Device.');
      } else {
        setError(err.message || 'Unable to access camera. Please use Upload from Device.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [stopStream]);

  React.useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
  }, [startCamera, stopStream]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedDataUrl(dataUrl);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          stopStream();
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const handleRetake = () => {
    startCamera();
  };

  const handleConfirm = () => {
    if (!capturedBlob) return;
    stopStream();
    onCapture(capturedBlob);
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  return (
    <div className="fin-camera-overlay" onMouseDown={handleClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="fin-camera-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="fin-camera-header">
          <div>
            <h3>{title}</h3>
            <p>Align the document inside the frame and capture</p>
          </div>
          <button type="button" className="fin-camera-close-btn" onClick={handleClose} aria-label="Close camera">
            <X size={20} />
          </button>
        </div>

        <div className="fin-camera-body">
          {error ? (
            <div className="fin-camera-error" role="alert">
              <AlertCircle size={28} />
              <p>{error}</p>
              <button type="button" className="fin-camera-retry-btn" onClick={startCamera}>
                <RotateCw size={15} /> Try Again
              </button>
            </div>
          ) : capturedDataUrl ? (
            <div className="fin-camera-preview-container">
              <img src={capturedDataUrl} alt="Captured Document Preview" className="fin-camera-captured-img" />
              <div className="fin-camera-badge">Captured Preview</div>
            </div>
          ) : (
            <div className="fin-camera-video-container">
              {isInitializing && (
                <div className="fin-camera-loading">
                  <span>Initializing camera...</span>
                </div>
              )}
              <video ref={videoRef} autoPlay playsInline muted className="fin-camera-video" />
              <div className="fin-camera-frame-guide" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="fin-camera-footer">
          {capturedDataUrl ? (
            <>
              <button type="button" className="fin-camera-btn-secondary" onClick={handleRetake}>
                <RotateCw size={16} /> Retake
              </button>
              <button type="button" className="fin-camera-btn-primary" onClick={handleConfirm}>
                <Check size={16} /> Use Photo
              </button>
            </>
          ) : (
            <>
              <button type="button" className="fin-camera-btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button
                type="button"
                className="fin-camera-btn-primary"
                onClick={handleCapture}
                disabled={Boolean(error) || isInitializing}
              >
                <Camera size={16} /> Capture Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentUpload({ label, documentName, fileNamePrefix = 'document', file, onChange }) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] || null;

    if (!selected) {
      onChange(event);
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
    ];

    const allowedExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.pdf',
    ];

    const extension = `.${selected.name
      .split('.')
      .pop()
      ?.toLowerCase()}`;

    // File type validation
    if (
      !allowedTypes.includes(selected.type) &&
      !allowedExtensions.includes(extension)
    ) {
      alert(
        'Invalid file type. Please upload JPG, JPEG, PNG or PDF files only.',
      );
      event.target.value = '';
      return;
    }

    // Maximum 5 MB
    if (selected.size > 5 * 1024 * 1024) {
      alert(
        `"${selected.name}" exceeds the 5 MB file size limit. Please choose a smaller file.`,
      );
      event.target.value = '';
      return;
    }

    // Empty file
    if (selected.size === 0) {
      alert(
        'The selected file appears to be empty. Please choose a valid document.',
      );
      event.target.value = '';
      return;
    }

    onChange(event);
  };

  const handleCameraCapture = (blob) => {
    const filename = `${fileNamePrefix || 'document'}-${Date.now()}.jpg`;
    const capturedFile = new File([blob], filename, { type: 'image/jpeg', lastModified: Date.now() });

    if (capturedFile.size > 5 * 1024 * 1024) {
      alert('Captured image exceeds the 5 MB limit. Please try again.');
      return;
    }

    onChange(capturedFile);
    setIsCameraOpen(false);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(null);
  };

  const displayName = documentName || label?.replace(/\s*\(Optional\)/i, '') || 'Document';

  return (
    <div className={`fin-customer-doc-card ${file ? 'has-file' : ''}`}>
      <input
        ref={fileInputRef}
        type="file"
        id={`upload-${fileNamePrefix || 'doc'}`}
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleFileChange}
        className="fin-doc-hidden-input"
      />

      <div className="fin-doc-card-header">
        <span className="fin-doc-title">{label}</span>
      </div>

      {file ? (
        <div className="fin-doc-selected-view">
          <div className="fin-doc-file-info">
            <FileText size={20} className="fin-doc-file-icon" />
            <div className="fin-doc-file-details">
              <span className="fin-doc-filename" title={file.name}>{file.name}</span>
              <span className="fin-doc-filesize">
                {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Ready'}
              </span>
            </div>
          </div>
          <div className="fin-doc-selected-actions">
            <button
              type="button"
              className="fin-doc-action-btn camera-retake"
              onClick={() => setIsCameraOpen(true)}
              title="Retake with Camera"
              aria-label={`Retake ${displayName} with camera`}
            >
              <Camera size={15} />
              <span>Retake</span>
            </button>
            <button
              type="button"
              className="fin-doc-action-btn change-file"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Different File"
              aria-label={`Upload different file for ${displayName}`}
            >
              <Upload size={15} />
              <span>Upload</span>
            </button>
            <button
              type="button"
              className="fin-doc-action-btn remove-file"
              onClick={handleRemove}
              title="Remove File"
              aria-label={`Remove ${displayName}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div className="fin-doc-card-actions">
          <button
            type="button"
            className="fin-doc-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            aria-label={`Upload ${displayName} from Device`}
          >
            <Upload size={16} />
            <span>Upload from Device</span>
          </button>
          <button
            type="button"
            className="fin-doc-camera-btn"
            onClick={() => setIsCameraOpen(true)}
            aria-label={`Capture ${displayName} with Camera`}
          >
            <Camera size={16} />
            <span>Capture with Camera</span>
          </button>
        </div>
      )}

      {isCameraOpen && (
        <DocumentCameraModal
          title={`Capture ${displayName}`}
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </div>
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
