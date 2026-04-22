import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Wifi, WifiOff, RefreshCw, User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/posDB';

interface MobileHeaderProps {
  isOnline: boolean;
  isSyncing: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ isOnline, isSyncing }) => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Jims Pos System');

  // Fetch shop logo from settings
  const shopLogo = useLiveQuery(() => db.settings.get('shopLogo'));

  useEffect(() => {
    const path = location.pathname.split('/')[1] || '';
    switch (path) {
      case 'dashboard': setPageTitle('Dashboard'); break;
      case 'pos': setPageTitle('Point of Sale'); break;
      case 'inventory': setPageTitle('Inventory'); break;
      case 'sales': setPageTitle('Sales Records'); break;
      case 'debt': setPageTitle('Debt Book'); break;
      case 'expenses': setPageTitle('Expenses'); break;
      case 'transactions': setPageTitle('Transactions'); break;
      case 'users': setPageTitle('Team'); break;
      case 'settings': setPageTitle('Settings'); break;
      default: setPageTitle('Jims Pos System');
    }
  }, [location]);

  return (
    <header className="sticky top-0 z-50 md:hidden bg-surface-card border-b border-surface-border/50 px-4 py-3 flex items-center justify-between backdrop-blur-xl bg-opacity-90">
      <div className="flex items-center gap-3">
        {/* Circular Logo */}
        <div className="w-10 h-10 rounded-full border-2 border-primary-500/20 overflow-hidden bg-surface-bg flex items-center justify-center shadow-inner">
          {shopLogo?.value ? (
            <img src={shopLogo.value as string} alt="Shop Logo" className="w-full h-full object-cover" />
          ) : (
            <div className="text-primary-400 font-black text-xs">JPS</div>
          )}
        </div>
        
        <div className="flex flex-col">
          <span className="text-[10px] font-black tracking-[0.1em] text-primary-400/80 leading-none mb-0.5">Jims Pos System</span>
          <h1 className="text-base font-black tracking-tighter text-surface-text">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Sync Icon Only */}
        {isSyncing && (
          <div className="p-2 bg-primary-500/10 rounded-full animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 text-primary-400 animate-spin" />
          </div>
        )}
        
        {/* Online Symbol Only */}
        <div className={clsx(
          "p-2 rounded-full transition-all border",
          isOnline 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
            : "bg-red-500/10 border-red-500/20 text-red-500"
        )}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
