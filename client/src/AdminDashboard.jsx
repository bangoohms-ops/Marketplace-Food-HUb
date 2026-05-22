import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const AdminDashboard = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Targets your live Render backend directly
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://abbey-bank-dashboard-2a8h.onrender.com';

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/sales`);
        setSales(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard Load Error", err);
        setLoading(false);
      }
    };
    
    fetchSales();
    const interval = setInterval(fetchSales, 30000);
    return () => clearInterval(interval);
  }, [API_BASE_URL]);

  // SAFE CALCULATION LAYER: Fallback to 0 if database rows are blank
  const totalRevenue = sales.length > 0 ? sales.reduce((sum, sale) => sum + Number(sale.total_price || 0), 0) : 0;
  const totalOrders = sales.length;
  const avgSale = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Safe Chart Mapping: Only slices if data rows actually exist
  const chartData = sales.length > 0 ? [...sales].slice(-10).reverse() : [];

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-white animate-pulse font-black uppercase tracking-widest">Syncing Fresh! Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white p-4 md:p-10 font-sans custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-orange-500">Executive Overview</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Fresh! Food Hub • Maryland Analytics</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-6 py-3 rounded-2xl">
          <div className={`w-2 h-2 rounded-full ${sales.length > 0 ? 'bg-green-500 animate-ping' : 'bg-red-500'}`}></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">{sales.length > 0 ? 'Live System Active' : 'System Standby'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-8 rounded-[2.5rem] shadow-2xl shadow-orange-900/20">
          <p className="text-orange-200 uppercase text-[10px] font-black tracking-[0.2em] mb-2">Total Revenue</p>
          <p className="text-4xl font-black">₦{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[2.5rem]">
          <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] mb-2">Total Orders</p>
          <p className="text-4xl font-black">{totalOrders}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[2.5rem]">
          <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] mb-2">Average Sale</p>
          <p className="text-4xl font-black">₦{Math.round(avgSale).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] mb-10">
        <h3 className="font-black uppercase text-xs tracking-[0.2em] text-slate-400 italic mb-8">Revenue Trend (Last 10 Sales)</h3>
        <div className="h-[300px] w-full">
          {chartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center border border-dashed border-slate-800 rounded-2xl">
              <p className="text-slate-500 italic text-sm">No sales analytics data available to compile chart view.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="id" hide />
                <YAxis stroke="#475569" fontSize={10} tickFormatter={(val) => `₦${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '15px' }} itemStyle={{ color: '#f97316' }} />
                <Bar dataKey="total_price" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f97316' : '#ea580c'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 bg-slate-900/20"><h3 className="font-black uppercase text-xs tracking-[0.2em] italic text-slate-400">Real-Time Ledger</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] border-b border-slate-800 bg-black/20"><th className="p-6">Date & Time</th><th className="p-6">Method</th><th className="p-6 text-right">Revenue</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {sales.length === 0 ? (
                <tr><td colSpan="3" className="p-10 text-center text-slate-500 italic">No transactions recorded yet.</td></tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id || sale._id} className="hover:bg-orange-500/[0.02] transition-colors group">
                    <td className="p-6 text-xs font-bold text-slate-400">{sale.created_at ? `${new Date(sale.created_at).toLocaleDateString()} • ${new Date(sale.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'N/A'}</td>
                    <td className="p-6"><span className="px-3 py-1 rounded-full text-[9px] font-black uppercase border border-slate-700 text-slate-400">{sale.payment_method || 'Cash'}</span></td>
                    <td className="p-6 text-right font-black text-orange-500">₦{Number(sale.total_price || 0).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;