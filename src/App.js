import React, { useState } from 'react';
import { 
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, 
  FileSpreadsheet, Shield, Search, PlusCircle, LogOut, 
  User, Building, Check, X, ArrowRight, Eye, Play
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authRole, setAuthRole] = useState('employee'); // 'employee' or 'hr'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // User Profile Session
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Active View State inside Portal
  const [activeTab, setActiveTab] = useState('dashboard');

  // Leave Balances
  const [balances, setBalances] = useState({
    casual: { used: 0, total: 12 },
    sick: { used: 0, total: 10 },
    earned: { used: 0, total: 15 },
    lop: { used: 0, total: 'Unlimited' }
  });

  // Raw State for Leave Requests
  const [leaveRequests, setLeaveRequests] = useState([]);

  // Form State for Applying Leave
  const [newLeave, setNewLeave] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [hrComments, setHrComments] = useState({});

  // Direct Preview Bypass Function (No Credentials Needed)
  const handleDirectBypass = (roleToPreview) => {
    setAuthRole(roleToPreview);
    setLoggedInUser({
      email: roleToPreview === 'hr' ? 'hr.admin@company.com' : 'employee@company.com',
      role: roleToPreview === 'hr' ? 'HR Administrator' : 'Employee',
      id: roleToPreview === 'hr' ? 'HR-001' : 'EMP-101'
    });
    setIsAuthenticated(true);
  };

  // Handle Standard Sign In Action
  const handleSignIn = (e) => {
    e.preventDefault();

    const isEmployeeLogin =
      authRole === 'employee' &&
      email === 'employee.demo@company.com' &&
      password === 'Employee123!';

    const isHrLogin =
      authRole === 'hr' &&
      email === 'hr.demo@company.com' &&
      password === 'HrAdmin123!';

    if (!isEmployeeLogin && !isHrLogin) {
      alert('Those demo credentials do not match the selected portal.');
      return;
    }

    setLoggedInUser({
      email,
      role: authRole === 'hr' ? 'HR Administrator' : 'Employee',
      id: authRole === 'hr' ? 'HR-001' : 'EMP-101'
    });

    setIsAuthenticated(true);
  };
  // Handle Sign Out Action
  const handleSignOut = () => {
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setLoggedInUser(null);
  };

  // Handle New Leave Submission
  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      alert('Please fill in all required fields.');
      return;
    }

    const start = new Date(newLeave.startDate);
    const end = new Date(newLeave.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const createdRequest = {
      id: `LR-${Date.now().toString().slice(-4)}`,
      employeeEmail: loggedInUser.email,
      leaveType: newLeave.leaveType,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      duration: diffDays,
      reason: newLeave.reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
      hrComment: ''
    };

    setLeaveRequests([createdRequest, ...leaveRequests]);
    setNewLeave({ leaveType: 'Casual Leave', startDate: '', endDate: '', reason: '' });
    setActiveTab('dashboard');
    alert('Leave application submitted successfully!');
  };

  // Handle HR Approval / Rejection
  const handleStatusChange = (requestId, newStatus) => {
    const comment = hrComments[requestId] || (newStatus === 'Approved' ? 'Approved by HR' : 'Rejected by HR');

    setLeaveRequests(leaveRequests.map(req => {
      if (req.id === requestId) {
        if (newStatus === 'Approved') {
          let typeKey = req.leaveType.toLowerCase().split(' ')[0];
          if (req.leaveType.includes('Loss of Pay') || req.leaveType.includes('Unpaid')) {
            typeKey = 'lop';
          }
          if (balances[typeKey]) {
            setBalances(prev => ({
              ...prev,
              [typeKey]: {
                ...prev[typeKey],
                used: prev[typeKey].used + req.duration
              }
            }));
          }
        }
        return { ...req, status: newStatus, hrComment: comment };
      }
      return req;
    }));
  };

  // CSV Export Functionality
  const exportToCSV = () => {
    if (leaveRequests.length === 0) {
      alert('No leave records to export.');
      return;
    }

    const headers = ['Request ID', 'User Email', 'Leave Type', 'Start Date', 'End Date', 'Duration (Days)', 'Status', 'Reason', 'HR Comment'];
    const rows = leaveRequests.map(req => [
      req.id,
      req.employeeEmail,
      `"${req.leaveType}"`,
      req.startDate,
      req.endDate,
      req.duration,
      req.status,
      `"${req.reason.replace(/"/g, '""')}"`,
      `"${(req.hrComment || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Leave_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Requests based on user and search
  const filteredRequests = leaveRequests.filter(req => {
    const matchesSearch = req.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.employeeEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesRoleScope = authRole === 'hr' ? true : req.employeeEmail === loggedInUser?.email;
    return matchesSearch && matchesStatus && matchesRoleScope;
  });

  // ================= 1. SIGN IN SCREEN WITH PREVIEW BYPASS =================
  if (!isAuthenticated) {
    const selectedPortalStyle = {
      border: '2px solid #147d6b',
      background: '#e8f4ef',
      color: '#173b34'
    };

    const portalStyle = {
      border: '1px solid #d8e2dc',
      background: '#ffffff',
      color: '#33433d'
    };

    return (
      <div style={{
        minHeight: '100vh',
        background: '#f4f1e8',
        color: '#20332d',
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '28px',
        boxSizing: 'border-box'
      }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '22px',
            fontSize: '23px',
            fontWeight: '800',
            letterSpacing: '-0.5px'
          }}>
            <Calendar size={27} color="#147d6b" />
            <span>Smart Leave Engine</span>
          </div>

          <main style={{
            background: '#ffffff',
            border: '1px solid #e3e7df',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 18px 50px rgba(32, 51, 45, 0.10)'
          }}>
            <div style={{
              color: '#147d6b',
              fontWeight: '700',
              fontSize: '12px',
              letterSpacing: '1.5px',
              marginBottom: '9px'
            }}>
              PORTAL LOGIN
            </div>

            <h1 style={{ fontSize: '27px', margin: '0 0 8px', color: '#20332d' }}>
              Sign in
            </h1>
            <p style={{ color: '#68766f', margin: '0 0 22px' }}>
              Choose your portal and sign in to continue.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '22px'
            }}>
              <button
                type="button"
                onClick={() => setAuthRole('employee')}
                style={{
                  ...(authRole === 'employee' ? selectedPortalStyle : portalStyle),
                  borderRadius: '12px',
                  padding: '14px 10px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <User size={19} />
                <div style={{ fontWeight: '700', marginTop: '8px' }}>Employee</div>
                <div style={{ fontSize: '12px', marginTop: '3px' }}>Apply and view leave</div>
              </button>

              <button
                type="button"
                onClick={() => setAuthRole('hr')}
                style={{
                  ...(authRole === 'hr' ? selectedPortalStyle : portalStyle),
                  borderRadius: '12px',
                  padding: '14px 10px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Building size={19} />
                <div style={{ fontWeight: '700', marginTop: '8px' }}>HR Administrator</div>
                <div style={{ fontSize: '12px', marginTop: '3px' }}>Review leave requests</div>
              </button>
            </div>

            <form onSubmit={handleSignIn}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Work email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px',
                  border: '1px solid #d7dfd9',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}
              />

              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px',
                  border: '1px solid #d7dfd9',
                  borderRadius: '10px',
                  marginBottom: '18px',
                  fontSize: '14px'
                }}
              />

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '13px',
                  background: '#147d6b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Sign in
              </button>
            </form></main>
        </div>
      </div>
    );
  }
  // ================= 2. MAIN DASHBOARD =================
  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* Header */}
      <header style={{ backgroundColor: '#065f46', color: '#ffffff', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar style={{ color: '#6ee7b7', width: '26px', height: '26px' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Smart Leave Engine</h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#a7f3d0' }}>{loggedInUser.role} Portal</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#ffffff' }}>{loggedInUser.email}</span>
            <span style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: '600' }}>{loggedInUser.role}</span>
          </div>
          <button 
            onClick={handleSignOut}
            style={{ padding: '8px 14px', backgroundColor: '#047857', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut style={{ width: '14px', height: '14px' }} />
            Sign Out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 16px' }}>

        {/* ================= EMPLOYEE PORTAL ================= */}
        {authRole === 'employee' && (
          <div>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Employee Portal</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Logged in as {loggedInUser.email}</p>
              </div>
              <button 
                onClick={() => setActiveTab(activeTab === 'apply' ? 'dashboard' : 'apply')}
                style={{ backgroundColor: '#047857', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
              >
                <PlusCircle style={{ width: '16px', height: '16px' }} />
                {activeTab === 'apply' ? 'View Dashboard' : 'Apply for Leave'}
              </button>
            </div>

            {/* Leave Balance Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {Object.entries(balances).map(([type, bal]) => {
                const title = type === 'lop' ? 'Loss of Pay (LOP)' : type.charAt(0).toUpperCase() + type.slice(1) + ' Leave';
                const available = typeof bal.total === 'number' ? bal.total - bal.used : 'Unlimited';
                const cardColor = type === 'lop' ? '#e11d48' : '#047857';
                return (
                  <div key={type} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderLeft: `4px solid ${cardColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: '600', color: '#475569', fontSize: '13px' }}>{title}</span>
                      <Clock style={{ width: '18px', height: '18px', color: cardColor }} />
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>
                      {type === 'lop' ? `${bal.used} days taken` : `${available} `}
                      {type !== 'lop' && <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>/ {bal.total} days</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Apply Leave Form */}
            {activeTab === 'apply' && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '28px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>Submit Leave Request</h3>
                <form onSubmit={handleApplyLeave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>Leave Type</label>
                    <select 
                      value={newLeave.leaveType}
                      onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    >
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Earned Leave">Earned Leave</option>
                      <option value="Loss of Pay (LOP) / Unpaid Leave">Loss of Pay (LOP) / Unpaid Leave</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>Start Date</label>
                    <input 
                      type="date" 
                      value={newLeave.startDate}
                      onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>End Date</label>
                    <input 
                      type="date" 
                      value={newLeave.endDate}
                      onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      required
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>Reason for Leave</label>
                    <textarea 
                      rows="3"
                      value={newLeave.reason}
                      onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                      placeholder="Enter reason..."
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      required
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('dashboard')}
                      style={{ padding: '10px 18px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      style={{ padding: '10px 18px', borderRadius: '6px', border: 'none', backgroundColor: '#047857', color: '#ffffff', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                    >
                      Submit Application
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ================= HR PORTAL ================= */}
        {authRole === 'hr' && (
          <div>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>HR / Admin Portal</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Review applications, approve/reject paid/unpaid requests, and export reports.</p>
              </div>
              <button 
                onClick={exportToCSV}
                style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
              >
                <FileSpreadsheet style={{ width: '16px', height: '16px' }} />
                Export CSV Report
              </button>
            </div>
          </div>
        )}

        {/* ================= SHARED LEAVE REQUESTS TABLE ================= */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>
              {authRole === 'hr' ? 'All User Leave Applications' : 'My Leave Applications'}
            </h3>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '10px', top: '10px', width: '15px', height: '15px', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Search email, ID, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '8px 12px 8px 32px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px' }}>Request ID</th>
                  <th style={{ padding: '12px' }}>User Email</th>
                  <th style={{ padding: '12px' }}>Leave Type</th>
                  <th style={{ padding: '12px' }}>Dates</th>
                  <th style={{ padding: '12px' }}>Duration</th>
                  <th style={{ padding: '12px' }}>Reason</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  {authRole === 'hr' && <th style={{ padding: '12px' }}>HR Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={authRole === 'hr' ? 8 : 7} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                      No leave applications found. Apply for leave to view records here.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#334155' }}>{req.id}</td>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{req.employeeEmail}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontWeight: req.leaveType.includes('LOP') ? '600' : 'normal', color: req.leaveType.includes('LOP') ? '#e11d48' : 'inherit' }}>
                          {req.leaveType}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{req.startDate} to {req.endDate}</td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{req.duration} day(s)</td>
                      <td style={{ padding: '12px', color: '#475569', maxWidth: '200px' }}>{req.reason}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                          backgroundColor: req.status === 'Approved' ? '#dcfce7' : req.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                          color: req.status === 'Approved' ? '#166534' : req.status === 'Rejected' ? '#991b1b' : '#92400e'
                        }}>
                          {req.status}
                        </span>
                      </td>

                      {/* HR Actions */}
                      {authRole === 'hr' && (
                        <td style={{ padding: '12px' }}>
                          {req.status === 'Pending' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <input 
                                type="text"
                                placeholder="Add remark..."
                                value={hrComments[req.id] || ''}
                                onChange={(e) => setHrComments({ ...hrComments, [req.id]: e.target.value })}
                                style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                              />
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button 
                                  onClick={() => handleStatusChange(req.id, 'Approved')}
                                  style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleStatusChange(req.id, 'Rejected')}
                                  style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', backgroundColor: '#dc2626', color: '#ffffff', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{req.hrComment || 'Recorded'}</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

