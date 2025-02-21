// frontend/src/components/Auth/Register.js
/*import React, { useState } from 'react';
import authService from '../../services/authService';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await authService.register(username, password, role);
    // Handle successful registration
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
*/