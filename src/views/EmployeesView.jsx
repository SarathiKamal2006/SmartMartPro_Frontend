import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  Users, 
  UserCheck, 
  Clock, 
  UserPlus, 
  Plus, 
  Search
} from 'lucide-react';

export default function EmployeesView() {
  const { employees, branchEmployees } = useApp();
  const { playClick } = useSoundEffects();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filtered = branchEmployees.filter(e => {
    const matchesRole = roleFilter === 'All' || e.role === roleFilter;
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Employee Roster & Role Access</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage ERP staff permissions, attendance records, and branch roster assignments.</p>
        </div>
        <button 
          onClick={playClick}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>ADD EMPLOYEE</span>
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Staff</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{branchEmployees.length} staff</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">+4% vs last month</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Present Today</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{branchEmployees.filter(e => e.attendance === 'Present').length} present</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">{branchEmployees.length > 0 ? ((branchEmployees.filter(e => e.attendance === 'Present').length / branchEmployees.length) * 100).toFixed(1) : 0}% attendance</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">On Leave</span>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{branchEmployees.filter(e => e.attendance === 'On Leave').length} on leave</h3>
            <span className="text-[10px] text-amber-600 font-bold mt-1 block">-1.5% vs last month</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">New Onboarded</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">3 onboarded</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">+100% vs last month</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee roster..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">ROLE:</span>
            <select
              value={roleFilter}
              onChange={(e) => { playClick(); setRoleFilter(e.target.value); }}
              className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="All">All Roles</option>
              <option value="Store Manager">Store Manager</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Cashier">Cashier</option>
              <option value="Warehouse Staff">Warehouse Staff</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">EMPLOYEE NAME</th>
                <th className="p-3.5">EMPLOYEE ID</th>
                <th className="p-3.5">ROLE</th>
                <th className="p-3.5">BRANCH</th>
                <th className="p-3.5">PHONE</th>
                <th className="p-3.5">JOIN DATE</th>
                <th className="p-3.5 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5 font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-[11px] shadow-sm">
                      {e.name.charAt(0)}
                    </div>
                    <span>{e.name}</span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-500">{e.id}</td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      e.role === 'Store Manager' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                      e.role === 'Admin' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                      e.role === 'Manager' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {e.role}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold">{e.branch}</td>
                  <td className="p-3.5 text-slate-500 font-mono">{e.phone}</td>
                  <td className="p-3.5 text-slate-400 text-[11px]">{e.joinDate}</td>
                  <td className="p-3.5 text-right">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      e.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
