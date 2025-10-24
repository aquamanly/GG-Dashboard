import React, { useState, useEffect, useMemo } from 'react';
import { fetchUserRoles, updateUserRole } from '../services/userRoles';

const AVAILABLE_ROLES = ['rep', 'manager', 'admin', 'trainee'];

// (Paste your full UserRolesManager component here, unchanged)
const UserRolesManager = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null); // The user object currently being edited
    const [isSaving, setIsSaving] = useState(false);
  
    // Initial Fetch Effect
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const fetchedUsers = await fetchUserRoles();
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Error loading user roles:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadUsers();
    }, []);
  
    // Filtered Users
    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const term = searchTerm.toLowerCase();
        return users.filter(user =>
            user.first_name?.toLowerCase().includes(term) ||
            user.last_name?.toLowerCase().includes(term) ||
            user.team?.toLowerCase().includes(term) ||
            user.role?.toLowerCase().includes(term)
        );
    }, [users, searchTerm]);
  
    // Handle form field changes
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingUser(prev => ({
            ...prev,
            [name]: value
        }));
    };
  
    // Handle Save
    const handleSave = async () => {
        if (!editingUser) return;
        setIsSaving(true);
        try {
            const savedUser = await updateUserRole(editingUser);
            // Update the main user list with the saved user data
            setUsers(prevUsers => prevUsers.map(u => 
                u.id === savedUser.id ? savedUser : u
            ));
            setEditingUser(null); // Close the modal
        } catch (error) {
            console.error("Failed to save user role:", error);
        } finally {
            setIsSaving(false);
        }
    };
  
    const UserTable = () => {
        if (isLoading) {
            return (
                <div className="text-center py-10 text-gray-500 text-lg">
                    Loading user data...
                </div>
            );
        }
        if (filteredUsers.length === 0) {
             return (
                <div className="text-center py-10 text-gray-500 text-lg">
                    No users match your search criteria.
                </div>
            );
        }
  
        return (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abbrev</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-indigo-50 transition duration-150 cursor-pointer">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                                        user.role === 'manager' ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{user.team}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{user.name_abreviation}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                    <button 
                                        onClick={() => setEditingUser({ ...user })} 
                                        className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };
  
    const EditModal = () => {
        if (!editingUser) return null;
  
        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-all">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Edit User: {editingUser.first_name} {editingUser.last_name}</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {/* First Name */}
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">First Name</span>
                            <input 
                                type="text"
                                name="first_name"
                                value={editingUser.first_name || ''}
                                onChange={handleEditChange}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                            />
                        </label>
                        {/* Last Name */}
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Last Name</span>
                            <input 
                                type="text"
                                name="last_name"
                                value={editingUser.last_name || ''}
                                onChange={handleEditChange}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                            />
                        </label>
                        {/* Role */}
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Role</span>
                            <select
                                name="role"
                                value={editingUser.role || 'rep'}
                                onChange={handleEditChange}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border bg-white"
                            >
                                {AVAILABLE_ROLES.map(role => (
                                    <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                                ))}
                            </select>
                        </label>
                        {/* Team */}
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Team</span>
                            <input 
                                type="text"
                                name="team"
                                value={editingUser.team || ''}
                                onChange={handleEditChange}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                            />
                        </label>
                        {/* Name Abbreviation */}
                        <label className="block col-span-2">
                            <span className="text-sm font-medium text-gray-700">Name Abbreviation (e.g., JD)</span>
                            <input 
                                type="text"
                                name="name_abreviation"
                                value={editingUser.name_abreviation || ''}
                                onChange={handleEditChange}
                                maxLength={3}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                            />
                        </label>
                    </div>
  
                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={() => setEditingUser(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-150"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className={`px-4 py-2 text-white font-semibold rounded-lg transition duration-150 ${isSaving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };
  
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Sales Representative Management
            </h3>
            
            <div className="mb-4">
                 <input
                    type="text"
                    placeholder="Search by name, role, or team..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
  
            <UserTable />
            <EditModal />
        </div>
    );
  };
  
export default UserRolesManager;
