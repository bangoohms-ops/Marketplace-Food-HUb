import React, { useState, useEffect } from 'react';
import Checkout from './Checkout';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('menu');

  // Updated Pricing for a Premium Pitch
 const sampleData = [
    { 
      id: 1, 
      name: "De-Stoned Rice (5kg)", 
      price: 6500, 
      image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800", 
      category: "Grains" 
    },
      { 
      id: 2, 
      name: "Bag of Onions", 
      price: 12000, 
      image_url: "https://images.unsplash.com/photo-1508747703725-719777637510?w=800", 
      category: "Vegetables" 
    },
     { 
      id: 3, 
      name: "Refined Palm Oil (2L)", 
      price: 4800, 
      image_url: "https://images.unsplash.com/photo-162070612211c-2f243020616b?w=800", 
      category: "Oils" 
    },
    { 
      id: 4, 
      name: "Yellow Garri (Paint Bucket)", 
      price: 3500, 
      image_url: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800", 
      category: "Staples" 
    },
   
    { 
      id: 5, 
      name: "Fresh Habanero (Atarodo)", 
      price: 2500, 
      image_url: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800", 
      category: "Vegetables" 
    },
    { 
      id: 6, 
      name: "Titus Fish (Frozen 5kg)", 
      price: 18500, 
      image_url: "https://images.unsplash.com/photo-1534939561122-3950781348f9?w=800", 
      category: "Protein" 
    },
    { 
      id: 7, 
      name: "Large Yam Tubers (3pcs)", 
      price: 9000, 
      image_url: "https://unsplash.com/photos/a-man-holds-a-root-vegetable-over-a-fire-dwk1JW76h5M", 
      category: "Tubers" 
    },
    { 
      id: 8, 
      name: "Vegetable Oil (3L)", 
      price: 7200, 
      image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800", 
      category: "Oils" 
    },
     { 
      id: 9, 
      name: "Oloyin Brown Beans", 
      price: 8200, 
      image_url: "https://plus.unsplash.com/premium_photo-1664647903498-386001738749?w=800", 
      category: "Legumes" 
    },
  
  ];
useEffect(() => {
  fetch('https://marketplace-food-hub.onrender.com/api/...')
    .then(res => res.json())
    .then(data => {
     
      if (data.length > 0 && data[0].price) {
        setProducts(data);
      } else {
        setProducts(sampleData);
      }
    })
    .catch(() => setProducts(sampleData));
}, []);

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
      if (exists.quantity === 1) return prev.filter(item => item.id !== product.id);
      return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item);
    });
  };

  const getItemQty = (id) => cart.find(item => item.id === id)?.quantity || 0;
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {view === 'menu' ? (
        <>
          <header className="flex justify-between items-center px-10 py-8 sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
            <h1 className="text-4xl font-black tracking-tighter">BANGO<span className="text-green-600">!</span></h1>
            <button 
              onClick={() => setView('checkout')} 
              className="bg-black text-white px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition"
            >
              Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
            </button>
          </header>

          <main className="px-10 py-16 max-w-[1400px] mx-auto">
            <h2 className="text-7xl font-black tracking-tighter mb-16">The Menu.</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {products.map((product) => (
                <div key={product.id} className="group">
                  <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-100 aspect-[4/5] mb-6">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                    <div className="absolute top-6 left-6 bg-white/90 px-4 py-1 rounded-full">
                      <p className="text-[10px] font-black uppercase tracking-widest">{product.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start px-2">
  <h3 className="text-2xl font-bold tracking-tight">{product.name}</h3>
  <p className="text-2xl font-black italic">
    ₦{ (parseFloat(product.price) || 0).toLocaleString() }
  </p>
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
                        <button onClick={() => removeFromCart(product)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl font-black text-2xl hover:bg-red-50">-</button>
                        <span className="font-black text-2xl">{getItemQty(product.id)}</span>
                        <button onClick={() => addToCart(product)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl font-black text-2xl hover:bg-green-50">+</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </>
      ) : (
        <Checkout cart={cart} total={subtotal} onBack={() => setView('menu')} />
      )}
    </div>
  );
}

export default App;