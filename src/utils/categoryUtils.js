import { collection, addDoc, getDocs, getDoc, updateDoc, doc, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Get all inventory categories for a shop
export const getInventoryCategories = async (shopId) => {
  try {
    const categoryRef = collection(db, 'inventoryCategories');
    const q = query(categoryRef, where('shopId', '==', shopId));
    
    const querySnapshot = await getDocs(q);
    const categories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by name
    categories.sort((a, b) => a.name.localeCompare(b.name));
    
    return categories;
  } catch (error) {
    console.error('Error fetching inventory categories:', error);
    throw error;
  }
};

// Add a new inventory category
export const addInventoryCategory = async (categoryData) => {
  try {
    const categoryRef = collection(db, 'inventoryCategories');
    const docRef = await addDoc(categoryRef, {
      ...categoryData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding inventory category:', error);
    throw error;
  }
};

// Update an inventory category
export const updateInventoryCategory = async (categoryId, updateData) => {
  try {
    const categoryRef = doc(db, 'inventoryCategories', categoryId);
    await updateDoc(categoryRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    
    return categoryId;
  } catch (error) {
    console.error('Error updating inventory category:', error);
    throw error;
  }
};

// Delete an inventory category
export const deleteInventoryCategory = async (categoryId) => {
  try {
    const categoryRef = doc(db, 'inventoryCategories', categoryId);
    await deleteDoc(categoryRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting inventory category:', error);
    throw error;
  }
};

// Get a single inventory category by ID
export const getInventoryCategoryById = async (categoryId) => {
  try {
    const categoryRef = doc(db, 'inventoryCategories', categoryId);
    const categorySnap = await getDoc(categoryRef);
    
    if (categorySnap.exists()) {
      return {
        id: categorySnap.id,
        ...categorySnap.data()
      };
    } else {
      throw new Error('Inventory category not found');
    }
  } catch (error) {
    console.error('Error fetching inventory category:', error);
    throw error;
  }
};

