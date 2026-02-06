
import React, { useEffect, useState } from 'react';
import { getPayments } from '../services/api';
import { Payment } from '../types';
import { Search, Filter, Calendar, CreditCard, User, MoreHorizontal, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentsList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState('All');

  useEffect(() => {
    getPayments().then(data => {
      setPayments(data);
      setLoading(false);
    });
  }, []);

  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.plot_id.toString().includes(searchTerm);
    const matchesMode = modeFilter === 'All' || p.mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Payment Logs</h2>
          <p className="text-slate-500">View and track all plot transaction history</p>
        </div>
        <Link 
           to="/add-payment"
           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
        >
          <Plus size={18} />
          <span>New Payment</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by Buyer or Plot ID..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
          >
            <option value="All">All Modes</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank">Bank</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading payments...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-sm">
                  <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-tight">Payment ID</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-tight">Plot ID</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-tight">Buyer</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-tight">Amount</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-tight">Date</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-tight">Mode</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-tight">Received By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPayments.length > 0 ? filteredPayments.map((pay) => (
                  <tr key={pay.payment_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-xs font-mono text-slate-500">{pay.payment_id}</td>
                    <td className="px-4 py-4 font-medium text-slate-900">
                      <Link to={`/plots/${pay.plot_id}`} className="text-blue-600 hover:underline">
                        {pay.plot_id}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{pay.buyer_name}</td>
                    <td className="px-4 py-4 font-bold text-emerald-600">{formatCurrency(pay.amount)}</td>
                    <td className="px-4 py-4 text-slate-500">{pay.date}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600 font-medium">{pay.mode}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-sm">{pay.received_by}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">No payment records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsList;
