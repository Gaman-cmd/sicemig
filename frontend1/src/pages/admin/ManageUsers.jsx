import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import './ManageUsers.css'; // Assurez-vous de créer ce fichier CSS pour les styles

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', role: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await API.get('/users');
      setUsers(response.data);
    };
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setFormData({ username: user.username, email: user.email, role: user.role });
  };

  const handleCancel = () => {
    setEditingUser(null);
    setIsAdding(false);
    setFormData({ username: '', email: '', role: '' });
  };

  const handleSave = async (id) => {
    try {
      await API.put(`/users/${id}`, formData);
      setUsers(users.map(user => (user.id === id ? { ...user, ...formData } : user)));
      handleCancel();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleAdd = async () => {
    try {
      const response = await API.post('/users', formData);
      setUsers([...users, response.data]);
      handleCancel();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  return (
    <div className="manage-users">
      <h1 className="title">Gestion des Utilisateurs</h1>
      <button className="add-btn" onClick={() => setIsAdding(true)}>Ajouter un utilisateur</button>
      {(isAdding || editingUser) && (
        <div className="user-form">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Rôle"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
          {isAdding ? (
            <button className="save-btn" onClick={handleAdd}>Ajouter</button>
          ) : (
            <button className="save-btn" onClick={() => handleSave(editingUser)}>Sauvegarder</button>
          )}
          <button className="cancel-btn" onClick={handleCancel}>Annuler</button>
        </div>
      )}
      <table className="users-table">
        <thead>
          <tr>
            <th>Nom d'utilisateur</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className={editingUser === user.id ? 'editing' : ''}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(user)}>Modifier</button>
                <button className="delete-btn">Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}