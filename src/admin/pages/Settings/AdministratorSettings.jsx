import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ShieldCheck, UserPlus } from 'lucide-react';

import { pageItems, platformApi } from '../../../common/services/platformApi';

const emptyForm = { firstName: '', lastName: '', email: '', phone: '', password: '' };

export default function AdministratorSettings() {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sessions, setSessions] = useState(null);

  const adminRole = useMemo(() => roles.find((role) => role.name === 'Admin'), [roles]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [adminPayload, rolePayload] = await Promise.all([
        platformApi.admin.admins({ page: 1, pageSize: 100 }),
        platformApi.admin.roles(),
      ]);
      setAdmins(pageItems(adminPayload).filter((user) => !user.financerId));
      setRoles(Array.isArray(rolePayload) ? rolePayload : rolePayload?.items || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const changeRole = async (admin, roleId) => { setError(''); try { await platformApi.admin.setUserRoles(admin.id, [roleId]); await load(); } catch (requestError) { setError(requestError.message); } };
  const deactivate = async (admin) => { if (!window.confirm(`Deactivate ${admin.firstName} ${admin.lastName} and revoke all sessions?`)) return; setError(''); try { await platformApi.admin.deactivateUser(admin.id); await load(); } catch (requestError) { setError(requestError.message); } };
  const showSessions = async (admin) => { setError(''); try { setSessions({ admin, items: await platformApi.admin.userSessions(admin.id) }); } catch (requestError) { setError(requestError.message); } };
  const revokeSession = async (sessionId) => { await platformApi.admin.revokeSession(sessions.admin.id, sessionId); await showSessions(sessions.admin); };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!adminRole) { setError('The Admin role is not configured.'); return; }
    if (form.password.length < 8) { setError('Temporary password must contain at least 8 characters.'); return; }

    setSubmitting(true);
    try {
      await platformApi.admin.createUser({
        financerId: null,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        roleIds: [adminRole.id],
      });
      setForm(emptyForm);
      setSuccess('Administrator account created successfully. Share the temporary password through a secure channel.');
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="admin-settings-admin-grid">
    <section className="admin-settings-card admin-create-card">
      <div className="admin-settings-section-title"><span><UserPlus size={20} /></span><div><h3>Add Administrator</h3><p>Create a platform account with the standard Admin role.</p></div></div>
      <form onSubmit={submit}>
        <div className="admin-settings-name-grid">
          <div className="admin-settings-group"><label htmlFor="adminFirstName">First Name</label><input id="adminFirstName" name="firstName" value={form.firstName} onChange={update} required autoComplete="given-name" /></div>
          <div className="admin-settings-group"><label htmlFor="adminLastName">Last Name</label><input id="adminLastName" name="lastName" value={form.lastName} onChange={update} required autoComplete="family-name" /></div>
        </div>
        <div className="admin-settings-group"><label htmlFor="adminEmail">Email Address</label><input id="adminEmail" name="email" type="email" value={form.email} onChange={update} required autoComplete="email" /></div>
        <div className="admin-settings-group"><label htmlFor="adminPhone">Mobile Number</label><input id="adminPhone" name="phone" type="tel" value={form.phone} onChange={update} required autoComplete="tel" pattern="[+0-9 ()-]{8,20}" /></div>
        <div className="admin-settings-group"><label htmlFor="adminPassword">Temporary Password</label><input id="adminPassword" name="password" type="password" value={form.password} onChange={update} required minLength="8" autoComplete="new-password" /><small>At least 8 characters. Share it securely with the new administrator.</small></div>
        {error && <div className="admin-settings-error" role="alert">{error}</div>}
        {success && <div className="admin-settings-success" role="status"><CheckCircle2 size={17} />{success}</div>}
        <button type="submit" className="admin-settings-purple-btn" disabled={submitting || loading}>{submitting ? 'Creating Administrator...' : 'Create Administrator'}</button>
      </form>
    </section>

    <section className="admin-settings-card admin-list-card">
      <div className="admin-settings-section-title"><span><ShieldCheck size={20} /></span><div><h3>Platform Administrators</h3><p>Accounts currently assigned Admin or SuperAdmin access.</p></div></div>
      {loading ? <p className="admin-settings-muted" role="status">Loading administrators...</p> : admins.length ? <div className="admin-settings-admin-list">{admins.map((admin) => <article key={admin.id}><span>{`${admin.firstName?.[0] || ''}${admin.lastName?.[0] || ''}` || 'A'}</span><div><strong>{admin.firstName} {admin.lastName}</strong><small>{admin.email}</small><label>Role<select aria-label={`Role for ${admin.firstName} ${admin.lastName}`} value={roles.find((role) => admin.roles?.includes(role.name))?.id || ''} onChange={(event) => changeRole(admin, event.target.value)}>{roles.filter((role) => ['SuperAdmin','Admin','FinanceOfficer','Auditor','ComplianceOfficer','SupportAgent'].includes(role.name)).map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label></div><em className={String(admin.status).toLowerCase()}>{admin.status}</em><button type="button" onClick={() => showSessions(admin)}>Sessions</button><button type="button" onClick={() => deactivate(admin)}>Deactivate & revoke sessions</button></article>)}</div> : <p className="admin-settings-muted">No administrator accounts were returned.</p>}
      {sessions && <div><h4>Sessions for {sessions.admin.firstName} {sessions.admin.lastName}</h4>{sessions.items.length ? sessions.items.map((session) => <p key={session.id}>{new Date(session.createdAt).toLocaleString('en-IN')} — {session.isActive ? 'Active' : 'Expired/revoked'} {session.isActive && <button type="button" onClick={() => revokeSession(session.id)}>Revoke</button>}</p>) : <p>No sessions.</p>}<button type="button" onClick={() => setSessions(null)}>Close</button></div>}
    </section>
  </div>;
}
