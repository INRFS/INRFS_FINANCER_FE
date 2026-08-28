import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, UserPlus, X } from 'lucide-react';

import { pageItems, platformApi } from '../../../common/services/platformApi';

const emptyForm = { firstName: '', lastName: '', email: '', phone: '', password: '' };
const NAME_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const MOBILE_REGEX = /^[0-9]{10}$/;
export default function AdministratorSettings() {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sessions, setSessions] = useState(null);
  const [confirmAdmin, setConfirmAdmin] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

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

const update = (event) => {
  const { name, value } = event.target;

  let newValue = value;

  // First Name / Last Name — alphabets only
  if (name === 'firstName' || name === 'lastName') {
    newValue = value.replace(/[^A-Za-z '-]/g, '');
  }

  // Mobile Number — digits only and maximum 10 digits
  if (name === 'phone') {
    newValue = value.replace(/\D/g, '').slice(0, 10);
  }

  setForm((current) => ({
    ...current,
    [name]: newValue,
  }));
};
  const changeRole = async (admin, roleId) => { setError(''); try { await platformApi.admin.setUserRoles(admin.id, [roleId]); await load(); } catch (requestError) { setError(requestError.message); } };
  const deactivate = async () => {
    if (!confirmAdmin || deactivating) return;
    setDeactivating(true); setError('');
    try {
      await platformApi.admin.deactivateUser(confirmAdmin.id);
      setConfirmAdmin(null);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeactivating(false);
    }
  };
  const showSessions = async (admin) => { setError(''); try { setSessions({ admin, items: await platformApi.admin.userSessions(admin.id) }); } catch (requestError) { setError(requestError.message); } };
  const revokeSession = async (sessionId) => { await platformApi.admin.revokeSession(sessions.admin.id, sessionId); await showSessions(sessions.admin); };

const submit = async (event) => {
  event.preventDefault();

  setError('');
  setSuccess('');

  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const email = form.email.trim().toLowerCase();
  const phone = form.phone.trim();
  const password = form.password;

  // First name validation
  if (!NAME_REGEX.test(firstName)) {
    setError(
      'First Name can contain alphabets only.'
    );
    return;
  }

  // Last name validation
  if (!NAME_REGEX.test(lastName)) {
    setError(
      'Last Name can contain alphabets only.'
    );
    return;
  }

  // Email validation
  if (!EMAIL_REGEX.test(email)) {
    setError(
      'Please enter a valid email address.'
    );
    return;
  }

  // Mobile validation
  if (!MOBILE_REGEX.test(phone)) {
    setError(
      'Mobile Number must contain exactly 10 digits.'
    );
    return;
  }

  // Admin role validation
  if (!adminRole) {
    setError('The Admin role is not configured.');
    return;
  }

  // Password validation
  if (password.length < 8) {
    setError(
      'Temporary password must contain at least 8 characters.'
    );
    return;
  }

  setSubmitting(true);

  try {
    await platformApi.admin.createUser({
      financerId: null,
      firstName,
      lastName,
      email,
      phone,
      password,
      roleIds: [adminRole.id],
    });

    setForm(emptyForm);

    setSuccess(
      `Administrator account created successfully. Login details were sent to ${email}. A one-time code will be emailed after password verification.`
    );

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
          <div className="admin-settings-group"><label htmlFor="adminFirstName">First Name</label><input
  id="adminFirstName"
  name="firstName"
  value={form.firstName}
  onChange={update}
  required
  autoComplete="given-name"
  pattern="[A-Za-z]+(?:[ '-][A-Za-z]+)*"
  title="First Name can contain alphabets only"
/></div>
          <div className="admin-settings-group"><label htmlFor="adminLastName">Last Name</label><input
  id="adminLastName"
  name="lastName"
  value={form.lastName}
  onChange={update}
  required
  autoComplete="family-name"
  pattern="[A-Za-z]+(?:[ '-][A-Za-z]+)*"
  title="Last Name can contain alphabets only"
/></div>
        </div>
        <div className="admin-settings-group"><label htmlFor="adminEmail">Email Address</label><input
  id="adminEmail"
  name="email"
  type="email"
  value={form.email}
  onChange={update}
  required
  autoComplete="email"
/></div>
        <div className="admin-settings-group"><label htmlFor="adminPhone">Mobile Number</label><input
  id="adminPhone"
  name="phone"
  type="tel"
  value={form.phone}
  onChange={update}
  required
  autoComplete="tel"
  pattern="[+0-9 ()-]{8,20}"
/></div>
        <div className="admin-settings-group"><label htmlFor="adminPassword">Temporary Password</label><input
  id="adminPassword"
  name="password"
  type="password"
  value={form.password}
  onChange={update}
  required
  minLength="8"
  autoComplete="new-password"
/><small>At least 8 characters. Share it securely with the new administrator.</small></div>
        {error && <div className="admin-settings-error" role="alert">{error}</div>}
        {success && <div className="admin-settings-success" role="status"><CheckCircle2 size={17} />{success}</div>}
        <button type="submit" className="admin-settings-purple-btn" disabled={submitting || loading}>{submitting ? 'Creating Administrator...' : 'Create Administrator'}</button>
      </form>
    </section>

    <section className="admin-settings-card admin-list-card">
      <div className="admin-settings-section-title"><span><ShieldCheck size={20} /></span><div><h3>Platform Administrators</h3><p>Accounts currently assigned Admin or SuperAdmin access.</p></div></div>
      {loading ? <p className="admin-settings-muted" role="status">Loading administrators...</p> : admins.length ? <div className="admin-settings-admin-list">{admins.map((admin) => <article key={admin.id}><span>{`${admin.firstName?.[0] || ''}${admin.lastName?.[0] || ''}` || 'A'}</span><div><strong>{admin.firstName} {admin.lastName}</strong><small>{admin.email}</small><label>Role<select aria-label={`Role for ${admin.firstName} ${admin.lastName}`} value={roles.find((role) => admin.roles?.includes(role.name))?.id || ''} onChange={(event) => changeRole(admin, event.target.value)}>{roles.filter((role) => ['SuperAdmin','Admin'].includes(role.name)).map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label></div><em className={String(admin.status).toLowerCase()}>{admin.status}</em><div className="admin-settings-admin-actions"><button className="admin-settings-action-btn" type="button" onClick={() => showSessions(admin)}>View sessions</button><button className="admin-settings-action-btn danger" type="button" onClick={() => setConfirmAdmin(admin)}>Deactivate</button></div></article>)}</div> : <p className="admin-settings-muted">No administrator accounts were returned.</p>}
      {sessions && <div><h4>Sessions for {sessions.admin.firstName} {sessions.admin.lastName}</h4>{sessions.items.length ? sessions.items.map((session) => <p key={session.id}>{new Date(session.createdAt).toLocaleString('en-IN')} — {session.isActive ? 'Active' : 'Expired/revoked'} {session.isActive && <button type="button" onClick={() => revokeSession(session.id)}>Revoke</button>}</p>) : <p>No sessions.</p>}<button type="button" onClick={() => setSessions(null)}>Close</button></div>}
    </section>
    {confirmAdmin && <div className="admin-settings-confirm-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !deactivating && setConfirmAdmin(null)}><section className="admin-settings-confirm" role="alertdialog" aria-modal="true" aria-labelledby="deactivate-admin-title"><button className="admin-settings-confirm-close" type="button" aria-label="Close" disabled={deactivating} onClick={() => setConfirmAdmin(null)}><X size={20}/></button><span className="admin-settings-confirm-icon"><AlertTriangle size={25}/></span><h3 id="deactivate-admin-title">Deactivate administrator?</h3><p><strong>{confirmAdmin.firstName} {confirmAdmin.lastName}</strong> will lose platform access and all active sessions will be revoked.</p><div><button className="admin-settings-action-btn" type="button" disabled={deactivating} onClick={() => setConfirmAdmin(null)}>Cancel</button><button className="admin-settings-action-btn danger solid" type="button" disabled={deactivating} onClick={deactivate}>{deactivating ? 'Deactivating...' : 'Deactivate & revoke sessions'}</button></div></section></div>}
  </div>;
}
