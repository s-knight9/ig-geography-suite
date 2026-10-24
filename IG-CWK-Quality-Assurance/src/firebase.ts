import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const APP_NAME = 'ig-cwk-qa';
const app = getApps().find(a => a.name === APP_NAME)
  ? getApp(APP_NAME)
  : initializeApp(firebaseConfig, APP_NAME);

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Uses the bucket in firebase-applet-config.json (or pass "gs://YOUR_NEW_IG_BUCKET_NAME" as a 2nd argument)
export const storage = getStorage(app);