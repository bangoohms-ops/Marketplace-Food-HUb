import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const AdminDashboard = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const API_BASE_URL = window.location.hostname === 'localhost' 
          ? 'http://localhost:5001' 
          : 'https://marketplace-food-hub-1.onrender.com';
        const res = await axios.get(`${API_BASE_URL}/api/sales`);
        setSales(res.data);
      } catch (err) {
        console.error("Dashboard Load Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <h1 className="text-3xl font-black italic text-orange-500 mb-8">CEO DASHBOARD</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* REVENUE CHART */}
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
          <h3 className="text-slate-400 text-xs font-black uppercase mb-4">Recent Revenue</h3>
          
          {/* THE FIX: Wrapper with height */}
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales.slice(0, 7).reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="created_at" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none' }}
                  itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                />
                <Bar dataKey="total_price" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT SALES LIST */}
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 overflow-hidden">
          <h3 className="text-slate-400 text-xs font-black uppercase mb-4">Latest Transactions</h3>
          <div className="space-y-4">
            {sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-sm font-bold">{sale.payment_method}</span>
                <span className="text-orange-500 font-mono font-bold">₦{Number(sale.total_price).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;