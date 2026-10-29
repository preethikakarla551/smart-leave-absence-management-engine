import React from 'react';

const CsvExportButton = ({ data, filename = 'leave_report.csv' }) => {
  const exportToCSV = () => {
    if (!data || !data.length) {
      alert('No data available to export');
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => `"${value}"`)
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('
');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportToCSV}
      style={{
        background: '#38A169',
        color: '#FFF',
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      📥 Export Report (CSV)
    </button>
  );
};

export default CsvExportButton;
