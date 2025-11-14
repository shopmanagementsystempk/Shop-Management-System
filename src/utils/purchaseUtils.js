import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { addStockItem, addStockToItem } from './stockUtils';

const purchaseCollection = 'purchaseOrders';

const normalizeNumber = (value, fallback = 0) => {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const createPurchaseOrder = async (shopId, purchasePayload) => {
  if (!shopId) {
    throw new Error('Shop ID is required to create a purchase order');
  }

  const { items = [], supplier = '', invoiceNumber = '', purchaseDate, note = '', reference = '' } = purchasePayload || {};
  if (!items.length) {
    throw new Error('Add at least one item to the purchase');
  }

  const preparedItems = [];

  for (const item of items) {
    const normalizedQuantity = normalizeNumber(item.quantity, 0);
    const normalizedCostPrice =
      item.costPrice !== undefined && item.costPrice !== '' ? normalizeNumber(item.costPrice, null) : null;

    if (item.sourceItemId) {
      try {
        await addStockToItem(shopId, item.sourceItemId, normalizedQuantity, {
          costPrice: normalizedCostPrice,
          supplier: supplier?.trim() || item.supplier?.trim() || '',
          reference: reference?.trim() || '',
          purchaseDate: purchaseDate || new Date().toISOString(),
          expiryDate: item.expiryDate || null
        });

        preparedItems.push({
          ...item,
          stockItemId: item.sourceItemId,
          quantity: normalizedQuantity,
          costPrice: normalizedCostPrice ?? 0,
          sellingPrice:
            item.sellingPrice !== undefined && item.sellingPrice !== '' ? normalizeNumber(item.sellingPrice, 0) : null,
          unit: item.unit || 'units',
          expiryDate: item.expiryDate || null,
          existingItem: true
        });
        continue;
      } catch (error) {
        console.error('Failed to add stock to existing item, falling back to new item creation', error);
      }
    }

    const stockPayload = {
      name: item.name?.trim() || 'Unnamed Item',
      description: item.description?.trim() || '',
      category: item.category?.trim() || '',
      price: normalizeNumber(item.sellingPrice, 0),
      quantity: normalizedQuantity,
      quantityUnit: item.unit || 'units',
      costPrice: normalizedCostPrice,
      supplier: supplier?.trim() || item.supplier?.trim() || '',
      sku: item.sku?.trim() || '',
      expiryDate: item.expiryDate || null
    };

    const stockItemId = await addStockItem(shopId, stockPayload);
    preparedItems.push({
      ...item,
      stockItemId,
      quantity: normalizedQuantity,
      costPrice: normalizedCostPrice ?? 0,
      sellingPrice: item.sellingPrice !== undefined && item.sellingPrice !== '' ? normalizeNumber(item.sellingPrice, 0) : null,
      unit: item.unit || 'units',
      expiryDate: item.expiryDate || null,
      existingItem: false
    });
  }

  const purchaseRef = collection(db, purchaseCollection);
  const payload = {
    shopId,
    supplier: supplier?.trim() || '',
    invoiceNumber: invoiceNumber?.trim() || '',
    purchaseDate: purchaseDate || new Date().toISOString(),
    note: note?.trim() || '',
    reference: reference?.trim() || '',
    items: preparedItems,
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(purchaseRef, payload);
  return { id: docRef.id, ...payload };
};

export const getPurchaseOrders = async (shopId) => {
  if (!shopId) return [];
  const purchaseRef = collection(db, purchaseCollection);
  const q = query(purchaseRef, where('shopId', '==', shopId));
  const snapshot = await getDocs(q);
  const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return list.sort((a, b) => new Date(b.purchaseDate || b.createdAt) - new Date(a.purchaseDate || a.createdAt));
};


