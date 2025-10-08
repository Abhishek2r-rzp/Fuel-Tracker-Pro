import {
  collection,
  addDoc,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@bill-reader/shared-auth";

// Collection names
const COLLECTIONS = {
  TRANSACTIONS: "expenseTransactions",
  STATEMENTS: "expenseStatements",
  CATEGORIES: "expenseCategories",
};

function cleanTransactionData(transaction) {
  const cleaned = {};
  Object.keys(transaction).forEach((key) => {
    const value = transaction[key];

    if (value === undefined || value === null) {
      return;
    }

    if (key === "date") {
      if (value instanceof Date) {
        cleaned[key] = Timestamp.fromDate(value);
      } else if (typeof value === "string" || typeof value === "number") {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            cleaned[key] = Timestamp.fromDate(date);
          }
        } catch (_e) {
          return;
        }
      }
      return;
    }

    if (key === "category") {
      if (typeof value === "object" && value.category) {
        cleaned[key] = value.category;
      } else if (typeof value === "string") {
        cleaned[key] = value;
      }
      return;
    }

    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      !(value instanceof Timestamp)
    ) {
      return;
    }

    if (Array.isArray(value)) {
      return;
    }

    cleaned[key] = value;
  });
  return cleaned;
}

/**
 * Add a new transaction
 * @param {string} userId - User ID
 * @param {Object} transaction - Transaction data
 * @returns {Promise<string>} Document ID
 */
export async function addTransaction(userId, transaction) {
  try {
    const cleanedTransaction = cleanTransactionData(transaction);
    const docRef = await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
      userId,
      ...cleanedTransaction,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (_error) {
    console._error("Error adding transaction:", _error);
    throw _error;
  }
}

/**
 * Add multiple transactions (batch import)
 * @param {string} userId - User ID
 * @param {Array} transactions - Array of transaction objects
 * @returns {Promise<Array>} Array of document IDs
 */
export async function addTransactionsBatch(
  userId,
  transactions,
  statementId = null
) {
  try {
    console.log("💾 Saving batch of", transactions.length, "transactions");
    const promises = transactions.map((transaction) => {
      const cleanedTransaction = cleanTransactionData(transaction);
      return addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
        userId,
        ...cleanedTransaction,
        ...(statementId && { statementId }),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
    const results = await Promise.all(promises);
    console.log("✅ Successfully saved", results.length, "transactions");
    return results.map((docRef) => docRef.id);
  } catch (_error) {
    console._error("❌ Error adding transactions batch:", _error);
    throw _error;
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
      where("userId", "==", userId)
    );

    // Apply filters
    if (filters.category) {
      q = query(q, where("category", "==", filters.category));
    }

    if (filters.startDate) {
      q = query(
        q,
        where("date", ">=", Timestamp.fromDate(new Date(filters.startDate)))
      );
    }

    if (filters.endDate) {
      q = query(
        q,
        where("date", "<=", Timestamp.fromDate(new Date(filters.endDate)))
      );
    }

    // Order by date (descending)
    q = query(q, orderBy("date", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      let category = data.category;
      if (typeof category === "object" && category?.category) {
        category = category.category;
      }
      return {
        id: doc.id,
        ...data,
        category,
        date: data.date?.toDate?.() || data.date,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    });
  } catch (_error) {
    console._error("Error getting transactions:", _error);
    // Fallback: try without ordering if index is missing
    try {
      const q = query(
        collection(db, COLLECTIONS.TRANSACTIONS),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        let category = data.category;
        if (typeof category === "object" && category?.category) {
          category = category.category;
        }
        return {
          id: doc.id,
          ...data,
          category,
          date: data.date?.toDate?.() || data.date,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        };
      });
      return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (fallbackError) {
      console._error("Fallback query also failed:", fallbackError);
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
  } catch (_error) {
    console._error("Error updating transaction:", _error);
    throw _error;
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
  } catch (_error) {
    console._error("Error deleting transaction:", _error);
    throw _error;
  }
}

/**
 * Delete multiple transactions
 * @param {string[]} transactionIds - Array of transaction IDs
 * @returns {Promise<number>} Number of deleted transactions
 */
export async function deleteTransactionsBulk(transactionIds) {
  try {
    const deletePromises = transactionIds.map((id) =>
      deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, id))
    );
    await Promise.all(deletePromises);
    return transactionIds.length;
  } catch (_error) {
    console._error("Error deleting transactions in bulk:", _error);
    throw _error;
  }
}

/**
 * Delete ALL transactions for a user (use with caution!)
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of deleted transactions
 */
export async function deleteAllTransactions(userId) {
  try {
    const q = query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    const transactionIds = querySnapshot.docs.map((doc) => doc.id);

    if (transactionIds.length === 0) {
      return 0;
    }

    const deletePromises = transactionIds.map((id) =>
      deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, id))
    );

    await Promise.all(deletePromises);
    console.log(
      `🗑️ Deleted ${transactionIds.length} transactions for user ${userId}`
    );
    return transactionIds.length;
  } catch (_error) {
    console._error("Error deleting all transactions:", _error);
    throw _error;
  }
}

