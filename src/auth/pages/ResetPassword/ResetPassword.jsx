import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { api } from '../../../common/services/apiClient';
import '../FinancerLogin/FinancerLogin.css';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(params.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 10) return setError('Use at least 10 characters.');
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/password/reset', { token, newPassword: password, confirmPassword }, { auth: false });
      navigate('/financer/login', { replace: true, state: { notice: 'Password reset successfully. Sign in with your new password.' } });
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fin-login-page">
      <div className="fin-login-card">
        <div className="fin-login-brand"><img src={logo} alt="INRFS" className="fin-login-logo" /></div>
        <div className="fin-login-heading"><h1>Create a new password</h1><p>Use the reset token from your password-reset message.</p></div>
        <form className="fin-login-form" onSubmit={submit}>
          <div className="fin-login-field"><label htmlFor="reset-token">Reset token</label><input id="reset-token" value={token} onChange={(event) => setToken(event.target.value)} autoComplete="one-time-code" required /></div>
          <div className="fin-login-field"><label htmlFor="new-password">New password</label><input id="new-password" type="password" minLength={10} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required /></div>
          <div className="fin-login-field"><label htmlFor="confirm-password">Confirm password</label><input id="confirm-password" type="password" minLength={10} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required /></div>
          {error && <p role="alert" className="auth-error">{error}</p>}
          <button className="fin-login-submit" type="submit" disabled={submitting}>{submitting ? 'Resetting…' : 'Reset password'}</button>
        </form>
        <Link to="/financer/login">Back to sign in</Link>
      </div>
    </div>
  );
}
