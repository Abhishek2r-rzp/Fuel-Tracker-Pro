import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@bill-reader/shared-auth";

const COLLECTIONS = {
  TAGS: "expenseTags",
  TRANSACTIONS: "expenseTransactions",
};

export async function createTag(userId, tagData) {
  const tag = {
    userId,
    name: tagData.name.trim(),
    color: tagData.color || "#9333EA",
    icon: tagData.icon || "🏷️",
    description: tagData.description || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.TAGS), tag);
  return { id: docRef.id, ...tag };
}

export async function getUserTags(userId) {
  const q = query(
    collection(db, COLLECTIONS.TAGS),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function updateTag(tagId, updates) {
  const tagRef = doc(db, COLLECTIONS.TAGS, tagId);
  await updateDoc(tagRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTag(tagId) {
  await deleteDoc(doc(db, COLLECTIONS.TAGS, tagId));
}

export async function addTagsToTransactions(transactionIds, tags) {
  const batch = writeBatch(db);

  transactionIds.forEach((txnId) => {
    const txnRef = doc(db, COLLECTIONS.TRANSACTIONS, txnId);
    batch.set(
      txnRef,
      {
        tags,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });

  await batch.commit();
}

export async function removeTagFromTransactions(transactionIds, tagToRemove) {
  const batch = writeBatch(db);

  transactionIds.forEach((txnId) => {
    const txnRef = doc(db, COLLECTIONS.TRANSACTIONS, txnId);
    batch.update(txnRef, {
      tags: arrayRemove(tagToRemove),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

export async function getTransactionsByTag(userId, tagName) {
  const q = query(
    collection(db, COLLECTIONS.TRANSACTIONS),
    where("userId", "==", userId),
    where("tags", "array-contains", tagName)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export function getTagEmoji(tagName) {
  const emojiMap = {
    family: "👨‍👩‍👧‍👦",
    grocery: "🛒",
    work: "💼",
    personal: "👤",
    business: "🏢",
    home: "🏠",
    travel: "✈️",
    health: "🏥",
    education: "📚",
    entertainment: "🎮",
    investment: "📈",
    savings: "💰",
    emergency: "🚨",
    gift: "🎁",
    charity: "❤️",
  };

  const key = tagName.toLowerCase();
  return emojiMap[key] || "🏷️";
}

export const PRESET_TAGS = [
  { name: "Family", color: "#EC4899", icon: "👨‍👩‍👧‍👦" },
  { name: "Grocery", color: "#22C55E", icon: "🛒" },
  { name: "Work", color: "#3B82F6", icon: "💼" },
  { name: "Personal", color: "#8B5CF6", icon: "👤" },
  { name: "Home", color: "#F97316", icon: "🏠" },
  { name: "Travel", color: "#14B8A6", icon: "✈️" },
  { name: "Health", color: "#EF4444", icon: "🏥" },
  { name: "Education", color: "#F59E0B", icon: "📚" },
  { name: "Entertainment", color: "#A855F7", icon: "🎮" },
  { name: "Business", color: "#10B981", icon: "🏢" },
];
