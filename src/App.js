import React, { useState } from 'react';
import BalanceCards from './components/Employee/BalanceCards';
import LeaveForm from './components/Employee/LeaveForm';
import TeamCalendar from './components/Shared/TeamCalendar';
import CsvExportButton from './components/Shared/CsvExportButton';

function App() {
  const [balances] = useState({
    SICK: { available: 10, used: 2, allocated: 12 },
    CASUAL: { available: 8, used: 4, allocated: 12 },
    EARNED: { available: 15, used: 0, allocated: 15 },
    UNPAID: { available: 'Unlimited', used: 0, allocated: 'Unlimited' }
  });

  const dummyTeam = [
    { id: 'EMP001', name: 'Sushant (Data & Logic)' },
    { id: 'EMP002', name: 'Omsri (Workflows & Messaging)' },
    { id: 'EMP003', name: 'Payal (Infra & Security)' },
    { id: 'EMP004', name: 'Preethi (Frontend & Portals)' }
  ];

  const dummyEvents = [
    { employee_id: 'EMP001', day: 5, status: 'APPROVED', leave_type: 'CASUAL' },
    { employee_id: 'EMP003', day: 12, status: 'APPROVED', leave_type: 'SICK' }
  ];

  const reportData = [
    { EmployeeID: 'EMP001', Name: 'Sushant', LeaveType: 'CASUAL', Days: 1, Status: 'APPROVED' },
    { EmployeeID: 'EMP002', Name: 'Omsri', LeaveType: 'EARNED', Days: 2, Status: 'PENDING' },
    { EmployeeID: 'EMP003', Name: 'Payal', LeaveType: 'SICK', Days: 1, Status: 'APPROVED' },
    { EmployeeID: 'EMP004', Name: 'Preethi', LeaveType: 'CASUAL', Days: 3, Status: 'APPROVED' }
  ];

  const handleFormSubmit = async (payload) => {
    alert(`Submitted leave request for ${payload.total_days} days!`);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1>Smart Leave & Absence Management Engine</h1>
        <p style={{ color: '#718096' }}>Employee & Manager Portal — Maintained by Preethi</p>
      </header>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Your Leave Quota</h2>
        <BalanceCards balances={balances} />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <LeaveForm onSubmitSuccess={handleFormSubmit} employeeId="EMP004" managerId="MGR001" />
        <div>
          <h3>Quick Export</h3>
          <p>Download monthly leave summary report for management review.</p>
          <CsvExportButton data={reportData} filename="Monthly_Leave_Report.csv" />
        </div>
      </section>

      <section>
        <TeamCalendar teamMembers={dummyTeam} leaveEvents={dummyEvents} />
      </section>
    </div>
  );
}

export default App;
