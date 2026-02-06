
import React, { useEffect, useState } from 'react';
import { getExpenses } from '../services/api';
import { Expense } from '../types';
import { Search, Plus, Filter, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExpensesList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    getExpenses().then(data => {
      setExpenses(data);
      setLoading(false);
    });
  }, []);

  const categories = Array.from(new Set(expenses.map(e => e.category)));

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Project Expenses</h2>
          <p className="text-slate-500">Track overheads, construction, and marketing costs</p>
        </div>
        <Link 
           to="/add-expense"
           className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-lg shadow-rose-200"
        >
          <Plus size={18} />
          <span>Add Expense</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search descriptions or categories..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-rose-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading expenses...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-sm">
                  <th className="px-4 py-3 font-semibold text-slate-600">ID</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Category</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Description</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Amount</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Done By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredExpenses.length > 0 ? filteredExpenses.map((exp) => (
                  <tr key={exp.expense_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-xs font-mono text-slate-400">{exp.expense_id}</td>
                    <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{exp.date}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded text-xs font-semibold">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700 max-w-xs overflow-hidden text-ellipsis">{exp.description}</td>
                    <td className="px-4 py-4 font-bold text-slate-900">{formatCurrency(exp.amount)}</td>
                    <td className="px-4 py-4 text-slate-500 text-sm">{exp.done_by}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">No expense records found.</td>
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

export default ExpensesList;
