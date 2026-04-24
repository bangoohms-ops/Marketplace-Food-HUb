import React, { useState, useEffect } from 'react';
import Checkout from './Checkout';
import POS_Screen from './POS_Screen';
import AdminDashboard from './AdminDashboard';

function App() {
  // 1. STATE MANAGEMENT
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('menu'); // 'menu', 'checkout', 'login', 'admin'
  const [adminTab, setAdminTab] = useState('pos'); // 'pos' or 'dashboard'
  const [userRole, setUserRole] = useState(null); // 'staff' or 'ceo'
  const [pinInput, setPinInput] = useState("");

  // 2. SECURITY CREDENTIALS
  const CREDENTIALS = {
    CEO: "0000",   
    STAFF: "1111"  
  };

  const sampleData = [
  // MAIN DISHES
  { id: 1, name: "Edikiakong Special", price: 8500, image_url: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800", category: "Main Dish" },
  { id: 2, name: "Abula Special", price: 4500, image_url: "https://images.unsplash.com/photo-1628102422204-706cc6e3c0b1?w=800", category: "Swallow" },
  { id: 3, name: "Pounded Yam & Egusi", price: 6500, image_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800", category: "Swallow" },
  { id: 4, name: "Seafood Okra", price: 9500, image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800", category: "Soups" },
  
  // GRILLS & SIDES
  { id: 5, name: "Grilled Catfish & Bole", price: 12500, image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800", category: "Grills" },
  { id: 6, name: "Spicy Asun (Goat Meat)", price: 4500, image_url: "https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?w=800", category: "Sides" },
  { id: 7, name: "Bango Special Wings", price: 5500, image_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800", category: "Sides" },
  { id: 8, name: "Golden Fried Yam & Eggs", price: 3800, image_url: "https://images.unsplash.com/photo-1599307767316-776533da941c?w=800", category: "Sides" },
  
  // CONTINENTAL & SALADS
  { id: 9, name: "Sweet & Sour Chicken", price: 7200, image_url: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800", category: "Chinese" },
  { id: 10, name: "Grilled Chicken Caesar", price: 5800, image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800", category: "Salads" },
  
  // DRINKS
  { id: 11, name: "Signature Chapman", price: 2500, image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800", category: "Drinks" },
  { id: 12, name: "Fresh Pineapple Juice", price: 2000, image_url: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800", category: "Drinks" }
];

  // 3. EFFECTS & FETCHING
  useEffect(() => {
    fetch('https://marketplace-food-hub-1.onrender.com/api/products')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setProducts(data);
        else setProducts(sampleData);
      })
      .catch(() => setProducts(sampleData));
  }, []);

  // 4. HANDLERS
  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === CREDENTIALS.CEO) {
      setUserRole('ceo');
      setView('admin');
      setAdminTab('dashboard');
      setPinInput("");
    } 
    else if (pinInput === CREDENTIALS.STAFF) {
      setUserRole('staff');
      setView('admin');
      setAdminTab('pos');
      setPinInput("");
    } 
    else {
      alert("⚠️ Access Denied. Invalid PIN.");
      setPinInput("");
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists?.quantity === 1) return prev.filter(item => item.id !== product.id);
      return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item);
    });
  };

  // Helper Stats
  const getItemQty = (id) => cart.find(item => item.id === id)?.quantity || 0;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen w-full max-w-full bg-white text-black font-sans overflow-x-hidden">
      
      {/* VIEW: CUSTOMER MENU */}
   {/* VIEW: CUSTOMER MENU */}
{view === 'menu' && (
  <>
    {/* HEADER: Added backdrop-blur for a premium glass feel */}
    <header className="fixed top-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl z-[100] border-b border-gray-100 px-4 md:px-10 flex justify-between items-center">
      <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
        FRESH FOODS<span className="text-orange-600">!</span>
      </h1>
      <div className="flex gap-4 md:gap-6 items-center">
        <button 
          onClick={() => setView('login')} 
          className="text-gray-400 text-[9px] font-bold uppercase tracking-widest hover:text-black transition-colors"
        >
          Staff Portal
        </button>
        <button 
          onClick={() => setView('checkout')} 
          className="bg-black text-white px-6 md:px-8 py-3 rounded-full font-bold text-xs md:text-sm uppercase tracking-widest hover:scale-105 transition shadow-lg"
        >
          Cart ({totalItems})
        </button>
      </div>
    </header>
    
    {/* MAIN: Added pt-32 to clear the fixed header and spacing for mobile */}
    <main className="pt-32 pb-16 px-6 md:px-10 max-w-[1400px] mx-auto">
      {/* Title Section: Added a small orange accent line */}
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-[2px] w-8 bg-orange-600"></div>
          <span className="text-orange-600 text-[10px] font-black uppercase tracking-[0.3em]">Maryland Lounge</span>
        </div>
        <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic leading-none">
          Our <span className="text-orange-600">Menu.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {products.map((product) => (
          <div key={product.id} className="group">
            {/* Image Container */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-100 aspect-[4/5] mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500">
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
              />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-1 rounded-full shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-black">{product.category || 'Special'}</p>
              </div>
            </div>

            {/* Product Details */}
            <div className="flex justify-between items-start px-2">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">{product.name}</h3>
              <p className="text-xl md:text-2xl font-black italic text-orange-600">₦{product.price.toLocaleString()}</p>
            </div>

            {/* Action Button */}
            <div className="mt-8">
              {getItemQty(product.id) === 0 ? (
                <button 
                  onClick={() => addToCart(product)} 
                  className="w-full py-5 bg-black text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg active:scale-95"
                >
                  Add To Cart +
                </button>
              ) : (
                <div className="flex items-center justify-between bg-gray-100 rounded-2xl p-2 border-2 border-black">
                  <button onClick={() => removeFromCart(product)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl font-black text-2xl hover:text-orange-600 transition">-</button>
                  <span className="font-black text-2xl">{getItemQty(product.id)}</span>
                  <button onClick={() => addToCart(product)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl font-black text-2xl hover:text-orange-600 transition">+</button>
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
            <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter mb-8">Fresh Foods Auth</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <input 
                type="password" 
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="ENTER PIN"
                className="w-full bg-black border border-white/10 text-white text-center text-4xl py-6 rounded-3xl focus:border-orange-500 outline-none transition-all tracking-[0.5em]"
                autoFocus
              />
              <button className="w-full bg-white text-black font-black py-5 rounded-3xl uppercase tracking-widest hover:bg-orange-500 transition-all">Verify Identity</button>
              <button type="button" onClick={() => setView('menu')} className="text-gray-600 text-xs font-bold uppercase tracking-widest block w-full mt-4">Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW: CHECKOUT */}
      {view === 'checkout' && <Checkout cart={cart} total={subtotal} onBack={() => setView('menu')} />}

      {/* VIEW: PROTECTED ADMIN SUITE */}
      {view === 'admin' && (
        <div className="flex flex-col min-h-screen bg-[#0f172a]">
          <nav className="bg-black border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-[100]">
            <div className="flex gap-2">
              <button onClick={() => setAdminTab('pos')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${adminTab === 'pos' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'text-gray-500 hover:text-white'}`}>POS System</button>
              {userRole === 'ceo' && (
                <button onClick={() => setAdminTab('dashboard')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${adminTab === 'dashboard' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'text-gray-500 hover:text-white'}`}>CEO Dashboard</button>
              )}
            </div>
            <div className="flex items-center gap-4">
               <span className="hidden md:block text-[9px] font-black text-orange-500 uppercase border border-orange-500/20 px-3 py-1 rounded-full">Session: {userRole}</span>
               <button onClick={() => { setView('menu'); setUserRole(null); }} className="text-[10px] font-black text-gray-500 hover:text-red-500 uppercase transition-colors">Logout</button>
            </div>
          </nav>
          <div className="flex-1">{adminTab === 'pos' ? <POS_Screen /> : <AdminDashboard />}</div>
        </div>
      )}
    </div>
  );
}

export default App;