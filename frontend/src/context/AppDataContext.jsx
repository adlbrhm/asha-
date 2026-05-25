import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPatients, updatePatientStatus as apiUpdatePatientStatus, updatePatientClinicalDetails as apiUpdatePatientClinicalDetails, resolvePatient as apiResolvePatient, createFollowUp as apiCreateFollowUp } from '../services/patientService';
import { getUsers, addUser as apiAddUser, changeUserStatus as apiChangeUserStatus, updatePersonnel as apiUpdatePersonnel, removeUser as apiRemoveUser } from '../services/userService';
import { getSystemStats, getAdminStats, getVillageRiskHeatmap as apiGetVillageRiskHeatmap } from '../services/systemService';

const AppDataContext = createContext();

export function AppDataProvider({ children }) {
  const [patients, setPatients] = useState([]);
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [patientsData, usersData, sysStats, admStats, heatmap] = await Promise.all([
        getPatients(),
        getUsers(),
        getSystemStats(),
        getAdminStats(),
        apiGetVillageRiskHeatmap()
      ]);
      setPatients(patientsData);
      setUsers(usersData);
      setSystemStats(sysStats);
      setAdminStats(admStats);
      setHeatmapData(heatmap);
    } catch (err) {
      setError(err.message || 'Failed to fetch operations data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);
  
  const updatePatientStatus = async (id, newStatus) => {
    try {
      setPatients(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      await apiUpdatePatientStatus(id, newStatus);
    } catch (err) {
      fetchAllData();
      alert('Failed to update patient status');
    }
  };

  const updatePatientClinicalDetails = async (id, details) => {
    try {
      setPatients(prev => prev.map(p => p.id === id ? { ...p, ...details } : p));
      await apiUpdatePatientClinicalDetails(id, details);
    } catch (err) {
      fetchAllData();
      alert('Failed to update clinical details');
    }
  };

  const resolvePatient = async (id, details) => {
    try {
      const userStr = localStorage.getItem('asha_plus_user');
      const user = userStr ? JSON.parse(userStr) : { name: 'System' };
      const resolvedAt = new Date().toISOString();

      setPatients(prev => prev.map(p => p.id === id ? { ...p, ...details, status: 'RESOLVED', resolvedAt, resolvedBy: user.name } : p));
      await apiResolvePatient(id, details);
    } catch (err) {
      fetchAllData();
      alert('Failed to resolve patient');
    }
  };

  const createFollowUp = async (id) => {
    try {
      setPatients(prev => prev.map(p => p.id === id ? { ...p, status: 'FOLLOW_UP' } : p));
      await apiCreateFollowUp(id);
    } catch (err) {
      fetchAllData();
      alert('Failed to create follow-up');
    }
  };

  const addUser = async (user) => {
    try {
      setUsers(prev => [...prev, user]);
      await apiAddUser(user);
    } catch (err) {
      fetchAllData();
      alert('Failed to create user');
    }
  };
  
  const changeUserStatus = async (id, status) => {
    try {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
      await apiChangeUserStatus(id, status);
    } catch (err) {
      fetchAllData();
      alert('Failed to change user status');
    }
  };

  const updatePersonnel = async (id, payload) => {
    try {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...payload } : u));
      await apiUpdatePersonnel(id, payload);
    } catch (err) {
      fetchAllData();
      alert('Failed to update personnel');
    }
  };

  const removeUser = async (id) => {
    try {
      setUsers(prev => prev.filter(u => u.id !== id));
      await apiRemoveUser(id);
    } catch (err) {
      fetchAllData();
      alert('Failed to remove personnel');
    }
  };
  
  return (
    <AppDataContext.Provider value={{
      patients,
      users,
      systemStats,
      adminStats,
      heatmapData,
      loading,
      error,
      refresh: fetchAllData,
      updatePatientStatus,
      updatePatientClinicalDetails,
      resolvePatient,
      createFollowUp,
      addUser,
      changeUserStatus,
      updatePersonnel,
      removeUser,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