export async function getTransactionsByStatement(statementId) {
  try {
    const q = query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      where("statementId", "==", statementId),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      let category = data.category;
      if (typeof category === "object" && category?.category) {
        category = category.category;
      }
      return {
        id: doc.id,
        ...data,
        category,
        date: data.date?.toDate?.() || data.date,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    });
  } catch (_error) {
    console._error("Error getting transactions by statement:", _error);
    try {
      const q = query(
        collection(db, COLLECTIONS.TRANSACTIONS),
        where("statementId", "==", statementId)
      );
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        let category = data.category;
        if (typeof category === "object" && category?.category) {
          category = category.category;
        }
        return {
          id: doc.id,
          ...data,
          category,
          date: data.date?.toDate?.() || data.date,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        };
      });
      return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (fallbackError) {
      console._error("Fallback query also failed:", fallbackError);
      throw fallbackError;
    }
  }
}

export async function deleteStatement(statementId) {
  try {
    const transactions = await getTransactionsByStatement(statementId);

    const deletePromises = transactions.map((txn) =>
      deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, txn.id))
    );
    await Promise.all(deletePromises);

    await deleteDoc(doc(db, COLLECTIONS.STATEMENTS, statementId));

    console.log(`✅ Deleted statement and ${transactions.length} transactions`);
    return transactions.length;
  } catch (_error) {
    console._error("Error deleting statement:", _error);
    throw _error;
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
  } catch (_error) {
    console._error("Error adding statement:", _error);
    throw _error;
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
      where("userId", "==", userId),
      orderBy("uploadedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt?.toDate?.() || doc.data().uploadedAt,
    }));
  } catch (_error) {
    console._error("Error getting statements:", _error);
    // Fallback without ordering
    try {
      const q = query(
        collection(db, COLLECTIONS.STATEMENTS),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const statements = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate?.() || doc.data().uploadedAt,
      }));
      return statements.sort(
        (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
      );
    } catch (fallbackError) {
      console._error("Fallback query also failed:", fallbackError);
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
      .filter((t) => t.type === "credit" || t.amount > 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "debit" || t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netSavings = totalIncome - totalExpenses;

    // Category-wise breakdown (prioritize merchant names for detailed tracking)
    const categoryBreakdown = transactions.reduce((acc, t) => {
      // Use merchant name if available, otherwise use category, fallback to 'Uncategorized'
      const displayName = t.merchant || t.category || "Uncategorized";
      if (!acc[displayName]) {
        acc[displayName] = { count: 0, total: 0 };
      }
      acc[displayName].count++;
      acc[displayName].total += Math.abs(t.amount);
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
  } catch (_error) {
    console._error("Error getting transaction stats:", _error);
    throw _error;
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
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          income: 0,
          expenses: 0,
          transactions: 0,
        };
      }

      if (t.type === "credit" || t.amount > 0) {
        monthlyData[monthKey].income += Math.abs(t.amount);
      } else {
        monthlyData[monthKey].expenses += Math.abs(t.amount);
      }
      monthlyData[monthKey].transactions++;
    });

    return Object.values(monthlyData).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  } catch (_error) {
    console._error("Error getting monthly trends:", _error);
    throw _error;
  }
}
