import axios from 'axios';
import { db } from '../db/posDB';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SyncService = {
  async pushSales() {
    const unsyncedSales = await db.salesQueue
      .where('synced')
      .equals(0)
      .toArray();

    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('deviceId') || 'unknown';
    const lastSyncTimestamp = localStorage.getItem('lastSyncTimestamp');

    try {
      const response = await axios.post(`${API_BASE_URL}/sync`, {
        sales: unsyncedSales,
        deviceId,
        lastSyncTimestamp
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Mark as synced locally
        if (unsyncedSales.length > 0) {
          const saleIds = unsyncedSales.map(s => s.id);
          await db.salesQueue.where('id').anyOf(saleIds).modify({ synced: 1 });
        }
        
        // Process delta updates from server (Products/Categories)
        const { products, categories } = response.data.updates;
        
        if (products && products.length > 0) {
          // Normalize Decimal to Number for Dexie if needed, but Prisma Decimal usually returns as String or Number
          await db.products.bulkPut(products.map((p: any) => ({
            ...p,
            costPrice: Number(p.costPrice),
            sellPrice: Number(p.sellPrice)
          })));
        }
        
        if (categories && categories.length > 0) {
          await db.categories.bulkPut(categories);
        }

        localStorage.setItem('lastSyncTimestamp', response.data.serverTime);
        return true;
      }
    } catch (error) {
      console.error('Failed to sync data:', error);
      return false;
    }
  },

  // Pull initial data if DB is empty
  async pullInitialData() {
    const productCount = await db.products.count();
    if (productCount === 0) {
      console.log('DB empty, triggering initial sync...');
      return await this.pushSales();
    }
    return true;
  },

  async checkConnection() {
    return navigator.onLine;
  }
};
