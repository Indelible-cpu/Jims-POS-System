import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Receipt, Settings, ShoppingCart } from 'lucide-react';
import { clsx } from 'clsx';

const MobileNav: React.FC = () => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'sales', label: 'Logs', icon: Receipt, path: '/sales' },
    { id: 'pos', label: 'Pos', icon: ShoppingCart, path: '/pos' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
    { id: 'settings', label: 'Menu', icon: Settings, path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-card/80 backdrop-blur-xl border-t border-surface-border md:hidden safe-bottom pb-2">
      <div className="flex items-center justify-around h-20 px-4">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) => clsx(
              "flex flex-col items-center justify-center flex-1 transition-all duration-500 h-14 rounded-2xl relative",
              isActive ? "text-primary-500 bg-primary-500/5" : "text-surface-text/30 hover:text-surface-text"
            )}
          >
            {({ isActive }) => (
              <>
                <div className={clsx(
                  "transition-all duration-300 flex items-center justify-center",
                  isActive && "scale-110"
                )}>
                  <tab.icon className={clsx("w-5 h-5")} strokeWidth={isActive ? 3 : 2} />
                </div>
                <span className={clsx(
                  "text-[8px] font-black tracking-[0.2em] mt-1.5 transition-all uppercase italic",
                  isActive ? "opacity-100" : "opacity-40"
                )}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
