import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Check,
  Crown,
  X,
} from 'lucide-react';
import './AdminSubscriptions.css';
import { platformApi, pageItems } from '../../../common/services/platformApi';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [financers, setFinancers] = useState([]);
  const [assignFinancerId, setAssignFinancerId] = useState('');
  const [pageError, setPageError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [changeFinancer, setChangeFinancer] = useState(null);

  const loadSubscriptions = React.useCallback(async () => {
    try {
      const [payload, financerPayload] = await Promise.all([platformApi.admin.subscriptions(), platformApi.admin.allFinancers()]);
      const financerItems = pageItems(financerPayload);
      const byId = new Map(financerItems.map((item) => [item.id, item]));
      const planById = new Map((payload.plans || []).map((item) => [item.id, item]));
      setFinancers(financerItems);
      setPlans((payload.plans || []).map((item, index) => ({ ...item, price: `₹${Number(item.monthlyPrice).toLocaleString('en-IN')}`, color: ['blue', 'purple', 'orange'][index % 3], icon: index === 2 ? Crown : CreditCard, features: JSON.parse(item.featuresJson || '[]') })));
      setSubscriptions((payload.subscriptions || []).map((item) => ({ ...item, financer: byId.get(item.financerId)?.displayName || item.financerId, plan: planById.get(item.subscriptionPlanId)?.name || 'Unknown', customers: '—', loans: '—', sms: '—' })));
    } catch (error) { setPageError(error.message); }
  }, []);
  useEffect(() => { loadSubscriptions(); }, [loadSubscriptions]);

  const handleAssignPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleChangePlan = (financer) => {
    setChangeFinancer(financer);
  };

  const updateSubscriptionPlan = async (plan) => {
    if (!changeFinancer) return;
    try {
      await platformApi.admin.assignSubscription({ financerId: changeFinancer.financerId, planId: plan.id, startsOn: new Date().toISOString().slice(0, 10), endsOn: null });
      setChangeFinancer(null);
      await loadSubscriptions();
    } catch (error) { setPageError(error.message); }
  };

  const assignPlan = async () => {
    if (!selectedPlan || !assignFinancerId) return;
    try {
      await platformApi.admin.assignSubscription({ financerId: assignFinancerId, planId: selectedPlan.id, startsOn: new Date().toISOString().slice(0, 10), endsOn: null });
      setSelectedPlan(null); setAssignFinancerId(''); await loadSubscriptions();
    } catch (error) { setPageError(error.message); }
  };

  return (
    <div className="admin-subscriptions-page">
      {pageError && <p role="alert">{pageError}</p>}

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
                        handleChangePlan(subscription)
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

            <select className="financer-select" value={assignFinancerId} onChange={(event) => setAssignFinancerId(event.target.value)}>
              <option value="">Select financer</option>
              {financers.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.displayName}
                </option>
              ))}
            </select>

            <button
              className={`modal-confirm-btn ${selectedPlan.color}`}
              onClick={assignPlan}
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
              <strong>{changeFinancer.financer}</strong>.
            </p>

            <div className="change-plan-options">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  className={`change-plan-option ${plan.color}`}
                  onClick={() =>
                    updateSubscriptionPlan(plan)
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
