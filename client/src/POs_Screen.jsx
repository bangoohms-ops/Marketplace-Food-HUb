import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, AlertCircle, ShoppingBag, X } from 'lucide-react';

const POS_Screen = () => {
  const [activeCart, setActiveCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isCartOpen, setIsCartOpen] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSaleTotal, setLastSaleTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const menuItems = [
    { id: 1, name: "Jollof Rice (Large)", price: 3500, category: "Main" },
    { id: 2, name: "Fried Yam & Fish", price: 4500, category: "Main" },
    { id: 3, name: "Turkey Wings", price: 2500, category: "Sides" },
    { id: 4, name: "Chapman", price: 1500, category: "Drinks" },
    { id: 5, name: "Bottle Water", price: 500, category: "Drinks" },
    { id: 6, name: "Extra Plantain", price: 1000, category: "Sides" },
    { id: 7, name: "Coleslaw", price: 800, category: "Sides" },
    { id: 8, name: "Moi Moi", price: 1500, category: "Sides" },
  ];

  const addToCart = (item) => {
    const existing = activeCart.find(cartItem => cartItem.id === item.id);
    if (existing) {
      setActiveCart(activeCart.map(i => i.id === item.id ? {...i, qty: i.qty + 1} : i));
    } else {
      setActiveCart([...activeCart, { ...item, qty: 1 }]);
    }
  };

  const total = activeCart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCompleteSale = async () => {
    if (activeCart.length === 0) {
      setErrorMessage("Cannot process an empty cart layout.");
      return;
    }
    
    const saleData = {
      items: activeCart,
      total_price: total,
      payment_method: paymentMethod,
      staff_name: "Admin"
    };

    setLoading(true);
    setErrorMessage(null);

    try {
      // Targets your live Render backend directly
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://abbey-bank-dashboard-2a8h.onrender.com';
      const response = await axios.post(`${API_BASE_URL}/api/sales`, saleData);
      
      if (response.status === 201 || response.status === 200) {
        setLastSaleTotal(total);
        setShowSuccess(true);
        setActiveCart([]);
        setIsCartOpen(false);
      }
    } catch (err) {
      console.error("POS Sale Error:", err);
      setErrorMessage(err.response?.data?.error || "Failed to reach transaction engine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0f172a] text-white font-sans overflow-hidden relative">
      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl shadow-emerald-900/20 transform scale-100 transition-all duration-300">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle size={36} className="animate-pulse" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1">Transaction Verified</h3>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-6">Sale Recorded Successfully</p>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Amount Settled ({paymentMethod})</span>
              <span className="text-2xl font-black text-orange-500 font-mono">₦{lastSaleTotal.toLocaleString()}</span>
            </div>
            <button onClick={() => setShowSuccess(false)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-colors shadow-lg shadow-emerald-900/40">Next Order →</button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4 animate-slideDown">
          <div className="bg-rose-950/90 backdrop-blur border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-rose-200 shadow-xl">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-400 shrink-0" />
              <p className="text-xs font-medium tracking-wide">{errorMessage}</p>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white transition p-1"><X size={16} /></button>
          </div>
        </div>
      )}

      <div className={`flex-1 p-4 md:p-6 h-full overflow-y-auto custom-scrollbar ${isCartOpen ? 'hidden md:block' : 'block'}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-black italic text-orange-500 uppercase tracking-tighter">Fresh Foods POS</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Shop: Maryland_01</p>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="md:hidden bg-orange-500 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-900/40">🛒 {activeCart.length}</button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-10">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => addToCart(item)} className="bg-slate-800 border border-slate-700 p-4 md:p-6 rounded-2xl active:scale-95 hover:border-orange-500/50 transition-all text-left group">
              <p className="text-slate-500 text-[9px] uppercase font-bold mb-1 tracking-wider">{item.category}</p>
              <p className="font-bold text-sm md:text-lg mb-2 group-hover:text-orange-400 line-clamp-1">{item.name}</p>
              <p className="text-orange-500 font-mono font-bold text-sm">₦{item.price.toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>

      <div className={`fixed inset-0 z-50 bg-white md:relative md:inset-auto md:flex md:w-1/3 text-slate-900 flex-col shadow-2xl h-full ${isCartOpen ? 'flex' : 'hidden md:flex'}`}>
        <div className="p-4 border-b flex justify-between items-center md:p-6 shrink-0">
          <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2"><ShoppingBag size={18} className="text-orange-500" /> Current Order</h2>
          <button onClick={() => setIsCartOpen(false)} className="md:hidden font-bold text-orange-500 uppercase text-xs">← Back</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-white">
          {activeCart.length === 0 ? (
            <div className="text-center mt-20"><p className="text-slate-400 italic text-sm">No items added yet.</p></div>
          ) : (
            activeCart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <p className="font-bold text-sm text-slate-800">{item.name}</p>
                  <p className="text-[11px] text-slate-500">₦{item.price.toLocaleString()} × {item.qty}</p>
                </div>
                <p className="font-bold text-sm text-slate-900">₦{(item.price * item.qty).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 md:p-6 bg-slate-50 border-t space-y-4 shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Total Bill</span>
            <span className="text-2xl md:text-3xl font-black text-orange-600 italic">₦{total.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['Cash', 'Transfer', 'POS'].map((method) => (
              <button key={method} type="button" onClick={() => setPaymentMethod(method)} className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all border-2 ${paymentMethod === method ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-slate-600 border-slate-200'}`}>{method}</button>
            ))}
          </div>
          <button type="button" disabled={loading} className="w-full bg-green-600 disabled:bg-slate-400 text-white font-black py-4 md:py-5 rounded-2xl uppercase tracking-widest text-base md:text-lg shadow-xl hover:bg-green-700 transition-colors active:translate-y-1 flex justify-center items-center" onClick={handleCompleteSale}>
            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Complete Sale"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS_Screen;