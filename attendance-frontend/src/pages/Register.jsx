import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom'
import API from '../services/api'

export default function Register() {
  const [role,   setRole]   = useState('STUDENT')
  const [form,   setForm]   = useState({
    name:'', email:'', password:'',
    rollNumber:'', course:'', section:''
  })
  const [images, setImages] = useState([])
  const [step,   setStep]   = useState(1)
  const [userId, setUserId] = useState(null)
  const [msg,    setMsg]    = useState('')
  const [error,  setError]  = useState('')
  const fileRef = useRef(null)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await API.post('/auth/register', { ...form, role })
      const res = await API.post('/auth/login',
        { email: form.email, password: form.password })
      localStorage.setItem('token',  res.data.token)
      localStorage.setItem('role',   res.data.role)
      localStorage.setItem('name',   res.data.name)
      localStorage.setItem('userId', res.data.userId)
      setUserId(res.data.userId)

      if (role === 'STUDENT') setStep(2)
      else navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data || 'Registration failed')
    }
  }

  const handleImageUpload = async (e) => {
    e.preventDefault()
    if (images.length < 3) {
      setError('Please upload at least 3 face images.')
      return
    }
    const formData = new FormData()
    Array.from(images).forEach(img => formData.append('images', img))
    try {
      await API.post(`/images/upload/${userId}`, formData)
      setMsg('✅ Registration complete!')
      setTimeout(() => navigate('/student'), 1500)
    } catch {
      setError('Image upload failed. You can upload later.')
      setTimeout(() => navigate('/student'), 2000)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card" style={{width:440}}>
        <h2>📋 Create Account</h2>
        <p>{step === 1 ? 'Fill in your details' : 'Upload face images'}</p>

        {/* Step indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`} />
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
        </div>

        {error && <div className="alert-error">{error}</div>}
        {msg   && <div className="alert-success">{msg}</div>}

        {step === 1 && (
          <form onSubmit={handleRegister}
            style={{display:'flex', flexDirection:'column', gap:'12px'}}>

            {/* Role toggle */}
            <div style={{display:'flex', gap:'8px'}}>
              {['STUDENT','FACULTY'].map(r => (
                <button key={r} type="button"
                  onClick={() => setRole(r)}
                  style={{
                    flex:1,
                    background: role === r ? '#4f46e5' : '#e0e7ff',
                    color:      role === r ? 'white'   : '#4f46e5'
                  }}>
                  {r === 'STUDENT' ? '🎓 Student' : '👨‍🏫 Faculty'}
                </button>
              ))}
            </div>

            <input placeholder="Full Name" required
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} />
            <input type="email" placeholder="Email" required
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} />
            <input type="password" placeholder="Password" required
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} />

            {role === 'STUDENT' && <>
              <input placeholder="Roll Number" required
                value={form.rollNumber}
                onChange={e => setForm({...form, rollNumber: e.target.value})} />
              <input placeholder="Course (e.g. B.Tech CS)"
                value={form.course}
                onChange={e => setForm({...form, course: e.target.value})} />
              <input placeholder="Section (e.g. A)"
                value={form.section}
                onChange={e => setForm({...form, section: e.target.value})} />
            </>}

            <button type="submit">Next →</button>
            <p style={{textAlign:'center', color:'#888', fontSize:'13px'}}>
              Already registered? <Link to="/login">Login</Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleImageUpload}
            style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            <p style={{color:'#555', fontSize:'14px'}}>
              📸 Upload <strong>3–5 clear face photos</strong> for
              attendance recognition. Good lighting recommended.
            </p>
            <input type="file" accept="image/*" multiple required
              ref={fileRef}
              onChange={e => setImages(e.target.files)} />
            {images.length > 0 &&
              <div className="alert-success">
                ✅ {images.length} image(s) selected
              </div>
            }
            <button type="submit">Upload & Finish</button>
            <button type="button"
              onClick={() => navigate('/student')}
              style={{background:'#6b7280'}}>
              Skip for now
            </button>
          </form>
        )}
      </div>
    </div>
  )
}