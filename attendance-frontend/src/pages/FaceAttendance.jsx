import React, { useState, useRef } from 'react';
import API from '../services/api'

export default function FaceAttendance() {
  const videoRef    = useRef(null)
  const canvasRef   = useRef(null)
  const [streaming, setStreaming] = useState(false)
  const [result,    setResult]    = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const startCamera = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = stream
      setStreaming(true)
    } catch {
      setError('Camera access denied. Please allow camera permission.')
    }
  }

  const stopCamera = () => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop())
    setStreaming(false)
  }

 const capture = async () => {
  const canvas = canvasRef.current
  const video  = videoRef.current
  canvas.width  = video.videoWidth
  canvas.height = video.videoHeight

  // Draw image
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0)

  // Convert to blob with explicit JPEG type
  canvas.toBlob(async (blob) => {
    if (!blob) {
      setError('Failed to capture image')
      return
    }
    setLoading(true)
    setError('')

    const formData = new FormData()
    // Explicitly name file with .jpg extension
    formData.append('image', blob, 'capture.jpg')

    try {
      const res = await API.post('/attendance/face', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
    } catch (err) {
      console.error(err)
      setError('Server error: ' + (err.response?.data?.message || err.message))
    }
    setLoading(false)
  }, 'image/jpeg', 0.95)  // ← explicit JPEG quality
}
  return (
    <div>
      <div className="page-header"><h2>📷 Face Attendance</h2></div>
      {error && <div className="alert-error">{error}</div>}

      <div className="face-container">

        {/* Camera Box */}
        <div className="webcam-box">
          <video ref={videoRef} autoPlay playsInline
            style={{
              borderRadius:'8px', width:'100%', maxWidth:'400px',
              background:'#000', display: streaming ? 'block' : 'none'
            }} />
          <canvas ref={canvasRef} style={{display:'none'}} />

          {!streaming &&
            <div className="webcam-off">
              📷<br />Camera is off
            </div>
          }

          <div style={{display:'flex', gap:'12px'}}>
            {!streaming
              ? <button onClick={startCamera}>▶ Start Camera</button>
              : <>
                  <button onClick={capture} disabled={loading}
                    style={{background: loading ? '#6b7280' : '#059669'}}>
                    {loading ? '⏳ Processing...' : '📸 Capture & Mark'}
                  </button>
                  <button onClick={stopCamera}
                    style={{background:'#ef4444'}}>
                    ⏹ Stop
                  </button>
                </>
            }
          </div>
        </div>

        {/* Result Box */}
        <div className="result-box">
          <div className="result-card">
            {result ? <>
              <div className="check">
                {result.success ? '✅' : '❌'}
              </div>
              <div className="name">{result.student || 'Unknown'}</div>
              <div className="roll">{result.rollNumber || ''}</div>
              <p style={{
                marginTop:'16px', fontWeight:'500',
                color: result.success ? '#059669' : '#dc2626'
              }}>
                {result.message}
              </p>
              {result.confidence &&
                <p style={{color:'#888', fontSize:'13px', marginTop:'8px'}}>
                  Confidence: {result.confidence}%
                </p>
              }
              {result.alreadyMarked &&
                <div className="alert-warning" style={{marginTop:'12px'}}>
                  ⚠️ Already marked present today
                </div>
              }
            </> : <>
              <div style={{fontSize:'48px'}}>👤</div>
              <p style={{color:'#888', marginTop:'16px'}}>
                Start camera and capture to mark attendance
              </p>
            </>}
          </div>
        </div>

      </div>
    </div>
  )
}