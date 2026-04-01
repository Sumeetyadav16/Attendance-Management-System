import React, { useState } from 'react';
import API from '../services/api'

export default function Report() {
  const [studentId, setStudentId] = useState('')
  const [report,    setReport]    = useState(null)
  const [history,   setHistory]   = useState([])
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  const fetchReport = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setReport(null)
    setHistory([])
    try {
      const repRes = await API.get(`/attendance/report/${studentId}`)
      setReport(repRes.data)
      const histRes = await API.get(`/attendance/student/${studentId}`)
      setHistory(histRes.data)
    } catch (err) {
      console.error(err)
      setError('Student not found or no attendance data. ID: ' + studentId)
    }
    setLoading(false)
  }

  const pct   = report ? parseFloat(report.percentage) : 0
  const color = pct >= 75 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626'

  return (
    <div>
      <div className="page-header"><h2>📊 Attendance Report</h2></div>

      <div className="card">
        <form onSubmit={fetchReport}
          style={{display:'flex', gap:'12px', alignItems:'center'}}>
          <input placeholder="Enter Student ID (number)" type="number"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            required style={{maxWidth: 250}} />
          <button type="submit" disabled={loading}>
            {loading ? '⏳ Loading...' : '🔍 Generate Report'}
          </button>
        </form>
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
            <div className="label">Attendance %</div>
          </div>
        </div>

        <div className="card">
          <p><strong>Name:</strong> {report.studentName}</p>
          <p style={{marginTop:'8px'}}>
            <strong>Roll No:</strong> {report.rollNumber}
          </p>
          <div style={{marginTop:'16px'}}>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill"
                style={{
                  width: `${Math.min(pct, 100)}%`,
                  background: color
                }} />
            </div>
            <p style={{fontSize:'12px',color:'#888',marginTop:'6px'}}>
              75% required •
              <span style={{color, fontWeight:'600'}}>
                {pct >= 75 ? ' ✅ Good Standing'
                 : pct >= 50 ? ' ⚠️ At Risk'
                 : ' ❌ Below 50% — Shortage'}
              </span>
            </p>
          </div>
        </div>

        <div className="card">
          <h3 style={{marginBottom:'16px'}}>Attendance History</h3>
          {history.length === 0
            ? <p style={{color:'#888', textAlign:'center', padding:'20px'}}>
                No attendance records found.
              </p>
            : <table>
                <thead>
                  <tr>
                    <th>Date</th><th>Subject</th>
                    <th>Status</th><th>Method</th><th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(a => (
                    <tr key={a.id}>
                      <td>{a.date}</td>
                      <td>{a.subject || '—'}</td>
                      <td>
                        <span className={`badge ${a.status.toLowerCase()}`}>
                          {a.status}
                        </span>
                      </td>
                      <td>{a.method || '—'}</td>
                      <td>{a.markedAt || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </>}
    </div>
  )
}