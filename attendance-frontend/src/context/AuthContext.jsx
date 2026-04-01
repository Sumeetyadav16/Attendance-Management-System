import React, { createContext, useContext, useState } from 'react';  

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [faculty, setFaculty] = useState(
    () => JSON.parse(localStorage.getItem('faculty') || 'null')
  );
  const [student, setStudent] = useState(
    () => JSON.parse(localStorage.getItem('student') || 'null')
  );

  const facultyLogin = (data) => {
    localStorage.setItem('faculty', JSON.stringify(data));
    setFaculty(data);
  };

  const studentLogin = (data) => {
    localStorage.setItem('student', JSON.stringify(data));
    setStudent(data);
  };

  const facultyLogout = () => {
    localStorage.removeItem('faculty');
    setFaculty(null);
  };

  const studentLogout = () => {
    localStorage.removeItem('student');
    setStudent(null);
  };

  return (
    <AuthContext.Provider value={{
      faculty, student,
      facultyLogin, studentLogin,
      facultyLogout, studentLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);