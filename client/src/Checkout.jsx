import React, { useState } from 'react';
import axios from 'axios';

const Checkout = ({ cart, total, onBack }) => {
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotalAmount = Number(total) || 0; 
  const deliveryFee = subtotalAmount > 0 ? 1500 : 0;
  const grandTotal = subtotalAmount + deliveryFee;

  const handleOrder = async () => {
    if (!address.trim()) return alert("Please enter a delivery address!");
    setIsProcessing(true);

    try {
      // POINTING TO RENDER API
      const response = await axios.post('https://marketplace-food-hub-1.onrender.com/api/orders', {
        address,
        paymentMethod,
        subtotal: subtotalAmount,
        deliveryFee,
        grandTotal,
        items: cart 
      });

      if (response.data.success) {
        alert(`🚀 BANGO! Order #${response.data.orderId} received.`);
        window.location.reload(); 
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
       {/* UI code remains the same as your previous version */}
       <button onClick={onBack}>← Back</button>
       <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
       <button onClick={handleOrder} disabled={isProcessing}>
         {isProcessing ? "Sending..." : "Confirm Bango Order"}
       </button>
    </div>
  );
};

export default Checkout;