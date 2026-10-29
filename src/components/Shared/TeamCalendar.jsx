import React from 'react';

const TeamCalendar = ({ teamMembers, leaveEvents }) => {
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  const getStatusForDay = (empId, day) => {
    const leave = leaveEvents.find(
      (e) => e.employee_id === empId && e.day === day && e.status === 'APPROVED'
    );
    return leave ? leave.leave_type : 'PRESENT';
  };

  return (
    <div style={{ overflowX: 'auto', margin: '1.5rem 0' }}>
      <h3>Team Absence Calendar (Sushant, Omsri, Payal, Preethi)</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #CBD5E0' }}>
        <thead>
          <tr style={{ background: '#EDF2F7' }}>
            <th style={{ padding: '8px', border: '1px solid #CBD5E0', textAlign: 'left' }}>Employee</th>
            {daysInMonth.map((d) => (
              <th key={d} style={{ padding: '4px', border: '1px solid #CBD5E0', fontSize: '0.75rem' }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teamMembers.map((emp) => (
            <tr key={emp.id}>
              <td style={{ padding: '8px', border: '1px solid #CBD5E0', fontWeight: '500' }}>{emp.name}</td>
              {daysInMonth.map((d) => {
                const status = getStatusForDay(emp.id, d);
                const isAbsent = status !== 'PRESENT';
                return (
                  <td
                    key={d}
                    style={{
                      border: '1px solid #CBD5E0',
                      textAlign: 'center',
                      background: isAbsent ? '#FEB2B2' : '#C6F6D5',
                      fontSize: '0.7rem'
                    }}
                    title={`${emp.name} - ${status}`}
                  >
                    {isAbsent ? status[0] : 'P'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamCalendar;
