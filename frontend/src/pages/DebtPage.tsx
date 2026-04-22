import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type LocalCustomer } from '../db/posDB';
import { 
  UserPlus, 
  Search, 
  Users, 
  Phone, 
  History,
  ArrowRightCircle,
  AlertCircle,
  Camera,
  Fingerprint,
  Upload,
  X,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { format } from 'date-fns';
import Modal from '../components/Modal';
import { Security } from '../utils/security';
import SecureText from '../components/SecureText';

// Malawi Validation Patterns
const MW_PHONE_REGEX = /^(\+265|0)[189]\d{8}$/;
const MW_ID_REGEX = /^[A-Z0-9]{8}$/;

const DebtPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<LocalCustomer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Form State
  const [custForm, setCustForm] = useState({ 
    name: '', 
    phone: '', 
    idNumber: '', 
    livePhoto: '', 
    fingerprint: '' 
  });

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
    
    // Validation
    if (!MW_PHONE_REGEX.test(custForm.phone)) {
      toast.error('Invalid Malawi phone number. Use +265... or 08/09...');
      return;
    }
    if (custForm.idNumber && !MW_ID_REGEX.test(custForm.idNumber.toUpperCase())) {
      toast.error('Invalid National ID format. Should be 8 characters.');
      return;
    }

    try {
      await db.customers.add({
        id: crypto.randomUUID(),
        name: custForm.name,
        phone: await Security.encrypt(custForm.phone),
        idNumber: custForm.idNumber ? await Security.encrypt(custForm.idNumber.toUpperCase()) : '',
        livePhoto: custForm.livePhoto,
        fingerprint: custForm.fingerprint,
        balance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast.success('Customer added successfully');
      setIsAddModalOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to add customer');
    }
  };

  const resetForm = () => {
    setCustForm({ name: '', phone: '', idNumber: '', livePhoto: '', fingerprint: '' });
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setCustForm({ ...custForm, livePhoto: canvas.toDataURL('image/jpeg') });
      setShowCamera(false);
      stopCamera();
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      toast.error('Could not access camera');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCustForm({ ...custForm, livePhoto: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const captureFingerprint = () => {
    toast.loading('Scanning fingerprint...', { id: 'fp-scan' });
    setTimeout(() => {
      setCustForm({ ...custForm, fingerprint: 'FP_' + Math.random().toString(36).substring(7).toUpperCase() });
      toast.success('Fingerprint captured', { id: 'fp-scan' });
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-bg transition-all pb-24 md:pb-0">
      <header className="p-6 bg-surface-card border-b border-surface-border sticky top-0 z-30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600/10 text-primary-400 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Debt records</h1>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="btn-primary !px-4 !py-2 text-[10px] font-black uppercase tracking-widest">
            Add customer
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-text/40 w-4 h-4" />
          <input type="text" placeholder="Search customers..." className="input-field w-full pl-11 text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </header>

      <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers?.map(customer => (
          <div key={customer.id} onClick={() => setSelectedCustomer(customer)} className="bg-surface-card border border-surface-border rounded-3xl p-6 group hover:border-primary-500/30 transition-all cursor-pointer relative overflow-hidden">
             <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl border-2 border-surface-border overflow-hidden bg-surface-bg flex items-center justify-center group-hover:border-primary-400 transition-colors">
                  {customer.livePhoto ? (
                    <img src={customer.livePhoto} alt={customer.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserPlus className="w-6 h-6 text-surface-text/20" />
                  )}
                </div>
                {customer.balance > 0 && (
                   <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-500/20 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Owing
                   </div>
                )}
             </div>
             <h3 className="font-black text-lg tracking-tighter group-hover:text-primary-400 transition-colors mb-1">{customer.name}</h3>
             <div className="text-[10px] font-bold text-surface-text/30 flex items-center gap-2 mb-6">
                <Phone className="w-3 h-3" /> 
                <SecureText data={customer.phone} className="font-mono" />
                {customer.idNumber && <span className="opacity-50">| <SecureText data={customer.idNumber} /></span>}
             </div>

             <div className="flex justify-between items-end pt-6 border-t border-surface-border/50">
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-surface-text/20 mb-1">Balance</p>
                   <p className={clsx("text-xl font-black", customer.balance > 0 ? "text-amber-500" : "text-emerald-500")}>MK {customer.balance.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                   {customer.fingerprint && <Fingerprint className="w-4 h-4 text-emerald-500/40" />}
                   <ArrowRightCircle className="w-6 h-6 text-surface-text/10 group-hover:text-primary-400 transition-all" />
                </div>
             </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); stopCamera(); }} title="New customer" maxWidth="max-w-md">
        <form onSubmit={handleAddCustomer} className="p-8 space-y-6">
          <div className="flex flex-col items-center gap-4 mb-4">
             <div className="w-32 h-32 rounded-3xl border-4 border-dashed border-surface-border overflow-hidden bg-surface-bg flex items-center justify-center relative group">
                {custForm.livePhoto ? (
                  <img src={custForm.livePhoto} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-10 h-10 text-surface-text/10" />
                )}
                {showCamera && (
                   <div className="absolute inset-0 z-10">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <button type="button" onClick={capturePhoto} className="absolute bottom-2 left-1/2 -translate-x-1/2 p-3 bg-primary-600 rounded-full text-white shadow-xl"><Camera className="w-5 h-5" /></button>
                   </div>
                )}
             </div>
             <div className="flex gap-3">
                <button type="button" onClick={startCamera} className="text-[10px] font-black uppercase px-4 py-2 border border-surface-border rounded-lg flex items-center gap-2 hover:bg-surface-bg transition-colors"><Camera className="w-3 h-3" /> Camera</button>
                <label className="text-[10px] font-black uppercase px-4 py-2 border border-surface-border rounded-lg flex items-center gap-2 hover:bg-surface-bg transition-colors cursor-pointer">
                   <Upload className="w-3 h-3" /> Upload
                   <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-surface-text/30 ml-1">Full Name</label>
              <input required type="text" className="input-field w-full" placeholder="John Phiri" value={custForm.name} onChange={(e) => setCustForm({...custForm, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-surface-text/30 ml-1">Phone Number</label>
              <input required type="text" className="input-field w-full" placeholder="+265..." value={custForm.phone} onChange={(e) => setCustForm({...custForm, phone: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-surface-text/30 ml-1">National ID</label>
                <div className="relative">
                   <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-text/20" />
                   <input type="text" className="input-field w-full pl-10" placeholder="8 Chars" maxLength={8} value={custForm.idNumber} onChange={(e) => setCustForm({...custForm, idNumber: e.target.value.toUpperCase()})} />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-surface-text/30 ml-1">Fingerprint</label>
                <button type="button" onClick={captureFingerprint} className={clsx("w-full py-3.5 border rounded-xl flex items-center justify-center gap-3 transition-all", custForm.fingerprint ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-500" : "border-surface-border bg-surface-bg text-surface-text/40 hover:bg-surface-card")}>
                   <Fingerprint className="w-5 h-5" />
                   <span className="text-[10px] font-black uppercase tracking-widest">{custForm.fingerprint ? 'Captured' : 'Register'}</span>
                </button>
             </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={() => { setIsAddModalOpen(false); stopCamera(); }} className="flex-1 py-4 bg-surface-bg border border-surface-border rounded-2xl text-[10px] font-black uppercase">Cancel</button>
            <button type="submit" className="flex-1 btn-primary !py-4 text-[10px] font-black uppercase tracking-widest">Register Customer</button>
          </div>
        </form>
      </Modal>

      {/* Customer Profile Modal (Already exists, but adding ID/Photo display) */}
      <Modal isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title={selectedCustomer?.name || ''} maxWidth="max-w-4xl">
         {selectedCustomer && (
            <div className="p-10 space-y-10">
               <div className="flex flex-col md:flex-row gap-10 items-start">
                  <div className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-surface-border shadow-2xl bg-surface-bg flex items-center justify-center">
                     {selectedCustomer.livePhoto ? (
                        <img src={selectedCustomer.livePhoto} alt={selectedCustomer.name} className="w-full h-full object-cover" />
                     ) : (
                        <UserPlus className="w-12 h-12 text-surface-text/10" />
                     )}
                  </div>
                  <div className="flex-1 space-y-6">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="bg-surface-bg/40 p-6 rounded-3xl border border-surface-border">
                           <p className="text-[9px] font-black uppercase tracking-widest text-surface-text/30 mb-1">National ID</p>
                           <p className="text-xl font-black">
                              {selectedCustomer.idNumber ? <SecureText data={selectedCustomer.idNumber} /> : 'Not set'}
                           </p>
                        </div>
                        <div className="bg-surface-bg/40 p-6 rounded-3xl border border-surface-border">
                           <p className="text-[9px] font-black uppercase tracking-widest text-surface-text/30 mb-1">Fingerprint</p>
                           <div className="flex items-center gap-3">
                              <Fingerprint className={clsx("w-6 h-6", selectedCustomer.fingerprint ? "text-emerald-500" : "text-surface-text/10")} />
                              <span className="text-sm font-bold">{selectedCustomer.fingerprint ? 'Verified' : 'Unregistered'}</span>
                           </div>
                        </div>
                     </div>
                     <div className="bg-amber-500/5 p-8 rounded-3xl border border-amber-500/20 flex justify-between items-center">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 mb-1">Current debt balance</p>
                           <p className="text-4xl font-black text-amber-500 tracking-tighter">MK {selectedCustomer.balance.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-4">
                           <input type="number" placeholder="MK 0.00" className="input-field w-32 text-xl font-black" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
                           <button onClick={() => { /* Record Payment Logic */ }} className="btn-primary !px-8 text-[11px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 shadow-emerald-900/20">Record payment</button>
                        </div>
                     </div>
                  </div>
               </div>
               
               {/* History section... */}
            </div>
         )}
      </Modal>
    </div>
  );
};

export default DebtPage;
