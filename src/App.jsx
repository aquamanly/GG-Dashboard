import React, { useState, useEffect, useMemo, useCallback } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { supabase } from './supabase';
const AVAILABLE_ROLES = ['rep', 'manager', 'admin', 'trainee']; // Missing definition
// --- MOCK DATA & CONFIGURATION ---


const ALL_ACTIVITIES = [
  'Not Home',
  'Sold',
  'No Soliciting',
  'Mosquito Sale',
  'Tree and Shrub Sale',
];

// --- UTILITY FUNCTIONS ---

/**
 * Placeholder for data fetching.
 */
const fetchActivityLogs = async () => {
  try {
    // 1. Await the Supabase query to fetch the data
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('logged_at', { ascending: false });

    // 2. Check for a Supabase error
    if (error) {
      console.error('Error fetching activity logs:', error);
      // It's often best practice to throw an error so the caller can handle it
      throw new Error(`Supabase error: ${error.message}`);
    }

    // 3. Return the fetched data (or an empty array if data is null/undefined)
    return data || [];
  } catch (err) {
    // 4. Handle unexpected errors (e.g., network issues, client not defined)
    console.error('Unexpected error fetching activity logs:', err);
    // Re-throw the error so the calling function can catch it
    throw err;
  }
};


const fetchUserRoles = async () => {
  // In a real app, this would use the provided supabase client: .from('user_roles').select('*')
  try {
    // 1. Await the Supabase query to fetch the data
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')

    // 2. Check for a Supabase error
    if (error) {
      console.error('Error fetching activity logs:', error);
      // It's often best practice to throw an error so the caller can handle it
      throw new Error(`Supabase error: ${error.message}`);
    }

    // 3. Return the fetched data (or an empty array if data is null/undefined)
    return data || [];
  } catch (err) {
    // 4. Handle unexpected errors (e.g., network issues, client not defined)
    console.error('Unexpected error fetching activity logs:', err);
    // Re-throw the error so the calling function can catch it
    throw err;
  }
};

// --- USER ROLES MANAGER COMPONENT (NEW) ---

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

/**
 * MOCK: Placeholder for updating user roles.
 */
