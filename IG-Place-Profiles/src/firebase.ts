import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || ""
};

export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let tempApp = null;
if (isFirebaseConfigured) {
  try {
    tempApp = initializeApp(firebaseConfig, "place-profiles");
  } catch (err) {
    tempApp = getApp("place-profiles");
  }
}

const databaseId = (import.meta as any).env?.VITE_FIREBASE_FIRESTORE_DATABASE_ID || undefined;

export const app = tempApp;
export const db = isFirebaseConfigured 
  ? (databaseId ? getFirestore(app!, databaseId) : getFirestore(app!)) 
  : null;
export const auth = isFirebaseConfigured ? getAuth(app!) : null;
