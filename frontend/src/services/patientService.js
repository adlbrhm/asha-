import { api } from './apiClient';
import { normalizeScreening } from '../utils/normalizers';

export async function getPatients(filters = {}) {
  const queryParams = new URLSearchParams(filters).toString();
  const query = queryParams ? `?${queryParams}` : '';
  const data = await api.get(`/screenings${query}`);
  return Array.isArray(data) ? data.map(normalizeScreening) : [];
}

export async function updatePatientStatus(id, newStatus) {
  return await api.patch(`/screenings/${id}/status`, { status: newStatus });
}

export async function updatePatientClinicalDetails(id, details) {
  return await api.patch(`/screenings/${id}/clinical`, details);
}

export async function resolvePatient(id, details) {
  return await api.patch(`/screenings/${id}`, {
    ...details,
    status: 'RESOLVED',
  });
}

export async function createFollowUp(id) {
  return await api.post(`/screenings/${id}/followup`, {
    assignedToAshaId: '', // Handled by backend fallback
    note: '' // Handled by backend fallback
  });
}

export async function getFollowups() {
  const data = await api.get('/followups');
  return Array.isArray(data) ? data.map(normalizeScreening) : [];
}