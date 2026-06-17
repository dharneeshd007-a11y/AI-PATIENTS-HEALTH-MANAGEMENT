import axios from 'axios';

const API_URL = '/api/auth';

const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

let cachedUserStr = null;
let cachedUserObj = null;

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr !== cachedUserStr) {
    cachedUserStr = userStr;
    cachedUserObj = userStr ? JSON.parse(userStr) : null;
  }
  return cachedUserObj;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService;
