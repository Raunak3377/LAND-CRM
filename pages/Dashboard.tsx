
import React, { useEffect, useState } from 'react';
import { getPlots, getProjectInfo, getPayments } from '../services/api';
import { Plot, ProjectInfo, Payment } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid
} from 'recharts';
import { Users, LayoutGrid, DollarSign, Wallet, TrendingUp, AlertCircle, Receipt } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plotsData, infoData, paymentsData] = await Promise.all([
          getPlots(), 
          getProjectInfo(),
          getPayments()
        ]);
        setPlots(plotsData);
        setProjectInfo(infoData);
        setPayments(paymentsData);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-slate-500 animate-pulse">Loading dashboard...</p></div>;

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

  // Payment Receiver Metrics
  const receiverMetrics = payments.reduce((acc, curr) => {
    const receiver = curr.received_by || 'Unknown';
    acc[receiver] = (acc[receiver] || 0) + (curr.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const receiverData = Object.entries(receiverMetrics).map(([name, total]) => ({
    name,
    total
  })).sort((a, b) => b.total - a.total);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const cards = [
    { title: 'Total Plots', value: plots.length, icon: LayoutGrid, color: 'text-slate-600', bg: 'bg-slate-100' },
    { title: 'Sold Plots', value: soldCount, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Available', value: availableCount, icon: LayoutGrid, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Net Profit', value: formatCurrency(projectInfo?.net_profit || 0), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Selling Value', value: formatCurrency(projectInfo?.total_selling_value || 0), icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Received', value: formatCurrency(projectInfo?.total_payments_received || 0), icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Expenses', value: formatCurrency(projectInfo?.total_expenses || 0), icon: Receipt, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Pending Sum', value: formatCurrency(totalPending), icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Project Overview</h2>
        <p className="text-slate-500">{projectInfo?.project_name || 'Loading Project...'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-lg flex items-center justify-center mb-4`}>
              <card.icon size={20} />
            </div>
            <p className="text-sm text-slate-500 font-medium">{card.title}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
            <LayoutGrid size={18} className="text-blue-500" />
            Plot Status Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
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

        {/* Receiver Metrics */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
            <Wallet size={18} className="text-emerald-500" />
            Collection by Receiver
          </h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={receiverData}
                margin={{ left: 40, right: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={80}
                  style={{ fontSize: '12px', fontWeight: 500 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(val: number) => formatCurrency(val)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="total" 
                  fill="#10b981" 
                  radius={[0, 4, 4, 0]} 
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
