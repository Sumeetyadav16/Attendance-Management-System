import React, { useState } from 'react';
import API from '../services/api'

export default function MarkAttendance() {
  const [students,   setStudents]   = useState([])
  const [date,       setDate]       = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState({})
  const [msg,        setMsg]        = useState('')
  const [error,      setError]      = useState('')
  const [saving,     setSaving]     = useState(false)

  React.useEffect(() => {
    API.get('/students').then(r => {
      setStudents(r.data)
      const init = {}
      r.data.forEach(s => init[s.id] = 'PRESENT')
      setAttendance(init)
    }).catch(() => {})
  }, [])

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      // Send as query params not JSON body
      await Promise.all(students.map(s =>
        API.post(
          `/attendance/mark?studentId=${s.id}&date=${date}&status=${attendance[s.id] || 'PRESENT'}&subject=General`
        )
      ))
      setMsg(`✅ Attendance saved for ${date}`)
      setTimeout(() => setMsg(''), 4000)
    } catch (err) {
      console.error(err)
      setError('❌ ' + (err.response?.data || 'Error saving attendance'))
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="page-header">
        <h2>✏️ Mark Attendance</h2>
        <input type="date" value={date}
          onChange={e => setDate(e.target.value)}
          style={{padding:'8px 12px', borderRadius:'8px',
                  border:'1px solid #ddd', width:'auto'}} />
      </div>

      {msg   && <div className="alert-success">{msg}</div>}
      {error && <div className="alert-error">{error}</div>}

      <div className="card">
        {students.length === 0
          ? <p style={{color:'#888', textAlign:'center', padding:'32px'}}>
              No students found. Add students first.
            </p>
          : <>
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Roll No</th>
                    <th>Name</th><th>Course</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td>{s.rollNumber}</td>
                      <td>{s.name}</td>
                      <td>{s.course || '—'}</td>
                      <td>
                        <select
                          value={attendance[s.id] || 'PRESENT'}
                          onChange={e => setAttendance({
                            ...attendance, [s.id]: e.target.value
                          })}
                          style={{
                            width: 'auto',
                            color: attendance[s.id] === 'ABSENT'
                              ? '#dc2626' : attendance[s.id] === 'LATE'
                              ? '#d97706' : '#059669'
                          }}>
                          <option value="PRESENT">✅ Present</option>
                          <option value="ABSENT">❌ Absent</option>
                          <option value="LATE">⏰ Late</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={save} disabled={saving}
                style={{marginTop:'20px', padding:'12px 32px'}}>
                {saving ? '⏳ Saving...' : '💾 Save Attendance'}
              </button>
            </>
        }
      </div>
    </div>
  )
}