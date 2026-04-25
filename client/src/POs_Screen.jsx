import React, { useState } from 'react';
import axios from 'axios';


const POS_Screen = () => {
  const [activeCart, setActiveCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isCartOpen, setIsCartOpen] = useState(false); 
  const [loading, setLoading] = useState(false);

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
    if (activeCart.length === 0) return alert("Cart is empty!");
    const saleData = {
      items: activeCart,
      total_price: total,
      payment_method: paymentMethod,
      staff_name: "Admin"
    };

    try {
    
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5001' 
  : 'https://marketplace-food-hub-1.onrender.com';

const response = await axios.post(`${API_BASE_URL}/api/sales`, saleData);
      if (response.status === 201 || response.status === 200) {
        alert("✅ Sale Recorded!");
        setActiveCart([]);
        setIsCartOpen(false);
      }
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.error || "Check Server"}`);
    }
  };

  return (
    /* Changed to h-screen to keep the layout contained, but children will scroll */
    <div className="flex flex-col md:flex-row h-screen bg-[#0f172a] text-white font-sans overflow-hidden">
      
      {/* 1. MENU SECTION */}
      {/* Added overflow-y-auto and h-full to ensure this column scrolls independently */}
      <div className={`flex-1 p-4 md:p-6 h-full overflow-y-auto custom-scrollbar ${isCartOpen ? 'hidden md:block' : 'block'}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-black italic text-orange-500 uppercase tracking-tighter">Fresh Foods POS</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Shop: Maryland_01</p>
          </div>
          {/* Mobile Cart Toggle */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="md:hidden bg-orange-500 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-900/40"
          >
            🛒 {activeCart.length}
          </button>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-10">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-slate-800 border border-slate-700 p-4 md:p-6 rounded-2xl active:scale-95 hover:border-orange-500/50 transition-all text-left group"
            >
              <p className="text-slate-500 text-[9px] uppercase font-bold mb-1 tracking-wider">{item.category}</p>
              <p className="font-bold text-sm md:text-lg mb-2 group-hover:text-orange-400 line-clamp-1">{item.name}</p>
              <p className="text-orange-500 font-mono font-bold text-sm">₦{item.price.toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. BILLING PANEL */}
      {/* Ensure height is 100% and overflow handles internal scrolling */}
      <div className={`
        fixed inset-0 z-50 bg-white md:relative md:inset-auto md:flex md:w-1/3 text-slate-900 flex-col shadow-2xl h-full
        ${isCartOpen ? 'flex' : 'hidden md:flex'}
      `}>
        {/* Fixed Header for Billing */}
        <div className="p-4 border-b flex justify-between items-center md:p-6 shrink-0">
          <h2 className="text-lg font-black uppercase tracking-tight">Current Order</h2>
          <button onClick={() => setIsCartOpen(false)} className="md:hidden font-bold text-orange-500 uppercase text-xs">← Back</button>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-white">
          {activeCart.length === 0 ? (
            <div className="text-center mt-20">
              <p className="text-slate-400 italic text-sm">No items added yet.</p>
            </div>
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

        {/* Fixed Footer for Totals/Payment */}
        <div className="p-4 md:p-6 bg-slate-50 border-t space-y-4 shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Total Bill</span>
            <span className="text-2xl md:text-3xl font-black text-orange-600 italic">₦{total.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['Cash', 'Transfer', 'POS'].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all border-2 ${
                  paymentMethod === method 
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
          
          <button 
            className="w-full bg-green-600 text-white font-black py-4 md:py-5 rounded-2xl uppercase tracking-widest text-base md:text-lg shadow-xl hover:bg-green-700 transition-colors active:translate-y-1"
            onClick={handleCompleteSale}
          >
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS_Screen;