import axios from 'axios'

const API = axios.create({
  baseURL: 'https://attendance-management-system-6y9v.onrender.com/api'
})
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
  return req
})

export default API