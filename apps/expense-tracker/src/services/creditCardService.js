import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch,
  orderBy,
} from "firebase/firestore";
import { db } from "@bill-reader/shared-auth";

const COLLECTIONS = {
  CREDIT_CARDS: "creditCards",
  CREDIT_CARD_TRANSACTIONS: "creditCardTransactions",
  TRANSACTIONS: "expenseTransactions",
};

export async function linkCreditCardStatement(
  userId,
  paymentTransactionId,
  statementData
) {
  const creditCardDoc = {
    userId,
    paymentTransactionId,
    bank: statementData.bank,
    cardType: statementData.cardType,
    last4: statementData.last4,
    displayName: statementData.displayName,
    fileName: statementData.fileName,
    uploadDate: serverTimestamp(),
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(
    collection(db, COLLECTIONS.CREDIT_CARDS),
    creditCardDoc
  );
  return docRef.id;
}

export async function addCreditCardTransactions(
  creditCardId,
  paymentTransactionId,
  transactions
) {
  const batch = writeBatch(db);
  const txnIds = [];

  transactions.forEach((txn) => {
    const docRef = doc(collection(db, COLLECTIONS.CREDIT_CARD_TRANSACTIONS));
    batch.set(docRef, {
      ...txn,
      creditCardId,
      paymentTransactionId,
      isCreditCardTransaction: true,
      excludeFromMainExpenses: true,
      createdAt: serverTimestamp(),
    });
    txnIds.push(docRef.id);
  });

  const paymentTxnRef = doc(db, COLLECTIONS.TRANSACTIONS, paymentTransactionId);
  batch.update(paymentTxnRef, {
    linkedCreditCardId: creditCardId,
    hasLinkedStatement: true,
    linkedTransactionCount: transactions.length,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  return txnIds;
}

export async function getCreditCardsByUser(userId) {
  const q = query(
    collection(db, COLLECTIONS.CREDIT_CARDS),
    where("userId", "==", userId),
    orderBy("uploadDate", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getCreditCardTransactions(creditCardId) {
  const q = query(
    collection(db, COLLECTIONS.CREDIT_CARD_TRANSACTIONS),
    where("creditCardId", "==", creditCardId),
    orderBy("date", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getAllCreditCardTransactions(userId) {
  const cards = await getCreditCardsByUser(userId);
  const allTransactions = [];

  for (const card of cards) {
    const transactions = await getCreditCardTransactions(card.id);
    allTransactions.push(
      ...transactions.map((t) => ({ ...t, cardInfo: card }))
    );
  }

  return allTransactions;
}

export async function getCreditCardStats(userId) {
  const cards = await getCreditCardsByUser(userId);
  const allTransactions = await getAllCreditCardTransactions(userId);

  const totalSpending = allTransactions.reduce(
    (sum, t) => sum + Math.abs(t.amount || 0),
    0
  );
  const transactionCount = allTransactions.length;
  const avgPerTransaction =
    transactionCount > 0 ? totalSpending / transactionCount : 0;

  const categoryBreakdown = {};
  const merchantBreakdown = {};
  const monthlyTrend = {};

  allTransactions.forEach((txn) => {
    const category = txn.category || "Uncategorized";
    if (!categoryBreakdown[category]) {
      categoryBreakdown[category] = { total: 0, count: 0 };
    }
    categoryBreakdown[category].total += Math.abs(txn.amount || 0);
    categoryBreakdown[category].count++;

    const merchant = txn.merchant || "Others";
    if (!merchantBreakdown[merchant]) {
      merchantBreakdown[merchant] = { total: 0, count: 0 };
    }
    merchantBreakdown[merchant].total += Math.abs(txn.amount || 0);
    merchantBreakdown[merchant].count++;

    if (txn.date) {
      const date = txn.date.toDate ? txn.date.toDate() : new Date(txn.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyTrend[monthKey]) {
        monthlyTrend[monthKey] = 0;
      }
      monthlyTrend[monthKey] += Math.abs(txn.amount || 0);
    }
  });

  return {
    totalSpending,
    transactionCount,
    avgPerTransaction,
    categoryBreakdown,
    merchantBreakdown,
    monthlyTrend,
    cards,
  };
}
