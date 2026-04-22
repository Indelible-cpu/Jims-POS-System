import Dexie, { type Table } from 'dexie';

export interface LocalProduct {
  id: number;
  categoryId: number;
  sku: string;
  name: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;
  isService: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface LocalSaleItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  lineTotal: number;
  profit: number;
}

export interface LocalSale {
  id: string; 
  invoiceNo: string;
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  changeDue: number;
  paymentMode: string;
  itemsCount: number;
  createdAt: string;
  synced: number; 
  customerId?: string;
  items: LocalSaleItem[];
}

export interface LocalCustomer {
  id: string;
  name: string;
  phone: string;
  balance: number; // Total amount currently owed
  createdAt: string;
  updatedAt: string;
}

export interface LocalDebtPayment {
  id: string;
  customerId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  createdAt: string;
}

export class POSDatabase extends Dexie {
  products!: Table<LocalProduct>;
  categories!: Table<{ id: number; title: string; slug: string }>;
  salesQueue!: Table<LocalSale>;
  settings!: Table<{ key: string; value: string | number | boolean | object }>;
  customers!: Table<LocalCustomer>;
  debtPayments!: Table<LocalDebtPayment>;

  constructor() {
    super('JEF_POS_DB');
    this.version(3).stores({
      products: 'id, categoryId, sku, name',
      categories: 'id, slug',
      salesQueue: 'id, invoiceNo, synced, customerId',
      settings: 'key',
      customers: 'id, name, phone',
      debtPayments: 'id, customerId'
    });
  }
}

export const db = new POSDatabase();
