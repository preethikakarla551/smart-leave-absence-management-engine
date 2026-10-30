import React, { useState } from 'react';

const TeamCalendar = ({ teamMembers = [], leaveEvents = [] }) => {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const monthLabel = visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const dateKey = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const findLeave = (employee, day) => {
    const date = dateKey(day);
    return leaveEvents.find((event) =>
      event.employeeEmail === employee.email &&
      event.status === 'Approved' &&
      event.startDate <= date &&
      event.endDate >= date
    );
  };

  return (
    <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#20332d', fontSize: '17px' }}>Team absence calendar</h3>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>Approved leave by employee and day</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button type="button" aria-label="Previous month" onClick={() => setVisibleMonth(new Date(year, month - 1, 1))} style={{ border: '1px solid #d8e2dc', background: '#fff', borderRadius: '8px', padding: '7px 11px', cursor: 'pointer' }}>‹</button>
          <strong style={{ minWidth: '130px', textAlign: 'center', color: '#20332d' }}>{monthLabel}</strong>
          <button type="button" aria-label="Next month" onClick={() => setVisibleMonth(new Date(year, month + 1, 1))} style={{ border: '1px solid #d8e2dc', background: '#fff', borderRadius: '8px', padding: '7px 11px', cursor: 'pointer' }}>›</button>
        </div>
      </div>

      {teamMembers.length === 0 ? (
        <div style={{ border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '28px 18px', textAlign: 'center', color: '#64748b', background: '#fbfcfa' }}>
          Employee names and approved absences will appear here when the employee and leave data are connected.
        </div>
      ) : (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: '900px', width: '100%', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f7f8f3', color: '#52635b' }}>
              <th style={{ position: 'sticky', left: 0, zIndex: 1, background: '#f7f8f3', textAlign: 'left', padding: '9px', border: '1px solid #e2e8f0', minWidth: '150px' }}>Team member</th>
              {days.map((day) => (
                <th key={day} style={{ padding: '5px 2px', border: '1px solid #e2e8f0', minWidth: '26px' }}>
                  <div>{day}</div>
                  <div style={{ fontSize: '9px', fontWeight: '400' }}>{new Date(year, month, day).toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((employee) => (
              <tr key={employee.email}>
                <th scope="row" style={{ position: 'sticky', left: 0, zIndex: 1, background: '#ffffff', textAlign: 'left', padding: '9px', border: '1px solid #e2e8f0', color: '#33433d', whiteSpace: 'nowrap' }}>{employee.name}</th>
                {days.map((day) => {
                  const leave = findLeave(employee, day);
                  return (
                    <td key={day} title={leave ? `${employee.name}: ${leave.leaveType}` : `${employee.name}: no approved leave`} style={{ textAlign: 'center', padding: '4px 1px', border: '1px solid #e2e8f0', background: leave ? '#d9f0e9' : '#fbfcfa', color: leave ? '#126756' : '#aab5af', fontWeight: leave ? '700' : '400' }}>
                      {leave ? leave.leaveType.split(' ').map((word) => word[0]).join('').slice(0, 2) : '·'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {teamMembers.length > 0 && <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '12px', color: '#64748b', fontSize: '12px' }}>
        <span><strong style={{ color: '#147d6b' }}>SL</strong> Sick Leave</span>
        <span><strong style={{ color: '#147d6b' }}>EL</strong> Earned Leave</span>
        <span><strong style={{ color: '#147d6b' }}>CL</strong> Casual Leave</span>
        <span>· No approved leave</span>
      </div>}
    </section>
  );
};

export default TeamCalendar;
