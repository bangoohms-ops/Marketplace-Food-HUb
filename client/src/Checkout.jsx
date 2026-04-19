import React, { useState } from 'react';

const Checkout = ({ cart, total, onBack }) => {
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [isProcessing, setIsProcessing] = useState(false);

  // Use the 'total' prop passed from App.jsx as the subtotal
  const subtotalAmount = Number(total) || 0; 
  const deliveryFee = subtotalAmount > 0 ? 1500 : 0;
  const grandTotal = subtotalAmount + deliveryFee;

  const handleOrder = async () => {
    if (!address.trim()) return alert("Please enter a delivery address!");
    body: JSON.stringify({
  address,
  paymentMethod,
  subtotal: total,
  deliveryFee,
  grandTotal,
  items: cart 
})
    
    setIsProcessing(true);

    // Final check: Ensure we aren't sending a null subtotal
    if (subtotalAmount === 0) {
      alert("Your cart seems to be empty.");
      setIsProcessing(false);
      return;
    }

    try {
      console.log("Sending Order Data:", { 
        address, 
        paymentMethod, 
        subtotal: subtotalAmount, 
        grandTotal 
      });

      
const response = await axios.post("https://marketplace-food-hub.onrender.com/api/order", {
    address,
    paymentMethod,
    subtotal: total,
    deliveryFee,
    grandTotal,
    items: cart 
});

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`🚀 BANGO! Order #${result.orderId} received.`);
        window.location.reload(); 
      } else {
        throw new Error(result.error || "Order failed to save");
      }
    } catch (err) {
      console.error("Checkout Sync Error:", err);
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* LEFT: FORM */}
        <div className="space-y-10">
          <div>
            <button onClick={onBack} className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
              ← Back to Menu
            </button>
            <h2 className="text-6xl font-black tracking-tighter">Checkout.</h2>
          </div>

          <div className="space-y-6">
            <textarea 
              placeholder="Delivery Address" 
              className="w-full p-8 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-black transition h-40 text-lg" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setPaymentMethod('transfer')} 
                className={`py-5 rounded-2xl font-bold border-2 transition ${paymentMethod === 'transfer' ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-400'}`}
              >
                Transfer
              </button>
              <button 
                onClick={() => setPaymentMethod('pod')} 
                className={`py-5 rounded-2xl font-bold border-2 transition ${paymentMethod === 'pod' ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-400'}`}
              >
                On Delivery
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: SUMMARY */}
        <div className="bg-gray-50 rounded-[3rem] p-10 h-fit">
          <h3 className="text-2xl font-black mb-8">Summary</h3>
          
          <div className="space-y-4 mb-8">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between font-bold">
                <span>{item.name} x{item.quantity}</span>
                <span>₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-6 space-y-2">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>₦{subtotalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-3xl font-black pt-4">
              <span>Total</span>
              <span>₦{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <button 
            onClick={handleOrder} 
            disabled={isProcessing}
            className="w-full mt-10 py-6 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest text-lg disabled:bg-gray-300"
          >
            {isProcessing ? "Sending..." : "Confirm Bango Order"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Checkout;