const updateUserRole = async (u) => {
    const { id, ...updates } = u;            // no mapping needed now
    const { data, error } = await supabase
      .from('user_roles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  };
  

/**
* Analyzes the data to determine the special sales leader and top overall salesmen.
*/
const analyzeSalesData = (logs) => {
  if (!logs.length) {
      return {
          specialSalesLeader: { email: 'N/A', specialSales: 0 },
          topOverallSalesmen: [],
      };
  }

  const specialSalesActivities = ['Mosquito Sale', 'Tree and Shrub Sale'];
  const salesmanMap = new Map();

  logs.forEach(log => {
      const email = log.user_email;
      if (!salesmanMap.has(email)) {
          salesmanMap.set(email, {
              overallSales: 0,
              specialSales: 0,
              email: email,
              id: log.user_id,
          });
      }

      const salesmanData = salesmanMap.get(email);

      // 1. Count Overall Sales (where activity_type includes 'Sold')
      if (Array.isArray(log.activity_type) && log.activity_type.includes('Sold')) {
          salesmanData.overallSales += 1;
      }

      // 2. Count Special Sales
      if(Array.isArray(log.activity_type)) {
          log.activity_type.forEach(activity => {
              if (specialSalesActivities.includes(activity)) {
                  salesmanData.specialSales += 1;
              }
          });
      }
  });

  const allSalesmen = Array.from(salesmanMap.values());

  // Find the leader in Special Sales
  const specialSalesLeader = allSalesmen.reduce((leader, current) => {
      if (current.specialSales > leader.specialSales) return current;
      if (current.specialSales === leader.specialSales && current.overallSales > leader.overallSales) return current; // Tiebreaker
      return leader;
  }, { specialSales: -1, email: 'N/A', overallSales: -1 });

  // Get Top 10 Overall Salesmen
  const topOverallSalesmen = allSalesmen
      .filter(s => s.overallSales > 0)
      .sort((a, b) => b.overallSales - a.overallSales)
      .slice(0, 10);

  return {
      specialSalesLeader,
      topOverallSalesmen,
  };
};




// --- DASHBOARD COMPONENT (EXISTING FUNCTIONALITY EXTRACTED) ---

const DashboardView = ({ logs, currentState, handleSort, handleFilterChange, handleSearchChange, analysis, isLoading, filteredAndSortedLogs }) => {
  
  // Renderer Components (Moved inside to access props/state easily)

  const TopSalesmenList = () => {
      if (isLoading) {
          return <p className="text-center text-gray-500 py-4">Loading...</p>;
      }
      if (analysis.topOverallSalesmen.length === 0) {
          return <p className="text-center text-gray-500 py-4">No sales recorded yet.</p>;
      }
      
      return (
          <div id="top-salesmen-list" className="space-y-3">
              {analysis.topOverallSalesmen.map((salesman, index) => {
                  const rankColor = index < 3 ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 text-gray-600';
                  return (
                      <div key={salesman.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-150">
                          <div className="flex items-center">
                              <span className={`w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs mr-3 ${rankColor}`}>
                                  {index + 1}
                              </span>
                              <span className="text-sm font-medium text-gray-700 truncate">{salesman.email}</span>
                          </div>
                          <span className="text-lg font-extrabold text-blue-600">{salesman.overallSales}</span>
                      </div>
                  );
              })}
          </div>
      );
  };

  const ActivityTable = () => {
      const { sortColumn, sortDirection } = currentState;

      const getSortIcon = (column) => {
          if (sortColumn === column) {
              return sortDirection === 'asc' ? '▲' : '▼';
          }
          return null;
      };

      if (isLoading) {
          return (
              <div className="text-center py-10 text-gray-500 text-lg">
                  <svg className="animate-spin h-5 w-5 text-blue-500 inline-block mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading data...
              </div>
          );
      }

      if (filteredAndSortedLogs.length === 0) {
          return (
              <div className="text-center py-10 text-gray-500 text-lg">
                  No activities match your filters.
              </div>
          );
      }

      return (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">ID</th>
                          <th
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition duration-150"
                              onClick={() => handleSort('user_email')}
                          >
                              <div className="flex items-center">
                                  Salesman <span className={`ml-1 text-xs ${sortColumn === 'user_email' ? 'opacity-100' : 'opacity-20'}`}>{getSortIcon('user_email')}</span>
                              </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">Activities</th>
                          <th
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition duration-150"
                              onClick={() => handleSort('logged_at')}
                          >
                              <div className="flex items-center">
                                  Date <span className={`ml-1 text-xs ${sortColumn === 'logged_at' ? 'opacity-100' : 'opacity-20'}`}>{getSortIcon('logged_at')}</span>
                              </div>
                          </th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAndSortedLogs.map(log => (
                          <tr key={log.id} className="hover:bg-blue-50 transition duration-150">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/6">{log.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.user_email}</td>
                              <td className="px-6 py-4 text-sm text-gray-500 w-2/5">
                                  <div className="flex flex-wrap gap-2">
                                      {log.activity_type.map(activity => (
                                          <span 
                                              key={activity}
                                              className={`px-3 py-1 text-xs font-semibold rounded-full ${activity === 'Sold' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
                                          >
                                              {activity}
                                          </span>
                                      ))}
                                  </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.logged_at).toLocaleDateString()}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      );
  };


  return (
      <div className="max-w-7xl mx-auto">
          <header className="mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-2">Sales Activity Dashboard</h1>
              <p className="text-gray-500 mt-1">Real-time insights from field activities.</p>
          </header>

          {/* --- Top Insights / Cards --- */}
          <div id="insights-container" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Top Performer Card */}
              <div className="md:col-span-2 bg-white p-5 rounded-xl shadow-lg border-l-4 border-pink-600">
                  <p className="text-lg font-semibold text-gray-700">Top Performer:</p>
                  <p id="leader-email" className="text-2xl font-bold text-pink-700 mt-1">
                      {isLoading ? 'Calculating...' : analysis.specialSalesLeader.email}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Highest combined sales for Mosquito and Tree/Shrub activities.</p>
              </div>
              
              {/* Special Sales Card */}
              <div className="p-5 rounded-xl shadow-lg flex items-center justify-between bg-pink-600 text-white">
                  <div>
                      <p className="text-sm font-semibold opacity-80">Mosquito/Tree Sale Leader</p>
                      <h2 id="special-sales-count" className="text-3xl font-bold mt-1">
                          {isLoading ? '...' : analysis.specialSalesLeader.specialSales} 
                          <span className="text-lg font-light ml-1">Special Sales</span>
                      </h2>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 17l5-5-5-5M16 12H3"></path></svg>
              </div>
          </div>

          {/* --- Main Content Grid (Top Salesmen and Table) --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Top 10 Salesmen List */}
              <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500 h-fit">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> 
                      Top 10 Overall Salesmen
                  </h3>
                  <TopSalesmenList />
              </div>

              {/* All Activity Table */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">All Activity Logs</h3>
                  
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      {/* Search Input */}
                      <div className="relative flex-grow">
                          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                          <input
                              type="text"
                              id="search-input"
                              placeholder="Search salesman by email..."
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                              value={currentState.searchTerm}
                              onChange={handleSearchChange}
                          />
                      </div>
                      {/* Activity Filter Dropdown */}
                      <select
                          id="activity-filter"
                          className="sm:w-1/3 py-2 px-4 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                          value={currentState.filterActivity}
                          onChange={handleFilterChange}
                      >
                          <option value="All">Filter by Activity: All</option>
                          {ALL_ACTIVITIES.map(activity => (
                              <option key={activity} value={activity}>{activity}</option>
                          ))}
                      </select>
                  </div>

                  {/* Table Container */}
                  <ActivityTable />
              </div>
          </div>
      </div>
  );
};


// --- MAIN APP COMPONENT ---

const App = () => {
  // Global App View State
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'users'

  // Dashboard States (retained from previous version)
  const [allLogs, setAllLogs] = useState([]);
  const [currentState, setCurrentState] = useState({
      searchTerm: '',
      filterActivity: 'All',
      sortColumn: 'logged_at',
      sortDirection: 'desc'
  });
  const [analysis, setAnalysis] = useState({ specialSalesLeader: { email: 'N/A', specialSales: 0 }, topOverallSalesmen: [] });
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Fetching Effect for Dashboard ---
  useEffect(() => {
      const loadData = async () => {
          try {
              const logs = await fetchActivityLogs();
              setAllLogs(logs);
              const initialAnalysis = analyzeSalesData(logs);
              setAnalysis(initialAnalysis);
          } catch (error) {
              console.error("Dashboard initialization failed:", error);
          } finally {
              setIsLoading(false);
          }
      };
      loadData();
  }, []); // Runs once on mount

  // --- Filtering and Sorting Logic for Dashboard ---
  const filteredAndSortedLogs = useMemo(() => {
      let logs = allLogs.slice();
      const { searchTerm, filterActivity, sortColumn, sortDirection } = currentState;

      // 1. Filtering
      logs = logs.filter(log => {
          const matchesSearch = log.user_email.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesActivity = filterActivity === 'All' || (Array.isArray(log.activity_type) && log.activity_type.includes(filterActivity));
          return matchesSearch && matchesActivity;
      });

      // 2. Sorting
      logs.sort((a, b) => {
          let valA, valB;

          if (sortColumn === 'logged_at') {
              valA = new Date(a.logged_at).getTime();
              valB = new Date(b.logged_at).getTime();
          } else if (sortColumn === 'user_email') {
              valA = a.user_email.toLowerCase();
              valB = b.user_email.toLowerCase();
          } else {
              return 0;
          }

          if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
          if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
          return 0;
      });

      return logs;
  }, [allLogs, currentState]); // Re-calculates when logs or filters/sort changes

  // --- Handlers for Dashboard ---
  const handleSort = useCallback((column) => {
      setCurrentState(prev => {
          let newDirection = 'desc';
          if (prev.sortColumn === column) {
              newDirection = prev.sortDirection === 'asc' ? 'desc' : 'asc';
          } else {
              newDirection = column === 'logged_at' ? 'desc' : 'asc'; // Default date to desc, email to asc
          }
          return { ...prev, sortColumn: column, sortDirection: newDirection };
      });
  }, []);

  const handleFilterChange = (e) => {
      setCurrentState(prev => ({
          ...prev,
          filterActivity: e.target.value
      }));
  };

  const handleSearchChange = (e) => {
      setCurrentState(prev => ({
          ...prev,
          searchTerm: e.target.value.trim()
      }));
  };

  const renderContent = () => {
      if (view === 'dashboard') {
          return (
              <DashboardView 
                  logs={allLogs}
                  currentState={currentState}
                  handleSort={handleSort}
                  handleFilterChange={handleFilterChange}
                  handleSearchChange={handleSearchChange}
                  analysis={analysis}
                  isLoading={isLoading}
                  filteredAndSortedLogs={filteredAndSortedLogs}
              />
          );
      } else if (view === 'users') {
          return <UserRolesManager />;
      }
      return <div className="text-center py-10">404 View Not Found</div>;
  };


  // --- Main JSX Return ---
  return (
      <div className="bg-gray-100 font-sans min-h-screen p-4 sm:p-8">
          {/* Navigation Bar */}
          <nav className="max-w-7xl mx-auto mb-8 bg-white p-3 rounded-xl shadow-md flex space-x-4">
              <button
                  onClick={() => setView('dashboard')}
                  className={`px-4 py-2 font-semibold rounded-lg transition duration-150 ${
                      view === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                  Sales Dashboard
              </button>
              <button
                  onClick={() => setView('users')}
                  className={`px-4 py-2 font-semibold rounded-lg transition duration-150 ${
                      view === 'users' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                  Manage Users
              </button>
          </nav>

          <main className="max-w-7xl mx-auto">
              {renderContent()}
          </main>
      </div>
  );
};

export default App;
