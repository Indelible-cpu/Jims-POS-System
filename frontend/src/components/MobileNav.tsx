import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Receipt, ShoppingCart, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import MoreOptionsMenu from './MoreOptionsMenu';

const MobileNav: React.FC = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'sales', label: 'Logs', icon: Receipt, path: '/sales' },
    { id: 'pos', label: 'Pos', icon: ShoppingCart, path: '/pos' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-card/80 backdrop-blur-xl border-t border-surface-border md:hidden safe-bottom pb-2">
        <div className="flex items-center justify-around h-20 px-4">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.path}
              className={({ isActive }) => clsx(
                "flex flex-col items-center justify-center flex-1 transition-all duration-500 h-14 rounded-2xl relative",
                isActive ? "text-primary-500 bg-primary-500/5" : "text-surface-text"
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={clsx(
                    "transition-all duration-300 flex items-center justify-center",
                    isActive ? "scale-110 opacity-100" : "opacity-60"
                  )}>
                    <tab.icon className={clsx("w-5 h-5")} strokeWidth={isActive ? 3 : 2} />
                  </div>
                  <span className={clsx(
                    "text-[8px] font-black tracking-[0.2em] mt-1.5 transition-all italic",
                    isActive ? "text-black dark:text-white opacity-100" : "text-surface-text opacity-80"
                  )}>
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
          
          <button
            onClick={() => setIsMoreOpen(true)}
            className={clsx(
              "flex flex-col items-center justify-center flex-1 transition-all duration-500 h-14 rounded-2xl relative text-surface-text",
            )}
          >
            <div className="transition-all duration-300 flex items-center justify-center opacity-60">
              <MoreHorizontal className="w-5 h-5" strokeWidth={2} />
            </div>
            <span className="text-[8px] font-black tracking-[0.2em] mt-1.5 transition-all italic opacity-80 text-surface-text">
              More
            </span>
          </button>
        </div>
      </nav>

      <MoreOptionsMenu isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
};

export default MobileNav;
