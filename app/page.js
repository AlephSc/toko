'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Sparkles, CheckCircle2, ArrowRight, Trash2, X, User, LogOut, LogIn } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState(null);
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '' });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    checkAuth();
    loadProducts();
    loadCart();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (e) {}
  };

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (e) {}
  };

  const loadCart = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cart`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (e) {}
  };

  const addToCart = async (product) => {
    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
        setIsCartOpen(true);
      }
    } catch (e) {}
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/api/cart/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (e) {}
  };

  const handleCheckout = async () => {
    if (!user) {
      setAuthModal('login');
      return;
    }
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      const res = await fetch(`${API_BASE}/api/checkout`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setInvoice(data);
        setCart([]);
        setIsCartOpen(false);
      }
    } catch (e) {
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const endpoint = authModal === 'login' ? '/api/login' : '/api/register';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (res.ok) {
        setUser({ username: data.username });
        setAuthModal(null);
        setAuthForm({ username: '', password: '', email: '' });
        loadCart();
      } else {
        setAuthError(data.error || 'Auth failed');
      }
    } catch (e) {
      setAuthError('Network error');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setCart([]);
    } catch (e) {}
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <main className="min-h-screen px-6 py-10 max-w-6xl mx-auto flex flex-col justify-between">
      <header className="flex items-center justify-between py-4 glass-panel px-8 rounded-2xl mb-12">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            TOKO DIGITAL
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4" />
                {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="glass-panel hover:bg-white/10 px-3 py-2 rounded-xl flex items-center gap-2 text-sm transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setAuthModal('login')}
              className="glass-panel hover:bg-white/10 px-3 py-2 rounded-xl flex items-center gap-2 text-sm transition"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
          )}
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
        </div>
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
          Production assets, engineering courses, dan architecture boilerplates untuk creator modern.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-10">
        {products.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel glass-panel-hover rounded-3xl p-8 flex flex-col justify-between"
          >
            <div>
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
                className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 text-white font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                Add
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="glass-panel p-8 rounded-3xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Keranjang</h2>
                <button onClick={() => setIsCartOpen(false)} className="hover:bg-white/10 p-2 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Keranjang kosong</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-400">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="hover:bg-red-500/20 p-2 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-4 mb-4">
                    <div className="flex justify-between text-lg font-bold mb-4">
                      <span>Total</span>
                      <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 py-3 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50 transition"
                    >
                      {isCheckingOut ? 'Processing...' : 'Checkout'}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {authModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-8 rounded-3xl max-w-sm w-full"
            >
              <h2 className="text-2xl font-bold mb-6">{authModal === 'login' ? 'Login' : 'Register'}</h2>
              <form onSubmit={handleAuth} className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"
                  required
                />
                {authModal === 'register' && (
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"
                  />
                )}
                {authError && <p className="text-red-400 text-sm">{authError}</p>}
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold transition"
                >
                  {authModal === 'login' ? 'Login' : 'Register'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModal(authModal === 'login' ? 'register' : 'login');
                    setAuthError('');
                  }}
                  className="w-full text-sm text-gray-400 hover:text-white transition"
                >
                  {authModal === 'login' ? 'Belum punya akun? Register' : 'Sudah punya akun? Login'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModal(null);
                    setAuthError('');
                    setAuthForm({ username: '', password: '', email: '' });
                  }}
                  className="w-full text-sm text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
              </form>
            </motion.div>
          </div>
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
              <h3 className="text-xl font-bold mb-1">Order #{invoice.orderId}</h3>
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
