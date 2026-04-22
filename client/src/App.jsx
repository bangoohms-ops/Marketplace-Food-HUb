import React, { useState, useEffect } from 'react';
import Checkout from './Checkout';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('menu');

  // fallback data if database is empty
// Updated fallback data to show COOKED FOOD instead of raw items
  const sampleData = [
    { 
      id: 1, 
      name: "Party Jollof Rice", 
      price: 4500, 
      image_url: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800", 
      category: "Main Dish" 
    },
    { 
      id: 2, 
      name: "Abula Special", 
      price: 4000, 
      image_url: "https://images.unsplash.com/photo-1628102422204-706cc6e3c0b1?w=800", 
      category: "Swallow" 
    },
    { 
      id: 3, 
      name: "Pounded Yam & Egusi", 
      price: 6000, 
      image_url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800", 
      category: "Swallow" 
    },
    { 
      id: 4, 
      name: "Seafood Okra", 
      price: 7500, 
      image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800", 
      category: "Soups" 
    },
    { 
      id: 5, 
      name: "Grilled Catfish & Bole", 
      price: 12000, 
      image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800", 
      category: "Grills" 
    },
    { 
      id: 6, 
      name: "Spicy Asun (Goat Meat)", 
      price: 3500, 
      image_url: "https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?w=800", 
      category: "Sides" 
    },
    { 
      id: 7, 
      name: "Sweet & Sour Chicken", 
      price: 6800, 
      image_url: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800", 
      category: "Chinese" 
    },
    // --- SALADS & SIDES ---
    { 
      id: 8, 
      name: "Grilled Chicken Caesar", 
      price: 5200, 
      image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800", 
      category: "Salads" 
    },
    { 
      id: 9, 
      name: "Classic Coleslaw Side", 
      price: 1500, 
      image_url: "https://images.unsplash.com/photo-1625943555419-56a2cb596640?w=800", 
      category: "Salads" 
    },
    // --- GRILLS & EXTRAS ---
    { 
      id: 10, 
      name: "Grilled Catfish & Bole", 
      price: 12000, 
      image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800", 
      category: "Grills" 
    },
    { 
      id: 11, 
      name: "Spicy Asun (Goat Meat)", 
      price: 3500, 
      image_url: "https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?w=800", 
      category: "Sides" 
    },
    { 
      id: 12, 
      name: "Bango Special Wings", 
      price: 4800, 
      image_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800", 
      category: "Sides" 
    }
  ];

  // 1. FETCH PRODUCTS FROM RENDER
  useEffect(() => {
    fetch('https://marketplace-food-hub-1.onrender.com/api/products')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(sampleData);
        }
      })
      .catch(() => setProducts(sampleData));
  }, []);

  // 2. ADD TO CART LOGIC
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

  // 3. REMOVE FROM CART LOGIC
  const removeFromCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists.quantity === 1) {
        return prev.filter(item => item.id !== product.id);
      }
      return prev.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const getItemQty = (id) => cart.find(item => item.id === id)?.quantity || 0;
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

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
              Cart ({totalItems})
            </button>
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
      ) : (
        <Checkout cart={cart} total={subtotal} onBack={() => setView('menu')} />
      )}
    </div>
  );
}

export default App;