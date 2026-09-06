import axios from 'axios';

// Базовый URL сервера (если в переменной не указан /api, он автоматически добавится)
const RAW_URL = process.env.REACT_APP_API_URL || 'https://ieltshelper.onrender.com';
const CLEAN_URL = RAW_URL.replace(/\/$/, ''); // Удаляем слэш в конце, если он есть
const BASE_URL = CLEAN_URL.endsWith('/api') ? CLEAN_URL : `${CLEAN_URL}/api`;

const api = axios.create({
  baseURL: BASE_URL,
});

// Добавляем JWT токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;