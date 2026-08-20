import React from 'react';
import { BarChart3, UsersRound } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import FinancerBillingUsage from './FinancerBillingUsage';
import FinancerDirectory from './FinancerDirectory';

import './FinancersHub.css';

export default function FinancersHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'usage' ? 'usage' : 'financers';

  const selectTab = (tab) => {
    setSearchParams(tab === 'usage' ? { tab: 'usage' } : {}, { replace: true });
  };

  return (
    <div className="financers-hub">
      <div className="financers-hub-tabs" role="tablist" aria-label="Financer administration">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'financers'}
          className={activeTab === 'financers' ? 'active' : ''}
          onClick={() => selectTab('financers')}
        >
          <UsersRound size={17} />
          Financers
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'usage'}
          className={activeTab === 'usage' ? 'active' : ''}
          onClick={() => selectTab('usage')}
        >
          <BarChart3 size={17} />
          Usage Analytics
        </button>
      </div>

      <div role="tabpanel">
        {activeTab === 'usage' ? <FinancerBillingUsage /> : <FinancerDirectory />}
      </div>
    </div>
  );
}
