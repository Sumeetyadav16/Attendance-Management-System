import React, { useState } from 'react';
import API from '../services/api'

export default function StudentPortal() {
  const [report,  setReport]  = useState(null)
  const [history, setHistory] = useState([])
  const [error,   setError]   = useState('')
  const userId = localStorage.getItem('userId')
  const name   = localStorage.getItem('name') || 'Student'

  React.useEffect(() => {
    if (!userId) return
    API.get(`/attendance/report/${userId}`)
      .then(r => setReport(r.data)).catch(() => {})
    API.get(`/attendance/student/${userId}`)
      .then(r => setHistory(r.data)).catch(() => {})
  }, [])

  const pct   = report ? parseFloat(report.percentage) : 0
  const color = pct >= 75 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626'

  return (
    <div>
      <div className="page-header">
        <h2>👋 Hello, {name}</h2>
        <span className="badge student">STUDENT</span>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {report && <>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="number">{report.totalClasses}</div>
            <div className="label">Total Classes</div>
          </div>
          <div className="stat-card">
            <div className="number" style={{color:'#059669'}}>
              {report.presentCount}
            </div>
            <div className="label">Present</div>
          </div>
          <div className="stat-card">
            <div className="number" style={{color:'#dc2626'}}>
              {report.absentCount}
            </div>
            <div className="label">Absent</div>
          </div>
          <div className="stat-card">
            <div className="number" style={{color}}>
              {report.percentage}%
            </div>
            <div className="label">Attendance</div>
          </div>
        </div>

        <div className="card">
          <p><strong>Roll No:</strong> {report.rollNumber}</p>
          <div style={{marginTop:'16px'}}>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill"
                style={{width:`${Math.min(pct,100)}%`, background: color}} />
            </div>
            <p style={{fontSize:'12px', color:'#888', marginTop:'6px'}}>
              75% required •
              <span style={{color, fontWeight:'600'}}>
                {pct >= 75 ? ' ✅ Good Standing'
                 : pct >= 50 ? ' ⚠️ At Risk'
                 : ' ❌ Shortage'}
              </span>
            </p>
          </div>
        </div>
      </>}

      <div className="card">
        <h3 style={{marginBottom:'16px'}}>Attendance History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Status</th><th>Method</th><th>Time</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0
              ? <tr><td colSpan="4"
                  style={{textAlign:'center', color:'#888', padding:'32px'}}>
                  No attendance records yet.
                </td></tr>
              : history.map(a => (
                <tr key={a.id}>
                  <td>{a.date}</td>
                  <td>
                    <span className={`badge ${a.status.toLowerCase()}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>{a.method || '—'}</td>
                  <td>{a.markedAt || '—'}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}