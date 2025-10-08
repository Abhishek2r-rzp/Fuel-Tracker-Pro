import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import * as readline from "readline";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function deleteAllTransactions() {
  try {
    console.log("🔍 Fetching all transactions...");
    const querySnapshot = await getDocs(collection(db, "expenseTransactions"));
    const totalCount = querySnapshot.docs.length;

    console.log(`📊 Found ${totalCount} transactions`);

    if (totalCount === 0) {
      console.log("✅ No transactions to delete");
      rl.close();
      process.exit(0);
    }

    rl.question(
      `\n⚠️  Are you ABSOLUTELY sure you want to delete ALL ${totalCount} transactions?\nThis action CANNOT be undone!\nType 'DELETE ALL' to confirm: `,
      async (answer) => {
        if (answer === "DELETE ALL") {
          console.log("\n🗑️  Deleting transactions...");

          let deletedCount = 0;
          const deletePromises = querySnapshot.docs.map(async (docSnapshot) => {
            await deleteDoc(doc(db, "expenseTransactions", docSnapshot.id));
            deletedCount++;
            if (deletedCount % 10 === 0) {
              console.log(`   Deleted ${deletedCount}/${totalCount}...`);
            }
          });

          await Promise.all(deletePromises);

          console.log(
            `\n✅ Successfully deleted ${deletedCount} transactions!`
          );
          rl.close();
          process.exit(0);
        } else {
          console.log("\n❌ Deletion cancelled. Transactions are safe.");
          rl.close();
          process.exit(0);
        }
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    rl.close();
    process.exit(1);
  }
}

deleteAllTransactions();
