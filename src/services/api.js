import { awsConfig } from '../config/aws-config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('id_token') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const fetchLeaveBalances = async (employeeId) => {
  const response = await fetch(`${awsConfig.api.baseUrl}/leave/balances?employee_id=${employeeId}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch leave balances');
  return await response.json();
};

export const submitLeaveRequest = async (payload) => {
  const response = await fetch(`${awsConfig.api.baseUrl}/leave/request`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error submitting leave request');
  }
  return await response.json();
};
