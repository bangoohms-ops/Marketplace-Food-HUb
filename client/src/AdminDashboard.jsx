import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/admin/stats');
        setData(res.data);
      } catch (err) {
        console.error("Dashboard Load Error", err);
      }
    };
    fetchStats();
  }, []);

  if (!data) return <div className="p-10 text-white animate-pulse font-black uppercase tracking-widest">Loading CEO Insights...</div>;

  // Formatting data for the Bar Chart (Last 10 sales)
  const chartData = data.recentSales.slice(0, 10).reverse();

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white p-4 md:p-10 font-sans custom-scrollbar">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Executive Overview</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Fresh Food Hub • Maryland Analytics</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-6 py-3 rounded-2xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live Data Sync</p>
        </div>
      </div>

      {/* 2. METRIC CARDS (Top Row) */}
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

      {/* 3. BAR CHART FORMAT (Visual Trend) */}
      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] mb-10">
        <div className="flex justify-between items-center mb-8">
            <h3 className="font-black uppercase text-xs tracking-[0.2em] text-slate-400 italic">Revenue Trend (Recent Sales)</h3>
            <div className="flex gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded-sm"></span>
                <span className="text-[9px] uppercase font-bold text-slate-500">Sales Amount</span>
            </div>
        </div>
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
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}
                itemStyle={{ color: '#f97316' }}
                formatter={(value) => [`₦${value.toLocaleString()}`, "Amount"]}
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

      {/* 4. TABULAR FORMAT (Detailed Transactions) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
            <h3 className="font-black uppercase text-xs tracking-[0.2em] italic text-slate-400">Transaction Ledger</h3>
            <button className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold px-4 py-2 rounded-full transition-all uppercase">Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] border-b border-slate-800 bg-black/20">
                <th className="p-6 font-black">Time</th>
                <th className="p-6 font-black">Transaction ID</th>
                <th className="p-6 font-black">Method</th>
                <th className="p-6 font-black text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {data.recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-orange-500/[0.02] transition-colors group">
                  <td className="p-6 text-xs font-bold text-slate-400">
                    {new Date(sale.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                  </td>
                  <td className="p-6 text-[10px] font-mono text-slate-500 uppercase">
                    #TXN-{sale.id.toString().padStart(4, '0')}
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                      sale.payment_method === 'Cash' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                      sale.payment_method === 'POS' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                      'bg-purple-500/10 border-purple-500/20 text-purple-500'
                    }`}>
                        {sale.payment_method}
                    </span>
                  </td>
                  <td className="p-6 text-right font-black text-orange-500 group-hover:scale-110 transition-transform origin-right">
                    ₦{Number(sale.total_amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.recentSales.length === 0 && (
            <div className="p-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">
                No transactions recorded today.
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Spacer */}
      <div className="h-20"></div>
    </div>
  );
};

export default AdminDashboard;