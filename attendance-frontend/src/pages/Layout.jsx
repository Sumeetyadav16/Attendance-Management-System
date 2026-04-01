import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom'

export default function Layout() {
  const navigate = useNavigate()
  const name = localStorage.getItem('name') || 'User'
  const role = localStorage.getItem('role') || ''

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  // Faculty links
  const facultyLinks = [
    { to: '/dashboard',            label: '🏠 Dashboard',        end: true },
    { to: '/dashboard/students',   label: '👥 Students' },
    { to: '/dashboard/attendance', label: '✏️ Mark Attendance' },
    { to: '/dashboard/face',       label: '📷 Face Attendance' },
    { to: '/dashboard/report',     label: '📊 Reports' },
  ]

  // Student links
  const studentLinks = [
    { to: '/student', label: '🏠 My Portal', end: true },
  ]

  const links = role === 'FACULTY' ? facultyLinks : studentLinks

  return (
    <div className="layout">
      <aside className="sidebar">

        <div className="sidebar-logo">
          <span>📋</span>
          <span>Attendance</span>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-label">Menu</p>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end || false}
              className={({ isActive }) =>
                isActive ? 'sidebar-link active' : 'sidebar-link'
              }>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="sidebar-username">{name}</p>
              <p className="sidebar-role">{role}</p>
            </div>
          </div>
          <button className="sidebar-logout" onClick={logout}>
            🚪 Logout
          </button>
        </div>

      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}