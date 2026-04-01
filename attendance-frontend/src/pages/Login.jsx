import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'
import API from '../services/api'

export default function Login() {
  const [role,  setRole]  = useState('FACULTY')
  const [form,  setForm]  = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await API.post('/auth/login', form)
      localStorage.setItem('token',  res.data.token)
      localStorage.setItem('role',   res.data.role)
      localStorage.setItem('name',   res.data.name)
      localStorage.setItem('userId', res.data.userId)

      // Redirect based on role
      if (res.data.role === 'FACULTY') navigate('/dashboard')
      else navigate('/student')
    } catch {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>📋 Attendance System</h2>
        <p>Sign in to your account</p>

        {/* Role Toggle */}
        <div style={{display:'flex', gap:'8px', marginBottom:'8px'}}>
          {['FACULTY','STUDENT'].map(r => (
            <button key={r} type="button"
              onClick={() => setRole(r)}
              style={{
                flex:1,
                background: role === r ? '#4f46e5' : '#e0e7ff',
                color:      role === r ? 'white'   : '#4f46e5'
              }}>
              {r === 'FACULTY' ? '👨‍🏫 Faculty' : '🎓 Student'}
            </button>
          ))}
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" required
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} />
          <input type="password" placeholder="Password" required
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} />
          <button type="submit">Login →</button>
          <p style={{textAlign:'center', color:'#888', fontSize:'13px'}}>
            No account? <Link to="/register">Register here</Link>
          </p>
        </form>
      </div>
    </div>
  )
}