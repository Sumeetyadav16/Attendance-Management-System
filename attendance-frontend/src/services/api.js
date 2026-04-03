import axios from 'axios'

const API = axios.create({
  baseURL: 'https://YOUR-BACKEND-SERVICE.onrender.com/api'  // ✅ paste backend URL here
})

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
  return req
})

export default API