
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPlots, addPayment } from '../services/api';
import { Plot } from '../types';
import { ArrowLeft, Save, Loader2, User } from 'lucide-react';

const AddPayment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loadingPlots, setLoadingPlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [receiverType, setReceiverType] = useState('Admin');
  const [customReceiver, setCustomReceiver] = useState('');

  const [formData, setFormData] = useState({
    plot_id: searchParams.get('plot_id') || '',
    buyer_name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    mode: 'Cash' as const,
    received_by: 'Admin',
    note: ''
  });

  useEffect(() => {
    getPlots().then(data => {
      setPlots(data);
      setLoadingPlots(false);
      
      if (formData.plot_id) {
        const selected = data.find(p => p.plot_id.toString() === formData.plot_id);
        if (selected) {
          setFormData(prev => ({ ...prev, buyer_name: selected.buyer_name || '' }));
        }
      }
    });
  }, [formData.plot_id]);

  const handlePlotChange = (id: string) => {
    const selected = plots.find(p => p.plot_id.toString() === id);
    setFormData({
      ...formData,
      plot_id: id,
      buyer_name: selected?.buyer_name || ''
    });
  };

  const handleReceiverTypeChange = (val: string) => {
    setReceiverType(val);
    if (val !== 'Other') {
      setFormData(prev => ({ ...prev, received_by: val }));
    } else {
      setFormData(prev => ({ ...prev, received_by: customReceiver }));
    }
  };

  const handleCustomReceiverChange = (val: string) => {
    setCustomReceiver(val);
    setFormData(prev => ({ ...prev, received_by: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plot_id || !formData.amount || !formData.received_by) {
      alert("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await addPayment({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      alert("Payment Added Successfully!");
      navigate(`/plots/${formData.plot_id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to add payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Add New Payment</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Select Plot ID *</label>
            <select
              required
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.plot_id}
              onChange={(e) => handlePlotChange(e.target.value)}
            >
              <option value="">-- Choose Plot --</option>
              {plots.map(p => (
                <option key={p.plot_id} value={p.plot_id}>Plot {p.plot_id} ({p.buyer_name || 'No Buyer'})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Buyer Name</label>
            <input
              type="text"
              readOnly
              placeholder="Auto-filled from Plot"
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-100 outline-none"
              value={formData.buyer_name}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Amount (INR) *</label>
            <input
              required
              type="number"
              placeholder="Enter amount"
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Payment Date *</label>
            <input
              required
              type="date"
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Payment Mode *</label>
            <div className="flex gap-2">
              {['Cash', 'UPI', 'Bank'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFormData({ ...formData, mode: m as any })}
                  className={`flex-1 py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                    formData.mode === m 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Received By *</label>
            <div className="space-y-3">
              <select
                required
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={receiverType}
                onChange={(e) => handleReceiverTypeChange(e.target.value)}
              >
                <option value="Admin">Admin</option>
                <option value="Sales Team">Sales Team</option>
                <option value="Accounts">Accounts</option>
                <option value="Other">Other (Custom)</option>
              </select>
              
              {receiverType === 'Other' && (
                <div className="relative animate-in slide-in-from-top-2 duration-200">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="text"
                    placeholder="Enter Custom Receiver Name"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={customReceiver}
                    onChange={(e) => handleCustomReceiverChange(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Note / Remarks</label>
          <textarea
            rows={3}
            placeholder="Additional transaction details..."
            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          Save Payment
        </button>
      </form>
    </div>
  );
};

export default AddPayment;
