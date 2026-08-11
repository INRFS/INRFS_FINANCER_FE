import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  Crown,
  X,
} from 'lucide-react';
import './AdminSubscriptions.css';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '₹999',
    color: 'blue',
    icon: CreditCard,
    features: [
      'Up to 100 customers',
      'Up to 200 active loans',
      '500 SMS credits/month',
      'Basic reports',
      'Email support',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '₹2,499',
    color: 'purple',
    icon: CreditCard,
    features: [
      'Up to 500 customers',
      'Up to 1,000 active loans',
      '2,000 SMS credits/month',
      'Advanced reports',
      'Priority support',
      'Customer ledger',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹4,999',
    color: 'orange',
    icon: Crown,
    popular: true,
    features: [
      'Unlimited customers',
      'Unlimited active loans',
      '10,000 SMS credits/month',
      'Full analytics suite',
      '24/7 support',
      'API access',
      'White-label option',
    ],
  },
];

const initialSubscriptions = [
  {
    financer: 'Patel Finance Services',
    plan: 'Premium',
    customers: 250,
    loans: 180,
    sms: 1240,
    status: 'Active',
  },
  {
    financer: 'Sharma Money Lenders',
    plan: 'Standard',
    customers: 89,
    loans: 65,
    sms: 320,
    status: 'Active',
  },
  {
    financer: 'Singh Credit Solutions',
    plan: 'Premium',
    customers: 145,
    loans: 112,
    sms: 890,
    status: 'Active',
  },
  {
    financer: 'Reddy Finance Corp',
    plan: 'Basic',
    customers: 42,
    loans: 30,
    sms: 85,
    status: 'Trial',
  },
  {
    financer: 'Khan Financial',
    plan: 'Standard',
    customers: 78,
    loans: 55,
    sms: 450,
    status: 'Active',
  },
  {
    financer: 'Verma Capital',
    plan: 'Basic',
    customers: 25,
    loans: 18,
    sms: 40,
    status: 'Suspended',
  },
  {
    financer: 'Jain Money Solutions',
    plan: 'Standard',
    customers: 110,
    loans: 88,
    sms: 620,
    status: 'Active',
  },
];

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [changeFinancer, setChangeFinancer] = useState(null);

  const handleAssignPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleChangePlan = (financer) => {
    setChangeFinancer(financer);
  };

  const updateSubscriptionPlan = (planName) => {
    if (!changeFinancer) return;

    setSubscriptions((current) =>
      current.map((item) =>
        item.financer === changeFinancer
          ? {
              ...item,
              plan: planName,
            }
          : item
      )
    );

    setChangeFinancer(null);
  };

  return (
    <div className="admin-subscriptions-page">

      {/* PAGE HEADER */}
      <div className="subscription-page-header">
        <h1>Subscription Management</h1>
        <p>Manage plans and financer subscriptions</p>
      </div>

      {/* PLAN CARDS */}
      <div className="subscription-plans-grid">
        {plans.map((plan) => {
          const PlanIcon = plan.icon;

          return (
            <div
              key={plan.id}
              className={`subscription-plan-card ${plan.color} ${
                plan.popular ? 'popular-plan' : ''
              }`}
            >
              {plan.popular && (
                <div className="popular-badge">
                  POPULAR
                </div>
              )}

              {/* PLAN ICON */}
              <div className="subscription-plan-icon">
                <PlanIcon size={20} strokeWidth={2} />
              </div>

              {/* PLAN NAME */}
              <h2>{plan.name}</h2>

              {/* PRICE */}
              <div className="subscription-price">
                <span className="price">{plan.price}</span>
                <span className="period">/month</span>
              </div>

              {/* FEATURES */}
              <div className="subscription-features">
                {plan.features.map((feature, index) => (
                  <div
                    className="subscription-feature"
                    key={index}
                  >
                    <Check size={14} strokeWidth={2.5} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* ASSIGN BUTTON */}
              <button
                className="assign-plan-btn"
                onClick={() => handleAssignPlan(plan)}
              >
                Assign Plan
              </button>
            </div>
          );
        })}
      </div>

      {/* CURRENT SUBSCRIPTIONS */}
      <section className="current-subscriptions-section">

        <div className="current-subscriptions-header">
          <h2>Current Financer Subscriptions</h2>
        </div>

        <div className="subscriptions-table-wrapper">
          <table className="subscriptions-table">
            <thead>
              <tr>
                <th>FINANCER</th>
                <th>PLAN</th>
                <th>CUSTOMERS</th>
                <th>LOANS</th>
                <th>SMS</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {subscriptions.map((subscription, index) => (
                <tr key={index}>

                  <td className="financer-name">
                    {subscription.financer}
                  </td>

                  <td>
                    <span
                      className={`table-plan plan-${subscription.plan.toLowerCase()}`}
                    >
                      {subscription.plan}
                    </span>
                  </td>

                  <td>{subscription.customers}</td>

                  <td>{subscription.loans}</td>

                  <td>{subscription.sms}</td>

                  <td>
                    <span
                      className={`status-badge status-${subscription.status.toLowerCase()}`}
                    >
                      {subscription.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="change-plan-btn"
                      onClick={() =>
                        handleChangePlan(subscription.financer)
                      }
                    >
                      Change Plan
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ASSIGN PLAN MODAL */}
      {selectedPlan && (
        <div
          className="subscription-modal-overlay"
          onClick={() => setSelectedPlan(null)}
        >
          <div
            className="subscription-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedPlan(null)}
            >
              <X size={18} />
            </button>

            <div className="modal-icon">
              <CreditCard size={22} />
            </div>

            <h3>Assign {selectedPlan.name} Plan</h3>

            <p>
              Select a financer to assign the{' '}
              <strong>{selectedPlan.name}</strong> subscription.
            </p>

            <select className="financer-select">
              <option value="">Select financer</option>
              {subscriptions.map((item) => (
                <option
                  key={item.financer}
                  value={item.financer}
                >
                  {item.financer}
                </option>
              ))}
            </select>

            <button
              className={`modal-confirm-btn ${selectedPlan.color}`}
              onClick={() => setSelectedPlan(null)}
            >
              Assign {selectedPlan.name}
            </button>
          </div>
        </div>
      )}

      {/* CHANGE PLAN MODAL */}
      {changeFinancer && (
        <div
          className="subscription-modal-overlay"
          onClick={() => setChangeFinancer(null)}
        >
          <div
            className="subscription-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setChangeFinancer(null)}
            >
              <X size={18} />
            </button>

            <div className="modal-icon">
              <CreditCard size={22} />
            </div>

            <h3>Change Subscription Plan</h3>

            <p>
              Change the subscription plan for{' '}
              <strong>{changeFinancer}</strong>.
            </p>

            <div className="change-plan-options">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  className={`change-plan-option ${plan.color}`}
                  onClick={() =>
                    updateSubscriptionPlan(plan.name)
                  }
                >
                  <span>{plan.name}</span>
                  <strong>{plan.price}</strong>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}