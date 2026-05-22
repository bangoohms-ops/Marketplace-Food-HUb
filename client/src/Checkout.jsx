import React, { useState } from "react";
import axios from "axios";

const Checkout = ({ cart, total, onBack }) => {
  const [address, setAddress] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryType, setDeliveryType] = useState("standard");
  const [isProcessing, setIsProcessing] = useState(false);
  const subtotalAmount = Number(total) || 0;

  const deliveryRates = {
    standard: 1500,
    express: 2500,
  };

  const deliveryFee = subtotalAmount > 0 ? deliveryRates[deliveryType] : 0;
  const grandTotal = subtotalAmount + deliveryFee;

  // --- 1. FIXED WHATSAPP LOGIC ---
  const sendWhatsAppNotification = (cartItems, reference) => {
    const myNumber = "2347018780492";

    const orderSummary = cartItems
      .map((item) => `${item.quantity}x ${item.name}`)
      .join("%0A");

    const message =
      `*New Order Confirmed!* 🚀%0A%0A` +
      `*Customer:* ${fullName}%0A` +
      `*Items:*%0A${orderSummary}%0A%0A` +
      `*Total Paid:* ₦${grandTotal.toLocaleString()}%0A` +
      `*Ref:* ${reference}%0A` +
      `*Delivery:* ${address}`;

    // Cleaned up the URL (removed the extra '}')
    window.open(`https://wa.me/${myNumber}?text=${message}`, "_blank");
  };

  const handlePaystack = () => {
    if (!email || !address || !fullName || !phone) {
      return alert("Oga, please fill in all details before payment!");
    }

    const handler = window.PaystackPop.setup({
      key: "pk_test_fb54dc6eb6432c5a2295463d44519ff31ef6cdf4",
      email: email,
      amount: grandTotal * 100,
      currency: "NGN",
      callback: (response) => {
        // Now passing the reference to the handleOrder function
        handleOrder(`Paid via Paystack`, response.reference);
      },
      onClose: () => alert("Transaction cancelled."),
    });
    handler.openIframe();
  };

  const handleOrder = async (status = "Pending", ref = "N/A") => {
    setIsProcessing(true);
    try {
      await axios.post(
        "https://marketplace-food-hub-1.onrender.com/api/orders",
        {
          fullName,
          phone,
          email,
          address,
          subtotal: subtotalAmount,
          deliveryFee,
          deliveryType,
          grandTotal,
          paymentStatus: status,
          items: cart,
        },
      );

      // --- 2. THE TRIGGER: This runs the WhatsApp function after the DB save ---
      sendWhatsAppNotification(cart, ref);

      alert("🚀 BANGO! Order received. Rider is warming up the bike!");

      // Note: We reload AFTER the alert so the WhatsApp tab has time to open
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
        <button
          onClick={onBack}
          className="mb-6 text-gray-500 hover:text-orange-500 text-xs uppercase tracking-widest transition-colors"
        >
          ← Back to Hub
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          <div className="space-y-6">
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-orange-500 italic uppercase">
                Order Review
              </h2>
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b border-white/5 pb-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-orange-500 font-bold text-sm">
                        {item.quantity}x
                      </span>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono text-orange-400 text-sm">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-sm font-black mb-4 uppercase tracking-widest text-gray-400">
                Select Delivery Speed
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDeliveryType("standard")}
                  className={`p-4 rounded-xl border-2 transition-all ${deliveryType === "standard" ? "border-orange-500 bg-orange-500/5" : "border-white/5 bg-black/20 opacity-50"}`}
                >
                  <p className="font-black italic uppercase text-xs">
                    Standard
                  </p>
                  <p className="text-orange-500 font-bold text-lg">₦1,500</p>
                </button>
                <button
                  onClick={() => setDeliveryType("express")}
                  className={`p-4 rounded-xl border-2 transition-all ${deliveryType === "express" ? "border-yellow-400 bg-yellow-400/5" : "border-white/5 bg-black/20 opacity-50"}`}
                >
                  <p className="font-black italic uppercase text-xs">Express</p>
                  <p className="text-yellow-400 font-bold text-lg">₦2,500</p>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#141414] border border-white/5 rounded-2xl p-8 shadow-2xl h-fit">
            <h2 className="text-xl font-bold mb-8 text-green-400 italic uppercase">
              Details
            </h2>
            <div className="space-y-5">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-orange-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-orange-500"
              />
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-orange-500"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-orange-500"
              />

              <div className="pt-6 border-t border-white/5 mt-8">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                    Total
                  </span>
                  <span className="text-4xl font-black text-orange-500 italic">
                    ₦{grandTotal.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handlePaystack}
                  className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white font-black py-5 rounded-2xl uppercase tracking-tighter text-lg shadow-lg hover:brightness-110 transition-all"
                >
                  Pay Now
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
