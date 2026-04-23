import React, { useState, useEffect } from 'react';
import Checkout from './Checkout';
import POS_Screen from './POS_Screen';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('menu'); // 'menu', 'checkout', 'login', 'pos'
  
  const [pinInput, setPinInput] = useState("");
  const ADMIN_PIN = "1234"; 

  // Full Menu Data
  const sampleData = [
    { id: 1, name: "Edikiakong Special", price: 8500, image_url: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800", category: "Main Dish" },
    { id: 2, name: "Abula Special", price: 4000, image_url: "https://images.unsplash.com/photo-1628102422204-706cc6e3c0b1?w=800", category: "Swallow" },
    { id: 3, name: "Pounded Yam & Egusi", price: 6000, image_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800", category: "Swallow" },
    { id: 4, name: "Seafood Okra", price: 7500, image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800", category: "Soups" },
    { id: 5, name: "Grilled Catfish & Bole", price: 12000, image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800", category: "Grills" },
    { id: 6, name: "Spicy Asun (Goat Meat)", price: 3500, image_url: "https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?w=800", category: "Sides" },
    { id: 7, name: "Sweet & Sour Chicken", price: 6800, image_url: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800", category: "Chinese" },
    { id: 8, name: "Grilled Chicken Caesar", price: 5200, image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800", category: "Salads" },
    { id: 9, name: "Classic Coleslaw Side", price: 1500, image_url: "https://images.unsplash.com/photo-1625943555419-56a2cb596640?w=800", category: "Salads" },
    { id: 12, name: "Bango Special Wings", price: 4800, image_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800", category: "Sides" },
    { id: 15, name: "Golden Fried Yam & Eggs", price: 3500, image_url: "https://images.unsplash.com/photo-1599307767316-776533da941c?w=800", category: "Sides" },
  ];

  // 1. Fetch Products from Database
  useEffect(() => {
    fetch('https://marketplace-food-hub-1.onrender.com/api/products')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setProducts(data);
        else setProducts(sampleData);
      })
      .catch(() => setProducts(sampleData));
  }, []);

  // 2. Login Logic
  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setView('pos');
      setPinInput("");
    } else {
      alert("⚠️ Invalid Credentials. Please try again.");
      setPinInput("");
    }
  };

  // 3. Cart Functions
  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists?.quantity === 1) {
        return prev.filter(item => item.id !== product.id);
      }
      return prev.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const getItemQty = (id) => cart.find(item => item.id === id)?.quantity || 0;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      
      {/* VIEW: CUSTOMER MENU */}
      {view === 'menu' && (
        <>
          <header className="flex justify-between items-center px-10 py-8 sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
            <h1 className="text-4xl font-black tracking-tighter">BANGO<span className="text-green-600">!</span></h1>
            <div className="flex gap-6 items-center">
               <button onClick={() => setView('login')} className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-black transition-colors">
                Management Login
              </button>
              <button onClick={() => setView('checkout')} className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition">
                Cart ({totalItems})
              </button>
            </div>
          </header>
          
          <main className="px-10 py-16 max-w-[1400px] mx-auto">
            <h2 className="text-7xl font-black tracking-tighter mb-16">The Menu.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {products.map((product) => (
                <div key={product.id} className="group">
                  <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-100 aspect-[4/5] mb-6">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  </div>
                  
                  <div className="flex justify-between items-start px-2">
                    <h3 className="text-2xl font-bold tracking-tight">{product.name}</h3>
                    <p className="text-2xl font-black italic">₦{(parseFloat(product.price) || 0).toLocaleString()}</p>
                  </div>

                  <div className="mt-8">
                    {getItemQty(product.id) === 0 ? (
                      <button 
                        onClick={() => addToCart(product)} 
                        className="w-full py-5 bg-black text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-green-600 transition"
                      >
                        Add to Cart +
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-gray-100 rounded-2xl p-2 border-2 border-black">
                        <button onClick={() => removeFromCart(product)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl font-black text-2xl">-</button>
                        <span className="font-black text-2xl">{getItemQty(product.id)}</span>
                        <button onClick={() => addToCart(product)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl font-black text-2xl">+</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </>
      )}

      {/* VIEW: LOGIN FORM */}
      {view === 'login' && (
        <div className="h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#141414] border border-white/5 p-10 rounded-[3rem] shadow-2xl text-center">
            <div className="mb-8">
              <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter">Bango Admin</h2>
              <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Restricted Access</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-left">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 block ml-4">Manager PIN</label>
                <input 
                  type="password" 
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-black border border-white/10 text-white text-center text-3xl py-5 rounded-3xl focus:border-orange-500 outline-none transition-all"
                  autoFocus
                />
              </div>
              <button className="w-full bg-white text-black font-black py-5 rounded-3xl uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all">
                Sign In
              </button>
              <button type="button" onClick={() => setView('menu')} className="text-gray-600 text-xs font-bold uppercase tracking-widest">
                Return to Menu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW: CHECKOUT */}
      {view === 'checkout' && (
        <Checkout cart={cart} total={subtotal} onBack={() => setView('menu')} />
      )}

      {/* VIEW: POS ADMIN */}
      {view === 'pos' && (
        <div className="relative">
           <button 
            onClick={() => setView('menu')} 
            className="absolute top-4 left-4 z-[100] bg-white text-black px-6 py-2 rounded-full font-bold text-xs uppercase shadow-xl"
          >
            ← Logout
          </button>
          <POS_Screen />
        </div>
      )}

    </div>
  );
}

export default App;