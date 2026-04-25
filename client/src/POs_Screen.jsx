import React, { useState } from 'react';
import axios from 'axios';

const POS_Screen = () => {
  const [activeCart, setActiveCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const menuItems = [
    { id: 1, name: "Jollof Rice (Large)", price: 3500, category: "Main" },
    { id: 2, name: "Turkey Wings", price: 2500, category: "Sides" },
    { id: 4, name: "Chapman", price: 1500, category: "Drinks" },
  ];

  const addToCart = (item) => {
    const existing = activeCart.find(i => i.id === item.id);
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
      total_price: Number(total), // Clean number
      payment_method: paymentMethod,
      staff_name: "Admin"
    };

    try {
      const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5001' 
        : 'https://marketplace-food-hub-1.onrender.com';

      const response = await axios.post(`${API_BASE_URL}/api/sales`, saleData);
      if (response.status === 201) {
        alert("✅ Sale Recorded!");
        setActiveCart([]);
        setIsCartOpen(false);
      }
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.details || "Server Error"}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0f172a] text-white overflow-hidden">
      {/* Menu UI code... (unchanged from your original) */}
      <div className="flex-1 p-6 overflow-y-auto">
         <h1 className="text-2xl font-black text-orange-500 italic mb-6">BANGO POS</h1>
         <div className="grid grid-cols-2 gap-4">
            {menuItems.map(item => (
                <button key={item.id} onClick={() => addToCart(item)} className="bg-slate-800 p-6 rounded-2xl text-left border border-slate-700 active:scale-95">
                    <p className="text-xs text-slate-400 uppercase font-bold">{item.category}</p>
                    <p className="font-bold text-lg">{item.name}</p>
                    <p className="text-orange-500 font-mono">₦{item.price.toLocaleString()}</p>
                </button>
            ))}
         </div>
      </div>

      {/* Cart Panel UI code... (unchanged from your original) */}
      <div className="w-full md:w-1/3 bg-white text-slate-900 flex flex-col">
          <div className="p-6 flex-1 overflow-y-auto">
              <h2 className="font-black uppercase mb-4">Current Order</h2>
              {activeCart.map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b py-2 text-sm">
                      <span>{item.name} x {item.qty}</span>
                      <span className="font-bold">₦{(item.price * item.qty).toLocaleString()}</span>
                  </div>
              ))}
          </div>
          <div className="p-6 bg-slate-50 border-t">
              <div className="flex justify-between mb-4">
                  <span className="font-bold">TOTAL</span>
                  <span className="text-2xl font-black text-orange-600">₦{total.toLocaleString()}</span>
              </div>
              <button onClick={handleCompleteSale} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold uppercase">Complete Sale</button>
          </div>
      </div>
    </div>
  );
};
export default POS_Screen;