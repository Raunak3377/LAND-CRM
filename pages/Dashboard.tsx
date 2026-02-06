
import React, { useEffect, useState } from 'react';
import { getPlots, getProjectInfo, getPayments, getExpenses } from '../services/api';
import { Plot, ProjectInfo, Payment, Expense } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid
} from 'recharts';
import { Users, LayoutGrid, DollarSign, Wallet, TrendingUp, AlertCircle, Receipt, ArrowUpDown } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plotsData, infoData, paymentsData, expensesData] = await Promise.all([
          getPlots(), 
          getProjectInfo(),
          getPayments(),
          getExpenses()
        ]);
        setPlots(plotsData);
        setProjectInfo(infoData);
        setPayments(paymentsData);
        setExpenses(expensesData);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-slate-500 animate-pulse font-medium">Loading project metrics...</p></div>;

  const soldCount = plots.filter(p => p.status === 'Sold').length;
  const availableCount = plots.filter(p => p.status === 'Available').length;
  const holdCount = plots.filter(p => p.status === 'Hold').length;
  const investorCount = plots.filter(p => p.status === 'Investor').length;
  const totalPending = plots.reduce((sum, p) => sum + (p.pending_amount || 0), 0);

  const statusData = [
    { name: 'Sold', value: soldCount, color: '#10b981' },
    { name: 'Available', value: availableCount, color: '#3b82f6' },
    { name: 'Hold', value: holdCount, color: '#f59e0b' },
    { name: 'Investor', value: investorCount, color: '#8b5cf6' },
  ];

  // Staff Performance: Collection vs Expenses per person
  const staffNames = new Set([...payments.map(p => p.received_by), ...expenses.map(e => e.done_by)]);
  const staffPerformanceData = Array.from(staffNames).map(name => {
    const collections = payments.filter(p => p.received_by === name).reduce((sum, p) => sum + (p.amount || 0), 0);
    const spending = expenses.filter(e => e.done_by === name).reduce((sum, e) => sum + (e.amount || 0), 0);
    return {
      name: name || 'Unknown',
      Collected: collections,
      Spent: spending,
      Net: collections - spending
    };
  }).sort((a, b) => b.Collected - a.Collected);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const cards = [
    { title: 'Total Plots', value: plots.length, icon: LayoutGrid, color: 'text-slate-600', bg: 'bg-slate-100' },
    { title: 'Sold Plots', value: soldCount, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Net Profit', value: formatCurrency(projectInfo?.net_profit || 0), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Received', value: formatCurrency(projectInfo?.total_payments_received || 0), icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Expenses', value: formatCurrency(projectInfo?.total_expenses || 0), icon: Receipt, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Pending Sum', value: formatCurrency(totalPending), icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Project Overview</h2>
        <p className="text-slate-500 font-medium">{projectInfo?.project_name || 'Project Statistics'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <div className={`w-9 h-9 ${card.bg} ${card.color} rounded-lg flex items-center justify-center mb-3`}>
              <card.icon size={18} />
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{card.title}</p>
            <p className="text-lg font-bold text-slate-900 mt-1 truncate">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Staff Performance Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
          <ArrowUpDown size={18} className="text-blue-500" />
          Staff Cash Flow (Collection vs Expense)
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={staffPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                formatter={(val: number) => formatCurrency(val)}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="Collected" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
              <Bar dataKey="Spent" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
            <LayoutGrid size={18} className="text-blue-500" />
            Plot Inventory Status
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Staff Table */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
            <Users size={18} className="text-indigo-500" />
            Net Handled per Person
          </h3>
          <div className="overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                  <th className="pb-3 px-2">Person</th>
                  <th className="pb-3 px-2 text-right">In</th>
                  <th className="pb-3 px-2 text-right">Out</th>
                  <th className="pb-3 px-2 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staffPerformanceData.map((staff, idx) => (
                  <tr key={idx} className="text-sm">
                    <td className="py-3 px-2 font-semibold text-slate-700">{staff.name}</td>
                    <td className="py-3 px-2 text-right text-emerald-600 font-medium">+{formatCurrency(staff.Collected)}</td>
                    <td className="py-3 px-2 text-right text-rose-600 font-medium">-{formatCurrency(staff.Spent)}</td>
                    <td className={`py-3 px-2 text-right font-bold ${staff.Net >= 0 ? 'text-blue-600' : 'text-rose-700'}`}>
                      {formatCurrency(staff.Net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
