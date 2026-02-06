
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPlots, getPayments } from '../services/api';
import { Plot, Payment } from '../types';
import { ArrowLeft, CreditCard, User, Tag, Calendar, Info, MapPin, DollarSign } from 'lucide-react';

const PlotDetails: React.FC = () => {
  const { plotId } = useParams();
  const navigate = useNavigate();
  const [plot, setPlot] = useState<Plot | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plotsData, paymentsData] = await Promise.all([getPlots(), getPayments()]);
        const foundPlot = plotsData.find(p => p.plot_id.toString() === plotId);
        const plotPayments = paymentsData.filter(pay => pay.plot_id.toString() === plotId);
        setPlot(foundPlot || null);
        setPayments(plotPayments);
      } catch (err) {
        console.error("Error loading plot details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [plotId]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading plot details...</div>;
  if (!plot) return <div className="p-8 text-center text-slate-500">Plot not found. <Link to="/plots" className="text-blue-600 underline">Back to list</Link></div>;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/plots')} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Plot {plot.plot_id}</h2>
          <p className="text-slate-500">Project ID: {plot.project_id}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Plot Info Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Info size={18} className="text-blue-600" />
              Main Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <DetailRow icon={MapPin} label="Size" value={`${plot.plot_size} Units`} />
                <DetailRow icon={Tag} label="Status" value={plot.status} isStatus statusType={plot.status} />
                <DetailRow icon={DollarSign} label="Cost Price" value={formatCurrency(plot.cost_price)} />
                <DetailRow icon={DollarSign} label="Sell Price" value={formatCurrency(plot.sell_price)} />
              </div>
              <div className="space-y-4">
                <DetailRow icon={CreditCard} label="Received" value={formatCurrency(plot.payment_received)} color="text-emerald-600" />
                <DetailRow icon={CreditCard} label="Pending" value={formatCurrency(plot.pending_amount)} color="text-rose-600" />
                <DetailRow icon={Calendar} label="Sold Date" value={plot.sold_date || 'N/A'} />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Link
                to={`/add-payment?plot_id=${plot.plot_id}`}
                className="flex-1 bg-blue-600 text-white text-center py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
              >
                Add Payment
              </Link>
              <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                Edit Details
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CreditCard size={18} className="text-blue-600" />
              Payment History
            </h3>
            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-sm text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="pb-3 px-2 font-medium">Date</th>
                      <th className="pb-3 px-2 font-medium">Mode</th>
                      <th className="pb-3 px-2 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {payments.map(pay => (
                      <tr key={pay.payment_id}>
                        <td className="py-3 px-2 text-slate-700">{pay.date}</td>
                        <td className="py-3 px-2 text-slate-500">{pay.mode}</td>
                        <td className="py-3 px-2 text-right font-semibold text-slate-900">{formatCurrency(pay.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 italic">No payments recorded for this plot.</div>
            )}
          </div>
        </div>

        {/* Buyer & Investor Side Panels */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <User size={18} className="text-blue-600" />
              Buyer Information
            </h3>
            {plot.buyer_name ? (
              <div className="space-y-4">
                <DetailRow label="Name" value={plot.buyer_name} />
                <DetailRow label="Phone" value={plot.buyer_phone || 'N/A'} />
              </div>
            ) : (
              <p className="text-slate-400 italic">No buyer assigned.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Investor Info
            </h3>
            {plot.investor_name ? (
              <div className="space-y-4">
                <DetailRow label="Investor" value={plot.investor_name} />
                <DetailRow label="Share" value={`${plot.investor_share}%`} />
              </div>
            ) : (
              <p className="text-slate-400 italic">No investor assigned.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Helper for Detail Display
const DetailRow = ({ icon: Icon, label, value, color = 'text-slate-900', isStatus, statusType }: any) => (
  <div className="flex items-start gap-3">
    {Icon && <Icon size={18} className="text-slate-400 mt-1" />}
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      {isStatus ? (
        <span className={`inline-block px-2 py-0.5 mt-1 rounded text-xs font-bold ${
          statusType === 'Sold' ? 'bg-emerald-100 text-emerald-700' : 
          statusType === 'Available' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
        }`}>
          {value}
        </span>
      ) : (
        <p className={`text-base font-semibold ${color}`}>{value}</p>
      )}
    </div>
  </div>
);

const Users = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export default PlotDetails;
