import React, { useState } from 'react';

const LeaveForm = ({ onSubmitSuccess, employeeId, managerId }) => {
  const [formData, setFormData] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: ''
  });
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) return 0;
    const diffTime = Math.abs(e - s);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (name === 'startDate' || name === 'endDate') {
      const days = calculateDays(
        name === 'startDate' ? value : formData.startDate,
        name === 'endDate' ? value : formData.endDate
      );
      setCalculatedDays(days);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (calculatedDays <= 0) {
      setError('End date must be on or after Start date');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        employee_id: employeeId,
        manager_id: managerId,
        leave_type: formData.leaveType,
        start_date: formData.startDate,
        end_date: formData.endDate,
        total_days: calculatedDays
      };
      await onSubmitSuccess(payload);
      setFormData({ leaveType: 'CASUAL', startDate: '', endDate: '' });
      setCalculatedDays(0);
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #E2E8F0', padding: '1.5rem', borderRadius: '8px', background: '#FFF' }}>
      <h3>Apply for Leave</h3>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Leave Type</label>
        <select name="leaveType" value={formData.leaveType} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }}>
          <option value="SICK">Sick Leave</option>
          <option value="CASUAL">Casual Leave</option>
          <option value="EARNED">Earned Leave</option>
          <option value="UNPAID">Unpaid Leave</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Start Date</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>End Date</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
        </div>
      </div>

      <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
        Total Days Requested: <span style={{ color: '#3182CE' }}>{calculatedDays}</span>
      </div>

      <button type="submit" disabled={loading} style={{ background: '#3182CE', color: '#FFF', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
};

export default LeaveForm;
