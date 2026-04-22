import React, { useState } from 'react';
import axios from 'axios';

const Checkout = ({ cart, total, onBack }) => {
  const [address, setAddress] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryType, setDeliveryType] = useState('standard'); 
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotalAmount = Number(total) || 0;
  
  const deliveryRates = {
    standard: 1500,
    express: 2500 
  };

  const deliveryFee = subtotalAmount > 0 ? deliveryRates[deliveryType] : 0;
  const grandTotal = subtotalAmount + deliveryFee;

  const handlePaystack = () => {
    if (!email || !address || !fullName || !phone) {
      return alert("Oga, please fill in all details before payment!");
    }

    const handler = window.PaystackPop.setup({
      key: 'pk_test_fb54dc6eb6432c5a2295463d44519ff31ef6cdf4', 
      email: email,
      amount: grandTotal * 100,
      currency: 'NGN',
      callback: (response) => {
        handleOrder(`Paid via Paystack (Ref: ${response.reference})`);
      },
      onClose: () => alert('Transaction cancelled.'),
    });
    handler.openIframe();
  };

  const handleOrder = async (status = "Pending") => {
    setIsProcessing(true);
    try {
      await axios.post('https://marketplace-food-hub-1.onrender.com/api/orders', {
        fullName,
        phone,
        email,
        address,
        subtotal: subtotalAmount,
        deliveryFee,
        deliveryType,
        grandTotal,
        paymentStatus: status,
        items: cart 
      });
      alert("🚀 BANGO! Order received. Rider is warming up the bike!");
      window.location.reload();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <button onClick={onBack} className="mb-6 text-gray-500 hover:text-orange-500 text-xs uppercase tracking-widest transition-colors">
          ← Back to Hub
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          
          {/* Left Column: Summary & Logistics */}
          <div className="space-y-6">
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-orange-500 italic uppercase">Order Review</h2>
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-orange-500 font-bold text-sm">{item.quantity}x</span>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono text-orange-400 text-sm">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bike Selection */}
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-sm font-black mb-4 uppercase tracking-widest text-gray-400">Select Delivery Speed</h2>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setDeliveryType('standard')}
                  className={`p-4 rounded-xl border-2 transition-all ${deliveryType === 'standard' ? 'border-orange-500 bg-orange-500/5' : 'border-white/5 bg-black/20 opacity-50'}`}
                >
                  <p className="font-black italic uppercase text-xs">Standard Bike</p>
                  <p className="text-[10px] text-gray-500 mb-2">45-60 Mins Delivery</p>
                  <p className="text-orange-500 font-bold text-lg">₦1,500</p>
                </button>
                <button 
                  onClick={() => setDeliveryType('express')}
                  className={`p-4 rounded-xl border-2 transition-all ${deliveryType === 'express' ? 'border-yellow-400 bg-yellow-400/5' : 'border-white/5 bg-black/20 opacity-50'}`}
                >
                  <p className="font-black italic uppercase text-xs">Express Rider</p>
                  <p className="text-[10px] text-gray-500 mb-2">Priority Dispatch</p>
                  <p className="text-yellow-400 font-bold text-lg">₦2,500</p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Payment */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-8 shadow-2xl h-fit">
            <h2 className="text-xl font-bold mb-8 text-green-400 italic uppercase">Delivery Details</h2>
            
            <div className="space-y-5">
              <div className="group">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block group-focus-within:text-orange-500 transition-colors">Full Name</label>
                <input 
                  type="text" placeholder="Enodien Emmanuel" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-orange-500 transition-all placeholder:text-gray-800"
                />
              </div>

              <div className="group">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block group-focus-within:text-orange-500 transition-colors">Email Address</label>
                <input 
                  type="email" placeholder="enodien@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-orange-500 transition-all placeholder:text-gray-800"
                />
              </div>

              <div className="group">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block group-focus-within:text-orange-500 transition-colors">Exact Delivery Address</label>
                <input 
                  type="text" placeholder="Egbeda, Ojuelegba, etc..." value={address} onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-orange-500 transition-all placeholder:text-gray-800"
                />
              </div>

              <div className="group">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block group-focus-within:text-orange-500 transition-colors">Phone Number</label>
                <input 
                  type="tel" placeholder="080XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-orange-500 transition-all placeholder:text-gray-800"
                />
              </div>

              <div className="pt-6 border-t border-white/5 mt-8">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Grand Total</span>
                  <span className="text-4xl font-black text-orange-500 italic drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                    ₦{grandTotal.toLocaleString()}
                  </span>
                </div>

                <button 
                  onClick={handlePaystack}
                  className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white font-black py-5 rounded-2xl uppercase tracking-tighter text-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all mb-4"
                >
                  Pay via Bank Transfer
                </button>

                <button 
                  onClick={() => handleOrder("Cash on Delivery")}
                  disabled={isProcessing}
                  className="w-full bg-transparent border border-white/10 text-gray-500 font-bold py-3 rounded-xl uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                >
                  Or Pay on Delivery
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;