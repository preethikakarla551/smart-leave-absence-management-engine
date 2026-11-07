import React, { useState } from 'react';
import TeamCalendar from './components/Shared/TeamCalendar';
import {
  CalendarDays,
  UserRound,
  UsersRound,
  Building2,
  LogOut,
  Clock3,
  FileSpreadsheet
} from 'lucide-react';
import {
  completeNewPasswordSignIn,
  finishCognitoPasswordReset,
  startCognitoPasswordReset,
  signInWithCognito,
  signOutFromCognito
} from './services/auth';
import {
  fetchDashboard,
  submitLeaveRequest,
  approveLeaveRequest
} from './services/api';

const leaveLabels = {
  SICK: 'Sick Leave',
  CASUAL: 'Casual Leave',
  EARNED: 'Earned Leave',
  UNPAID: 'Loss of Pay'
};

const statusLabel = (status) =>
  String(status || '').replaceAll('_', ' ');

const asNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export default function App() {
  const [portal, setPortal] = useState('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [needsNewPassword, setNeedsNewPassword] = useState(false);
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const refreshDashboard = async () => {
    const data = await fetchDashboard(portal);
    setDashboard(data);
    return data;
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);

    try {
      const result = await signInWithCognito(email, password);

      if (!result.signedIn) {
        // Amplify versions may expose the first-login challenge in different
        // nextStep fields. Inspect the whole nextStep object so this flow still
        // opens the password-change form when Cognito requires it.
        const nextStepText = JSON.stringify(result.nextStep || {}).toUpperCase();
        if (nextStepText.includes('NEW_PASSWORD_REQUIRED')) {
          setNeedsNewPassword(true);
          setPassword('');
          setNotice('Your temporary password was accepted. Choose a new password to finish signing in.');
          return;
        }

        if (nextStepText.includes('RESET_PASSWORD')) {
          await startCognitoPasswordReset(email);
          setNeedsPasswordReset(true);
          setResetCode('');
          setPassword('');
          setNotice('Cognito sent a password-reset code to the account recovery email. Enter it below with your new password.');
          return;
        }

        throw new Error(
          `Cognito needs another sign-in step: ${
            result.nextStep?.signInStep || 'follow the Cognito instructions'
          }`
        );
      }

      const data = await fetchDashboard(portal);
      setDashboard(data);
      setSignedIn(true);
      setPassword('');
    } catch (err) {
      setError(err.message || 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!resetCode.trim()) {
      setError('Enter the password-reset code sent by Cognito.');
      return;
    }
    if (!newPassword) {
      setError('Enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      await finishCognitoPasswordReset(email, resetCode, newPassword);
      setNeedsPasswordReset(false);
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      setPassword('');
      setNotice('Password updated. Sign in with your new password.');
    } catch (err) {
      setError(err.message || 'Could not reset the password. Check the code and try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleNewPassword = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!newPassword) {
      setError('Enter a new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const result = await completeNewPasswordSignIn(newPassword);

      if (!result.signedIn) {
        throw new Error(
          `Cognito needs another sign-in step: ${
            result.nextStep?.signInStep || 'follow the Cognito instructions'
          }`
        );
      }

      const data = await fetchDashboard(portal);
      setDashboard(data);
      setSignedIn(true);
      setNeedsNewPassword(false);
      setNeedsPasswordReset(false);
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Could not set the new password.');
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    try {
      await signOutFromCognito();
    } finally {
      setSignedIn(false);
      setDashboard(null);
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNeedsNewPassword(false);
      setError('');
      setNotice('');
      setBusy(false);
    }
  };

  const handleSubmitLeave = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);

    try {
      if (!form.startDate || !form.endDate || !form.reason.trim()) {
        throw new Error('Enter the dates and reason for your leave request.');
      }

      if (form.endDate < form.startDate) {
        throw new Error('The end date must be on or after the start date.');
      }

      await submitLeaveRequest({
        employee_id: dashboard?.employee?.employee_id,
        leave_type: form.leaveType,
        start_date: form.startDate,
        end_date: form.endDate,
        reason: form.reason.trim()
      });

      await refreshDashboard();
      setForm({
        leaveType: 'CASUAL',
        startDate: '',
        endDate: '',
        reason: ''
      });
      setNotice('Your leave request was submitted.');
    } catch (err) {
      setError(err.message || 'Could not submit the leave request.');
    } finally {
      setBusy(false);
    }
  };

  const handleDecision = async (requestId, action) => {
    setError('');
    setNotice('');
    setBusy(true);

    try {
      await approveLeaveRequest(requestId, action);
      await refreshDashboard();
      setNotice(action === 'APPROVE' ? 'Request approved.' : 'Request rejected.');
    } catch (err) {
      setError(err.message || 'Could not update this request.');
    } finally {
      setBusy(false);
    }
  };

  const requests = dashboard?.leave_requests || [];
  const balances = dashboard?.leave_balances || [];
  const balanceFor = (type) =>
    balances.find((item) => String(item.balance_key || '').startsWith(`${type}#`));

  const absenceRows = dashboard?.team_absences || [];
  const memberSource =
    portal === 'manager'
      ? dashboard?.team_members || []
      : absenceRows;

  const seenMembers = new Set();
  const teamMembers = memberSource
    .filter((person) => {
      const id = person.employee_id;
      if (!id || seenMembers.has(id)) return false;
      seenMembers.add(id);
      return portal !== 'manager' || id !== dashboard?.manager?.employee_id;
    })
    .map((person) => ({
      email: person.employee_id,
      name: person.employee_name || person.employee_id
    }));

  const calendarEvents = absenceRows
    .filter((item) => item.date)
    .map((item) => ({
      employeeEmail: item.employee_id,
      leaveType: leaveLabels[item.leave_type] || item.leave_type,
      startDate: item.date,
      endDate: item.date,
      status: 'Approved'
    }));

  const downloadCsv = () => {
    if (!requests.length) {
      setNotice('There are no leave requests to export.');
      return;
    }

    const columns = [
      'Request ID',
      'Employee',
      'Email',
      'Leave Type',
      'Start Date',
      'End Date',
      'Days',
      'Status',
      'Reason'
    ];

    const rows = requests.map((request) => [
      request.request_id,
      request.employee_name,
      request.employee_email,
      leaveLabels[request.leave_type] || request.leave_type,
      request.start_date,
      request.end_date,
      request.total_days,
      statusLabel(request.status),
      request.reason
    ]);

    const quote = (value) =>
      `"${String(value ?? '').replaceAll('"', '""')}"`;

    const csv = [columns, ...rows]
      .map((row) => row.map(quote).join(','))
      .join('\r\n');

    const link = document.createElement('a');
    link.href = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' })
    );
    link.download = 'leave-report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (!signedIn) {
    return (
      <main style={styles.page}>
        <section style={styles.loginWrap}>
          <div style={styles.brand}>
            <CalendarDays size={30} color="#147d6b" />
            <h1 style={styles.title}>Smart Leave Engine</h1>
          </div>
          <div style={styles.loginCard}>
          <div style={styles.eyebrow}>PORTAL LOGIN</div>
          <h2 style={styles.loginHeading}>Sign in</h2>
          <p style={styles.subtitle}>{needsNewPassword ? 'Set a new password to finish activating your account.' : needsPasswordReset ? 'Enter the reset code sent to your account email and choose a new password.' : 'Choose your portal and sign in to continue.'}</p>

          {!needsNewPassword && !needsPasswordReset && <div style={styles.portals}>
            {[
              ['employee', 'Employee', 'Apply and view leave', UserRound],
              ['manager', 'Manager', 'Review team requests', UsersRound],
              ['hr', 'HR Administrator', 'Review leave requests', Building2]
            ].map(([value, label, description, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPortal(value)}
                style={{
                  ...styles.portalButton,
                  ...(portal === value ? styles.portalSelected : {})
                }}
              >
                <Icon size={19} />
                <strong style={{ display: 'block', marginTop: '8px' }}>{label}</strong>
                <span style={{ display: 'block', marginTop: '3px', fontSize: '12px' }}>{description}</span>
              </button>
            ))}
          </div>}

          <form onSubmit={needsNewPassword ? handleNewPassword : needsPasswordReset ? handlePasswordReset : handleSignIn}>
            <label style={styles.label}>Work email</label>
            <input
              style={styles.input}
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              readOnly={needsNewPassword || needsPasswordReset}
              required
            />

            {needsPasswordReset ? (
              <>
                <label style={styles.label}>Password reset code</label>
                <input
                  style={styles.input}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={resetCode}
                  onChange={(event) => setResetCode(event.target.value)}
                  required
                />

                <label style={styles.label}>New password</label>
                <input
                  style={styles.input}
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />

                <label style={styles.label}>Confirm new password</label>
                <input
                  style={styles.input}
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </>
            ) : needsNewPassword ? (
              <>
                <label style={styles.label}>New password</label>
                <input
                  style={styles.input}
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />

                <label style={styles.label}>Confirm new password</label>
                <input
                  style={styles.input}
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </>
            ) : (
              <>
                <label style={styles.label}>Password</label>
                <input
                  style={styles.input}
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </>
            )}

            {error && <p style={styles.error}>{error}</p>}
            {notice && <p style={styles.notice}>{notice}</p>}

            <button style={styles.primaryButton} disabled={busy}>
              {busy
                ? (needsPasswordReset ? 'Resetting password…' : needsNewPassword ? 'Setting password…' : 'Signing in…')
                : (needsPasswordReset ? 'Reset password' : needsNewPassword ? 'Set new password' : 'Sign in')}
            </button>
          </form>
          </div>
        </section>
      </main>
    );
  }

  const profile = dashboard?.employee || dashboard?.manager;
  const heading =
    portal === 'hr' ? 'HR / Admin Portal' :
    portal === 'manager' ? 'Manager Portal' :
    'Employee Portal';

  return (
    <main style={styles.page}>
      <section style={styles.container}>
        <header style={styles.dashboardHeader}>
          <div style={styles.dashboardBrand}>
            <CalendarDays size={28} color="#6ee7b7" />
            <div>
              <h1 style={styles.dashboardTitle}>Smart Leave Engine</h1>
              <p style={styles.dashboardSubtitle}>{heading}</p>
            </div>
          </div>
          <div style={styles.userActions}>
            <div style={styles.userIdentity}>
              <strong>{profile?.employee_email || email}</strong>
              <span>{heading}</span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              style={styles.signOutButton}
              disabled={busy}
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </header>

        {error && <p style={styles.error}>{error}</p>}
        {notice && <p style={styles.notice}>{notice}</p>}

        {portal === 'employee' && (
          <>
            <section style={styles.card}>
              <h2>My leave balances</h2>
              <div style={styles.balanceGrid}>
                {['SICK', 'CASUAL', 'EARNED'].map((type) => {
                  const item = balanceFor(type);
                  return (
                    <article key={type} style={styles.balanceCard}>
                      <div style={styles.balanceTitle}><Clock3 size={17} color="#147d6b" /><strong>{leaveLabels[type]}</strong></div>
                      <div style={styles.balanceNumber}>
                        {asNumber(item?.available)} days
                      </div>
                      <small>
                        Used: {asNumber(item?.used)} / Allocated:{' '}
                        {asNumber(item?.allocated)}
                      </small>
                    </article>
                  );
                })}
                <article style={styles.balanceCard}>
                  <div style={styles.balanceTitle}><Clock3 size={17} color="#b74343" /><strong>{leaveLabels.UNPAID}</strong></div>
                  <div style={styles.balanceNumber}>As per policy</div>
                  <small>
                    Used: {asNumber(dashboard?.lop_days_taken)} day(s)
                  </small>
                </article>
              </div>
            </section>

            <section style={styles.card}>
              <h2>Apply for leave</h2>
              <form onSubmit={handleSubmitLeave}>
                <label style={styles.label}>Leave type</label>
                <select
                  style={styles.input}
                  value={form.leaveType}
                  onChange={(event) =>
                    setForm({ ...form, leaveType: event.target.value })
                  }
                >
                  <option value="SICK">Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="EARNED">Earned Leave</option>
                  <option value="UNPAID">Loss of Pay</option>
                </select>

                <div style={styles.dateGrid}>
                  <div>
                    <label style={styles.label}>Start date</label>
                    <input
                      style={styles.input}
                      type="date"
                      value={form.startDate}
                      onChange={(event) =>
                        setForm({ ...form, startDate: event.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label style={styles.label}>End date</label>
                    <input
                      style={styles.input}
                      type="date"
                      value={form.endDate}
                      onChange={(event) =>
                        setForm({ ...form, endDate: event.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <label style={styles.label}>Reason</label>
                <textarea
                  style={{ ...styles.input, minHeight: '90px' }}
                  value={form.reason}
                  onChange={(event) =>
                    setForm({ ...form, reason: event.target.value })
                  }
                  required
                />

                <button style={styles.primaryButton} disabled={busy}>
                  {busy ? 'Submitting…' : 'Submit leave request'}
                </button>
              </form>
            </section>
          </>
        )}

        {(portal === 'manager' || portal === 'hr') && (
          <>
            <section style={styles.card}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2>Team absence calendar</h2>
                  <p style={styles.subtitle}>
                    Approved absences returned by the backend
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadCsv}
                  style={styles.secondaryButton}
                >
                  <FileSpreadsheet size={16} style={{ verticalAlign: 'middle', marginRight: '7px' }} />Download CSV report
                </button>
              </div>
              <TeamCalendar
                teamMembers={teamMembers}
                leaveEvents={calendarEvents}
              />
            </section>
          </>
        )}

        <section style={styles.card}>
          <h2>
            {portal === 'employee'
              ? 'My leave history'
              : portal === 'manager'
                ? 'Team leave requests'
                : 'All user leave applications'}
          </h2>

          {requests.length === 0 ? (
            <p style={styles.subtitle}>No leave requests were returned.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    {portal !== 'employee' && <th>Employee</th>}
                    <th>Leave type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Reason</th>
                    {portal !== 'employee' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => {
                    const canAct =
                      (portal === 'manager' && request.status === 'PENDING') ||
                      (portal === 'hr' &&
                        request.status === 'PENDING_HR_REVIEW');

                    return (
                      <tr key={request.request_id}>
                        <td>{request.request_id}</td>
                        {portal !== 'employee' && (
                          <td>
                            {request.employee_name || request.employee_email}
                          </td>
                        )}
                        <td>
                          {leaveLabels[request.leave_type] ||
                            request.leave_type}
                        </td>
                        <td>
                          {request.start_date} to {request.end_date}
                        </td>
                        <td>{request.total_days}</td>
                        <td><span style={{ ...styles.statusBadge, ...(request.status === 'APPROVED' ? styles.statusApproved : request.status === 'REJECTED' ? styles.statusRejected : styles.statusPending) }}>{statusLabel(request.status)}</span></td>
                        <td>{request.reason}</td>
                        {portal !== 'employee' && (
                          <td>
                            {canAct ? (
                              <div style={styles.actionButtons}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDecision(
                                      request.request_id,
                                      'APPROVE'
                                    )
                                  }
                                  disabled={busy}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDecision(
                                      request.request_id,
                                      'REJECT'
                                    )
                                  }
                                  disabled={busy}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f4f1e8',
    color: '#20332d',
    fontFamily: 'Segoe UI, system-ui, sans-serif',
    padding: '32px 16px'
  },
  container: { maxWidth: '1200px', margin: '0 auto' },
  loginWrap: { width: '100%', maxWidth: '560px', margin: '0 auto' },
  brand: { display: 'flex', alignItems: 'center', gap: '11px', margin: '0 0 18px 8px' },
  eyebrow: { color: '#147d6b', fontWeight: '700', fontSize: '12px', letterSpacing: '1.5px', marginBottom: '8px' },
  loginHeading: { margin: '0 0 6px', fontSize: '28px', color: '#20332d' },
  loginCard: {
    maxWidth: '560px',
    margin: '40px auto',
    padding: '32px',
    borderRadius: '18px',
    background: '#fff',
    boxShadow: '0 12px 36px rgba(32, 51, 45, 0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px'
  },
  dashboardHeader: { background: '#065f46', color: '#fff', borderRadius: '16px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', boxShadow: '0 8px 20px rgba(6,95,70,.14)' },
  dashboardBrand: { display: 'flex', alignItems: 'center', gap: '12px' },
  dashboardTitle: { margin: 0, fontSize: '21px', fontWeight: '800' },
  dashboardSubtitle: { margin: '3px 0 0', color: '#a7f3d0', fontSize: '13px' },
  userActions: { display: 'flex', alignItems: 'center', gap: '16px' },
  userIdentity: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', fontSize: '12px' },
  signOutButton: { border: '1px solid #6ee7b7', borderRadius: '8px', background: '#047857', color: '#fff', padding: '9px 13px', display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontWeight: '700' },
  title: { margin: 0, fontSize: '28px' },
  subtitle: { color: '#64748b', marginTop: '8px' },
  portals: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    margin: '24px 0'
  },
  portalButton: {
    border: '1px solid #d8e2dc',
    borderRadius: '10px',
    background: '#fff',
    padding: '14px 8px',
    cursor: 'pointer',
    color: '#20332d',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minHeight: '98px',
    textAlign: 'left'
  },
  portalSelected: {
    border: '2px solid #147d6b',
    background: '#e8f4ef',
    fontWeight: '700'
  },
  label: { display: 'block', margin: '14px 0 6px', fontWeight: '600' },
  input: {
    boxSizing: 'border-box',
    width: '100%',
    border: '1px solid #cbd5d1',
    borderRadius: '9px',
    padding: '12px',
    font: 'inherit'
  },
  primaryButton: {
    width: '100%',
    border: 0,
    borderRadius: '9px',
    background: '#147d6b',
    color: '#fff',
    padding: '13px',
    marginTop: '18px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  secondaryButton: {
    border: '1px solid #147d6b',
    borderRadius: '9px',
    background: '#fff',
    color: '#147d6b',
    padding: '10px 14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '22px',
    marginBottom: '20px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  balanceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '12px'
  },
  balanceCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px'
  },
  balanceTitle: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  balanceNumber: { fontSize: '24px', fontWeight: '700', margin: '10px 0' },
  dateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  actionButtons: { display: 'flex', gap: '6px' },
  statusBadge: { display: 'inline-block', padding: '4px 10px', borderRadius: '999px', fontWeight: '700', fontSize: '12px' },
  statusApproved: { background: '#dcfce7', color: '#166534' },
  statusRejected: { background: '#fee2e2', color: '#991b1b' },
  statusPending: { background: '#fef3c7', color: '#92400e' },
  error: {
    padding: '12px',
    borderRadius: '8px',
    background: '#fee2e2',
    color: '#991b1b'
  },
  notice: {
    padding: '12px',
    borderRadius: '8px',
    background: '#dcfce7',
    color: '#166534'
  }
};
