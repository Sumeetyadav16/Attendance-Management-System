import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login          from './pages/Login.jsx'
import Register       from './pages/Register.jsx'
import Layout         from './pages/Layout.jsx'
import Dashboard      from './pages/Dashboard.jsx'
import Students       from './pages/Students.jsx'
import MarkAttendance from './pages/MarkAttendance.jsx'
import FaceAttendance from './pages/FaceAttendance.jsx'
import StudentPortal  from './pages/StudentPortal.jsx'
import Report         from './pages/Report.jsx'
import Home           from './pages/Home.jsx'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Faculty protected — all under /dashboard */}
        <Route path="/dashboard" element={
          <PrivateRoute><Layout /></PrivateRoute>
        }>
          <Route index              element={<Dashboard />} />
          <Route path="students"    element={<Students />} />
          <Route path="attendance"  element={<MarkAttendance />} />
          <Route path="face"        element={<FaceAttendance />} />
          <Route path="report"      element={<Report />} />
        </Route>

        {/* Student protected — all under /student */}
        <Route path="/student" element={
          <PrivateRoute><Layout /></PrivateRoute>
        }>
          <Route index element={<StudentPortal />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}