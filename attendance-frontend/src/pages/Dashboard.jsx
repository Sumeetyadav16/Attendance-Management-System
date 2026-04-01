import React, { useState } from 'react';
import API from '../services/api'

export default function Dashboard() {
  const [students,  setStudents]  = useState([])
  const [todayList, setTodayList] = useState([])
  const today = new Date().toISOString().split('T')[0]
  const name  = localStorage.getItem('name') || 'Faculty'

  React.useEffect(() => {
    API.get('/students').then(r => setStudents(r.data)).catch(() => {})
    API.get(`/attendance/date/${today}`).then(r => setTodayList(r.data)).catch(() => {})
  }, [])

  const presentToday = todayList.filter(a => a.status === 'PRESENT').length

  return (
    <div>
      <div className="page-header">
        <h2>👋 Welcome, {name}</h2>
        <span className="badge faculty">FACULTY</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="number">{students.length}</div>
          <div className="label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="number" style={{color:'#059669'}}>{presentToday}</div>
          <div className="label">Present Today</div>
        </div>
        <div className="stat-card">
          <div className="number" style={{color:'#dc2626'}}>
            {students.length - presentToday}
          </div>
          <div className="label">Absent Today</div>
        </div>
        <div className="stat-card">
          <div className="number">
            {students.length > 0
              ? Math.round((presentToday / students.length) * 100) : 0}%
          </div>
          <div className="label">Today's Rate</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{marginBottom:'16px', color:'#1e1b4b'}}>
          Today's Attendance — {today}
        </h3>
        <table>
          <thead>
            <tr>
              <th>Roll No</th><th>Name</th>
              <th>Status</th><th>Method</th><th>Time</th>
            </tr>
          </thead>
          <tbody>
            {todayList.length === 0
              ? <tr><td colSpan="5"
                  style={{textAlign:'center', color:'#888', padding:'32px'}}>
                  No records yet for today.
                </td></tr>
              : todayList.map(a => (
                <tr key={a.id}>
                  <td>{a.student?.rollNumber || '—'}</td>
                  <td>{a.student?.name || '—'}</td>
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