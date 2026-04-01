import React, { useState } from 'react';
import API from '../services/api'

export default function Students() {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({
    name:'', rollNumber:'', course:'', section:'', faceLabel:''
  })
  const [msg,   setMsg]   = useState('')
  const [error, setError] = useState('')

  React.useEffect(() => { fetchStudents() }, [])

  const fetchStudents = () =>
    API.get('/students').then(r => setStudents(r.data)).catch(console.error)

 // Replace your catch blocks with this

const add = async (e) => {
    e.preventDefault()
    setError('')
    setMsg('')
    try {
      await API.post('/students', form)
      setForm({ name:'', rollNumber:'', course:'', section:'', faceLabel:'' })
      setMsg('✅ Student added!')
      fetchStudents()
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      // Fix: properly extract error message
      const msg = err.response?.data?.message
               || err.response?.data
               || err.message
               || 'Error adding student'
      setError('❌ ' + (typeof msg === 'object' ? JSON.stringify(msg) : msg))
    }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this student?')) return
    try {
      await API.delete(`/students/${id}`)
      setMsg('✅ Student deleted!')
      fetchStudents()
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      const msg = err.response?.data?.message
               || err.response?.data
               || err.message
               || 'Error deleting student'
      setError('❌ ' + (typeof msg === 'object' ? JSON.stringify(msg) : msg))
    }
  }
  return (
    <div>
      <div className="page-header"><h2>👥 Students</h2></div>
      {msg   && <div className="alert-success">{msg}</div>}
      {error && <div className="alert-error">{error}</div>}

      <div className="card">
        <h3 style={{marginBottom:'16px'}}>Add New Student</h3>
        <form onSubmit={add}>
          <div className="form-row">
            <input placeholder="Full Name" required
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} />
            <input placeholder="Roll Number" required
              value={form.rollNumber}
              onChange={e => setForm({...form, rollNumber: e.target.value})} />
          </div>
          <div className="form-row">
            <input placeholder="Course (e.g. B.Tech CS)"
              value={form.course}
              onChange={e => setForm({...form, course: e.target.value})} />
            <input placeholder="Section (e.g. A)"
              value={form.section}
              onChange={e => setForm({...form, section: e.target.value})} />
            <input placeholder="Face Label (e.g. student_1)"
              value={form.faceLabel}
              onChange={e => setForm({...form, faceLabel: e.target.value})} />
          </div>
          <button type="submit">➕ Add Student</button>
        </form>
      </div>

      <div className="card">
        <h3 style={{marginBottom:'16px'}}>
          All Students ({students.length})
        </h3>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Roll No</th><th>Name</th>
              <th>Course</th><th>Section</th>
              <th>Face Label</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0
              ? <tr><td colSpan="7"
                  style={{textAlign:'center',color:'#888',padding:'32px'}}>
                  No students yet.
                </td></tr>
              : students.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td>{s.rollNumber}</td>
                  <td>{s.name}</td>
                  <td>{s.course || '—'}</td>
                  <td>{s.section || '—'}</td>
                  <td><code>{s.faceLabel || '—'}</code></td>
                  <td>
                    <button onClick={() => del(s.id)}
                      style={{background:'#ef4444',
                              padding:'6px 12px', fontSize:'12px'}}>
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}