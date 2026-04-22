import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import POSPage from './pages/POSPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import { SyncService } from './services/SyncService';
import MainLayout from './components/MainLayout';

const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    if (navigator.onLine) {
      SyncService.pushSales();
    }

    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        SyncService.pushSales();
      }
    }, 60000);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
      clearInterval(syncInterval);
    };
  }, []);

  return (
    <Router>
      <Toaster position="top-center" />
      <div className="min-h-screen selection:bg-primary-500/30">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/*" 
            element={
              localStorage.getItem('token') ? (
                <MainLayout isOnline={isOnline}>
                  <Routes>
                    <Route path="pos" element={<POSPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="sales" element={<SalesPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="/" element={<Navigate to="/pos" replace />} />
                  </Routes>
                </MainLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
