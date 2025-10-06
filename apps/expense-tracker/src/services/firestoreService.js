import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@bill-reader/shared-auth';

// Collection names
const COLLECTIONS = {
  TRANSACTIONS: 'expenseTransactions',
  STATEMENTS: 'expenseStatements',
  CATEGORIES: 'expenseCategories',
};

/**
 * Add a new transaction
 * @param {string} userId - User ID
 * @param {Object} transaction - Transaction data
 * @returns {Promise<string>} Document ID
 */
export async function addTransaction(userId, transaction) {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
      userId,
      ...transaction,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
}

/**
 * Add multiple transactions (batch import)
 * @param {string} userId - User ID
 * @param {Array} transactions - Array of transaction objects
 * @returns {Promise<Array>} Array of document IDs
 */
export async function addTransactionsBatch(userId, transactions) {
  try {
    const promises = transactions.map((transaction) =>
      addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
        userId,
        ...transaction,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
    const results = await Promise.all(promises);
    return results.map((docRef) => docRef.id);
  } catch (error) {
    console.error('Error adding transactions batch:', error);
    throw error;
  }
}

/**
 * Get all transactions for a user
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters (startDate, endDate, category)
 * @returns {Promise<Array>} Array of transactions
 */
export async function getTransactions(userId, filters = {}) {
  try {
    let q = query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      where('userId', '==', userId)
    );

    // Apply filters
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters.startDate) {
      q = query(q, where('date', '>=', Timestamp.fromDate(new Date(filters.startDate))));
    }

    if (filters.endDate) {
      q = query(q, where('date', '<=', Timestamp.fromDate(new Date(filters.endDate))));
    }

    // Order by date (descending)
    q = query(q, orderBy('date', 'desc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to JS Date
      date: doc.data().date?.toDate?.() || doc.data().date,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    }));
  } catch (error) {
    console.error('Error getting transactions:', error);
    // Fallback: try without ordering if index is missing
    try {
      const q = query(
        collection(db, COLLECTIONS.TRANSACTIONS),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.() || doc.data().date,
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      }));
      // Sort manually
      return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Update a transaction
 * @param {string} transactionId - Transaction ID
 * @param {Object} updates - Updated fields
 * @returns {Promise<void>}
 */
export async function updateTransaction(transactionId, updates) {
  try {
    const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, transactionId);
    await updateDoc(transactionRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
}

/**
 * Delete a transaction
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<void>}
 */
export async function deleteTransaction(transactionId) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, transactionId));
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

/**
 * Add a statement record (metadata about uploaded file)
 * @param {string} userId - User ID
 * @param {Object} statement - Statement data
 * @returns {Promise<string>} Document ID
 */
export async function addStatement(userId, statement) {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.STATEMENTS), {
      userId,
      ...statement,
      uploadedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding statement:', error);
    throw error;
  }
}

/**
 * Get all statements for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of statements
 */
export async function getStatements(userId) {
  try {
    const q = query(
      collection(db, COLLECTIONS.STATEMENTS),
      where('userId', '==', userId),
      orderBy('uploadedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt?.toDate?.() || doc.data().uploadedAt,
    }));
  } catch (error) {
    console.error('Error getting statements:', error);
    // Fallback without ordering
    try {
      const q = query(
        collection(db, COLLECTIONS.STATEMENTS),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const statements = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate?.() || doc.data().uploadedAt,
      }));
      return statements.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Get transaction statistics for dashboard
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters (startDate, endDate)
 * @returns {Promise<Object>} Statistics object
 */
export async function getTransactionStats(userId, filters = {}) {
  try {
    const transactions = await getTransactions(userId, filters);

    const totalIncome = transactions
      .filter((t) => t.type === 'credit' || t.amount > 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'debit' || t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netSavings = totalIncome - totalExpenses;

    // Category-wise breakdown
    const categoryBreakdown = transactions.reduce((acc, t) => {
      const category = t.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { count: 0, total: 0 };
      }
      acc[category].count++;
      acc[category].total += Math.abs(t.amount);
      return acc;
    }, {});

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      transactionCount: transactions.length,
      categoryBreakdown,
      transactions,
    };
  } catch (error) {
    console.error('Error getting transaction stats:', error);
    throw error;
  }
}

/**
 * Get monthly spending trends
 * @param {string} userId - User ID
 * @param {number} months - Number of months to fetch
 * @returns {Promise<Array>} Array of monthly data
 */
export async function getMonthlyTrends(userId, months = 6) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await getTransactions(userId, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    // Group by month
    const monthlyData = {};
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          income: 0,
          expenses: 0,
          transactions: 0,
        };
      }

      if (t.type === 'credit' || t.amount > 0) {
        monthlyData[monthKey].income += Math.abs(t.amount);
      } else {
        monthlyData[monthKey].expenses += Math.abs(t.amount);
      }
      monthlyData[monthKey].transactions++;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    console.error('Error getting monthly trends:', error);
    throw error;
  }
}

