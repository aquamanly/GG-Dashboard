import React from 'react';
import { ALL_ACTIVITIES } from '../constants'; // optional if you move it there

const DashboardView = ({ logs, currentState, handleSort, handleFilterChange, handleSearchChange, analysis, isLoading, filteredAndSortedLogs }) => {
  // (Paste full DashboardView code here)


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

export default DashboardView;
