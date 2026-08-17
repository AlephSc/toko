'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Sparkles, CheckCircle2, ArrowRight, Trash2, X } from 'lucide-react';

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!email || cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, email }),
      });
      const data = await res.json();
      if (data.success) {
        setInvoice(data);
        setCart([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-10 max-w-6xl mx-auto flex flex-col justify-between">
      <header className="flex items-center justify-between py-4 glass-panel px-8 rounded-2xl mb-12">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            AETHER
          </span>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative glass-panel hover:bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2 transition"
        >
          <ShoppingBag className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-medium">Cart</span>
          {cart.length > 0 && (
            <span className="bg-indigo-500 text-xs px-2 py-0.5 rounded-full font-bold">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </header>

      <section className="text-center my-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4"
        >
          Next-Gen <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400">Digital Goods</span>
        </motion.h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Production assets, engineering courses, and architecture boilerplates built for modern creators.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
        {products.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel glass-panel-hover rounded-3xl p-8 flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-semibold px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                {p.tag}
              </span>
              <h3 className="text-2xl font-bold mt-4 mb-2">{p.name}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{p.description}</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <span className="text-xs text-gray-400 block">Price</span>
                <span className="text-2xl font-bold text-white">Rp {p.price.toLocaleString('id-ID')}</span>
              </div>
              <button
                onClick={() => addToCart(p)}
                className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 text-white font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition"
              >
                Add to Cart <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="glass-panel border-l border-white/10 w-full max-w-md h-full p-8 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-indigo-400" /> Your Cart
                  </h2>
                  <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">Cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                        <div>
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs text-gray-400">
                            {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-rose-400 hover:text-rose-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <form onSubmit={handleCheckout} className="pt-6 border-t border-white/10 space-y-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    type="submit"
                    disabled={isCheckingOut}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50 transition"
                  >
                    {isCheckingOut ? 'Processing...' : 'Pay with Gateway'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {invoice && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-8 rounded-3xl max-w-sm w-full text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-1">Invoice #{invoice.orderId}</h3>
              <p className="text-gray-400 text-sm mb-6">Total: Rp {invoice.total.toLocaleString('id-ID')}</p>
              <a
                href={invoice.paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 rounded-xl font-bold text-white mb-3"
              >
                Proceed to Payment Gateway
              </a>
              <button
                onClick={() => setInvoice(null)}
                className="text-sm text-gray-400 hover:text-white"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
