import { api } from './apiClient';

export async function getSystemStats() {
  return await api.get('/stats/system');
}

export async function getAdminStats() {
  return await api.get('/stats/admin');
}

export async function getDoctorStats() {
  return await api.get('/stats/doctor');
}

export async function getVillageRiskHeatmap() {
  return await api.get('/stats/village-risk');
}

export async function getNotifications() {
  return await api.get('/notifications');
}

export async function getPhcs() {
  return await api.get('/phcs');
}