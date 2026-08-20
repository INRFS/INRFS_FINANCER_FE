import React, { useEffect, useMemo, useState } from 'react';
import { Building2, CheckCircle2, Eye, Mail, Phone, Power, PowerOff, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../auth/authState';
import { FINANCER_MANAGE_ROLES } from '../../adminAccess';
import { pageItems, platformApi } from '../../../common/services/platformApi';

import './FinancerDirectory.css';

export default function FinancerDirectory() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canManage = hasRole(...FINANCER_MANAGE_ROLES);
  const [financers, setFinancers] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = React.useCallback(() => platformApi.admin.allFinancers()
    .then((payload) => setFinancers(pageItems(payload)))
    .catch((requestError) => setError(requestError.message)), []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return financers.filter((financer) => !term || [financer.displayName, financer.legalName, financer.ownerName, financer.email, financer.phone, financer.id].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [financers, search]);

  const changeStatus = async (financer, status) => {
    try {
      await platformApi.admin.changeFinancerStatus(financer.id, { status, reason: `Status changed to ${status} by administrator` });
      await load();
    } catch (requestError) { setError(requestError.message); }
  };

  const active = financers.filter((financer) => financer.status === 'Active').length;

  return <div className="financer-directory">
    <header><div><h1>Financer Institutions</h1><p>Manage registered financer organizations, contacts, fee rates, and access status.</p></div><label><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search financer or contact..." /></label></header>
    {error && <p className="financer-directory-error" role="alert">{error}</p>}
    <section className="financer-directory-summary"><article><Building2 size={21} /><div><span>Total Financers</span><strong>{financers.length}</strong></div></article><article><CheckCircle2 size={21} /><div><span>Active Financers</span><strong>{active}</strong></div></article><article><PowerOff size={21} /><div><span>Inactive / Suspended</span><strong>{Math.max(0, financers.length - active)}</strong></div></article></section>
    <section className="financer-directory-table"><div className="financer-directory-scroll"><table><thead><tr><th>Organization</th><th>Owner / Contact</th><th>Location</th><th>Platform Fee</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.length ? filtered.map((financer) => <tr key={financer.id}><td><strong>{financer.displayName}</strong><small>{financer.legalName || financer.financerNumber || financer.id}</small></td><td><strong>{financer.ownerName || '—'}</strong><small><Mail size={12} />{financer.email || '—'}</small><small><Phone size={12} />{financer.phone || '—'}</small></td><td>{[financer.city, financer.state].filter(Boolean).join(', ') || '—'}</td><td>{Number(financer.serviceChargePercentage || 1)}% of interest</td><td><span className={`directory-status ${String(financer.status || '').toLowerCase().replaceAll(' ', '-')}`}>{financer.status}</span></td><td><div className="financer-directory-actions"><button type="button" className="is-primary" onClick={() => navigate(`/admin/financers/${financer.id}`)}><Eye size={14} /> View Details</button>{canManage && (financer.status === 'Active' ? <button type="button" onClick={() => changeStatus(financer, 'Inactive')}><PowerOff size={14} /> Deactivate</button> : <button type="button" onClick={() => changeStatus(financer, 'Active')}><Power size={14} /> Activate</button>)}</div></td></tr>) : <tr><td colSpan="6" className="financer-directory-empty">No financers found.</td></tr>}</tbody></table></div></section>
  </div>;
}
