import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom'
import API from '../services/api'

export default function Register() {
  const [role, setRole] = useState('STUDENT')
  const [form, setForm] = useState({
    name:'', email:'', password:'',
    rollNumber:'', course:'', section:''
  })
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState(null)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [captured, setCaptured] = useState([])
  const [countdown, setCountdown] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const navigate = useNavigate()

  // ✅ REGISTER
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await API.post('/api/auth/register', { ...form, role })

      const res = await API.post('/api/auth/login', {
        email: form.email,
        password: form.password
      })

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('name', res.data.name)
      localStorage.setItem('userId', res.data.userId)

      setUserId(res.data.userId)

      if (role === 'STUDENT') {
        setStep(2)
        startCamera()
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

  // ✅ CAMERA START
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setStreaming(true)
        }
      }, 500)

    } catch {
      setError('Camera permission denied')
    }
  }

  // ✅ CAMERA STOP
  const stopCamera = () => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop())
    setStreaming(false)
  }

  // ✅ CAPTURE PHOTO
  const capturePhoto = () => {
    const canvas = canvasRef.current
    const video = videoRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    canvas.getContext('2d').drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      setCaptured(prev => [...prev, { blob, url }])
    }, 'image/jpeg', 0.95)
  }

  // ✅ AUTO CAPTURE
  const autoCapture = () => {
    setCapturing(true)
    setCaptured([])

    let count = 0
    let seconds = 3

    setCountdown(seconds)

    const countdownInterval = setInterval(() => {
      seconds--
      setCountdown(seconds)

      if (seconds === 0) {
        clearInterval(countdownInterval)
        setCountdown(null)

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

  // ✅ UPLOAD IMAGES
  const uploadFaceImages = async () => {
    if (captured.length < 3) {
      setError('Capture at least 3 photos')
      return
    }

    setMsg('Uploading images...')

    try {
      const formData = new FormData()

      captured.forEach((item, i) => {
        formData.append('images', item.blob, `face_${i}.jpg`)
      })

      await API.post(`/api/images/upload/${userId}`, formData)

      stopCamera()
      setMsg('Registration complete!')

      setTimeout(() => navigate('/student'), 1500)

    } catch {
      setError('Upload failed, try later')
      setTimeout(() => navigate('/student'), 2000)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card" style={{width: step === 2 ? 560 : 440}}>

        <h2>{step === 1 ? 'Create Account' : 'Face Registration'}</h2>

        {error && <div className="alert-error">{error}</div>}
        {msg && <div className="alert-success">{msg}</div>}

        {step === 1 && (
          <form onSubmit={handleRegister}>

            <div>
              {['STUDENT','FACULTY'].map(r => (
                <button key={r} type="button" onClick={() => setRole(r)}>
                  {r}
                </button>
              ))}
            </div>

            <input placeholder="Name" required
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} />

            <input type="email" placeholder="Email" required
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} />

            <input type="password" placeholder="Password" required
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} />

            {role === 'STUDENT' && (
              <>
                <input placeholder="Roll No"
                  value={form.rollNumber}
                  onChange={e => setForm({...form, rollNumber: e.target.value})} />
              </>
            )}

            <button type="submit">Next</button>

            <p>
              Already registered? <Link to="/login">Login</Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <div>
            <video ref={videoRef} autoPlay />
            <canvas ref={canvasRef} style={{display:'none'}} />

            <button onClick={capturePhoto}>Capture</button>
            <button onClick={autoCapture}>Auto Capture</button>

            <button onClick={uploadFaceImages}>
              Save ({captured.length})
            </button>
          </div>
        )}

      </div>
    </div>
  )
}