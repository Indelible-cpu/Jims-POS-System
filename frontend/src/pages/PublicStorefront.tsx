import React, { useState, useEffect } from 'react';
import { Package, Search, MessageSquare, ShoppingBag, Loader2, User as UserIcon, Heart, Bookmark, Plus, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import CustomerAuthModal from '../components/CustomerAuthModal';
import { motion, AnimatePresence } from 'framer-motion';

export const PublicStorefront: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [shopName, setShopName] = useState('Msika');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Engagement States
  const [likes, setLikes] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const loadStorefront = async () => {
      setLoading(true);
      try {
        const [productsRes, settingsRes] = await Promise.all([
          api.get('/public/products'),
          api.get('/public/settings'),
        ]);

        if (productsRes.data.success) {
          setProducts(productsRes.data.data);
        }

        if (settingsRes.data.success && settingsRes.data.data?.companyName) {
          setShopName(settingsRes.data.data.companyName);
        }
      } catch (err) {
        console.error('Storefront load error:', err);
      } finally {
        setLoading(false);
      }

      // Restore session & engagement
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.role === 'CUSTOMER') setCustomer(u);
      }

      setLikes(JSON.parse(localStorage.getItem('msika_likes') || '[]'));
      setSaved(JSON.parse(localStorage.getItem('msika_saved') || '[]'));
      setCart(JSON.parse(localStorage.getItem('msika_cart') || '[]'));
    };
    loadStorefront();
  }, []);

  const toggleLike = (id: number) => {
    const newLikes = likes.includes(id) ? likes.filter(l => l !== id) : [...likes, id];
    setLikes(newLikes);
    localStorage.setItem('msika_likes', JSON.stringify(newLikes));
    if (!likes.includes(id)) toast.success('Added to your likes');
  };

  const toggleSave = (id: number) => {
    const newSaved = saved.includes(id) ? saved.filter(s => s !== id) : [...saved, id];
    setSaved(newSaved);
    localStorage.setItem('msika_saved', JSON.stringify(newSaved));
    toast.success(saved.includes(id) ? 'Removed from saved' : 'Saved for later');
  };

  const addToCart = (product: any) => {
    const existing = cart.find(c => c.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
    } else {
      newCart = [...cart, { ...product, qty: 1 }];
    }
    setCart(newCart);
    localStorage.setItem('msika_cart', JSON.stringify(newCart));
    toast.success('Added to cart');
  };

  const handleInquiry = async (product: any) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!token || user?.role !== 'CUSTOMER') {
      setSelectedProduct(product);
      setIsAuthOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/inquiries', {
        items: [{ id: product.id, name: product.name, price: product.sellPrice ?? 0 }]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Inquiry sent successfully!');
    } catch (error) {
      toast.error('Failed to send inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthSuccess = (_token: string, user: any) => {
    setCustomer(user);
    if (selectedProduct) {
      handleInquiry(selectedProduct);
      setSelectedProduct(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCustomer(null);
    toast.success('Signed out');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-surface-text transition-colors duration-300 pb-24">
      {/* Edge-to-Edge Header */}
      <header className="sticky top-0 z-40 bg-surface-bg/80 backdrop-blur-xl border-b border-surface-border">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center border border-primary-500/20">
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h1 className="text-lg md:text-xl font-black tracking-tighter italic">{shopName}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {customer ? (
              <div className="flex items-center gap-2 md:gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[8px] font-black tracking-widest text-surface-text/30 italic">Logged in as</p>
                  <p className="text-[10px] font-black">{customer.fullname}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-8 h-8 md:w-10 md:h-10 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                  title="Sign Out"
                >
                  <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            ) : (
               <button 
                 onClick={() => setIsAuthOpen(true)}
                 className="px-4 py-2 bg-surface-card border border-surface-border rounded-full text-[9px] font-black tracking-widest hover:border-primary-500 transition-all"
               >
                 SIGN IN
               </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Search */}
      <div className="w-full bg-surface-bg border-b border-surface-border transition-colors">
        <div className="max-w-5xl mx-auto px-6 py-8 md:py-12 text-center">
          <h2 className="text-2xl md:text-5xl font-black tracking-tighter italic mb-3">Marketplace</h2>
          <p className="text-[10px] md:text-sm font-bold text-surface-text/40 mb-6 md:mb-8 max-w-md mx-auto leading-relaxed">Premium products and professional services curated just for you.</p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-surface-text/40 w-4 h-4 md:w-5 md:h-5" />
            <input 
              type="text" 
              placeholder="Search items..."
              className="w-full py-4 md:py-5 pl-12 md:pl-14 pr-6 bg-surface-card border border-surface-border rounded-full outline-none focus:border-primary-500 font-bold text-xs md:text-sm shadow-xl shadow-surface-text/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Product Grid - Fixed 2 cards per row on mobile */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-3 md:px-6 py-8 md:py-12">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-[9px] font-black tracking-[0.3em] text-surface-text/20 italic uppercase">Loading...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <Package className="w-12 h-12 text-surface-text/10 mb-4" />
            <p className="text-[9px] font-black tracking-widest text-surface-text/30 italic uppercase">Empty Marketplace</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            {filteredProducts.map(p => (
              <motion.div 
                layout
                key={p.id} 
                className="group relative bg-surface-card border border-surface-border rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden hover:border-primary-500/30 transition-all duration-500 flex flex-col h-full"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/5] bg-surface-bg border-b border-surface-border/30 overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-bg/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                  
                  {/* Action Overlay */}
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 flex flex-col gap-2">
                    <button 
                      onClick={() => toggleLike(p.id)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                        likes.includes(p.id) ? 'bg-rose-500 text-white' : 'bg-surface-bg/80 text-surface-text/40 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 md:w-5 md:h-5 ${likes.includes(p.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                      onClick={() => toggleSave(p.id)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                        saved.includes(p.id) ? 'bg-primary-500 text-white' : 'bg-surface-bg/80 text-surface-text/40 hover:text-primary-500'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 md:w-5 md:h-5 ${saved.includes(p.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <img 
                      src={p.isService ? '/professional_service_placeholder.png' : '/premium_product_placeholder.png'} 
                      alt="placeholder" 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                    />
                  )}

                  {/* Add to Cart Overlay */}
                  <button 
                    onClick={() => addToCart(p)}
                    className="absolute bottom-4 left-4 right-4 z-20 h-10 md:h-12 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl md:rounded-3xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all font-black text-[9px] tracking-widest shadow-2xl"
                  >
                    <Plus className="w-4 h-4" />
                    ADD TO CART
                  </button>
                </div>
                
                {/* Details Section */}
                <div className="p-4 md:p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <div className="text-[7px] md:text-[9px] font-black text-primary-500 mb-1 tracking-[0.2em] italic opacity-60 uppercase">
                      {p.category?.name || 'Featured'}
                    </div>
                    <h3 className="font-black text-sm md:text-lg tracking-tight leading-tight mb-2 group-hover:text-primary-500 transition-colors line-clamp-1">{p.name}</h3>
                    <p className="text-[9px] md:text-xs font-medium text-surface-text/40 line-clamp-2 h-6 md:h-8 leading-relaxed">
                      {p.description || `Premium ${p.isService ? 'service' : 'product'} available for inquiry. Contact us for details.`}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-surface-border/50 flex flex-col gap-3">
                    <div className="flex items-end gap-1">
                      <p className="text-sm md:text-xl font-black text-primary-500 italic tracking-tighter">MK {(p.sellPrice ?? 0).toLocaleString()}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleInquiry(p)}
                      disabled={submitting}
                      className="w-full py-3 md:py-4 bg-surface-bg border border-surface-border rounded-2xl md:rounded-3xl text-[8px] md:text-[9px] font-black tracking-widest hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
                      INQUIRE
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Indicator */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <button className="h-14 px-8 bg-primary-500 text-white rounded-full flex items-center gap-4 shadow-2xl shadow-primary-500/40 ring-4 ring-primary-500/20 active:scale-95 transition-all">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-primary-500 rounded-full flex items-center justify-center text-[10px] font-black">{cart.reduce((s,i)=>s+i.qty, 0)}</span>
              </div>
              <span className="text-[10px] font-black tracking-widest">VIEW CART</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomerAuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={handleAuthSuccess}
      />

      <footer className="bg-surface-card border-t border-surface-border py-8 text-center mt-auto">
        <p className="text-[9px] font-black text-surface-text/20 tracking-widest italic">© {new Date().getFullYear()} {shopName}. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PublicStorefront;
