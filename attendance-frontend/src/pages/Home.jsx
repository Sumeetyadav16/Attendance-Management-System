import React from 'react';
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b, #4f46e5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{textAlign: 'center', color: 'white'}}>

        {/* Logo */}
        <div style={{fontSize: '64px', marginBottom: '16px'}}>📋</div>

        {/* Title */}
        <h1 style={{fontSize: '36px', fontWeight: 'bold', marginBottom: '8px'}}>
          Attendance Management System
        </h1>
        <p style={{color: '#a5b4fc', fontSize: '16px', marginBottom: '48px'}}>
          Smart attendance tracking with face recognition
        </p>

        {/* Buttons */}
        <div style={{display: 'flex', gap: '16px', justifyContent: 'center'}}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '14px 40px',
              fontSize: '16px',
              background: 'white',
              color: '#4f46e5',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600'
            }}>
            👨‍🏫 Faculty Login
          </button>

          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '14px 40px',
              fontSize: '16px',
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600'
            }}>
            🎓 Student Login
          </button>
        </div>

        {/* Register link */}
        <p style={{marginTop: '24px', color: '#a5b4fc', fontSize: '14px'}}>
          New user?{' '}
          <span
            onClick={() => navigate('/register')}
            style={{color: 'white', cursor: 'pointer', textDecoration: 'underline'}}>
            Register here
          </span>
        </p>

      </div>
    </div>
  )
}