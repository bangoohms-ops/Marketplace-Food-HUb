import React, { useState } from 'react';
import axios from 'axios';

const POS_Screen = () => {
  const [activeCart, setActiveCart] = useState([]);
  
  // Dummy data for your demo
  const menuItems = [
    { id: 1, name: "Jollof Rice (Large)", price: 3500, category: "Main" },
    { id: 2, name: "Fried Yam & Fish", price: 4500, category: "Main" },
    { id: 3, name: "Turkey Wings", price: 2500, category: "Sides" },
    { id: 4, name: "Chapman", price: 1500, category: "Drinks" },
    { id: 5, name: "Bottle Water", price: 500, category: "Drinks" },
    { id: 6, name: "Jollof Rice (Large)", price: 3500, category: "Main" },
    { id: 7, name: "Fried Yam & Fish", price: 4500, category: "Main" },
    { id: 8, name: "Turkey Wings", price: 2500, category: "Sides" },
    { id: 9, name: "Chapman", price: 1500, category: "Drinks" },
    { id: 10, name: "Bottle Water", price: 500, category: "Drinks" },
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

  // --- UPDATED LOGIC TO MATCH SERVER.JS ---
  const handleCompleteSale = async () => {
    if (activeCart.length === 0) return alert("Cart is empty!");

    const saleData = {
      items: activeCart,
      total_amount: total,      // Matches 'total_amount' in server.js destructuring
      payment_method: "Cash",    // Matches 'payment_method' in server.js
      staff_name: "Enodien Admin" // Matches 'staff_name' in server.js
    };

    try {
      // Updated to Port 5001 to match your server.js listener
      const response = await axios.post('http://localhost:5000/api/sales', saleData);
      
      if (response.status === 201 || response.status === 200) {
        alert("✅ Sale Recorded in Neon!");
        setActiveCart([]); // Clears the cart after success
      }
    } catch (err) {
      console.error("Sale Error Details:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || "Check if Server.js is running on Port 5001";
      alert(`❌ Failed to save sale: ${errorMsg}`);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-white font-sans overflow-hidden">
      
      {/* 1. LEFT SIDE: MENU GRID */}
      <div className="w-2/3 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black italic text-orange-500 uppercase tracking-tighter">Bango POS Admin</h1>
          <div className="bg-slate-800 px-4 py-2 rounded-full text-xs font-bold text-slate-400">Shop ID: Maryland_01</div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-slate-800 border border-slate-700 p-6 rounded-2xl hover:border-orange-500 hover:bg-slate-700 transition-all text-left group"
            >
              <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">{item.category}</p>
              <p className="font-bold text-lg mb-2 group-hover:text-orange-400">{item.name}</p>
              <p className="text-orange-500 font-mono font-bold">₦{item.price.toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. RIGHT SIDE: BILLING PANEL */}
      <div className="w-1/3 bg-white text-slate-900 flex flex-col shadow-2xl">
        <div className="p-6 border-b">
          <h2 className="text-lg font-black uppercase tracking-tight">Current Order</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeCart.length === 0 ? (
            <p className="text-slate-400 italic text-center mt-20 text-sm">Cart is empty. Click items to add.</p>
          ) : (
            activeCart.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{item.name}</p>
                  <p className="text-xs text-slate-500">₦{item.price} x {item.qty}</p>
                </div>
                <p className="font-bold text-sm">₦{(item.price * item.qty).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold uppercase text-xs">Total Bill</span>
            <span className="text-3xl font-black text-orange-600 italic">₦{total.toLocaleString()}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-slate-200 text-slate-700 font-bold py-4 rounded-xl text-xs uppercase hover:bg-slate-300">Save/Hold</button>
            <button className="bg-orange-500 text-white font-black py-4 rounded-xl text-xs uppercase shadow-lg shadow-orange-200 hover:brightness-110">Print Receipt</button>
          </div>
          
          <button 
            className="w-full bg-green-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-lg shadow-xl shadow-green-100 hover:bg-green-700"
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