import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const AdminDashboard = () => {
  // MOCK DATA: This ensures the dashboard works even if the backend is down
  const mockData = {
    summary: {
      total_revenue: 1250000,
      total_orders: 45,
      avg_sale: 27777
    },
    recentSales: [
      { id: 101, total_amount: 45000, payment_method: 'POS', created_at: new Date().toISOString() },
      { id: 102, total_amount: 12000, payment_method: 'Cash', created_at: new Date().toISOString() },
      { id: 103, total_amount: 15000, payment_method: 'Transfer', created_at: new Date().toISOString() },
      { id: 104, total_amount: 65000, payment_method: 'POS', created_at: new Date().toISOString() },
      { id: 105, total_amount: 22000, payment_method: 'Cash', created_at: new Date().toISOString() },
    ]
  };

  const [data, setData] = useState(mockData); // Initialize with mockData immediately

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // UNCOMMENT the lines below when your Neon backend is ready to go live
        /*
        const res = await axios.get('http://localhost:5001/api/admin/stats');
        setData(res.data);
        */
      } catch (err) {
        console.error("Dashboard Load Error - Falling back to mock data", err);
      }
    };
    fetchStats();
  }, []);

  if (!data) return <div className="p-10 text-white animate-pulse font-black uppercase tracking-widest text-center">Loading Bango! Insights...</div>;

  const chartData = [...data.recentSales].reverse();

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white p-4 md:p-10 font-sans custom-scrollbar">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-orange-500">Executive Overview</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Bango! Food Hub • Maryland Analytics</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-6 py-3 rounded-2xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live Preview Mode</p>
        </div>
      </div>

      {/* 2. METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-8 rounded-[2.5rem] shadow-2xl shadow-orange-900/20">
          <p className="text-orange-200 uppercase text-[10px] font-black tracking-[0.2em] mb-2">Total Revenue</p>
          <p className="text-4xl font-black">₦{Number(data.summary.total_revenue).toLocaleString()}</p>
        </div>
        
        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[2.5rem]">
          <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] mb-2">Total Orders</p>
          <p className="text-4xl font-black">{data.summary.total_orders}</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[2.5rem]">
          <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] mb-2">Average Sale</p>
          <p className="text-4xl font-black">₦{Math.round(data.summary.avg_sale).toLocaleString()}</p>
        </div>
      </div>

      {/* 3. BAR CHART */}
      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] mb-10">
        <h3 className="font-black uppercase text-xs tracking-[0.2em] text-slate-400 italic mb-8">Revenue Trend</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="id" hide />
              <YAxis 
                stroke="#475569" 
                fontSize={10} 
                tickFormatter={(val) => `₦${val/1000}k`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '15px' }}
                itemStyle={{ color: '#f97316' }}
              />
              <Bar dataKey="total_amount" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f97316' : '#ea580c'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. TRANSACTION TABLE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
            <h3 className="font-black uppercase text-xs tracking-[0.2em] italic text-slate-400">Transaction Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] border-b border-slate-800 bg-black/20">
                <th className="p-6">Time</th>
                <th className="p-6">Method</th>
                <th className="p-6 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {data.recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-orange-500/[0.02] transition-colors group">
                  <td className="p-6 text-xs font-bold text-slate-400">
                    {new Date(sale.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase border border-slate-700 text-slate-400">
                        {sale.payment_method}
                    </span>
                  </td>
                  <td className="p-6 text-right font-black text-orange-500">
                    ₦{Number(sale.total_amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;