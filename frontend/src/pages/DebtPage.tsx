import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type LocalCustomer } from '../db/posDB';
import { 
  UserPlus, 
  Search, 
  Users, 
  Phone, 
  DollarSign, 
  History,
  ArrowRightCircle,
  AlertCircle,
  Plus,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { format } from 'date-fns';

const DebtPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<LocalCustomer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  // Form State
  const [custForm, setCustForm] = useState({ name: '', phone: '' });

  // Data
  const customers = useLiveQuery(
    () => db.customers.where('name').startsWithIgnoreCase(searchTerm).toArray(),
    [searchTerm]
  );

  const customerSales = useLiveQuery(
    () => selectedCustomer ? db.salesQueue.where('customerId').equals(selectedCustomer.id).reverse().toArray() : [],
    [selectedCustomer]
  );

  const customerPayments = useLiveQuery(
    () => selectedCustomer ? db.debtPayments.where('customerId').equals(selectedCustomer.id).reverse().toArray() : [],
    [selectedCustomer]
  );

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custForm.name || !custForm.phone) return;

    try {
      await db.customers.add({
        id: crypto.randomUUID(),
        name: custForm.name,
        phone: custForm.phone,
        balance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast.success('Customer added successfully');
      setIsAddModalOpen(false);
      setCustForm({ name: '', phone: '' });
    } catch (err) {
      toast.error('Failed to add customer');
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedCustomer || !paymentAmount || parseFloat(paymentAmount) <= 0) return;

    const amount = parseFloat(paymentAmount);
    try {
      // 1. Record the payment
      await db.debtPayments.add({
        id: crypto.randomUUID(),
        customerId: selectedCustomer.id,
        amount,
        paymentMethod: 'CASH',
        createdAt: new Date().toISOString(),
      });

      // 2. Update customer balance
      await db.customers.update(selectedCustomer.id, {
        balance: selectedCustomer.balance - amount,
        updatedAt: new Date().toISOString()
      });

      // Update local state for accuracy
      setSelectedCustomer({
        ...selectedCustomer,
        balance: selectedCustomer.balance - amount
      });

      toast.success(`Payment of MK ${amount.toLocaleString()} recorded`);
      setPaymentAmount('');
    } catch (err) {
      toast.error('Failed to record payment');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-bg transition-all pb-24 md:pb-0">
      <header className="p-6 bg-surface-card border-b border-surface-border sticky top-0 z-30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-accent-vibrant/10 text-accent-vibrant rounded-xl flex items-center justify-center border border-accent-vibrant/20">
                <Users className="w-6 h-6" />
             </div>
             <h1 className="text-2xl font-black tracking-tighter uppercase">Debt Book</h1>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-accent-vibrant hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-900/20 active:scale-95 transition-all"
          >
            Add Customer
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-text/40 w-4 h-4" />
          <input 
            title="Search Customers"
            aria-label="Search Customers"
            type="text" 
            placeholder="Search by name or phone..."
            className="input-field w-full pl-11 text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {customers?.map((customer) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className={clsx(
                "bg-surface-card p-6 border rounded-2xl cursor-pointer group transition-all",
                customer.balance > 0 ? "border-accent-vibrant/30" : "border-surface-border"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-surface-bg rounded-xl flex items-center justify-center border border-surface-border group-hover:border-primary-500/30 transition-colors">
                  <Users className="w-6 h-6 text-surface-text/40 group-hover:text-primary-400" />
                </div>
                {customer.balance > 0 && (
                  <div className="bg-accent-vibrant/10 text-accent-vibrant px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border border-accent-vibrant/20 flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" /> Owing
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg leading-tight uppercase tracking-tight mb-1 group-hover:text-primary-400 transition-colors">{customer.name}</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-surface-text/30 mb-6 uppercase tracking-wider">
                <Phone className="w-3 h-3" /> {customer.phone}
              </div>
              
              <div className="pt-4 border-t border-surface-border flex justify-between items-end">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-surface-text/20 mb-1">Total Debt</div>
                  <div className={clsx(
                    "text-xl font-black leading-none",
                    customer.balance > 0 ? "text-accent-vibrant" : "text-surface-text/20"
                  )}>MK {customer.balance.toLocaleString()}</div>
                </div>
                <ArrowRightCircle className="w-5 h-5 text-surface-text/20 group-hover:text-primary-400 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Customer Detail Drawer */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCustomer(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-surface-bg/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-card border-t md:border border-surface-border rounded-t-3xl md:rounded-3xl w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] shadow-2xl flex flex-col mt-auto md:mt-0"
            >
              <div className="p-8 border-b border-surface-border flex justify-between items-center bg-surface-bg/30">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase">{selectedCustomer.name}</h2>
                  <p className="text-[10px] text-surface-text/40 font-bold uppercase tracking-[0.2em]">{selectedCustomer.phone}</p>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="p-3 bg-surface-bg rounded-xl border border-surface-border">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Balance & Payment Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface-bg/50 p-6 rounded-2xl border border-surface-border">
                    <span className="text-[10px] font-black uppercase tracking-widest text-surface-text/30">Current Balance</span>
                    <div className="text-3xl font-black text-accent-vibrant mt-2">MK {selectedCustomer.balance.toLocaleString()}</div>
                  </div>
                  <div className="space-y-4">
                    <input 
                      title="Payment Amount"
                      aria-label="Payment Amount"
                      type="number" 
                      placeholder="Enter payment amount..."
                      className="input-field w-full"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                    <button 
                      onClick={handleRecordPayment}
                      className="w-full btn-primary !bg-accent-vibrant !text-black flex items-center justify-center gap-2 uppercase font-black text-[10px] tracking-widest py-4"
                    >
                      <CreditCard className="w-4 h-4" /> Record Partial Payment
                    </button>
                  </div>
                </div>

                {/* Combined History */}
                <div className="space-y-4">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-surface-text/30 flex items-center gap-2">
                     <History className="w-4 h-4" /> Account Activity
                   </h3>
                   <div className="space-y-px bg-surface-border/20 rounded-2xl overflow-hidden border border-surface-border">
                      {customerSales?.map(sale => (
                        <div key={sale.id} className="p-4 bg-surface-card flex justify-between items-center group">
                          <div>
                            <div className="text-xs font-black group-hover:text-primary-400 transition-colors uppercase">{sale.invoiceNo}</div>
                            <div className="text-[9px] text-surface-text/30 font-bold uppercase">{format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm')}</div>
                          </div>
                          <div className="text-right">
                             <div className="text-sm font-black text-accent-danger">+ MK {sale.total.toLocaleString()}</div>
                             <div className="text-[8px] text-surface-text/20 font-black uppercase">Credit Sale</div>
                          </div>
                        </div>
                      ))}
                      {customerPayments?.map(payment => (
                        <div key={payment.id} className="p-4 bg-surface-card flex justify-between items-center">
                          <div>
                            <div className="text-xs font-black text-accent-success uppercase tracking-widest">PAYMENT RECEIVED</div>
                            <div className="text-[9px] text-surface-text/30 font-bold uppercase">{format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}</div>
                          </div>
                          <div className="text-right">
                             <div className="text-sm font-black text-accent-success">- MK {payment.amount.toLocaleString()}</div>
                             <div className="text-[8px] text-surface-text/20 font-black uppercase">{payment.paymentMethod}</div>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-bg/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-surface-card border border-surface-border rounded-3xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6 border-b border-surface-border bg-surface-bg/30">
                <h2 className="text-lg font-black uppercase tracking-tighter">New Customer</h2>
              </div>
              <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-surface-text/30 pl-1">Full Name</label>
                  <input 
                    title="Customer Name"
                    required
                    type="text" 
                    className="input-field w-full"
                    placeholder="e.g. John Phiri"
                    value={custForm.name}
                    onChange={(e) => setCustForm({...custForm, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-surface-text/30 pl-1">Phone Number</label>
                  <input 
                    title="Customer Phone"
                    required
                    type="tel" 
                    className="input-field w-full"
                    placeholder="e.g. +265 88..."
                    value={custForm.phone}
                    onChange={(e) => setCustForm({...custForm, phone: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-surface-bg border border-surface-border rounded-xl text-[10px] font-bold uppercase">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary !bg-accent-vibrant !text-black py-3 rounded-xl text-[10px] font-black uppercase">Create Profile</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DebtPage;
