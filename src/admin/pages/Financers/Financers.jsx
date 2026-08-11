import React, { useState } from 'react';
import { Building2, Plus, CheckCircle, Ban, Eye } from 'lucide-react';
import SearchInput from '../../../common/components/SearchInput';
import StatusBadge from '../../../common/components/StatusBadge';
import Button from '../../../common/components/Button';
import Modal from '../../../common/components/Modal';
import { formatCurrency } from '../../../common/utils/formatters';
import { mockFinancersList } from '../../data/mockAdminData';
import './Financers.css';

export default function Financers() {
  const [financers, setFinancers] = useState(mockFinancersList);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newFinancer, setNewFinancer] = useState({ name: '', owner: '', city: 'Ahmedabad' });

  const filtered = financers.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.owner.toLowerCase().includes(search.toLowerCase()));

  const handleApprove = (id) => {
    setFinancers(financers.map(f => f.id === id ? { ...f, status: 'Active', kycStatus: 'Verified' } : f));
  };

  const handleSuspend = (id) => {
    setFinancers(financers.map(f => f.id === id ? { ...f, status: 'Suspended' } : f));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const created = {
      id: `FIN-${Math.floor(106 + Math.random() * 50)}`,
      name: newFinancer.name,
      owner: newFinancer.owner,
      city: newFinancer.city,
      activeLoans: 0,
      totalDisbursed: 0,
      kycStatus: 'Verified',
      status: 'Active',
    };
    setFinancers([created, ...financers]);
    setIsAddModalOpen(false);
    setNewFinancer({ name: '', owner: '', city: 'Ahmedabad' });
  };

  return (
    <div className="admin-financers-page animate-fade-in">
      <div className="admin-financers-header">
        <div>
          <h1 className="admin-financers-title">Financer Accounts & KYC</h1>
          <p className="admin-financers-subtitle">Manage registered financial institutions, verify KYC & set platform limits.</p>
        </div>
        <Button variant="purple" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
          Add Financer Institution
        </Button>
      </div>

      <div className="admin-financers-toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Search institution or owner..." />
      </div>

      <div className="admin-financers-table-card">
        <div className="admin-financers-table-wrapper">
          <table className="admin-financers-table">
            <thead>
              <tr>
                <th>FINANCER ID</th>
                <th>INSTITUTION</th>
                <th>PROPRIETOR</th>
                <th>CITY</th>
                <th>ACTIVE LOANS</th>
                <th>TOTAL DISBURSED</th>
                <th>KYC STATUS</th>
                <th>PORTAL STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td><strong className="admin-financers-id">{f.id}</strong></td>
                  <td><strong className="admin-financers-name">{f.name}</strong></td>
                  <td>{f.owner}</td>
                  <td>{f.city}</td>
                  <td><strong>{f.activeLoans}</strong></td>
                  <td>{formatCurrency(f.totalDisbursed)}</td>
                  <td><StatusBadge status={f.kycStatus} /></td>
                  <td><StatusBadge status={f.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="admin-financers-actions">
                      {f.status === 'Pending Approval' && (
                        <button className="admin-financers-approve-btn" onClick={() => handleApprove(f.id)} title="Approve KYC">
                          <CheckCircle size={16} /> Approve
                        </button>
                      )}
                      {f.status === 'Active' && (
                        <button className="admin-financers-suspend-btn" onClick={() => handleSuspend(f.id)} title="Suspend Account">
                          <Ban size={16} />
                        </button>
                      )}
                      <button className="admin-financers-view-btn" title="View Details">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register Financer Institution">
        <form onSubmit={handleAddSubmit} className="admin-financers-modal-form">
          <div className="admin-financers-input-group">
            <label>Institution Name</label>
            <input type="text" placeholder="e.g. Apex Finance" value={newFinancer.name} onChange={(e) => setNewFinancer({ ...newFinancer, name: e.target.value })} required />
          </div>
          <div className="admin-financers-input-group">
            <label>Proprietor / Owner Name</label>
            <input type="text" placeholder="e.g. Suresh Patel" value={newFinancer.owner} onChange={(e) => setNewFinancer({ ...newFinancer, owner: e.target.value })} required />
          </div>
          <div className="admin-financers-input-group">
            <label>City</label>
            <input type="text" value={newFinancer.city} onChange={(e) => setNewFinancer({ ...newFinancer, city: e.target.value })} required />
          </div>
          <div className="admin-financers-modal-actions">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="purple">Register Financer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
