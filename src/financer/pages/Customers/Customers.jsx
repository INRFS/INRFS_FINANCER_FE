import React, { useState } from 'react';
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
} from 'lucide-react';

import SearchInput from '../../../common/components/SearchInput';
import StatusBadge from '../../../common/components/StatusBadge';
import Button from '../../../common/components/Button';
import { formatCurrency } from '../../../common/utils/formatters';
import { mockCustomers } from '../../data/mockFinancerData';

import './Customers.css';


// =========================================================
// CUSTOMER ID GENERATOR
// CUST001, CUST002, CUST003...
// =========================================================
const generateCustomerId = (customers) => {
  let maxNumber = 0;

  customers.forEach((customer) => {
    const match = String(customer.id || '').match(/(\d+)$/);

    if (match) {
      maxNumber = Math.max(maxNumber, Number(match[1]));
    }
  });

  return `CUST${String(maxNumber + 1).padStart(3, '0')}`;
};


export default function Customers() {

  // Convert existing customer IDs to CUST001, CUST002...
  const [customers, setCustomers] = useState(() =>
    mockCustomers.map((customer, index) => ({
      ...customer,
      id: `CUST${String(index + 1).padStart(3, '0')}`,
    }))
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [newCustomerForm, setNewCustomerForm] = useState({
    // Step 1 - Personal Info
    name: '',
    mobile: '',
    email: '',
    dob: '',
    gender: '',

    // Step 2 - Address
    houseNumber: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pinCode: '',

    // Step 3 - KYC
    aadhaar: '',
    pan: '',

    // Step 4 - Documents
    aadhaarDocument: null,
    panDocument: null,
    addressProof: null,
    photograph: null,
    otherDocuments: null,
  });


  // =========================================================
  // FILTER CUSTOMERS
  // =========================================================
  const filteredCustomers = customers.filter((customer) => {

    const searchValue = search.toLowerCase();

    const matchesSearch =
      customer.name?.toLowerCase().includes(searchValue) ||
      customer.mobile?.toLowerCase().includes(searchValue) ||
      customer.id?.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === 'All' ||
      customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


  // =========================================================
  // FORM UPDATE
  // =========================================================
  const updateForm = (field, value) => {
    setNewCustomerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  // =========================================================
  // OPEN ADD CUSTOMER
  // =========================================================
  const openAddCustomer = () => {

    setCurrentStep(1);

    setNewCustomerForm({
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
    });

    setIsAddModalOpen(true);
  };


  // =========================================================
  // CLOSE MODAL
  // =========================================================
  const closeAddCustomer = () => {
    setIsAddModalOpen(false);
    setCurrentStep(1);
  };


  // =========================================================
  // NEXT STEP / SUBMIT
  // =========================================================
  const handleNext = (e) => {

    if (e) {
      e.preventDefault();
    }

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleAddSubmit();
    }
  };


  // =========================================================
  // BACK
  // =========================================================
  const handleBack = () => {

    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };


  // =========================================================
  // FILE CHANGE
  // =========================================================
  const handleFileChange = (field, e) => {

    const file = e.target.files?.[0] || null;

    updateForm(field, file);
  };


  // =========================================================
  // ADD CUSTOMER
  // =========================================================
  const handleAddSubmit = () => {

    const newCustomerId = generateCustomerId(customers);

    const createdCustomer = {
      id: newCustomerId,

      name: newCustomerForm.name,

      mobile: newCustomerForm.mobile.startsWith('+91')
        ? newCustomerForm.mobile
        : `+91 ${newCustomerForm.mobile}`,

      activeLoans: 0,

      outstanding: 0,

      nextDue: '-',

      status: 'Active',

      city: newCustomerForm.city,
    };


    setCustomers((prev) => [
      createdCustomer,
      ...prev,
    ]);

    closeAddCustomer();
  };


  return (
    <div className="fin-customers-page animate-fade-in">

      {/* =====================================================
          PAGE HEADER
         ===================================================== */}
      <div className="fin-customers-header">

        <div>
          <h1 className="fin-customers-title">
            Customers
          </h1>

          <p className="fin-customers-subtitle">
            Manage your customers and their loan accounts.
          </p>
        </div>


        <Button
          variant="cyan"
          icon={Plus}
          onClick={openAddCustomer}
        >
          Add Customer
        </Button>

      </div>


      {/* =====================================================
          STATISTICS
         ===================================================== */}
      <div className="fin-customers-stats-grid">

        <div className="fin-customers-stat-card">

          <div className="fin-customers-stat-icon fin-cust-icon-navy">
            <Users size={18} />
          </div>

          <div>
            <span className="fin-customers-stat-label">
              Total Customers
            </span>

            <h3 className="fin-customers-stat-val">
              {customers.length}
            </h3>
          </div>

        </div>


        <div className="fin-customers-stat-card">

          <div className="fin-customers-stat-icon fin-cust-icon-green">
            <UserCheck size={18} />
          </div>

          <div>
            <span className="fin-customers-stat-label">
              Active Customers
            </span>

            <h3 className="fin-customers-stat-val">
              {customers.filter(
                (customer) => customer.status === 'Active'
              ).length}
            </h3>
          </div>

        </div>


        <div className="fin-customers-stat-card">

          <div className="fin-customers-stat-icon fin-cust-icon-cyan">
            <UserPlus size={18} />
          </div>

          <div>
            <span className="fin-customers-stat-label">
              New This Month
            </span>

            <h3 className="fin-customers-stat-val">
              12
            </h3>
          </div>

        </div>


        <div className="fin-customers-stat-card">

          <div className="fin-customers-stat-icon fin-cust-icon-red">
            <AlertCircle size={18} />
          </div>

          <div>
            <span className="fin-customers-stat-label">
              Customers With Overdue
            </span>

            <h3 className="fin-customers-stat-val fin-val-red">
              {customers.filter(
                (customer) => customer.status === 'Overdue'
              ).length}
            </h3>
          </div>

        </div>

      </div>


      {/* =====================================================
          TOOLBAR
         ===================================================== */}
      <div className="fin-customers-toolbar">

        <div className="fin-customers-search">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by customer name, phone or ID..."
          />
        </div>


        <div className="fin-customers-filters">

          <label>
            Status:
          </label>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="fin-customers-select"
          >
            <option value="All">
              All Statuses
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Due">
              Due
            </option>

            <option value="Overdue">
              Overdue
            </option>

            <option value="Closed">
              Closed
            </option>
          </select>

        </div>

      </div>


      {/* =====================================================
          CUSTOMERS TABLE
         ===================================================== */}
      <div className="fin-customers-table-card">

        <div className="fin-customers-table-wrapper">

          <table className="fin-customers-table">

            <thead>
              <tr>

                <th>
                  CUSTOMER
                </th>

                <th>
                  MOBILE
                </th>

                <th>
                  CITY
                </th>

                <th className="center-column">
                  ACTIVE LOANS
                </th>

                <th>
                  OUTSTANDING
                </th>

                <th>
                  NEXT DUE
                </th>

                <th>
                  STATUS
                </th>

                <th className="action-column">
                  ACTION
                </th>

              </tr>
            </thead>


            <tbody>

              {filteredCustomers.map((customer) => (

                <tr key={customer.id}>

                  {/* CUSTOMER */}
                  <td>

                    <div className="fin-customers-name-cell">

                      <div className="fin-customers-avatar">
                        {customer.name?.charAt(0)?.toUpperCase()}
                      </div>


                      <div className="fin-customers-customer-info">

                        <strong className="fin-customers-name">
                          {customer.name}
                        </strong>

                        <span className="fin-customers-id">
                          {customer.id}
                        </span>

                      </div>

                    </div>

                  </td>


                  {/* MOBILE */}
                  <td className="mobile-column">
                    {customer.mobile}
                  </td>


                  {/* CITY */}
                  <td>
                    {customer.city}
                  </td>


                  {/* ACTIVE LOANS */}
                  <td className="center-column">

                    <strong>
                      {customer.activeLoans}
                    </strong>

                  </td>


                  {/* OUTSTANDING */}
                  <td>

                    <strong className="fin-customers-amt">
                      {formatCurrency(customer.outstanding)}
                    </strong>

                  </td>


                  {/* NEXT DUE */}
                  <td>
                    {customer.nextDue}
                  </td>


                  {/* STATUS */}
                  <td>
                    <StatusBadge status={customer.status} />
                  </td>


                  {/* ACTION */}
                  <td className="action-column">

                    <div className="fin-customers-actions">

                      <button
                        type="button"
                        className="fin-customers-action-btn"
                        title="View Profile"
                      >
                        <Eye size={15} />
                      </button>


                      <button
                        type="button"
                        className="fin-customers-action-btn"
                        title="Edit"
                      >
                        <Edit size={15} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}


              {filteredCustomers.length === 0 && (

                <tr>

                  <td
                    colSpan="8"
                    className="fin-customers-empty"
                  >
                    No customers found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =====================================================
          ADD CUSTOMER MODAL
         ===================================================== */}
      {isAddModalOpen && (

        <div className="customer-wizard-overlay">

          <div className="customer-wizard-modal">


            {/* HEADER */}
            <div className="customer-wizard-header">

              <div>

                <h2>
                  Add New Customer
                </h2>

                <p>
                  Step {currentStep} of 4 —{' '}

                  {currentStep === 1 && 'Personal Info'}
                  {currentStep === 2 && 'Address'}
                  {currentStep === 3 && 'KYC'}
                  {currentStep === 4 && 'Documents'}

                </p>

              </div>


              <button
                type="button"
                className="customer-wizard-close"
                onClick={closeAddCustomer}
                aria-label="Close"
              >
                <X size={22} />
              </button>

            </div>


            {/* PROGRESS */}
            <div className="customer-wizard-progress">

              {[
                'Personal Info',
                'Address',
                'KYC',
                'Documents',
              ].map((label, index) => {

                const stepNumber = index + 1;

                const isCompleted =
                  currentStep > stepNumber;

                const isCurrent =
                  currentStep === stepNumber;


                return (

                  <div
                    className="customer-wizard-progress-item"
                    key={label}
                  >

                    <div
                      className={`
                        customer-wizard-progress-line
                        ${isCompleted ? 'completed' : ''}
                        ${isCurrent ? 'current' : ''}
                      `}
                    />

                    <span
                      className={`
                        customer-wizard-step-label
                        ${isCompleted ? 'completed' : ''}
                        ${isCurrent ? 'current' : ''}
                      `}
                    >
                      {label}
                    </span>

                  </div>

                );

              })}

            </div>


            {/* CONTENT */}
            <div className="customer-wizard-content">


              {/* =================================================
                  STEP 1
                 ================================================= */}
              {currentStep === 1 && (

                <form onSubmit={handleNext}>

                  <div className="customer-form-field full">

                    <label>
                      Full Name <span>*</span>
                    </label>

                    <input
                      type="text"
                      placeholder="Ramesh Kumar"
                      value={newCustomerForm.name}
                      onChange={(e) =>
                        updateForm(
                          'name',
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>


                  <div className="customer-form-grid">

                    <div className="customer-form-field">

                      <label>
                        Mobile Number <span>*</span>
                      </label>

                      <input
                        type="text"
                        placeholder="+91 98001 11111"
                        value={newCustomerForm.mobile}
                        onChange={(e) =>
                          updateForm(
                            'mobile',
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>


                    <div className="customer-form-field">

                      <label>
                        Email Address
                      </label>

                      <input
                        type="email"
                        placeholder="ramesh@gmail.com"
                        value={newCustomerForm.email}
                        onChange={(e) =>
                          updateForm(
                            'email',
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="customer-form-field">

                      <label>
                        Date of Birth
                      </label>

                      <input
                        type="text"
                        placeholder="15-Mar-1985"
                        value={newCustomerForm.dob}
                        onChange={(e) =>
                          updateForm(
                            'dob',
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="customer-form-field">

                      <label>
                        Gender
                      </label>

                      <select
                        value={newCustomerForm.gender}
                        onChange={(e) =>
                          updateForm(
                            'gender',
                            e.target.value
                          )
                        }
                      >

                        <option value="">
                          Select
                        </option>

                        <option value="Male">
                          Male
                        </option>

                        <option value="Female">
                          Female
                        </option>

                        <option value="Other">
                          Other
                        </option>

                      </select>

                    </div>

                  </div>


                  <WizardButton text="Continue →" />

                </form>

              )}


              {/* =================================================
                  STEP 2
                 ================================================= */}
              {currentStep === 2 && (

                <form onSubmit={handleNext}>

                  <div className="customer-form-grid">

                    <div className="customer-form-field">

                      <label>
                        House / Flat Number
                      </label>

                      <input
                        type="text"
                        placeholder="12, MG Road"
                        value={newCustomerForm.houseNumber}
                        onChange={(e) =>
                          updateForm(
                            'houseNumber',
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="customer-form-field">

                      <label>
                        Street
                      </label>

                      <input
                        type="text"
                        placeholder="Andheri West"
                        value={newCustomerForm.street}
                        onChange={(e) =>
                          updateForm(
                            'street',
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="customer-form-field">

                      <label>
                        Area
                      </label>

                      <input
                        type="text"
                        placeholder="Andheri"
                        value={newCustomerForm.area}
                        onChange={(e) =>
                          updateForm(
                            'area',
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="customer-form-field">

                      <label>
                        City
                      </label>

                      <input
                        type="text"
                        placeholder="Mumbai"
                        value={newCustomerForm.city}
                        onChange={(e) =>
                          updateForm(
                            'city',
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>


                    <div className="customer-form-field">

                      <label>
                        State
                      </label>

                      <input
                        type="text"
                        placeholder="Maharashtra"
                        value={newCustomerForm.state}
                        onChange={(e) =>
                          updateForm(
                            'state',
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="customer-form-field">

                      <label>
                        PIN Code
                      </label>

                      <input
                        type="text"
                        placeholder="400001"
                        value={newCustomerForm.pinCode}
                        onChange={(e) =>
                          updateForm(
                            'pinCode',
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>


                  <WizardNavigation
                    onBack={handleBack}
                    onNext={handleNext}
                  />

                </form>

              )}


              {/* =================================================
                  STEP 3
                 ================================================= */}
              {currentStep === 3 && (

                <form onSubmit={handleNext}>

                  <div className="customer-form-field full">

                    <label>
                      Aadhaar Number
                    </label>

                    <input
                      type="text"
                      placeholder="1234 5678 9012"
                      value={newCustomerForm.aadhaar}
                      onChange={(e) =>
                        updateForm(
                          'aadhaar',
                          e.target.value
                        )
                      }
                    />

                  </div>


                  <div className="customer-form-field full">

                    <label>
                      PAN Number
                    </label>

                    <input
                      type="text"
                      placeholder="ABCDE1234F"
                      value={newCustomerForm.pan}
                      onChange={(e) =>
                        updateForm(
                          'pan',
                          e.target.value.toUpperCase()
                        )
                      }
                    />

                  </div>


                  <WizardNavigation
                    onBack={handleBack}
                    onNext={handleNext}
                  />

                </form>

              )}


              {/* =================================================
                  STEP 4
                 ================================================= */}
              {currentStep === 4 && (

                <form onSubmit={handleNext}>

                  <div className="customer-document-grid">

                    <DocumentUpload
                      label="Upload Aadhaar Card"
                      file={newCustomerForm.aadhaarDocument}
                      onChange={(e) =>
                        handleFileChange(
                          'aadhaarDocument',
                          e
                        )
                      }
                    />


                    <DocumentUpload
                      label="Upload PAN Card"
                      file={newCustomerForm.panDocument}
                      onChange={(e) =>
                        handleFileChange(
                          'panDocument',
                          e
                        )
                      }
                    />


                    <DocumentUpload
                      label="Upload Address Proof"
                      file={newCustomerForm.addressProof}
                      onChange={(e) =>
                        handleFileChange(
                          'addressProof',
                          e
                        )
                      }
                    />


                    <DocumentUpload
                      label="Upload Photograph"
                      file={newCustomerForm.photograph}
                      onChange={(e) =>
                        handleFileChange(
                          'photograph',
                          e
                        )
                      }
                    />


                    <DocumentUpload
                      label="Upload Other Documents"
                      file={newCustomerForm.otherDocuments}
                      onChange={(e) =>
                        handleFileChange(
                          'otherDocuments',
                          e
                        )
                      }
                    />

                  </div>


                  <div className="customer-wizard-actions">

                    <button
                      type="button"
                      className="customer-wizard-back"
                      onClick={handleBack}
                    >
                      ← Back
                    </button>


                    <button
                      type="submit"
                      className="customer-wizard-save"
                    >

                      <Check size={17} />

                      Save Customer

                    </button>

                  </div>

                </form>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


// =========================================================
// WIZARD BUTTON
// =========================================================
function WizardButton({ text }) {

  return (

    <button
      type="submit"
      className="customer-wizard-continue"
    >
      {text}
    </button>

  );
}


// =========================================================
// WIZARD NAVIGATION
// =========================================================
function WizardNavigation({ onBack, onNext }) {

  return (

    <div className="customer-wizard-actions">

      <button
        type="button"
        className="customer-wizard-back"
        onClick={onBack}
      >
        ← Back
      </button>


      <button
        type="button"
        className="customer-wizard-continue half"
        onClick={onNext}
      >
        Continue →
      </button>

    </div>

  );
}


// =========================================================
// DOCUMENT UPLOAD
// =========================================================
function DocumentUpload({
  label,
  file,
  onChange,
}) {

  return (

    <label className="customer-document-upload">

      <input
        type="file"
        onChange={onChange}
        accept=".jpg,.jpeg,.png,.pdf"
      />


      <div className="customer-document-left">

        <Upload size={19} />

        <span>
          {file ? file.name : label}
        </span>

      </div>


      <span className="customer-document-browse">

        {file
          ? 'Selected'
          : 'Browse'
        }

      </span>

    </label>

  );
}