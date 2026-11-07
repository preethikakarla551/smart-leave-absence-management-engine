import { awsConfig } from '../config/aws-config';
import { getCognitoIdToken } from './auth';

async function apiRequest(path, { method = 'GET', body } = {}) {
  const token = await getCognitoIdToken();

  if (!token) {
    throw new Error('Your sign-in session has expired. Please sign in again.');
  }

  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${awsConfig.api.baseUrl}${path}`, options);
  const text = await response.text();

  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || 'The server returned an unreadable response.' };
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status}).`);
  }

  return data;
}

export function fetchDashboard(role) {
  const routes = {
    employee: '/dashboard/employee',
    manager: '/dashboard/manager',
    hr: '/dashboard/hr'
  };

  const path = routes[String(role).toLowerCase()];
  if (!path) {
    throw new Error('Unknown portal role.');
  }

  return apiRequest(path);
}

export function submitLeaveRequest(payload) {
  return apiRequest('/leave-requests', {
    method: 'POST',
    body: payload
  });
}

export function approveLeaveRequest(requestId, action, comments = '') {
  return apiRequest(
    `/leave-requests/${encodeURIComponent(requestId)}/approval`,
    {
      method: 'POST',
      body: { action, comments }
    }
  );
}