import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './App.css';
import { supabase } from './supabase';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import UserRolesManager from './components/UserRolesManager';
import { fetchActivityLogs } from './services/activityLogs';
import { analyzeSalesData } from './utils/analyzeSalesData';


const App = () => {
    // 🔐 Auth session
    const [session, setSession] = useState(null);

    const [checkingSession, setCheckingSession] = useState(true);



    useEffect(() => {
        let mounted = true;

        const init = async () => {
            const { data } = await supabase.auth.getSession();
            if (mounted) setSession(data.session ?? null);
            setCheckingSession(false);
        };
        init();

        const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
            setSession(sess);
        });

        return () => {
            mounted = false;
            sub.subscription?.unsubscribe?.();
        };
    }, []);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        if (!session?.user?.id) return;

        const fetchRole = async () => {

            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .single()

            if (error) {
                console.error('Error fetching user role:', error);
                setUserRole('rep'); // default fallback
            } else {
                setUserRole(data?.role || 'rep');
            }
        };

        fetchRole();
    }, [session]);

    // ---------------- Existing state  ----------------
    const [view, setView] = useState('dashboard'); // 'dashboard' | 'users'

    const [allLogs, setAllLogs] = useState([]);
    const [currentState, setCurrentState] = useState({
        searchTerm: '',
        filterActivity: 'All',
        sortColumn: 'logged_at',
        sortDirection: 'desc'
    });
    const [analysis, setAnalysis] = useState({ specialSalesLeader: { email: 'N/A', specialSales: 0 }, topOverallSalesmen: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Only load data if authenticated
        if (!session) return;
        const loadData = async () => {
            try {
                setIsLoading(true);
                const logs = await fetchActivityLogs();
                setAllLogs(logs);
                setAnalysis(analyzeSalesData(logs));
            } catch (e) {
                console.error("Dashboard initialization failed:", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [session]);

    const filteredAndSortedLogs = useMemo(() => {
        let logs = allLogs.slice();
        const { searchTerm, filterActivity, sortColumn, sortDirection } = currentState;
        logs = logs.filter(log => {
            const matchesSearch = log.user_email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesActivity = filterActivity === 'All' || (Array.isArray(log.activity_type) && log.activity_type.includes(filterActivity));
            return matchesSearch && matchesActivity;
        });
        logs.sort((a, b) => {
            let valA, valB;
            if (sortColumn === 'logged_at') {
                valA = new Date(a.logged_at).getTime();
                valB = new Date(b.logged_at).getTime();
            } else if (sortColumn === 'user_email') {
                valA = a.user_email.toLowerCase();
                valB = b.user_email.toLowerCase();
            } else return 0;
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return logs;
    }, [allLogs, currentState]);

    const handleSort = useCallback((column) => {
        setCurrentState(prev => {
            let newDirection = 'desc';
            if (prev.sortColumn === column) {
                newDirection = prev.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                newDirection = column === 'logged_at' ? 'desc' : 'asc';
            }
            return { ...prev, sortColumn: column, sortDirection: newDirection };
        });
    }, []);

    const handleFilterChange = (e) => setCurrentState(prev => ({ ...prev, filterActivity: e.target.value }));
    const handleSearchChange = (e) => setCurrentState(prev => ({ ...prev, searchTerm: e.target.value.trim() }));

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
        }

        if (view === 'users') {
            if (userRole !== 'admin') {
                return (
                    <div className="text-center py-10 text-red-500 font-semibold">
                        You do not have permission to view this page.
                    </div>
                );
            }
            return <UserRolesManager />;
        }

        return <div className="text-center py-10">404 View Not Found</div>;
    };


    // 🔐 Gate: if not signed in, show Login
    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600">
                Checking session…
            </div>
        );
    }
    if (!session) {
        return <LoginView />;
    }

    // ✅ Authenticated UI
    return (
        <div className="bg-gray-100 font-sans min-h-screen p-4 sm:p-8">
            <nav className="max-w-7xl mx-auto mb-8 bg-white p-3 rounded-xl shadow-md flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('dashboard')}
                        className={`px-4 py-2 font-semibold rounded-lg transition ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Sales Dashboard
                    </button>
                    {userRole === 'admin' && (
                        <button
                            onClick={() => setView('users')}
                            className={`px-4 py-2 font-semibold rounded-lg transition ${view === 'users' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Manage Users
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 hidden sm:block">
                        {session.user?.email}
                    </span>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="px-3 py-2 rounded-lg font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                        Sign Out
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto">
                {renderContent()}
            </main>
        </div>
    );
};


export default App;
