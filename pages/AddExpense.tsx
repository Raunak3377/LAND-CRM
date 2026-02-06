
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addExpense } from '../services/api';
import { ArrowLeft, Save, Loader2, User } from 'lucide-react';

const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  const [staffType, setStaffType] = useState('Admin');
  const [customStaff, setCustomStaff] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: '',
    done_by: 'Admin'
  });

  const categories = ['Marketing', 'Construction', 'Labor', 'Material', 'Registration', 'Legal', 'Staff Salary', 'Utilities', 'Other'];

  const handleStaffTypeChange = (val: string) => {
    setStaffType(val);
    if (val !== 'Other') {
      setFormData(prev => ({ ...prev, done_by: val }));
    } else {
      setFormData(prev => ({ ...prev, done_by: customStaff }));
    }
  };

  const handleCustomStaffChange = (val: string) => {
    setCustomStaff(val);
    setFormData(prev => ({ ...prev, done_by: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.amount || !formData.done_by) {
      alert("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await addExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      alert("Expense Recorded Successfully!");
      navigate('/expenses');
    } catch (err) {
      console.error(err);
      alert("Failed to add expense. Please try again.");
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
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Record Expense</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Date *</label>
            <input
              required
              type="date"
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Category *</label>
            <select
              required
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-rose-500 outline-none transition-all cursor-pointer"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">-- Choose Category --</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Amount (INR) *</label>
            <input
              required
              type="number"
              placeholder="Enter amount"
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Done By *</label>
            <div className="space-y-3">
              <select
                required
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-rose-500 outline-none transition-all cursor-pointer"
                value={staffType}
                onChange={(e) => handleStaffTypeChange(e.target.value)}
              >
                <option value="Admin">Admin</option>
                <option value="Sales Team">Sales Team</option>
                <option value="Accounts">Accounts</option>
                <option value="Other">Other (Custom Name)</option>
              </select>
              
              {staffType === 'Other' && (
                <div className="relative animate-in slide-in-from-top-2 duration-200">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="text"
                    placeholder="Enter Staff Name"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                    value={customStaff}
                    onChange={(e) => handleCustomStaffChange(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Description / Details *</label>
          <textarea
            required
            rows={4}
            placeholder="Describe what the expense was for..."
            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-rose-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Record Expense
        </button>
      </form>
    </div>
  );
};

export default AddExpense;
