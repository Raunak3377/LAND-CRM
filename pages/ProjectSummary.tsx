
import React, { useEffect, useState } from 'react';
import { getProjectInfo, getPlots } from '../services/api';
import { ProjectInfo, Plot } from '../types';
import { Info, Users, Briefcase, TrendingUp, DollarSign, Wallet } from 'lucide-react';

const ProjectSummary: React.FC = () => {
  const [info, setInfo] = useState<ProjectInfo | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProjectInfo(), getPlots()]).then(([infoData, plotsData]) => {
      setInfo(infoData);
      setPlots(plotsData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading summary...</div>;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  // Group investor shares
  const investorGroups: Record<string, { share: number, plotsCount: number }> = {};
  plots.forEach(p => {
    if (p.investor_name) {
      if (!investorGroups[p.investor_name]) {
        investorGroups[p.investor_name] = { share: 0, plotsCount: 0 };
      }
      investorGroups[p.investor_name].share += (p.investor_share || 0);
      investorGroups[p.investor_name].plotsCount += 1;
    }
  });

  const summaryCards = [
    { label: 'Total Plots', value: info?.total_plots, icon: Briefcase, color: 'text-slate-600' },
    { label: 'Total Cost', value: formatCurrency(info?.total_cost_price || 0), icon: DollarSign, color: 'text-slate-600' },
    { label: 'Selling Value', value: formatCurrency(info?.total_selling_value || 0), icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Total Received', value: formatCurrency(info?.total_payments_received || 0), icon: Wallet, color: 'text-emerald-600' },
    { label: 'Gross Profit', value: formatCurrency(info?.gross_profit || 0), icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Net Profit', value: formatCurrency(info?.net_profit || 0), icon: TrendingUp, color: 'text-indigo-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Project Master Summary</h2>
        <p className="text-slate-500">Detailed financial analysis for {info?.project_name}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
            <div className={`p-3 rounded-xl bg-slate-50 ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="text-xl font-bold text-slate-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Users size={18} className="text-blue-600" />
          Investor Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-sm">
                <th className="pb-3 px-2 font-medium">Investor Name</th>
                <th className="pb-3 px-2 font-medium">Associated Plots</th>
                <th className="pb-3 px-2 font-medium text-right">Total Share Sum (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {Object.entries(investorGroups).length > 0 ? Object.entries(investorGroups).map(([name, data]) => (
                <tr key={name}>
                  <td className="py-4 px-2 font-semibold text-slate-900">{name}</td>
                  <td className="py-4 px-2 text-slate-600">{data.plotsCount} Plots</td>
                  <td className="py-4 px-2 text-right font-bold text-blue-600">{data.share}%</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400 italic">No investor data found in current plot list.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectSummary;
