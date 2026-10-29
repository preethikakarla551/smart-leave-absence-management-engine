import React from 'react';

const BalanceCards = ({ balances }) => {
  const categories = [
    { type: 'SICK', name: 'Sick Leave', key: 'SICK', color: '#E53E3E' },
    { type: 'CASUAL', name: 'Casual Leave', key: 'CASUAL', color: '#DD6B20' },
    { type: 'EARNED', name: 'Earned Leave', key: 'EARNED', color: '#319795' },
    { type: 'UNPAID', name: 'Unpaid Leave', key: 'UNPAID', color: '#718096' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
      {categories.map((cat) => {
        const item = balances[cat.key] || { available: 0, used: 0, allocated: 0 };
        return (
          <div key={cat.type} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', borderTop: `4px solid ${cat.color}` }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#2D3748' }}>{cat.name}</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1A202C' }}>
              {item.available} <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#718096' }}>days available</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#A0AEC0', marginTop: '0.25rem' }}>
              Used: {item.used} | Total: {item.allocated}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BalanceCards;
