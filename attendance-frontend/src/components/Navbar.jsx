import React from 'react';  
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ role = 'faculty' }) {
  const { facultyLogout, studentLogout, faculty, student } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (role === 'faculty') { facultyLogout(); navigate('/faculty/login'); }
    else                    { studentLogout(); navigate('/student/login'); }
  };

  const name = role === 'faculty' ? faculty?.name : student?.name;

  return (
    <nav className="bg-slate-800 text-white px-6 py-3 flex items-center gap-6 sticky top-0 z-50">
      <span className="text-lg font-semibold flex-1">📋 Attendance System</span>

      {role === 'faculty' && (
        <>
          <Link to="/faculty/dashboard"   className="text-slate-300 hover:text-white text-sm">Dashboard</Link>
          <Link to="/faculty/add-student" className="text-slate-300 hover:text-white text-sm">Add Student</Link>
          <Link to="/faculty/attendance"  className="text-slate-300 hover:text-white text-sm">Attendance</Link>
          <Link to="/faculty/reports"     className="text-slate-300 hover:text-white text-sm">Reports</Link>
        </>
      )}

      <span className="text-slate-300 text-sm">👤 {name}</span>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm"
      >
        Logout
      </button>
    </nav>
  );
}