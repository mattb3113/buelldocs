import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAjb4weJRZz-Mv5CjuErHw7Q-NFdC2voH8",
  authDomain: "buelldocs.firebaseapp.com",
  projectId: "buelldocs",
  storageBucket: "buelldocs.appspot.com",
  messagingSenderId: "1046042296153",
  appId: "1:1046042296153:web:4b65ee4938efb5db649648"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);