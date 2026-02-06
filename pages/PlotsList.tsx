
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlots, addPlot } from '../services/api';
import { Plot, PlotStatus } from '../types';
import { Search, Filter, ChevronRight, Plus, X, Loader2, Save } from 'lucide-react';

const PlotsList: React.FC = () => {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PlotStatus | 'All'>('All');
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [newPlot, setNewPlot] = useState({
    plot_id: '',
    project_id: 'PRJ001',
    plot_size: '',
    cost_price: '',
    sell_price: '',
    status: 'Available' as PlotStatus,
    investor_name: '',
    investor_share: '0'
  });

  const loadPlots = () => {
    setLoading(true);
    getPlots().then(data => {
      setPlots(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadPlots();
  }, []);

  const handleAddPlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlot.plot_id || !newPlot.plot_size) return;
    
    setIsSubmitting(true);
    try {
      await addPlot({
        ...newPlot,
        plot_size: newPlot.plot_size,
        cost_price: parseFloat(newPlot.cost_price || '0'),
        sell_price: parseFloat(newPlot.sell_price || '0'),
        investor_share: parseFloat(newPlot.investor_share || '0')
      });
      alert("Plot Added Successfully!");
      setIsModalOpen(false);
      loadPlots();
      setNewPlot({
        plot_id: '',
        project_id: 'PRJ001',
        plot_size: '',
        cost_price: '',
        sell_price: '',
        status: 'Available',
        investor_name: '',
        investor_share: '0'
      });
    } catch (err) {
      alert("Failed to add plot");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPlots = plots.filter(p => {
    const matchesSearch = 
      p.plot_id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesPending = !showPendingOnly || (p.pending_amount > 0);

    return matchesSearch && matchesStatus && matchesPending;
  });

  const getStatusColor = (status: PlotStatus) => {
    switch (status) {
      case 'Sold': return 'bg-emerald-100 text-emerald-700';
      case 'Available': return 'bg-blue-100 text-blue-700';
      case 'Hold': return 'bg-amber-100 text-amber-700';
      case 'Investor': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Plots Inventory</h2>
          <p className="text-slate-500">Manage and track your project plots</p>
        </div>
        <button 
           onClick={() => setIsModalOpen(true)}
           className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold shadow-lg shadow-blue-200 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={20} />
          <span>Add New Plot</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by Plot ID or Buyer..."
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              className="px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="All">All Status</option>
              <option value="Sold">Sold</option>
              <option value="Available">Available</option>
              <option value="Hold">Hold</option>
              <option value="Investor">Investor</option>
            </select>
            <button
              onClick={() => setShowPendingOnly(!showPendingOnly)}
              className={`px-4 py-3 rounded-xl border transition-all font-medium ${
                showPendingOnly 
                  ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pending &gt; 0
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center gap-3">
             <Loader2 className="animate-spin text-blue-600" size={32} />
             <p className="text-slate-500 font-medium">Refreshing plots...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Plot ID</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Size</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Received</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlots.length > 0 ? filteredPlots.map((plot) => (
                  <tr 
                    key={plot.plot_id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/plots/${plot.plot_id}`)}
                  >
                    <td className="px-6 py-5 font-bold text-slate-900">{plot.plot_id}</td>
                    <td className="px-6 py-5 text-slate-600">{plot.plot_size}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(plot.status)}`}>
                        {plot.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-600 font-medium">{plot.buyer_name || '-'}</td>
                    <td className="px-6 py-5 text-emerald-600 font-bold">{formatCurrency(plot.payment_received || 0)}</td>
                    <td className="px-6 py-5">
                      <span className={plot.pending_amount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                        {formatCurrency(plot.pending_amount || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-300 group-hover:text-blue-600 transition-colors">
                      <ChevronRight size={20} />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic bg-slate-50/50">No plots found matching your criteria</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Plot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">Add New Plot</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddPlotSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Plot ID *</label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newPlot.plot_id}
                    onChange={e => setNewPlot({...newPlot, plot_id: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Project ID</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl outline-none"
                    value={newPlot.project_id}
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Size (Units) *</label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newPlot.plot_size}
                    onChange={e => setNewPlot({...newPlot, plot_size: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <select
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newPlot.status}
                    onChange={e => setNewPlot({...newPlot, status: e.target.value as any})}
                  >
                    <option value="Available">Available</option>
                    <option value="Hold">Hold</option>
                    <option value="Sold">Sold</option>
                    <option value="Investor">Investor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Cost Price</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newPlot.cost_price}
                    onChange={e => setNewPlot({...newPlot, cost_price: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Sell Price</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newPlot.sell_price}
                    onChange={e => setNewPlot({...newPlot, sell_price: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Investor Name</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newPlot.investor_name}
                    onChange={e => setNewPlot({...newPlot, investor_name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Investor Share (%)</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newPlot.investor_share}
                    onChange={e => setNewPlot({...newPlot, investor_share: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-2xl transition-all border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold shadow-xl shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Add Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlotsList;
