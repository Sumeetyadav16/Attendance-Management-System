import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom'
import API from '../services/api'

export default function Register() {
  const [role,       setRole]       = useState('STUDENT')
  const [form,       setForm]       = useState({
    name:'', email:'', password:'',
    rollNumber:'', course:'', section:''
  })
  const [step,       setStep]       = useState(1)  // 1=form, 2=camera
  const [userId,     setUserId]     = useState(null)
  const [msg,        setMsg]        = useState('')
  const [error,      setError]      = useState('')
  const [streaming,  setStreaming]  = useState(false)
  const [capturing,  setCapturing]  = useState(false)
  const [captured,   setCaptured]   = useState([])  // captured images list
  const [countdown,  setCountdown]  = useState(null)

  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const navigate  = useNavigate()

  // ── Step 1: Register user ──
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

      if (role === 'STUDENT') {
        setStep(2)          // go to camera step
        startCamera()       // auto open camera
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      const msg = err.response?.data?.message
               || err.response?.data
               || err.message
               || 'Registration failed'
      setError(typeof msg === 'object' ? JSON.stringify(msg) : msg)
    }
  }

  // ── Start camera ──
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      // Small delay to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setStreaming(true)
        }
      }, 500)
    } catch {
      setError('Camera access denied. Please allow camera permission.')
    }
  }

  // ── Stop camera ──
  const stopCamera = () => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop())
    setStreaming(false)
  }

  // ── Capture single photo ──
  const capturePhoto = () => {
    const canvas = canvasRef.current
    const video  = videoRef.current
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      setCaptured(prev => [...prev, { blob, url }])
    }, 'image/jpeg', 0.95)
  }

  // ── Auto capture 5 photos with countdown ──
  const autoCapture = () => {
    setCapturing(true)
    setCaptured([])
    let count = 0
    let seconds = 3

    // Countdown before first capture
    setCountdown(seconds)
    const countdownInterval = setInterval(() => {
      seconds--
      setCountdown(seconds)
      if (seconds === 0) {
        clearInterval(countdownInterval)
        setCountdown(null)

        // Capture 5 photos with 1 second interval
        const captureInterval = setInterval(() => {
          capturePhoto()
          count++
          if (count >= 5) {
            clearInterval(captureInterval)
            setCapturing(false)
          }
        }, 1000)
      }
    }, 1000)
  }

  // ── Upload captured photos ──
  const uploadFaceImages = async () => {
    if (captured.length < 3) {
      setError('Please capture at least 3 photos.')
      return
    }
    setMsg('⏳ Uploading face images...')
    try {
      const formData = new FormData()
      captured.forEach((item, i) => {
        formData.append('images', item.blob, `face_${i}.jpg`)
      })
      await API.post(`/images/upload/${userId}`, formData)
      stopCamera()
      setMsg('✅ Registration complete! Redirecting...')
      setTimeout(() => navigate('/student'), 1500)
    } catch {
      setError('Upload failed. You can upload later from dashboard.')
      setTimeout(() => navigate('/student'), 2000)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card"
        style={{width: step === 2 ? 560 : 440}}>

        <h2>📋 {step === 1 ? 'Create Account' : 'Face Registration'}</h2>
        <p>{step === 1
          ? 'Fill in your details'
          : 'Capture your face for attendance recognition'}</p>

        {/* Step indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`} />
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
        </div>

        {error && <div className="alert-error">{error}</div>}
        {msg   && <div className="alert-success">{msg}</div>}

        {/* ── STEP 1: Registration Form ── */}
        {step === 1 && (
          <form onSubmit={handleRegister}
            style={{display:'flex', flexDirection:'column', gap:'12px'}}>

            {/* Role toggle */}
            <div style={{display:'flex', gap:'8px'}}>
              {['STUDENT','FACULTY'].map(r => (
                <button key={r} type="button"
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
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

        {/* ── STEP 2: Camera Capture ── */}
        {step === 2 && (
          <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>

            {/* Camera preview */}
            <div style={{
              background:'#1e1b4b', borderRadius:'12px',
              padding:'16px', display:'flex',
              flexDirection:'column', alignItems:'center', gap:'12px'
            }}>
              <video ref={videoRef} autoPlay playsInline
                style={{
                  borderRadius:'8px', width:'100%', maxWidth:'400px',
                  display: streaming ? 'block' : 'none', background:'#000'
                }} />
              <canvas ref={canvasRef} style={{display:'none'}} />

              {!streaming &&
                <div style={{
                  color:'#a5b4fc', padding:'40px 0',
                  fontSize:'16px', textAlign:'center'
                }}>
                  📷 Starting camera...
                </div>
              }

              {/* Countdown overlay */}
              {countdown !== null &&
                <div style={{
                  fontSize:'48px', fontWeight:'bold',
                  color:'#fbbf24', textAlign:'center'
                }}>
                  {countdown === 0 ? '📸' : countdown}
                </div>
              }

              {/* Camera buttons */}
              <div style={{display:'flex', gap:'8px', flexWrap:'wrap',
                           justifyContent:'center'}}>
                <button onClick={capturePhoto}
                  disabled={!streaming || capturing}
                  style={{background:'#059669', fontSize:'13px',
                          padding:'8px 16px'}}>
                  📸 Capture
                </button>
                <button onClick={autoCapture}
                  disabled={!streaming || capturing}
                  style={{background:'#4f46e5', fontSize:'13px',
                          padding:'8px 16px'}}>
                  {capturing ? '⏳ Capturing...' : '🎯 Auto Capture 5'}
                </button>
              </div>
            </div>

            {/* Captured photos preview */}
            {captured.length > 0 && (
              <div>
                <p style={{
                  fontSize:'13px', color:'#555', marginBottom:'8px'
                }}>
                  ✅ {captured.length} photo(s) captured
                  {captured.length < 3 &&
                    <span style={{color:'#d97706'}}>
                      {' '}— need at least 3
                    </span>
                  }
                </p>
                <div style={{
                  display:'flex', gap:'8px', flexWrap:'wrap'
                }}>
                  {captured.map((item, i) => (
                    <div key={i} style={{position:'relative'}}>
                      <img src={item.url} alt={`face ${i+1}`}
                        style={{
                          width:'70px', height:'70px',
                          objectFit:'cover', borderRadius:'8px',
                          border:'2px solid #4f46e5'
                        }} />
                      <button
                        onClick={() => setCaptured(
                          prev => prev.filter((_, idx) => idx !== i)
                        )}
                        style={{
                          position:'absolute', top:'-6px', right:'-6px',
                          background:'#ef4444', color:'white',
                          border:'none', borderRadius:'50%',
                          width:'18px', height:'18px',
                          fontSize:'10px', cursor:'pointer',
                          display:'flex', alignItems:'center',
                          justifyContent:'center', padding:0
                        }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{display:'flex', gap:'8px'}}>
              <button
                onClick={uploadFaceImages}
                disabled={captured.length < 3}
                style={{
                  flex:1,
                  background: captured.length >= 3 ? '#4f46e5' : '#a5b4fc'
                }}>
                ✅ Save & Finish ({captured.length}/5)
              </button>
              <button
                onClick={() => { stopCamera(); navigate('/student') }}
                style={{background:'#6b7280', padding:'10px 16px'}}>
                Skip
              </button>
            </div>

            <p style={{
              fontSize:'12px', color:'#888', textAlign:'center'
            }}>
              💡 Tip: Capture in good lighting, look directly at camera.
              Move head slightly between captures for better accuracy.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}